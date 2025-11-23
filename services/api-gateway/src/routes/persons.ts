/**
 * Persons API Routes
 *
 * Public person information endpoints.
 * Separate from users.ts to provide public-facing person data.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation.js';
import { NotFoundError } from '../middleware/errorHandler.js';

interface PersonParams {
  id: string;
}

const personSearchSchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  region: z.string().uuid().optional(),
  role: z.enum(['CITIZEN', 'REPRESENTATIVE', 'OFFICIAL', 'EXPERT']).optional(),
  verificationLevel: z.string().optional(),
  sortBy: z.enum(['name', 'reputation', 'votingPower', 'joinDate']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function personRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/persons - List persons with filters
   */
  fastify.get('/', {
    schema: {
      tags: ['Persons'],
      summary: 'List persons with filters',
      description: 'Returns publicly available person information',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          region: { type: 'string' },
          role: { type: 'string' },
          verificationLevel: { type: 'string' },
          sortBy: { type: 'string' },
          order: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preHandler: [validateQuery(personSearchSchema)],
  }, async (request) => {
    const query = (request as any).validatedQuery;

    // TODO: Integrate with entity-registry package
    return {
      data: [],
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      },
    };
  });

  /**
   * GET /api/persons/:id - Get person public info
   */
  fastify.get<{ Params: PersonParams }>('/:id', {
    schema: {
      tags: ['Persons'],
      summary: 'Get person public info',
      description: 'Returns publicly available information about a person',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            displayName: { type: 'string' },
            verificationLevel: { type: 'string' },
            role: { type: 'string' },
            region: { type: 'object' },
            reputation: { type: 'number' },
            memberSince: { type: 'string' },
          },
        },
      },
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Fetch from database via entity-registry
    // Return public profile only - no private data
    return {
      id,
      displayName: 'Citizen',
      verificationLevel: 'EMAIL_VERIFIED',
      role: 'CITIZEN',
      primaryRegion: {
        id: 'region-1',
        name: 'Default Region',
        level: 'LOCAL',
      },
      reputation: 50,
      expertiseAreas: [],
      publicStats: {
        billsSponsored: 0,
        publicVotes: 0,
        delegationsReceived: 0,
        amendmentsProposed: 0,
        commentsPosted: 0,
      },
      badges: [],
      memberSince: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
  });

  /**
   * GET /api/persons/:id/activity - Get person's public activity
   */
  fastify.get<{ Params: PersonParams }>('/:id/activity', {
    schema: {
      tags: ['Persons'],
      summary: "Get person's public activity",
      description: 'Returns public activity feed for a person',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      personId: id,
      activities: [],
      // Only public activities: public votes, bill sponsorships, comments
    };
  });

  /**
   * GET /api/persons/:id/positions - Get person's public positions
   */
  fastify.get<{ Params: PersonParams }>('/:id/positions', {
    schema: {
      tags: ['Persons'],
      summary: "Get person's public positions on issues",
      description: 'Returns voting patterns and stated positions',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      personId: id,
      positions: {
        byCategory: {},
        byIssue: {},
      },
      votingPattern: {
        mostActiveCategories: [],
        alignmentScores: {},
      },
    };
  });

  /**
   * GET /api/persons/:id/sponsored - Get person's sponsored bills
   */
  fastify.get<{ Params: PersonParams }>('/:id/sponsored', {
    schema: {
      tags: ['Persons'],
      summary: "Get person's sponsored bills",
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      personId: id,
      bills: [],
      summary: {
        total: 0,
        passed: 0,
        pending: 0,
        rejected: 0,
      },
    };
  });

  /**
   * GET /api/persons/:id/delegations - Get person's public delegation info
   */
  fastify.get<{ Params: PersonParams }>('/:id/delegations', {
    schema: {
      tags: ['Persons'],
      summary: "Get person's public delegation information",
      description: 'Shows incoming delegations (if person is a delegate)',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      personId: id,
      isDelegate: false,
      incomingCount: 0,
      totalVotingPower: 1,
      expertiseAreas: [],
      // Does not reveal who delegated to them (privacy)
    };
  });

  /**
   * GET /api/persons/:id/involvement - Get entity involvement report
   */
  fastify.get<{ Params: PersonParams }>('/:id/involvement', {
    schema: {
      tags: ['Persons'],
      summary: 'Get entity involvement report',
      description: 'Shows organizational affiliations and potential conflicts of interest',
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Integrate with entity-registry package
    return {
      personId: id,
      organizations: [],
      roles: [],
      financialInterests: [],
      conflictsOfInterest: [],
      disclosureDate: new Date().toISOString(),
    };
  });

  /**
   * GET /api/persons/representatives - Get elected representatives
   */
  fastify.get('/representatives', {
    schema: {
      tags: ['Persons'],
      summary: 'Get elected representatives',
      querystring: {
        type: 'object',
        properties: {
          region: { type: 'string' },
          level: { type: 'string', enum: ['FEDERAL', 'REGIONAL', 'LOCAL'] },
        },
      },
    },
  }, async (request) => {
    const query = request.query as { region?: string; level?: string };

    return {
      representatives: [],
      region: query.region,
      level: query.level,
    };
  });

  /**
   * GET /api/persons/experts - Get subject matter experts
   */
  fastify.get('/experts', {
    schema: {
      tags: ['Persons'],
      summary: 'Get subject matter experts',
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          region: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request) => {
    const query = request.query as { category?: string; region?: string; limit?: number };

    return {
      experts: [],
      category: query.category,
      criteria: {
        minReputation: 70,
        verificationRequired: true,
      },
    };
  });

  /**
   * GET /api/persons/leaderboard - Get participation leaderboard
   */
  fastify.get('/leaderboard', {
    schema: {
      tags: ['Persons'],
      summary: 'Get participation leaderboard',
      querystring: {
        type: 'object',
        properties: {
          metric: { type: 'string', enum: ['votes', 'bills', 'comments', 'reputation'] },
          region: { type: 'string' },
          timeframe: { type: 'string', enum: ['7d', '30d', '90d', 'all'] },
          limit: { type: 'number', default: 10 },
        },
      },
    },
  }, async (request) => {
    const query = request.query as {
      metric?: string;
      region?: string;
      timeframe?: string;
      limit?: number;
    };

    return {
      metric: query.metric || 'reputation',
      timeframe: query.timeframe || '30d',
      entries: [],
      lastUpdated: new Date().toISOString(),
    };
  });
}
