import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /v1/metrics/overview
 * Get platform-wide metrics overview
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const overview = {
      timestamp: new Date().toISOString(),
      platform: {
        totalRegions: 52,
        totalCitizens: 45234567,
        activeCitizens: 31456789,
        totalBills: 1234,
        activeBills: 89,
      },
      participation: {
        averageRate: 69.5,
        trend: '+3.2%',
        highestRegion: { id: 'CA-SF', name: 'San Francisco', rate: 74.5 },
        lowestRegion: { id: 'TX-HOU', name: 'Houston', rate: 52.3 },
      },
      legislation: {
        billsPassedThisMonth: 23,
        billsRejectedThisMonth: 8,
        averageTimeToPass: '16 days',
        citizenProposals: 156,
      },
      tbl: {
        averageScore: 72.4,
        people: 71.2,
        planet: 74.8,
        profit: 71.2,
      },
    };

    res.json({ data: overview });
  } catch (error) {
    console.error('Error getting overview:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get metrics overview' },
    });
  }
});

/**
 * GET /v1/metrics/tbl
 * Get Triple Bottom Line scores
 */
router.get('/tbl', async (req: Request, res: Response) => {
  try {
    const { regionId, period } = req.query;

    const tblMetrics = {
      period: period || 'last_30_days',
      regionId: regionId || 'national',
      scores: {
        overall: 72.4,
        people: {
          score: 71.2,
          components: {
            happiness: 68.5,
            equality: 72.1,
            healthAccess: 74.2,
            educationAccess: 69.8,
          },
        },
        planet: {
          score: 74.8,
          components: {
            carbonReduction: 71.2,
            renewableEnergy: 78.4,
            airQuality: 76.1,
            waterQuality: 73.5,
          },
        },
        profit: {
          score: 71.2,
          components: {
            gdpGrowth: 72.3,
            employmentRate: 74.1,
            smallBusinessGrowth: 68.2,
            medianWealthGrowth: 70.2,
          },
        },
      },
      trends: {
        weekly: [70.1, 70.8, 71.2, 71.5, 71.9, 72.1, 72.4],
        monthly: [68.2, 69.4, 70.1, 72.4],
      },
      topPerformers: [
        { regionId: 'CA-SF', name: 'San Francisco', score: 82.1 },
        { regionId: 'WA-SEA', name: 'Seattle', score: 80.4 },
        { regionId: 'CO-DEN', name: 'Denver', score: 79.2 },
      ],
    };

    res.json({ data: tblMetrics });
  } catch (error) {
    console.error('Error getting TBL metrics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get TBL metrics' },
    });
  }
});

/**
 * GET /v1/metrics/governance
 * Get governance health metrics
 */
router.get('/governance', async (req: Request, res: Response) => {
  try {
    const governanceMetrics = {
      efficiency: {
        averageBillPassTime: '16 days',
        comparedToTraditional: '-92%',
        automatedProcessingRate: 85.2,
      },
      transparency: {
        publicDataAvailability: 100,
        votingTransparency: 100,
        spendingVisibility: 98.5,
      },
      participation: {
        citizenEngagement: 69.5,
        delegationUtilization: 34.2,
        proposalSubmissionRate: 12.3,
        commentEngagement: 45.6,
      },
      accountability: {
        sunsetEnforcement: 100,
        metricsCompliance: 97.8,
        conflictResolutionTime: '3.2 days',
      },
      cost: {
        operationalCostReduction: 42.3,
        costPerCitizen: 12.45,
        automationSavings: 156000000,
      },
    };

    res.json({ data: governanceMetrics });
  } catch (error) {
    console.error('Error getting governance metrics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get governance metrics' },
    });
  }
});

/**
 * GET /v1/metrics/compare
 * Compare metrics across regions
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { regions, metrics: requestedMetrics } = req.query;

    const regionList = (regions as string)?.split(',') || ['CA-SF', 'CA-LA'];
    const metricList = (requestedMetrics as string)?.split(',') || ['tbl_score', 'participation_rate'];

    const comparison = {
      regions: regionList,
      metrics: metricList,
      data: regionList.map((regionId) => ({
        regionId,
        regionName: regionId === 'CA-SF' ? 'San Francisco' : 'Los Angeles',
        values: {
          tbl_score: regionId === 'CA-SF' ? 82.1 : 75.3,
          participation_rate: regionId === 'CA-SF' ? 74.5 : 62.8,
          bills_active: regionId === 'CA-SF' ? 8 : 12,
          bills_passed: regionId === 'CA-SF' ? 45 : 67,
        },
      })),
    };

    res.json({ data: comparison });
  } catch (error) {
    console.error('Error comparing metrics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to compare metrics' },
    });
  }
});

export default router;
