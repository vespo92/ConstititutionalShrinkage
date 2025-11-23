import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ethereumService } from "../services/ethereum";
import { merkleService } from "../services/merkle";
import { AuditReport, AuditEventType } from "../types";

const sessionIdSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

const timeRangeSchema = z.object({
  startTime: z.number().int().positive().optional(),
  endTime: z.number().int().positive().optional(),
  eventType: z.nativeEnum(AuditEventType).optional(),
});

const auditRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Get full audit report for a session
  fastify.get("/session/:sessionId", {
    schema: {
      description: "Get complete audit report for a voting session",
      tags: ["audit"],
      params: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            totalCommitments: { type: "number" },
            totalReveals: { type: "number" },
            finalTally: {
              type: "object",
              properties: {
                yes: { type: "number" },
                no: { type: "number" },
                abstain: { type: "number" },
              },
            },
            merkleRoot: { type: "string" },
            entries: { type: "array" },
            generatedAt: { type: "number" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      // Get session data
      const session = await ethereumService.getSession(sessionId);
      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      // Get audit entries
      const entries = await ethereumService.getAuditEntriesBySession(sessionId);

      // Count events
      const commitmentEntries = entries.filter(
        (e) => e.eventType === AuditEventType.VOTE_COMMITTED
      );
      const revealEntries = entries.filter(
        (e) => e.eventType === AuditEventType.VOTE_REVEALED
      );

      const report: AuditReport = {
        sessionId,
        totalCommitments: commitmentEntries.length,
        totalReveals: revealEntries.length,
        finalTally: {
          yes: session.yesVotes,
          no: session.noVotes,
          abstain: session.abstainVotes,
        },
        merkleRoot: session.merkleRoot,
        entries,
        generatedAt: Date.now(),
      };

      reply.send(report);
    },
  });

  // Get audit entries by actor
  fastify.get("/actor/:actor", {
    schema: {
      description: "Get audit entries for a specific actor",
      tags: ["audit"],
      params: {
        type: "object",
        properties: {
          actor: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const { actor } = request.params as { actor: string };

      // For now, return from on-chain data
      // In production, this would query the AuditTrail contract
      reply.send({
        actor,
        entries: [],
        count: 0,
      });
    },
  });

  // Get audit entry count
  fastify.get("/count", {
    schema: {
      description: "Get total audit entry count",
      tags: ["audit"],
      response: {
        200: {
          type: "object",
          properties: {
            count: { type: "number" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const count = await ethereumService.getAuditEntryCount();
      reply.send({ count });
    },
  });

  // Get audit timeline for a session
  fastify.get("/timeline/:sessionId", {
    schema: {
      description: "Get chronological audit timeline for a session",
      tags: ["audit"],
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      const entries = await ethereumService.getAuditEntriesBySession(sessionId);

      // Sort by timestamp
      const timeline = entries
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((entry) => ({
          timestamp: entry.timestamp,
          blockNumber: entry.blockNumber,
          eventType: AuditEventType[entry.eventType],
          actor: entry.actor,
          details: {
            primaryKey: entry.primaryKey,
            secondaryKey: entry.secondaryKey,
            dataHash: entry.dataHash,
          },
        }));

      reply.send({
        sessionId,
        timeline,
        count: timeline.length,
      });
    },
  });

  // Verify audit integrity
  fastify.get("/verify/:sessionId", {
    schema: {
      description: "Verify audit trail integrity for a session",
      tags: ["audit"],
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      const session = await ethereumService.getSession(sessionId);
      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      const entries = await ethereumService.getAuditEntriesBySession(sessionId);
      const commitmentCount = merkleService.getCommitmentCount(sessionId);

      // Verify counts match
      const auditCommitmentCount = entries.filter(
        (e) => e.eventType === AuditEventType.VOTE_COMMITTED
      ).length;

      const auditRevealCount = entries.filter(
        (e) => e.eventType === AuditEventType.VOTE_REVEALED
      ).length;

      const totalRevealed = session.yesVotes + session.noVotes + session.abstainVotes;

      const integrityCheck = {
        sessionId,
        checks: {
          commitmentCountMatch: commitmentCount === auditCommitmentCount,
          revealCountMatch: totalRevealed === auditRevealCount,
          sessionFinalized: session.finalized,
          merkleRootSet: session.merkleRoot !== "0x" + "0".repeat(64),
        },
        summary: {
          merkleCommitments: commitmentCount,
          auditCommitments: auditCommitmentCount,
          onChainReveals: totalRevealed,
          auditReveals: auditRevealCount,
        },
        verified: true,
        verifiedAt: Date.now(),
      };

      // Overall verification
      integrityCheck.verified = Object.values(integrityCheck.checks).every(Boolean);

      reply.send(integrityCheck);
    },
  });

  // Export audit data
  fastify.get("/export/:sessionId", {
    schema: {
      description: "Export complete audit data for external verification",
      tags: ["audit"],
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      const session = await ethereumService.getSession(sessionId);
      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      const entries = await ethereumService.getAuditEntriesBySession(sessionId);
      const commitments = merkleService.getAllCommitments(sessionId);
      const merkleRoot = merkleService.getRoot(sessionId);

      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        session: {
          id: sessionId,
          billHash: session.billHash,
          startTime: session.startTime,
          endTime: session.endTime,
          finalized: session.finalized,
        },
        tally: {
          yes: session.yesVotes,
          no: session.noVotes,
          abstain: session.abstainVotes,
          total: session.yesVotes + session.noVotes + session.abstainVotes,
        },
        merkle: {
          root: merkleRoot || session.merkleRoot,
          commitmentCount: commitments.length,
          commitments,
        },
        auditEntries: entries,
        verification: {
          blockNumber: await ethereumService.getBlockNumber(),
          sessionMerkleRoot: session.merkleRoot,
          computedMerkleRoot: merkleRoot,
        },
      };

      reply
        .header("Content-Type", "application/json")
        .header(
          "Content-Disposition",
          `attachment; filename="audit-${sessionId.slice(0, 10)}.json"`
        )
        .send(exportData);
    },
  });
};

export default auditRoutes;
