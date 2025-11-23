/**
 * Organizations API Routes
 *
 * Business and organization transparency endpoints.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateQuery } from '../middleware/validation.js';
import { NotFoundError } from '../middleware/errorHandler.js';

interface OrgParams {
  id: string;
}

const orgSearchSchema = z.object({
  q: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'UNION', 'PAC', 'OTHER']).optional(),
  region: z.string().uuid().optional(),
  industry: z.string().optional(),
  minTransparencyScore: z.coerce.number().min(0).max(100).optional(),
  sortBy: z.enum(['name', 'transparencyScore', 'lobbyingSpend', 'size']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function organizationRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/organizations - List organizations
   */
  fastify.get('/', {
    schema: {
      tags: ['Organizations'],
      summary: 'List organizations',
      description: 'Returns registered organizations with transparency data',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
          type: { type: 'string' },
          region: { type: 'string' },
          industry: { type: 'string' },
          minTransparencyScore: { type: 'number' },
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
    preHandler: [validateQuery(orgSearchSchema)],
  }, async (request) => {
    const query = (request as any).validatedQuery;

    // TODO: Integrate with business-transparency package
    return {
      data: [],
      filters: {
        types: ['CORPORATION', 'NON_PROFIT', 'GOVERNMENT', 'UNION', 'PAC', 'OTHER'],
        industries: [],
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
   * GET /api/organizations/:id - Get organization details
   */
  fastify.get<{ Params: OrgParams }>('/:id', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization details',
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

    // TODO: Integrate with business-transparency package
    return {
      id,
      name: 'Organization',
      type: 'CORPORATION',
      industry: 'Technology',
      size: 'LARGE',
      headquarters: {
        region: null,
        address: null,
      },
      registrationDate: new Date().toISOString(),
      transparencyScore: 0,
      tblScore: {
        people: 0,
        planet: 0,
        profit: 0,
        composite: 0,
      },
      leadership: [],
      recentActivity: [],
    };
  });

  /**
   * GET /api/organizations/:id/transparency - Get transparency report
   */
  fastify.get<{ Params: OrgParams }>('/:id/transparency', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization transparency report',
      description: 'Detailed transparency metrics and disclosures',
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Integrate with business-transparency package
    return {
      organizationId: id,
      overallScore: 0,
      components: {
        financialDisclosure: {
          score: 0,
          lastUpdated: null,
          details: {},
        },
        lobbyingTransparency: {
          score: 0,
          totalSpend: 0,
          activities: [],
        },
        politicalContributions: {
          score: 0,
          totalContributions: 0,
          recipients: [],
        },
        environmentalReporting: {
          score: 0,
          carbonFootprint: null,
          certifications: [],
        },
        laborPractices: {
          score: 0,
          wageTransparency: false,
          unionStatus: null,
        },
        supplyChain: {
          score: 0,
          disclosureLevel: 'NONE',
          auditResults: [],
        },
      },
      certifications: [],
      pendingDisclosures: [],
      reportGeneratedAt: new Date().toISOString(),
    };
  });

  /**
   * GET /api/organizations/:id/lobbying - Get lobbying activities
   */
  fastify.get<{ Params: OrgParams }>('/:id/lobbying', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization lobbying activities',
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request) => {
    const { id } = request.params;
    const query = request.query as { startDate?: string; endDate?: string; page?: number; limit?: number };

    return {
      organizationId: id,
      summary: {
        totalSpend: 0,
        billsTargeted: 0,
        contactsMade: 0,
        lobbyistsEmployed: 0,
      },
      activities: [],
      byBill: [],
      byCategory: {},
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 0,
        totalPages: 0,
      },
    };
  });

  /**
   * GET /api/organizations/:id/contributions - Get political contributions
   */
  fastify.get<{ Params: OrgParams }>('/:id/contributions', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get political contributions',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      organizationId: id,
      summary: {
        totalContributions: 0,
        recipientCount: 0,
        averageContribution: 0,
      },
      contributions: [],
      byParty: {},
      byRegion: {},
      trends: [],
    };
  });

  /**
   * GET /api/organizations/:id/bills - Get bills organization is interested in
   */
  fastify.get<{ Params: OrgParams }>('/:id/bills', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get bills organization has lobbied on',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      organizationId: id,
      bills: [],
      positions: {},
      // Shows what bills the org has lobbied for/against
    };
  });

  /**
   * GET /api/organizations/:id/people - Get affiliated people
   */
  fastify.get<{ Params: OrgParams }>('/:id/people', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get people affiliated with organization',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      organizationId: id,
      leadership: [],
      employees: {
        total: 0,
        inGovernment: 0,
        lobbyists: 0,
      },
      formerOfficials: [], // Revolving door tracking
      boardMembers: [],
    };
  });

  /**
   * GET /api/organizations/:id/network - Get organization network graph
   */
  fastify.get<{ Params: OrgParams }>('/:id/network', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization network connections',
      description: 'Returns graph data for visualization',
    },
  }, async (request) => {
    const { id } = request.params;

    // TODO: Integrate with entity-registry package
    return {
      organizationId: id,
      nodes: [],
      edges: [],
      clusters: [],
      centralityScore: 0,
    };
  });

  /**
   * GET /api/organizations/:id/tbl - Get TBL score history
   */
  fastify.get<{ Params: OrgParams }>('/:id/tbl', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organization TBL score history',
    },
  }, async (request) => {
    const { id } = request.params;

    return {
      organizationId: id,
      current: {
        people: 0,
        planet: 0,
        profit: 0,
        composite: 0,
      },
      history: [],
      industryAverage: {
        people: 0,
        planet: 0,
        profit: 0,
      },
      ranking: {
        overall: 0,
        inIndustry: 0,
        inRegion: 0,
      },
    };
  });

  /**
   * GET /api/organizations/industries - List industries
   */
  fastify.get('/industries', {
    schema: {
      tags: ['Organizations'],
      summary: 'List all industries',
    },
  }, async () => {
    return {
      industries: [
        { id: 'technology', name: 'Technology', orgCount: 0 },
        { id: 'healthcare', name: 'Healthcare', orgCount: 0 },
        { id: 'finance', name: 'Finance', orgCount: 0 },
        { id: 'energy', name: 'Energy', orgCount: 0 },
        { id: 'manufacturing', name: 'Manufacturing', orgCount: 0 },
        { id: 'retail', name: 'Retail', orgCount: 0 },
        { id: 'agriculture', name: 'Agriculture', orgCount: 0 },
        { id: 'defense', name: 'Defense', orgCount: 0 },
        { id: 'media', name: 'Media & Entertainment', orgCount: 0 },
        { id: 'real_estate', name: 'Real Estate', orgCount: 0 },
      ],
    };
  });

  /**
   * GET /api/organizations/top-lobbyists - Get top lobbying organizations
   */
  fastify.get('/top-lobbyists', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get top lobbying organizations',
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['30d', '90d', '1y', 'all'] },
          industry: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request) => {
    const query = request.query as { timeframe?: string; industry?: string; limit?: number };

    return {
      timeframe: query.timeframe || '1y',
      organizations: [],
      totalSpend: 0,
    };
  });

  /**
   * GET /api/organizations/transparency-leaders - Get most transparent orgs
   */
  fastify.get('/transparency-leaders', {
    schema: {
      tags: ['Organizations'],
      summary: 'Get organizations with highest transparency scores',
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          industry: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request) => {
    const query = request.query as { type?: string; industry?: string; limit?: number };

    return {
      leaders: [],
      averageScore: 0,
      improvingFastest: [],
    };
  });
}
