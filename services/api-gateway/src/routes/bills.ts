/**
 * Bills API Routes
 *
 * CRUD operations for legislation management.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { schemas, validateBody, validateQuery } from '../middleware/validation.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';

// Type definitions
interface BillParams {
  id: string;
}

interface BillQuery {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  region?: string;
  sponsor?: string;
  search?: string;
}

interface DiffParams {
  id: string;
  v1: string;
  v2: string;
}

// Query schemas
const billListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'IN_COMMITTEE', 'SCHEDULED', 'VOTING', 'PASSED', 'REJECTED', 'ACTIVE', 'EXPIRED']).optional(),
  category: z.string().optional(),
  region: z.string().uuid().optional(),
  sponsor: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title', 'votesCount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function billRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate;

  /**
   * GET /api/bills - List bills with filters
   */
  fastify.get<{ Querystring: BillQuery }>('/', {
    schema: {
      tags: ['Bills'],
      summary: 'List bills with filters',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          status: { type: 'string' },
          category: { type: 'string' },
          region: { type: 'string' },
          sponsor: { type: 'string' },
          search: { type: 'string' },
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
    preHandler: [validateQuery(billListSchema)],
  }, async (request, reply) => {
    const query = (request as any).validatedQuery;

    // TODO: Integrate with database
    // For now, return mock data structure
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
   * GET /api/bills/trending - Get trending bills
   */
  fastify.get('/trending', {
    schema: {
      tags: ['Bills'],
      summary: 'Get trending bills',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
          },
        },
      },
    },
  }, async () => {
    // TODO: Implement trending algorithm
    return { data: [] };
  });

  /**
   * GET /api/bills/categories - List bill categories
   */
  fastify.get('/categories', {
    schema: {
      tags: ['Bills'],
      summary: 'List bill categories',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
          },
        },
      },
    },
  }, async () => {
    return {
      data: [
        { id: 'environment', name: 'Environment', billCount: 0 },
        { id: 'healthcare', name: 'Healthcare', billCount: 0 },
        { id: 'education', name: 'Education', billCount: 0 },
        { id: 'economy', name: 'Economy', billCount: 0 },
        { id: 'infrastructure', name: 'Infrastructure', billCount: 0 },
        { id: 'defense', name: 'Defense', billCount: 0 },
        { id: 'social', name: 'Social Services', billCount: 0 },
        { id: 'technology', name: 'Technology', billCount: 0 },
      ],
    };
  });

  /**
   * GET /api/bills/my-region/:region - Get bills for a region
   */
  fastify.get<{ Params: { region: string } }>('/my-region/:region', {
    schema: {
      tags: ['Bills'],
      summary: 'Get bills for a specific region',
      params: {
        type: 'object',
        properties: {
          region: { type: 'string' },
        },
        required: ['region'],
      },
    },
  }, async (request) => {
    const { region } = request.params;
    // TODO: Filter by region
    return { data: [], region };
  });

  /**
   * GET /api/bills/:id - Get bill details
   */
  fastify.get<{ Params: BillParams }>('/:id', {
    schema: {
      tags: ['Bills'],
      summary: 'Get bill details',
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
    throw new NotFoundError('Bill', id);
  });

  /**
   * POST /api/bills - Create a new bill
   */
  fastify.post('/', {
    schema: {
      tags: ['Bills'],
      summary: 'Create a new bill',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['title', 'content', 'level', 'categoryId'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 200 },
          content: { type: 'string', minLength: 10 },
          level: { type: 'string', enum: ['IMMUTABLE', 'FEDERAL', 'REGIONAL', 'LOCAL'] },
          regionId: { type: 'string' },
          categoryId: { type: 'string' },
          sunsetYears: { type: 'number', default: 5 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, validateBody(schemas.createBill)],
  }, async (request, reply) => {
    const user = request.user!;
    const body = request.body as z.infer<typeof schemas.createBill>;

    // TODO: Create bill using governance-utils package
    // const bill = createBill({
    //   title: body.title,
    //   content: body.content,
    //   sponsor: user.id,
    //   level: body.level,
    //   sunsetYears: body.sunsetYears,
    // });

    reply.status(201);
    return {
      id: 'new-bill-id',
      message: 'Bill created successfully',
    };
  });

  /**
   * PUT /api/bills/:id - Update a bill
   */
  fastify.put<{ Params: BillParams }>('/:id', {
    schema: {
      tags: ['Bills'],
      summary: 'Update a bill',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, validateBody(schemas.updateBill)],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Check ownership and update
    return { id, message: 'Bill updated successfully' };
  });

  /**
   * DELETE /api/bills/:id - Delete a draft bill
   */
  fastify.delete<{ Params: BillParams }>('/:id', {
    schema: {
      tags: ['Bills'],
      summary: 'Delete a draft bill',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    // Only allow deleting DRAFT bills by sponsor
    reply.status(204);
  });

  /**
   * GET /api/bills/:id/history - Get bill version history
   */
  fastify.get<{ Params: BillParams }>('/:id/history', {
    schema: {
      tags: ['Bills'],
      summary: 'Get bill version history',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      versions: [],
    };
  });

  /**
   * GET /api/bills/:id/amendments - Get bill amendments
   */
  fastify.get<{ Params: BillParams }>('/:id/amendments', {
    schema: {
      tags: ['Bills'],
      summary: 'Get bill amendments',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      amendments: [],
    };
  });

  /**
   * POST /api/bills/:id/amendments - Propose an amendment
   */
  fastify.post<{ Params: BillParams }>('/:id/amendments', {
    schema: {
      tags: ['Bills'],
      summary: 'Propose an amendment',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, validateBody(schemas.proposeAmendment)],
  }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;

    reply.status(201);
    return {
      billId: id,
      amendmentId: 'new-amendment-id',
      message: 'Amendment proposed successfully',
    };
  });

  /**
   * GET /api/bills/:id/comments - Get bill comments
   */
  fastify.get<{ Params: BillParams }>('/:id/comments', {
    schema: {
      tags: ['Bills'],
      summary: 'Get bill comments',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      comments: [],
    };
  });

  /**
   * POST /api/bills/:id/comments - Add a comment
   */
  fastify.post<{ Params: BillParams }>('/:id/comments', {
    schema: {
      tags: ['Bills'],
      summary: 'Add a comment to a bill',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, validateBody(schemas.createComment)],
  }, async (request, reply) => {
    const { id } = request.params;
    reply.status(201);
    return {
      billId: id,
      commentId: 'new-comment-id',
      message: 'Comment added successfully',
    };
  });

  /**
   * GET /api/bills/:id/impact - Get impact prediction
   */
  fastify.get<{ Params: BillParams }>('/:id/impact', {
    schema: {
      tags: ['Bills'],
      summary: 'Get Triple Bottom Line impact prediction',
    },
  }, async (request) => {
    const { id } = request.params;
    // TODO: Integrate with metrics package
    return {
      billId: id,
      impact: {
        people: 0,
        planet: 0,
        profit: 0,
        composite: 0,
        tradeoffs: [],
      },
    };
  });

  /**
   * GET /api/bills/:id/constitutional - Get constitutional compliance check
   */
  fastify.get<{ Params: BillParams }>('/:id/constitutional', {
    schema: {
      tags: ['Bills'],
      summary: 'Get constitutional compliance check',
    },
  }, async (request) => {
    const { id } = request.params;
    // TODO: Integrate with constitutional-framework package
    return {
      billId: id,
      valid: true,
      errors: [],
      warnings: [],
      rightsProtected: [],
    };
  });

  /**
   * GET /api/bills/:id/diff/:v1/:v2 - Get diff between versions
   */
  fastify.get<{ Params: DiffParams }>('/:id/diff/:v1/:v2', {
    schema: {
      tags: ['Bills'],
      summary: 'Get diff between two versions',
    },
  }, async (request) => {
    const { id, v1, v2 } = request.params;
    // TODO: Integrate with governance-utils package
    return {
      billId: id,
      fromVersion: v1,
      toVersion: v2,
      diff: {
        additions: [],
        deletions: [],
        modifications: [],
      },
    };
  });

  /**
   * GET /api/bills/:id/blame - Get blame info
   */
  fastify.get<{ Params: BillParams }>('/:id/blame', {
    schema: {
      tags: ['Bills'],
      summary: 'Get line-by-line authorship info',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      blame: [],
    };
  });

  /**
   * POST /api/bills/:id/vote - Cast a vote on a bill
   */
  fastify.post<{ Params: BillParams }>('/:id/vote', {
    schema: {
      tags: ['Bills', 'Votes'],
      summary: 'Cast a vote on a bill',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Integrate with voting-system package
    reply.status(201);
    return {
      billId: id,
      voteId: 'new-vote-id',
      receipt: 'cryptographic-proof',
      message: 'Vote cast successfully',
    };
  });

  /**
   * GET /api/bills/:id/my-vote - Get user's vote on a bill
   */
  fastify.get<{ Params: BillParams }>('/:id/my-vote', {
    schema: {
      tags: ['Bills', 'Votes'],
      summary: "Get user's vote on a bill",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    return {
      billId: id,
      userId: user.id,
      vote: null, // or { choice, timestamp, isPublic }
    };
  });

  /**
   * GET /api/bills/:id/results - Get voting results
   */
  fastify.get<{ Params: BillParams }>('/:id/results', {
    schema: {
      tags: ['Bills', 'Votes'],
      summary: 'Get current voting results',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      results: {
        for: 0,
        against: 0,
        abstain: 0,
        total: 0,
        weightedFor: 0,
        weightedAgainst: 0,
        quorumMet: false,
        passed: false,
      },
    };
  });

  /**
   * GET /api/bills/:id/session - Get voting session info
   */
  fastify.get<{ Params: BillParams }>('/:id/session', {
    schema: {
      tags: ['Bills', 'Votes'],
      summary: 'Get voting session info',
    },
  }, async (request) => {
    const { id } = request.params;
    return {
      billId: id,
      session: null, // or session details
    };
  });

  /**
   * POST /api/bills/:id/cosponsors - Invite a co-sponsor
   */
  fastify.post<{ Params: BillParams }>('/:id/cosponsors', {
    schema: {
      tags: ['Bills'],
      summary: 'Invite a co-sponsor',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    reply.status(201);
    return {
      billId: id,
      message: 'Co-sponsor invitation sent',
    };
  });

  /**
   * POST /api/bills/:id/validate - Validate bill
   */
  fastify.post<{ Params: BillParams }>('/:id/validate', {
    schema: {
      tags: ['Bills'],
      summary: 'Validate bill against constitutional framework',
    },
  }, async (request) => {
    const { id } = request.params;
    // TODO: Integrate with constitutional-framework package
    return {
      billId: id,
      valid: true,
      errors: [],
      warnings: [],
    };
  });
}
