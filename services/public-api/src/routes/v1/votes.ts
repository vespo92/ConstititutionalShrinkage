import { Router, Request, Response } from 'express';
import { parsePaginationParams, createPaginatedResponse } from '../../lib/pagination';
import { PublicVoteSession } from '../../types';

const router = Router();

// Mock data for demo
const mockSessions: PublicVoteSession[] = [
  {
    id: 'session_001',
    billId: 'bill_001',
    status: 'active',
    startedAt: '2024-01-20T00:00:00Z',
    endsAt: '2024-02-15T23:59:59Z',
    tally: { yes: 15420, no: 3201, abstain: 892 },
    participationRate: 67.5,
    quorumMet: true,
  },
  {
    id: 'session_002',
    billId: 'bill_002',
    status: 'ended',
    startedAt: '2024-01-12T00:00:00Z',
    endsAt: '2024-01-18T23:59:59Z',
    tally: { yes: 8932, no: 2104, abstain: 445 },
    participationRate: 72.3,
    quorumMet: true,
  },
];

/**
 * GET /v1/votes/sessions
 * List voting sessions with filtering
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const { status, billId } = req.query;

    let filteredSessions = [...mockSessions];

    if (status) {
      filteredSessions = filteredSessions.filter((s) => s.status === status);
    }
    if (billId) {
      filteredSessions = filteredSessions.filter((s) => s.billId === billId);
    }

    const response = createPaginatedResponse(filteredSessions, pagination, filteredSessions.length);
    res.json(response);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list voting sessions' },
    });
  }
});

/**
 * GET /v1/votes/sessions/:id
 * Get a specific voting session
 */
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = mockSessions.find((s) => s.id === id);

    if (!session) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Voting session ${id} not found` },
      });
      return;
    }

    res.json({ data: session });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get voting session' },
    });
  }
});

/**
 * GET /v1/votes/sessions/:id/tally
 * Get detailed tally for a voting session
 */
router.get('/sessions/:id/tally', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = mockSessions.find((s) => s.id === id);

    if (!session) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Voting session ${id} not found` },
      });
      return;
    }

    // Extended tally with regional breakdown
    const tally = {
      sessionId: id,
      billId: session.billId,
      overall: session.tally,
      participationRate: session.participationRate,
      quorumMet: session.quorumMet,
      totalEligibleVoters: 28934,
      totalVotesCast: session.tally.yes + session.tally.no + session.tally.abstain,
      byRegion: [
        {
          regionId: 'CA-SF',
          regionName: 'San Francisco',
          tally: { yes: 8245, no: 1203, abstain: 412 },
          participationRate: 71.2,
        },
        {
          regionId: 'CA-LA',
          regionName: 'Los Angeles',
          tally: { yes: 7175, no: 1998, abstain: 480 },
          participationRate: 64.1,
        },
      ],
      byDemographic: {
        ageGroups: [
          { group: '18-29', yes: 4821, no: 892, abstain: 201 },
          { group: '30-44', yes: 5102, no: 1124, abstain: 312 },
          { group: '45-59', yes: 3412, no: 698, abstain: 198 },
          { group: '60+', yes: 2085, no: 487, abstain: 181 },
        ],
      },
      timeline: [
        { timestamp: '2024-01-20T00:00:00Z', cumulativeVotes: 0 },
        { timestamp: '2024-01-21T00:00:00Z', cumulativeVotes: 4521 },
        { timestamp: '2024-01-22T00:00:00Z', cumulativeVotes: 9234 },
        { timestamp: '2024-01-23T00:00:00Z', cumulativeVotes: 14892 },
      ],
    };

    res.json({ data: tally });
  } catch (error) {
    console.error('Error getting tally:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get voting tally' },
    });
  }
});

/**
 * GET /v1/votes/statistics
 * Get overall voting statistics
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { period } = req.query;

    const statistics = {
      period: period || 'last_30_days',
      totalSessions: 47,
      activeSessions: 5,
      completedSessions: 42,
      averageParticipationRate: 68.4,
      averageVotesPerSession: 15234,
      passRate: 73.8,
      topCategories: [
        { category: 'infrastructure', sessions: 12, avgParticipation: 72.1 },
        { category: 'environment', sessions: 9, avgParticipation: 69.5 },
        { category: 'safety', sessions: 8, avgParticipation: 71.2 },
      ],
    };

    res.json({ data: statistics });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get voting statistics' },
    });
  }
});

export default router;
