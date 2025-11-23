import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ethereumService } from "../services/ethereum";
import { commitmentService } from "../services/commitment";
import { merkleService } from "../services/merkle";
import { VoteChoice } from "../types";

const commitVoteSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  commitment: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  eligibilityProof: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

const revealVoteSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  choice: z.nativeEnum(VoteChoice),
  salt: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  nullifier: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

const prepareVoteSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  choice: z.nativeEnum(VoteChoice),
  citizenId: z.string().min(1),
});

const votesRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Prepare a vote (generate commitment and proof)
  fastify.post("/prepare", {
    schema: {
      description: "Prepare a vote by generating commitment and eligibility proof",
      tags: ["votes"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          choice: { type: "number", enum: [0, 1, 2] },
          citizenId: { type: "string" },
        },
        required: ["sessionId", "choice", "citizenId"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            commitment: { type: "string" },
            salt: { type: "string" },
            nullifier: { type: "string" },
            proof: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = prepareVoteSchema.parse(request.body);

      const result = await commitmentService.createCommitment(
        body.sessionId,
        body.choice,
        body.citizenId
      );

      reply.send(result);
    },
  });

  // Commit a vote
  fastify.post("/commit", {
    schema: {
      description: "Submit a vote commitment to the blockchain",
      tags: ["votes"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          commitment: { type: "string" },
          eligibilityProof: { type: "string" },
        },
        required: ["sessionId", "commitment", "eligibilityProof"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            commitment: { type: "string" },
            transactionHash: { type: "string" },
            blockNumber: { type: "number" },
            timestamp: { type: "number" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = commitVoteSchema.parse(request.body);

      const receipt = await commitmentService.submitCommitment(
        body.sessionId,
        body.commitment,
        body.eligibilityProof
      );

      reply.status(201).send(receipt);
    },
  });

  // Reveal a vote
  fastify.post("/reveal", {
    schema: {
      description: "Reveal a previously committed vote",
      tags: ["votes"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          choice: { type: "number", enum: [0, 1, 2] },
          salt: { type: "string" },
          nullifier: { type: "string" },
        },
        required: ["sessionId", "choice", "salt", "nullifier"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            transactionHash: { type: "string" },
            revealed: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = revealVoteSchema.parse(request.body);

      const txHash = await ethereumService.revealVote(
        body.sessionId,
        body.choice,
        body.salt,
        body.nullifier
      );

      reply.send({
        sessionId: body.sessionId,
        transactionHash: txHash,
        revealed: true,
      });
    },
  });

  // Get commitment status
  fastify.get("/:sessionId/:voter", {
    schema: {
      description: "Get vote commitment status for a voter",
      tags: ["votes"],
      params: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          voter: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            commitment: { type: "string" },
            timestamp: { type: "number" },
            revealed: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId, voter } = request.params as {
        sessionId: string;
        voter: string;
      };

      const commitment = await ethereumService.getCommitment(sessionId, voter);

      if (!commitment) {
        reply.status(404).send({ error: "Commitment not found" });
        return;
      }

      reply.send(commitment);
    },
  });

  // Check if nullifier is used
  fastify.get("/nullifier/:nullifier", {
    schema: {
      description: "Check if a nullifier has been used",
      tags: ["votes"],
      params: {
        type: "object",
        properties: {
          nullifier: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            nullifier: { type: "string" },
            used: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { nullifier } = request.params as { nullifier: string };

      const used = await ethereumService.isNullifierUsed(nullifier);

      reply.send({ nullifier, used });
    },
  });

  // Get all commitments for a session
  fastify.get("/:sessionId/commitments", {
    schema: {
      description: "Get all vote commitments for a session",
      tags: ["votes"],
    },
    handler: async (request, reply) => {
      const { sessionId } = request.params as { sessionId: string };

      const commitments = merkleService.getAllCommitments(sessionId);

      reply.send({
        sessionId,
        count: commitments.length,
        commitments,
      });
    },
  });
};

export default votesRoutes;
