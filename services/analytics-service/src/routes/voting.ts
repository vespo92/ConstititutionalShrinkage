import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { aggregator } from '../services/aggregator.js';
import { VotingOverview, VotingSession } from '../types/index.js';

interface DateRangeQuery {
  start?: string;
  end?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export async function votingRoutes(app: FastifyInstance) {
  // GET /analytics/voting/overview - Voting summary
  app.get('/overview', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const { start, end, period = 'month' } = request.query;

    const overview: VotingOverview = {
      totalVotes: 1284563,
      activeSessions: 12,
      participationRate: 68.5,
      avgTimeToVote: 4.2,
    };

    return reply.send({
      success: true,
      data: overview,
      period,
      dateRange: { start, end },
    });
  });

  // GET /analytics/voting/sessions - Session analytics
  app.get('/sessions', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery & { status?: string } }>,
    reply: FastifyReply
  ) => {
    const { status } = request.query;

    const sessions: VotingSession[] = [
      {
        id: 'VS-2024-156',
        billId: 'BILL-2024-089',
        billTitle: 'Climate Action Bill',
        startTime: '2025-01-28T10:00:00Z',
        endTime: '2025-01-28T22:00:00Z',
        totalVotes: 12450,
        yesVotes: 9711,
        noVotes: 2490,
        abstainVotes: 249,
        participationRate: 78,
        status: 'completed',
      },
      {
        id: 'VS-2024-157',
        billId: 'BILL-2024-090',
        billTitle: 'Education Reform Act',
        startTime: '2025-01-29T09:00:00Z',
        totalVotes: 8540,
        yesVotes: 5551,
        noVotes: 2562,
        abstainVotes: 427,
        participationRate: 65,
        status: 'active',
      },
    ];

    const filtered = status
      ? sessions.filter((s) => s.status === status)
      : sessions;

    return reply.send({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  });

  // GET /analytics/voting/participation - Participation rates
  app.get('/participation', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery & { groupBy?: string } }>,
    reply: FastifyReply
  ) => {
    const { groupBy = 'region' } = request.query;

    const participationData = {
      overall: 68.5,
      byRegion: [
        { region: 'Northeast', rate: 72 },
        { region: 'Southeast', rate: 65 },
        { region: 'Midwest', rate: 58 },
        { region: 'Southwest', rate: 71 },
        { region: 'West', rate: 68 },
      ],
      byDemographic: [
        { group: '18-25', rate: 45 },
        { group: '26-35', rate: 62 },
        { group: '36-50', rate: 75 },
        { group: '51-65', rate: 82 },
        { group: '65+', rate: 68 },
      ],
      trend: [
        { date: '2025-01-01', rate: 65 },
        { date: '2025-01-08', rate: 67 },
        { date: '2025-01-15', rate: 66 },
        { date: '2025-01-22', rate: 69 },
        { date: '2025-01-29', rate: 68.5 },
      ],
    };

    return reply.send({
      success: true,
      data: participationData,
      groupBy,
    });
  });

  // GET /analytics/voting/trends - Voting trends
  app.get('/trends', async (
    request: FastifyRequest<{ Querystring: DateRangeQuery }>,
    reply: FastifyReply
  ) => {
    const trendData = aggregator.generateTimeSeries('votes', 30);

    return reply.send({
      success: true,
      data: trendData,
    });
  });
}
