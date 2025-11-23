/**
 * Analysis routes (sensitivity, Monte Carlo, historical)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sensitivityService } from '../services/sensitivity';
import { monteCarloService } from '../services/monte-carlo';
import { comparisonService } from '../services/comparison';
import { simulationRunner } from '../services/runner';

const router = Router();

// Validation schemas
const sensitivitySchema = z.object({
  simulationId: z.string().min(1),
  parameters: z.array(z.string()).optional(),
  ranges: z.record(z.tuple([z.number(), z.number()])).optional()
});

const monteCarloSchema = z.object({
  simulationId: z.string().min(1),
  iterations: z.number().min(100).max(10000).default(1000),
  parameterRanges: z.array(z.object({
    name: z.string(),
    distribution: z.enum(['normal', 'uniform', 'triangular', 'lognormal']),
    params: z.array(z.number())
  }))
});

const compareSchema = z.object({
  policyIds: z.array(z.string()).min(2),
  region: z.string().min(1),
  timeHorizon: z.number().positive().max(50)
});

/**
 * Run sensitivity analysis
 */
router.post('/sensitivity', async (req: Request, res: Response) => {
  try {
    const validated = sensitivitySchema.parse(req.body);

    // Get default parameters if not specified
    const parameters = validated.parameters?.length
      ? validated.parameters
      : sensitivityService.getDefaultParameters();

    const results = await sensitivityService.analyze(
      validated.simulationId,
      parameters,
      validated.ranges
    );

    res.json({
      simulationId: validated.simulationId,
      parameters: parameters.length,
      results,
      mostSensitive: results[0]?.parameter || null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * Run Monte Carlo analysis
 */
router.post('/monte-carlo', async (req: Request, res: Response) => {
  try {
    const validated = monteCarloSchema.parse(req.body);

    const simulation = await simulationRunner.get(validated.simulationId);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const results = await monteCarloService.run(
      simulation.config,
      {
        iterations: validated.iterations,
        parameterRanges: validated.parameterRanges
      }
    );

    res.json({
      simulationId: validated.simulationId,
      iterations: results.iterations,
      outcomes: {
        people: {
          mean: results.outcomes.people.mean,
          stdDev: results.outcomes.people.stdDev,
          min: results.outcomes.people.min,
          max: results.outcomes.people.max
        },
        planet: {
          mean: results.outcomes.planet.mean,
          stdDev: results.outcomes.planet.stdDev,
          min: results.outcomes.planet.min,
          max: results.outcomes.planet.max
        },
        profit: {
          mean: results.outcomes.profit.mean,
          stdDev: results.outcomes.profit.stdDev,
          min: results.outcomes.profit.min,
          max: results.outcomes.profit.max
        }
      },
      percentiles: results.percentiles,
      riskAnalysis: results.riskAnalysis
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * Compare policies
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const validated = compareSchema.parse(req.body);

    const results = await comparisonService.compare(
      validated.policyIds,
      validated.region,
      validated.timeHorizon
    );

    res.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * Get historical similar policies (placeholder)
 */
router.get('/historical', async (req: Request, res: Response) => {
  try {
    const { billId, limit } = req.query;

    // Placeholder for historical data integration
    res.json({
      billId,
      similar: [],
      message: 'Historical data integration coming soon',
      limit: limit ? parseInt(limit as string) : 10
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
