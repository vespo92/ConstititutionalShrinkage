/**
 * Delegations API Routes
 *
 * Liquid democracy delegation management.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schemas, validateBody, validateQuery } from '../middleware/validation.js';
import { NotFoundError, ConflictError, ValidationError } from '../middleware/errorHandler.js';

interface DelegationParams {
  id: string;
}

const delegationListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  scope: z.enum(['ALL', 'CATEGORY', 'SINGLE_BILL']).optional(),
  active: z.coerce.boolean().optional(),
  direction: z.enum(['outgoing', 'incoming', 'both']).default('both'),
});

export async function delegationRoutes(fastify: FastifyInstance) {
  const authenticate = (fastify as any).authenticate;

  /**
   * GET /api/delegations - List user's delegations
   */
  fastify.get('/', {
    schema: {
      tags: ['Delegations'],
      summary: "List user's delegations",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          scope: { type: 'string' },
          active: { type: 'boolean' },
          direction: { type: 'string', default: 'both' },
        },
      },
    },
    preHandler: [authenticate, validateQuery(delegationListSchema)],
  }, async (request) => {
    const user = request.user!;
    const query = (request as any).validatedQuery;

    return {
      userId: user.id,
      outgoing: [],
      incoming: [],
      summary: {
        totalOutgoing: 0,
        totalIncoming: 0,
        effectiveVotingPower: user.votingPower,
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total: 0,
        totalPages: 0,
      },
    };
  });

  /**
   * POST /api/delegations - Create a new delegation
   */
  fastify.post('/', {
    schema: {
      tags: ['Delegations'],
      summary: 'Create a new delegation',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['delegateId', 'scope'],
        properties: {
          delegateId: { type: 'string' },
          scope: { type: 'string', enum: ['ALL', 'CATEGORY', 'SINGLE_BILL'] },
          category: { type: 'string' },
          billId: { type: 'string' },
          expiresAt: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            delegatorId: { type: 'string' },
            delegateId: { type: 'string' },
            scope: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authenticate, validateBody(schemas.createDelegation)],
  }, async (request, reply) => {
    const user = request.user!;
    const body = request.body as z.infer<typeof schemas.createDelegation>;

    // Validation
    if (body.delegateId === user.id) {
      throw new ValidationError('Cannot delegate to yourself');
    }

    if (body.scope === 'CATEGORY' && !body.category) {
      throw new ValidationError('Category is required for CATEGORY scope');
    }

    if (body.scope === 'SINGLE_BILL' && !body.billId) {
      throw new ValidationError('Bill ID is required for SINGLE_BILL scope');
    }

    // TODO: Check for circular delegation
    // TODO: Check for duplicate delegation

    reply.status(201);
    return {
      id: `delegation-${Date.now()}`,
      delegatorId: user.id,
      delegateId: body.delegateId,
      scope: body.scope,
      category: body.category,
      billId: body.billId,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: body.expiresAt,
      message: 'Delegation created successfully',
    };
  });

  /**
   * GET /api/delegations/:id - Get delegation details
   */
  fastify.get<{ Params: DelegationParams }>('/:id', {
    schema: {
      tags: ['Delegations'],
      summary: 'Get delegation details',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Fetch and verify ownership
    return {
      id,
      delegatorId: user.id,
      delegateId: 'delegate-id',
      scope: 'ALL',
      active: true,
      createdAt: new Date().toISOString(),
      votesUsed: 0,
    };
  });

  /**
   * PUT /api/delegations/:id - Update delegation
   */
  fastify.put<{ Params: DelegationParams }>('/:id', {
    schema: {
      tags: ['Delegations'],
      summary: 'Update delegation (e.g., expiration)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const { id } = request.params;
    const user = request.user!;

    return {
      id,
      message: 'Delegation updated successfully',
    };
  });

  /**
   * DELETE /api/delegations/:id - Revoke delegation
   */
  fastify.delete<{ Params: DelegationParams }>('/:id', {
    schema: {
      tags: ['Delegations'],
      summary: 'Revoke a delegation',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params;
    const user = request.user!;

    // TODO: Verify ownership and revoke
    reply.status(204);
  });

  /**
   * GET /api/delegations/:id/chain - Get delegation chain
   */
  fastify.get<{ Params: DelegationParams }>('/:id/chain', {
    schema: {
      tags: ['Delegations'],
      summary: 'Get full delegation chain',
      description: 'Shows the complete chain of delegations (A → B → C)',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      delegationId: id,
      chain: [],
      totalWeight: 1,
      depth: 0,
    };
  });

  /**
   * GET /api/delegations/incoming - Get incoming delegations
   */
  fastify.get('/incoming', {
    schema: {
      tags: ['Delegations'],
      summary: 'Get delegations where user is the delegate',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;

    return {
      userId: user.id,
      delegations: [],
      totalWeight: 0,
      byCategory: {},
    };
  });

  /**
   * GET /api/delegations/outgoing - Get outgoing delegations
   */
  fastify.get('/outgoing', {
    schema: {
      tags: ['Delegations'],
      summary: 'Get delegations where user is the delegator',
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;

    return {
      userId: user.id,
      delegations: [],
      totalDelegated: 0,
      byCategory: {},
    };
  });

  /**
   * GET /api/delegations/check-circular - Check for circular delegation
   */
  fastify.get('/check-circular', {
    schema: {
      tags: ['Delegations'],
      summary: 'Check if a proposed delegation would create a cycle',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        required: ['delegateId'],
        properties: {
          delegateId: { type: 'string' },
          scope: { type: 'string' },
          category: { type: 'string' },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;
    const query = request.query as { delegateId: string; scope?: string; category?: string };

    // TODO: Implement circular delegation check
    return {
      delegatorId: user.id,
      delegateId: query.delegateId,
      wouldCreateCycle: false,
      potentialCycle: [],
    };
  });

  /**
   * GET /api/delegations/suggestions - Get delegate suggestions
   */
  fastify.get('/suggestions', {
    schema: {
      tags: ['Delegations'],
      summary: 'Get suggested delegates based on expertise',
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          region: { type: 'string' },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request) => {
    const user = request.user!;
    const query = request.query as { category?: string; region?: string };

    return {
      suggestions: [],
      basedOn: {
        category: query.category,
        region: query.region,
        userExpertise: [],
      },
    };
  });
}
