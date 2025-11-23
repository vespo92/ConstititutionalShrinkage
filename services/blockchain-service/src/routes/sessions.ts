import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ethereumService } from "../services/ethereum";
import { merkleService } from "../services/merkle";

const createSessionSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  billHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
});

const sessionIdSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

const sessionsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Create a new voting session
  fastify.post("/", {
    schema: {
      description: "Create a new voting session",
      tags: ["sessions"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          billHash: { type: "string" },
          startTime: { type: "number" },
          endTime: { type: "number" },
        },
        required: ["sessionId", "billHash", "startTime", "endTime"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            transactionHash: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = createSessionSchema.parse(request.body);

      const txHash = await ethereumService.createSession(
        body.sessionId,
        body.billHash,
        body.startTime,
        body.endTime
      );

      reply.status(201).send({
        sessionId: body.sessionId,
        transactionHash: txHash,
      });
    },
  });

  // Get session details
  fastify.get("/:sessionId", {
    schema: {
      description: "Get voting session details",
      tags: ["sessions"],
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
            billHash: { type: "string" },
            startTime: { type: "number" },
            endTime: { type: "number" },
            yesVotes: { type: "number" },
            noVotes: { type: "number" },
            abstainVotes: { type: "number" },
            finalized: { type: "boolean" },
            merkleRoot: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      const session = await ethereumService.getSession(sessionId);

      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      reply.send(session);
    },
  });

  // Finalize a session
  fastify.post("/:sessionId/finalize", {
    schema: {
      description: "Finalize a voting session",
      tags: ["sessions"],
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
            merkleRoot: { type: "string" },
            transactionHash: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      // Build merkle tree from commitments
      const merkleRoot = merkleService.getRoot(sessionId);

      if (!merkleRoot) {
        reply.status(400).send({ error: "No commitments found for session" });
        return;
      }

      const txHash = await ethereumService.finalizeSession(sessionId, merkleRoot);

      reply.send({
        sessionId,
        merkleRoot,
        transactionHash: txHash,
      });
    },
  });

  // Get session statistics
  fastify.get("/:sessionId/stats", {
    schema: {
      description: "Get voting session statistics",
      tags: ["sessions"],
    },
    handler: async (request, reply) => {
      const { sessionId } = sessionIdSchema.parse(request.params);

      const session = await ethereumService.getSession(sessionId);
      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      const commitmentCount = merkleService.getCommitmentCount(sessionId);
      const totalVotes = session.yesVotes + session.noVotes + session.abstainVotes;

      reply.send({
        sessionId,
        commitmentCount,
        revealedCount: totalVotes,
        pendingReveals: commitmentCount - totalVotes,
        tally: {
          yes: session.yesVotes,
          no: session.noVotes,
          abstain: session.abstainVotes,
        },
        finalized: session.finalized,
        isActive:
          Date.now() / 1000 >= session.startTime &&
          Date.now() / 1000 <= session.endTime,
      });
    },
  });
};

export default sessionsRoutes;
