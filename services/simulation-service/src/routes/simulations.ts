/**
 * Simulation routes
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { simulationRunner } from '../services/runner';
import { scheduler } from '../services/scheduler';
import type { PolicySimulation } from '@constitutional/modeling';

const router = Router();

// Validation schemas
const createSimulationSchema = z.object({
  billId: z.string().min(1),
  region: z.string().min(1),
  timeHorizon: z.number().positive().max(50),
  confidenceLevel: z.number().min(0.5).max(0.99).optional().default(0.95),
  economic: z.object({
    baselineGdp: z.number().positive(),
    taxRateChanges: z.array(z.object({
      category: z.string(),
      currentRate: z.number().min(0),
      proposedRate: z.number().min(0),
      affectedPopulation: z.number().min(0)
    })).optional().default([]),
    spendingChanges: z.array(z.object({
      category: z.string(),
      currentAmount: z.number(),
      proposedAmount: z.number(),
      effectiveDate: z.string()
    })).optional().default([]),
    regulatoryBurden: z.number().min(0).max(100)
  }),
  environmental: z.object({
    baselineCarbon: z.number().min(0),
    supplyChainLocality: z.number().min(0).max(100),
    energyMix: z.object({
      coal: z.number().min(0).max(100),
      naturalGas: z.number().min(0).max(100),
      nuclear: z.number().min(0).max(100),
      solar: z.number().min(0).max(100),
      wind: z.number().min(0).max(100),
      hydro: z.number().min(0).max(100),
      other: z.number().min(0).max(100)
    }),
    resourceConsumption: z.number().min(0).max(100)
  }),
  social: z.object({
    populationAffected: z.number().min(0),
    accessibilityChange: z.number().min(-100).max(100),
    inequalityImpact: z.number().min(-0.5).max(0.5)
  })
});

/**
 * Create a new simulation
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createSimulationSchema.parse(req.body);

    // Convert to PolicySimulation
    const config: PolicySimulation = {
      billId: validated.billId,
      region: validated.region,
      timeHorizon: validated.timeHorizon,
      confidenceLevel: validated.confidenceLevel,
      economic: {
        baselineGdp: validated.economic.baselineGdp,
        taxRateChanges: validated.economic.taxRateChanges,
        spendingChanges: validated.economic.spendingChanges.map(sc => ({
          ...sc,
          effectiveDate: new Date(sc.effectiveDate)
        })),
        regulatoryBurden: validated.economic.regulatoryBurden
      },
      environmental: validated.environmental,
      social: validated.social
    };

    const simulation = await simulationRunner.create(config);

    res.status(201).json({
      id: simulation.id,
      billId: simulation.config.billId,
      status: simulation.status,
      createdAt: simulation.createdAt.toISOString()
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
 * List all simulations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { billId, status, limit, offset } = req.query;

    const simulations = await simulationRunner.list({
      billId: billId as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json({
      simulations: simulations.map(s => ({
        id: s.id,
        billId: s.config.billId,
        region: s.config.region,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        completedAt: s.completedAt?.toISOString()
      })),
      total: simulations.length
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get a specific simulation
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const simulation = await simulationRunner.get(req.params.id);

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json({
      id: simulation.id,
      billId: simulation.config.billId,
      region: simulation.config.region,
      timeHorizon: simulation.config.timeHorizon,
      status: simulation.status,
      createdAt: simulation.createdAt.toISOString(),
      completedAt: simulation.completedAt?.toISOString(),
      config: simulation.config,
      error: simulation.error
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Run a simulation
 */
router.post('/:id/run', async (req: Request, res: Response) => {
  try {
    const simulation = await simulationRunner.get(req.params.id);

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    if (simulation.status === 'running') {
      return res.status(409).json({ error: 'Simulation is already running' });
    }

    // Schedule the simulation
    const job = scheduler.schedule(simulation.id, req.body.priority || 5);

    res.json({
      id: simulation.id,
      jobId: job.id,
      status: 'running',
      message: 'Simulation started',
      estimatedDuration: simulation.config.timeHorizon * 1000
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get simulation results
 */
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const simulation = await simulationRunner.get(req.params.id);

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    if (simulation.status === 'pending') {
      return res.status(400).json({ error: 'Simulation has not been run yet' });
    }

    if (simulation.status === 'running') {
      return res.status(202).json({
        status: 'running',
        message: 'Simulation is still running'
      });
    }

    if (simulation.status === 'failed') {
      return res.status(500).json({
        status: 'failed',
        error: simulation.error
      });
    }

    res.json({
      id: simulation.id,
      status: 'completed',
      result: simulation.result
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete a simulation
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await simulationRunner.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
