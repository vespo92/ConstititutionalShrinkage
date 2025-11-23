import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { ethereumService } from "../services/ethereum";
import { merkleService } from "../services/merkle";
import { VerificationResult, TallyVerification, MerkleProof } from "../types";

const verifyVoteSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  commitment: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
});

const verifyProofSchema = z.object({
  sessionId: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  commitment: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  proof: z.array(z.string()),
  root: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

const verifyRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Verify a vote was recorded
  fastify.post("/vote", {
    schema: {
      description: "Verify a vote was recorded on the blockchain",
      tags: ["verify"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          commitment: { type: "string" },
          transactionHash: { type: "string" },
        },
        required: ["sessionId", "commitment"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            valid: { type: "boolean" },
            sessionId: { type: "string" },
            commitment: { type: "string" },
            blockNumber: { type: "number" },
            transactionHash: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = verifyVoteSchema.parse(request.body);

      const result: VerificationResult = {
        valid: false,
        sessionId: body.sessionId,
      };

      // Check if commitment exists in merkle tree
      const merkleProof = merkleService.getProof(body.sessionId, body.commitment);

      if (merkleProof && merkleProof.valid) {
        result.valid = true;
        result.commitment = body.commitment;
      }

      // If transaction hash provided, verify it
      if (body.transactionHash) {
        const receipt = await ethereumService.getTransactionReceipt(body.transactionHash);
        if (receipt) {
          result.blockNumber = receipt.blockNumber;
          result.transactionHash = body.transactionHash;
        } else {
          result.error = "Transaction not found";
          result.valid = false;
        }
      }

      reply.send(result);
    },
  });

  // Verify session totals match blockchain
  fastify.get("/session/:sessionId", {
    schema: {
      description: "Verify session totals match blockchain records",
      tags: ["verify"],
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
            onChainTally: {
              type: "object",
              properties: {
                yes: { type: "number" },
                no: { type: "number" },
                abstain: { type: "number" },
              },
            },
            verified: { type: "boolean" },
            merkleRoot: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId } = request.params as { sessionId: string };

      const session = await ethereumService.getSession(sessionId);

      if (!session) {
        reply.status(404).send({ error: "Session not found" });
        return;
      }

      const result: TallyVerification = {
        sessionId,
        onChainTally: {
          yes: session.yesVotes,
          no: session.noVotes,
          abstain: session.abstainVotes,
        },
        verified: session.finalized,
        merkleRoot: session.merkleRoot,
      };

      reply.send(result);
    },
  });

  // Get merkle proof for vote inclusion
  fastify.get("/proof/:sessionId/:commitment", {
    schema: {
      description: "Get merkle proof for vote inclusion",
      tags: ["verify"],
      params: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          commitment: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            commitment: { type: "string" },
            proof: { type: "array", items: { type: "string" } },
            root: { type: "string" },
            index: { type: "number" },
            valid: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId, commitment } = request.params as {
        sessionId: string;
        commitment: string;
      };

      const proof = merkleService.getProof(sessionId, commitment);

      if (!proof) {
        reply.status(404).send({ error: "Commitment not found" });
        return;
      }

      reply.send(proof);
    },
  });

  // Verify a merkle proof
  fastify.post("/proof", {
    schema: {
      description: "Verify a merkle proof for vote inclusion",
      tags: ["verify"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          commitment: { type: "string" },
          proof: { type: "array", items: { type: "string" } },
          root: { type: "string" },
        },
        required: ["sessionId", "commitment", "proof", "root"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            valid: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const body = verifyProofSchema.parse(request.body);

      const valid = merkleService.verifyProof(
        body.sessionId,
        body.commitment,
        body.proof,
        body.root
      );

      reply.send({ valid });
    },
  });

  // Verify eligibility root
  fastify.get("/eligibility-root", {
    schema: {
      description: "Get current eligibility merkle root",
      tags: ["verify"],
      response: {
        200: {
          type: "object",
          properties: {
            root: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const root = await ethereumService.getEligibilityRoot();
      reply.send({ root });
    },
  });

  // Batch verify multiple votes
  fastify.post("/batch", {
    schema: {
      description: "Batch verify multiple vote commitments",
      tags: ["verify"],
      body: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          commitments: { type: "array", items: { type: "string" } },
        },
        required: ["sessionId", "commitments"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            sessionId: { type: "string" },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  commitment: { type: "string" },
                  valid: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { sessionId, commitments } = request.body as {
        sessionId: string;
        commitments: string[];
      };

      const results = commitments.map((commitment) => {
        const proof = merkleService.getProof(sessionId, commitment);
        return {
          commitment,
          valid: proof?.valid || false,
        };
      });

      reply.send({ sessionId, results });
    },
  });
};

export default verifyRoutes;
