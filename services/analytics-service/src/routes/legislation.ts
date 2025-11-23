import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LegislationOverview, BillLifecycle } from '../types/index.js';

interface DateRangeQuery {
  start?: string;
  end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export async function legislationRoutes(app: FastifyInstance) {
  // GET /analytics/legislation/overview - Bill summary
  app.get('/overview', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const overview: LegislationOverview = {
      totalBills: 293,
      passageRate: 72.4,
      avgDaysToPass: 18,
      pendingReview: 32,
    };

    return reply.send({
      success: true,
      data: overview,
    });
  });

  // GET /analytics/legislation/lifecycle - Bill lifecycle
  app.get('/lifecycle', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const lifecycle: BillLifecycle = {
      draft: 45,
      review: 32,
      voting: 12,
      passed: 156,
      rejected: 23,
      sunset: 8,
    };

    return reply.send({
      success: true,
      data: lifecycle,
    });
  });

  // GET /analytics/legislation/categories - Category breakdown
  app.get('/categories', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const categories = [
      { category: 'Environment', count: 45, passRate: 78 },
      { category: 'Economy', count: 38, passRate: 65 },
      { category: 'Healthcare', count: 32, passRate: 71 },
      { category: 'Education', count: 28, passRate: 82 },
      { category: 'Infrastructure', count: 25, passRate: 68 },
      { category: 'Defense', count: 18, passRate: 55 },
      { category: 'Technology', count: 22, passRate: 75 },
      { category: 'Housing', count: 15, passRate: 60 },
    ];

    return reply.send({
      success: true,
      data: categories,
    });
  });

  // GET /analytics/legislation/sunsets - Upcoming sunsets
  app.get('/sunsets', async (
    request: FastifyRequest<{ Querystring: { days?: string } }>,
    reply: FastifyReply
  ) => {
    const days = parseInt(request.query.days || '90');

    const sunsets = [
      {
        billId: 'BILL-2023-045',
        title: 'Clean Air Initiative',
        category: 'Environment',
        sunsetDate: '2025-03-15',
        effectivenessScore: 85,
        recommendation: 'renew',
      },
      {
        billId: 'BILL-2023-078',
        title: 'Small Business Tax Credit',
        category: 'Economy',
        sunsetDate: '2025-04-01',
        effectivenessScore: 72,
        recommendation: 'review',
      },
      {
        billId: 'BILL-2023-092',
        title: 'Digital Privacy Act',
        category: 'Technology',
        sunsetDate: '2025-04-30',
        effectivenessScore: 91,
        recommendation: 'renew',
      },
      {
        billId: 'BILL-2023-101',
        title: 'Housing Subsidy Program',
        category: 'Housing',
        sunsetDate: '2025-05-15',
        effectivenessScore: 45,
        recommendation: 'sunset',
      },
    ];

    return reply.send({
      success: true,
      data: sunsets,
      lookAheadDays: days,
    });
  });

  // GET /analytics/legislation/efficiency - Legislative efficiency metrics
  app.get('/efficiency', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const efficiency = {
      avgDaysToPass: 18,
      targetDays: 20,
      trend: [
        { month: 'Jul', avgDays: 24, bills: 45 },
        { month: 'Aug', avgDays: 22, bills: 52 },
        { month: 'Sep', avgDays: 19, bills: 38 },
        { month: 'Oct', avgDays: 18, bills: 61 },
        { month: 'Nov', avgDays: 17, bills: 55 },
        { month: 'Dec', avgDays: 18, bills: 42 },
      ],
      bottlenecks: [
        { stage: 'Review', avgDays: 8 },
        { stage: 'Amendment', avgDays: 5 },
        { stage: 'Voting', avgDays: 3 },
        { stage: 'Implementation', avgDays: 2 },
      ],
    };

    return reply.send({
      success: true,
      data: efficiency,
    });
  });
}
