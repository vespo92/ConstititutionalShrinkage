/**
 * Votes API Routes
 *
 * Voting operations and verification.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schemas, validateBody, validateQuery } from '../middleware/validation.js';

interface VoteParams {
  id: string;
}

interface VerifyParams {
  proof: string;
}

const voteHistorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  choice: z.enum(['for', 'against', 'abstain']).optional(),
  billStatus: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export async function voteRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate;

  /**
   * POST /api/votes - Cast a vote
   */
  fastify.post('/', {
    schema: {
      tags: ['Votes'],
      summary: 'Cast a vote on a bill',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['billId', 'choice'],
        properties: {
          billId: { type: 'string' },
          choice: { type: 'string', enum: ['for', 'against', 'abstain'] },
          isPublic: { type: 'boolean', default: false },
          signature: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            voteId: { type: 'string' },
            billId: { type: 'string' },
            choice: { type: 'string' },
            weight: { type: 'number' },
            receipt: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, validateBody(schemas.castVote)],
  }, async (request, reply) => {
    const user = request.user!;
    const body = request.body as z.infer<typeof schemas.castVote>;

    // TODO: Integrate with voting-system package
    // Check eligibility, verify no duplicate vote, calculate weight with delegations

    reply.status(201);
    return {
      voteId: `vote-${Date.now()}`,
      billId: body.billId,
      choice: body.choice,
      weight: user.votingPower,
      receipt: 'cryptographic-proof-placeholder',
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * GET /api/votes/:id - Get vote receipt
   */
  fastify.get<{ Params: VoteParams }>('/:id', {
    schema: {
      tags: ['Votes'],
      summary: 'Get vote receipt and details',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    preHandler: [authenticate],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Fetch vote, verify ownership
    return {
      voteId: id,
      billId: 'bill-id',
      choice: 'for',
      weight: 1,
      timestamp: new Date().toISOString(),
      isPublic: false,
      cryptographicProof: 'proof',
      verified: true,
    };
  });

  /**
   * GET /api/votes/verify/:proof - Verify cryptographic proof
   */
  fastify.get<{ Params: VerifyParams }>('/verify/:proof', {
    schema: {
      tags: ['Votes'],
      summary: 'Verify a vote cryptographic proof',
      description: 'Allows anyone to verify that a vote was recorded correctly',
      params: {
        type: 'object',
        properties: {
          proof: { type: 'string' },
        },
        required: ['proof'],
      },
    },
  }, async (request) => {
    const { proof } = request.params;

    // TODO: Verify cryptographic proof using voting-system package
    return {
      proof,
      valid: true,
      billId: 'bill-id',
      timestamp: new Date().toISOString(),
      // Note: Choice and voter identity should remain private unless vote was public
    };
  });

  /**
   * GET /api/votes/history - Get voting history for authenticated user
   */
  fastify.get('/history', {
    schema: {
      tags: ['Votes'],
      summary: 'Get voting history',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          choice: { type: 'string' },
          billStatus: { type: 'string' },
          fromDate: { type: 'string' },
          toDate: { type: 'string' },
        },
      },
    },
    preHandler: [authenticate, validateQuery(voteHistorySchema)],
  }, async (request) => {
    const user = request.user!;
    const query = (request as any).validatedQuery;

    return {
      userId: user.id,
      votes: [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      },
      summary: {
        totalVotes: 0,
        forVotes: 0,
        againstVotes: 0,
        abstainVotes: 0,
      },
    };
  });

  /**
   * GET /api/votes/stats - Get voting statistics
   */
  fastify.get('/stats', {
    schema: {
      tags: ['Votes'],
      summary: 'Get global voting statistics',
    },
  }, async () => {
    // TODO: Calculate from database
    return {
      totalVotes: 0,
      totalVoters: 0,
      averageParticipation: 0,
      delegationRate: 0,
      activeSessions: 0,
      recentActivity: [],
    };
  });

  /**
   * GET /api/votes/delegated - Get votes cast on behalf of user via delegation
   */
  fastify.get('/delegated', {
    schema: {
      tags: ['Votes'],
      summary: 'Get votes cast via delegation',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;

    return {
      userId: user.id,
      delegatedVotes: [],
      // List of votes where someone voted on behalf of this user
    };
  });

  /**
   * POST /api/votes/:id/override - Override a delegated vote
   */
  fastify.post<{ Params: VoteParams }>('/:id/override', {
    schema: {
      tags: ['Votes'],
      summary: 'Override a delegated vote with direct vote',
      security: [{ bearerAuth: [] }],
      description: 'If a delegate voted on your behalf, you can override with your own vote',
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Verify this was a delegated vote for this user, then allow override
    reply.status(201);
    return {
      overriddenVoteId: id,
      newVoteId: `vote-override-${Date.now()}`,
      message: 'Vote successfully overridden',
    };
  });
}
