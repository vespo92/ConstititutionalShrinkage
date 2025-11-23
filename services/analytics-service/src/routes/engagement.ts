import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EngagementOverview } from '../types/index.js';

interface DateRangeQuery {
  start?: string;
  end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export async function engagementRoutes(app: FastifyInstance) {
  // GET /analytics/engagement/overview - Engagement summary
  app.get('/overview', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const overview: EngagementOverview = {
      activeCitizens: 127453,
      dailyActiveUsers: 45230,
      activeDelegations: 183000,
      avgSessionTime: 8.5,
    };

    return reply.send({
      success: true,
      data: overview,
    });
  });

  // GET /analytics/engagement/trends - Engagement trends
  app.get('/trends', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const trends = [
      { date: '2025-01-01', users: 45000, sessions: 62000, votes: 12000 },
      { date: '2025-01-08', users: 48000, sessions: 68000, votes: 15000 },
      { date: '2025-01-15', users: 52000, sessions: 74000, votes: 18000 },
      { date: '2025-01-22', users: 55000, sessions: 78000, votes: 22000 },
      { date: '2025-01-29', users: 58000, sessions: 82000, votes: 25000 },
      { date: '2025-02-05', users: 61000, sessions: 88000, votes: 28000 },
    ];

    return reply.send({
      success: true,
      data: trends,
    });
  });

  // GET /analytics/engagement/delegations - Delegation patterns
  app.get('/delegations', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const delegations = {
      total: 183000,
      byType: [
        { type: 'Full Delegation', count: 64050, percentage: 35 },
        { type: 'Topic-Specific', count: 82350, percentage: 45 },
        { type: 'Temporary', count: 27450, percentage: 15 },
        { type: 'Partial', count: 9150, percentage: 5 },
      ],
      byCategory: [
        { category: 'Environment', delegations: 45000 },
        { category: 'Economy', delegations: 38000 },
        { category: 'Healthcare', delegations: 32000 },
        { category: 'Education', delegations: 28000 },
        { category: 'Infrastructure', delegations: 22000 },
        { category: 'Defense', delegations: 18000 },
      ],
      topDelegates: [
        { id: 'd1', name: 'policy_expert_1', delegators: 1250, categories: ['Environment', 'Economy'] },
        { id: 'd2', name: 'civic_leader_2', delegators: 980, categories: ['Healthcare', 'Education'] },
        { id: 'd3', name: 'tech_advocate_3', delegators: 875, categories: ['Technology', 'Infrastructure'] },
      ],
    };

    return reply.send({
      success: true,
      data: delegations,
    });
  });

  // GET /analytics/engagement/retention - User retention cohorts
  app.get('/retention', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const retention = {
      cohorts: [
        { cohort: 'Jan Week 1', values: [100, 72, 58, 48, 42, 38] },
        { cohort: 'Jan Week 2', values: [100, 75, 62, 52, 45, null] },
        { cohort: 'Jan Week 3', values: [100, 78, 65, 55, null, null] },
        { cohort: 'Jan Week 4', values: [100, 74, 61, null, null, null] },
        { cohort: 'Feb Week 1', values: [100, 76, null, null, null, null] },
      ],
      averages: {
        week1: 75,
        week2: 61.5,
        week3: 51.7,
        week4: 43.5,
        week5: 38,
      },
    };

    return reply.send({
      success: true,
      data: retention,
    });
  });

  // GET /analytics/engagement/contributors - Top contributors
  app.get('/contributors', async (
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) => {
    const limit = parseInt(request.query.limit || '10');

    const contributors = [
      { rank: 1, username: 'citizen_42', proposals: 12, votes: 156, delegations: 45, score: 892 },
      { rank: 2, username: 'democracy_fan', proposals: 8, votes: 203, delegations: 38, score: 845 },
      { rank: 3, username: 'policy_wonk', proposals: 15, votes: 89, delegations: 52, score: 812 },
      { rank: 4, username: 'civic_leader', proposals: 6, votes: 178, delegations: 28, score: 768 },
      { rank: 5, username: 'engaged_voter', proposals: 4, votes: 245, delegations: 15, score: 724 },
    ].slice(0, limit);

    return reply.send({
      success: true,
      data: contributors,
    });
  });
}
