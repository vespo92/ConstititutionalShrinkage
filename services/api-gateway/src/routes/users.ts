/**
 * Users API Routes
 *
 * User profile and activity management.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schemas, validateBody, validateQuery } from '../middleware/validation.js';
import { NotFoundError } from '../middleware/errorHandler.js';

interface UserParams {
  id: string;
}

const userSearchSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  region: z.string().uuid().optional(),
  expertise: z.string().optional(),
  minReputation: z.coerce.number().int().min(0).max(100).optional(),
  verificationLevel: z.string().optional(),
});

export async function userRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate;

  /**
   * GET /api/users/me - Get current authenticated user
   */
  fastify.get('/me', {
    schema: {
      tags: ['Users'],
      summary: 'Get current user profile',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;
    return {
      id: user.id,
      email: user.email,
      verificationLevel: user.verificationLevel,
      votingPower: user.votingPower,
      regions: user.regions,
      roles: user.roles,
    };
  });

  /**
   * GET /api/users/search - Search users
   */
  fastify.get('/search', {
    schema: {
      tags: ['Users'],
      summary: 'Search users',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          region: { type: 'string' },
          expertise: { type: 'string' },
          minReputation: { type: 'number' },
        },
      },
    },
    preHandler: [validateQuery(userSearchSchema)],
  }, async (request) => {
    const query = (request as any).validatedQuery;

    return {
      users: [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      },
    };
  });

  /**
   * GET /api/users/:id - Get user profile
   */
  fastify.get<{ Params: UserParams }>('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Get user profile',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Fetch from database
    // Return public profile only
    return {
      id,
      preferredName: 'User',
      verificationLevel: 'EMAIL_VERIFIED',
      reputation: 50,
      primaryRegion: null,
      expertiseAreas: [],
      publicStats: {
        billsSponsored: 0,
        votesCount: 0,
        delegationsReceived: 0,
        memberSince: new Date().toISOString(),
      },
    };
  });

  /**
   * PUT /api/users/:id - Update user profile
   */
  fastify.put<{ Params: UserParams }>('/:id', {
    schema: {
      tags: ['Users'],
      summary: 'Update user profile',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, validateBody(schemas.updateProfile)],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    // Verify user can only update their own profile
    if (user.id !== id) {
      throw new Error('Not authorized to update this profile');
    }

    return {
      id,
      message: 'Profile updated successfully',
    };
  });

  /**
   * GET /api/users/:id/votes - Get user's voting history
   */
  fastify.get<{ Params: UserParams }>('/:id/votes', {
    schema: {
      tags: ['Users'],
      summary: "Get user's voting history (public votes only)",
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      userId: id,
      votes: [],
      // Only returns public votes
    };
  });

  /**
   * GET /api/users/:id/delegations - Get user's delegations
   */
  fastify.get<{ Params: UserParams }>('/:id/delegations', {
    schema: {
      tags: ['Users'],
      summary: "Get user's delegations (public info)",
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      userId: id,
      outgoing: [],
      incoming: [],
      totalVotingPower: 1,
    };
  });

  /**
   * GET /api/users/:id/sponsored-bills - Get bills sponsored by user
   */
  fastify.get<{ Params: UserParams }>('/:id/sponsored-bills', {
    schema: {
      tags: ['Users'],
      summary: 'Get bills sponsored by user',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      userId: id,
      bills: [],
      total: 0,
    };
  });

  /**
   * GET /api/users/:id/activity - Get user's public activity feed
   */
  fastify.get<{ Params: UserParams }>('/:id/activity', {
    schema: {
      tags: ['Users'],
      summary: "Get user's public activity feed",
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      userId: id,
      activities: [],
      // Public activities only: bill sponsorship, public votes, delegations
    };
  });

  /**
   * POST /api/users/:id/verify - Submit verification request
   */
  fastify.post<{ Params: UserParams }>('/:id/verify', {
    schema: {
      tags: ['Users'],
      summary: 'Submit verification request',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;

    if (user.id !== id) {
      throw new Error('Not authorized');
    }

    reply.status(201);
    return {
      verificationId: `verification-${Date.now()}`,
      status: 'PENDING',
      message: 'Verification request submitted',
    };
  });

  /**
   * GET /api/users/:id/involvement - Get involvement report
   */
  fastify.get<{ Params: UserParams }>('/:id/involvement', {
    schema: {
      tags: ['Users'],
      summary: 'Get detailed involvement report (entity-registry)',
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Integrate with entity-registry package
    return {
      userId: id,
      totalAssociations: 0,
      legislativeInvolvement: [],
      financialInvolvement: [],
      organizationalInvolvement: [],
      conflictsOfInterest: [],
    };
  });

  /**
   * GET /api/users/:id/network - Get user's network connections
   */
  fastify.get<{ Params: UserParams }>('/:id/network', {
    schema: {
      tags: ['Users'],
      summary: 'Get user network connections graph data',
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Integrate with entity-registry package
    return {
      userId: id,
      nodes: [],
      edges: [],
      centralityScore: 0,
    };
  });

  /**
   * GET /api/users/:id/reputation - Get reputation breakdown
   */
  fastify.get<{ Params: UserParams }>('/:id/reputation', {
    schema: {
      tags: ['Users'],
      summary: 'Get reputation score breakdown',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      userId: id,
      totalScore: 50,
      breakdown: {
        participation: 0,
        accuracy: 0,
        endorsements: 0,
        tenure: 0,
      },
      history: [],
    };
  });
}
