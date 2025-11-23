import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TBLScore, TBLMetrics } from '../types/index.js';

interface DateRangeQuery {
  start?: string;
  end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export async function tblRoutes(app: FastifyInstance) {
  // GET /analytics/tbl/overview - TBL summary
  app.get('/overview', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const score: TBLScore = {
      people: 78,
      planet: 85,
      profit: 72,
      overall: 78.3,
    };

    const trends = {
      people: [72, 74, 75, 77, 78, 78],
      planet: [78, 80, 82, 84, 85, 85],
      profit: [68, 70, 69, 71, 72, 72],
    };

    return reply.send({
      success: true,
      data: {
        currentScore: score,
        trends,
        target: { people: 85, planet: 90, profit: 75 },
      },
    });
  });

  // GET /analytics/tbl/people - People metrics
  app.get('/people', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const metrics = {
      overall: 78,
      citizenSatisfaction: 82,
      equalityIndex: 75,
      participationRate: 68,
      accessScore: 79,
      trends: {
        satisfaction: [78, 79, 80, 81, 82, 82],
        equality: [72, 73, 74, 74, 75, 75],
        participation: [65, 66, 67, 67, 68, 68],
        access: [76, 77, 78, 78, 79, 79],
      },
      breakdown: {
        byRegion: [
          { region: 'Northeast', score: 80 },
          { region: 'Southeast', score: 75 },
          { region: 'Midwest', score: 77 },
          { region: 'Southwest', score: 82 },
          { region: 'West', score: 84 },
        ],
      },
    };

    return reply.send({
      success: true,
      data: metrics,
    });
  });

  // GET /analytics/tbl/planet - Planet metrics
  app.get('/planet', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const metrics = {
      overall: 85,
      carbonReduction: 42,
      localSupplyChainPct: 62,
      renewableEnergy: 72,
      wasteReduction: 68,
      trends: {
        carbon: [35, 37, 39, 40, 41, 42],
        localSupply: [55, 57, 58, 60, 61, 62],
        renewable: [65, 67, 68, 70, 71, 72],
        waste: [62, 64, 65, 66, 67, 68],
      },
      breakdown: {
        byRegion: [
          { region: 'Northeast', score: 82 },
          { region: 'Southeast', score: 78 },
          { region: 'Midwest', score: 80 },
          { region: 'Southwest', score: 88 },
          { region: 'West', score: 92 },
        ],
      },
    };

    return reply.send({
      success: true,
      data: metrics,
    });
  });

  // GET /analytics/tbl/profit - Profit metrics
  app.get('/profit', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const metrics = {
      overall: 72,
      costSavings: 2500000000,
      economicGrowth: 3.2,
      jobsCreated: 125000,
      smallBusinessGrowth: 8.5,
      trends: {
        savings: [1.8, 2.0, 2.1, 2.3, 2.4, 2.5],
        growth: [2.8, 2.9, 3.0, 3.1, 3.2, 3.2],
        jobs: [85000, 95000, 105000, 115000, 120000, 125000],
        smallBiz: [5.5, 6.2, 7.0, 7.5, 8.0, 8.5],
      },
      breakdown: {
        byRegion: [
          { region: 'Northeast', score: 70 },
          { region: 'Southeast', score: 68 },
          { region: 'Midwest', score: 72 },
          { region: 'Southwest', score: 75 },
          { region: 'West', score: 78 },
        ],
      },
    };

    return reply.send({
      success: true,
      data: metrics,
    });
  });

  // GET /analytics/tbl/policies - Policy effectiveness
  app.get('/policies', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const policies = [
      {
        id: 'policy-1',
        name: 'Climate Action Bill',
        category: 'Environment',
        tblImpact: { people: 65, planet: 92, profit: 45 },
        effectivenessScore: 78,
        status: 'active',
      },
      {
        id: 'policy-2',
        name: 'Job Training Initiative',
        category: 'Economy',
        tblImpact: { people: 88, planet: 30, profit: 75 },
        effectivenessScore: 82,
        status: 'active',
      },
      {
        id: 'policy-3',
        name: 'Green Energy Incentives',
        category: 'Environment',
        tblImpact: { people: 72, planet: 95, profit: 68 },
        effectivenessScore: 85,
        status: 'active',
      },
      {
        id: 'policy-4',
        name: 'Healthcare Access Act',
        category: 'Healthcare',
        tblImpact: { people: 95, planet: 40, profit: 55 },
        effectivenessScore: 79,
        status: 'active',
      },
    ];

    return reply.send({
      success: true,
      data: policies,
    });
  });
}
