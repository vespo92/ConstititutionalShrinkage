import { Router, Request, Response } from 'express';
import { parsePaginationParams, createPaginatedResponse } from '../../lib/pagination';
import { PublicRegion } from '../../types';

const router = Router();

// Mock data for demo
const mockRegions: PublicRegion[] = [
  {
    id: 'CA',
    name: 'California',
    type: 'state',
    population: 39538223,
    activeCitizens: 15234567,
    metrics: {
      tblScore: 78.5,
      participationRate: 68.2,
      billsActive: 23,
      billsPassed: 156,
    },
  },
  {
    id: 'CA-SF',
    name: 'San Francisco',
    type: 'city',
    parentId: 'CA',
    population: 873965,
    activeCitizens: 412345,
    metrics: {
      tblScore: 82.1,
      participationRate: 74.5,
      billsActive: 8,
      billsPassed: 45,
    },
  },
  {
    id: 'CA-LA',
    name: 'Los Angeles',
    type: 'city',
    parentId: 'CA',
    population: 3979576,
    activeCitizens: 1456234,
    metrics: {
      tblScore: 75.3,
      participationRate: 62.8,
      billsActive: 12,
      billsPassed: 67,
    },
  },
];

/**
 * GET /v1/regions
 * List regions with filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const { type, parentId } = req.query;

    let filteredRegions = [...mockRegions];

    if (type) {
      filteredRegions = filteredRegions.filter((r) => r.type === type);
    }
    if (parentId) {
      filteredRegions = filteredRegions.filter((r) => r.parentId === parentId);
    }

    const response = createPaginatedResponse(filteredRegions, pagination, filteredRegions.length);
    res.json(response);
  } catch (error) {
    console.error('Error listing regions:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list regions' },
    });
  }
});

/**
 * GET /v1/regions/:id
 * Get a specific region
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const region = mockRegions.find((r) => r.id === id);

    if (!region) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Region ${id} not found` },
      });
      return;
    }

    // Include child regions
    const children = mockRegions.filter((r) => r.parentId === id);

    res.json({
      data: {
        ...region,
        children: children.map((c) => ({ id: c.id, name: c.name, type: c.type })),
      },
    });
  } catch (error) {
    console.error('Error getting region:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get region' },
    });
  }
});

/**
 * GET /v1/regions/:id/metrics
 * Get detailed metrics for a region
 */
router.get('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { metrics: requestedMetrics, period } = req.query;

    const region = mockRegions.find((r) => r.id === id);

    if (!region) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Region ${id} not found` },
      });
      return;
    }

    // Detailed metrics
    const detailedMetrics = {
      regionId: id,
      regionName: region.name,
      period: period || 'last_30_days',
      tbl: {
        overall: region.metrics.tblScore,
        people: 76.2,
        planet: 81.4,
        profit: 77.9,
        trend: '+2.3%',
      },
      participation: {
        rate: region.metrics.participationRate,
        activeUsers: region.activeCitizens,
        totalEligible: region.population,
        trend: '+1.5%',
      },
      legislation: {
        billsActive: region.metrics.billsActive,
        billsPassed: region.metrics.billsPassed,
        billsRejected: 23,
        averageTimeToPass: '18 days',
      },
      governance: {
        delegationRate: 34.5,
        averageCommentsPerBill: 45,
        citizenProposalRate: 12.3,
      },
      historical: [
        { date: '2024-01-01', tblScore: 76.2, participationRate: 65.4 },
        { date: '2024-01-08', tblScore: 77.1, participationRate: 66.8 },
        { date: '2024-01-15', tblScore: 77.8, participationRate: 67.5 },
        { date: '2024-01-22', tblScore: 78.5, participationRate: 68.2 },
      ],
    };

    res.json({ data: detailedMetrics });
  } catch (error) {
    console.error('Error getting region metrics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get region metrics' },
    });
  }
});

/**
 * GET /v1/regions/:id/leaderboard
 * Get leaderboard for regions
 */
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { metric } = req.query;

    const region = mockRegions.find((r) => r.id === id);

    if (!region) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Region ${id} not found` },
      });
      return;
    }

    // Child regions leaderboard
    const children = mockRegions
      .filter((r) => r.parentId === id)
      .sort((a, b) => b.metrics.tblScore - a.metrics.tblScore)
      .map((r, index) => ({
        rank: index + 1,
        regionId: r.id,
        regionName: r.name,
        score: r.metrics.tblScore,
        change: index === 0 ? 0 : Math.random() > 0.5 ? 1 : -1,
      }));

    res.json({
      data: {
        parentRegion: { id: region.id, name: region.name },
        metric: metric || 'tbl_score',
        leaderboard: children,
      },
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get leaderboard' },
    });
  }
});

export default router;
