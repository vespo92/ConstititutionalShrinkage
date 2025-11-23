/**
 * Quick sandbox routes for fast simulations
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { TBLAggregator, PolicySimulation } from '@constitutional/modeling';

const router = Router();

// In-memory cache for quick simulations
const cache = new Map<string, { result: unknown; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Pre-configured scenario defaults
const scenarioDefaults: Record<string, Partial<PolicySimulation>> = {
  conservative: {
    economic: {
      baselineGdp: 1000000000,
      taxRateChanges: [],
      spendingChanges: [],
      regulatoryBurden: 30
    },
    environmental: {
      baselineCarbon: 50000,
      supplyChainLocality: 40,
      energyMix: {
        coal: 30, naturalGas: 30, nuclear: 15,
        solar: 10, wind: 8, hydro: 5, other: 2
      },
      resourceConsumption: 60
    },
    social: {
      populationAffected: 100000,
      accessibilityChange: 5,
      inequalityImpact: -0.01
    }
  },
  moderate: {
    economic: {
      baselineGdp: 1000000000,
      taxRateChanges: [],
      spendingChanges: [],
      regulatoryBurden: 50
    },
    environmental: {
      baselineCarbon: 50000,
      supplyChainLocality: 55,
      energyMix: {
        coal: 20, naturalGas: 25, nuclear: 15,
        solar: 18, wind: 12, hydro: 8, other: 2
      },
      resourceConsumption: 50
    },
    social: {
      populationAffected: 100000,
      accessibilityChange: 15,
      inequalityImpact: -0.02
    }
  },
  aggressive: {
    economic: {
      baselineGdp: 1000000000,
      taxRateChanges: [],
      spendingChanges: [],
      regulatoryBurden: 70
    },
    environmental: {
      baselineCarbon: 50000,
      supplyChainLocality: 75,
      energyMix: {
        coal: 5, naturalGas: 15, nuclear: 10,
        solar: 30, wind: 25, hydro: 12, other: 3
      },
      resourceConsumption: 35
    },
    social: {
      populationAffected: 100000,
      accessibilityChange: 30,
      inequalityImpact: -0.05
    }
  }
};

// Validation schema
const quickSimSchema = z.object({
  billId: z.string().min(1),
  region: z.string().min(1),
  scenario: z.enum(['conservative', 'moderate', 'aggressive']),
  timeHorizon: z.number().positive().max(20).optional().default(5),
  overrides: z.record(z.number()).optional()
});

/**
 * Run a quick sandbox simulation
 */
router.post('/quick', async (req: Request, res: Response) => {
  try {
    const validated = quickSimSchema.parse(req.body);

    // Generate cache key
    const cacheKey = JSON.stringify({
      billId: validated.billId,
      region: validated.region,
      scenario: validated.scenario,
      timeHorizon: validated.timeHorizon,
      overrides: validated.overrides
    });

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({
        ...cached.result,
        cached: true
      });
    }

    // Build simulation config
    const defaults = scenarioDefaults[validated.scenario];
    const config: PolicySimulation = {
      billId: validated.billId,
      region: validated.region,
      timeHorizon: validated.timeHorizon,
      confidenceLevel: 0.95,
      economic: defaults.economic!,
      environmental: defaults.environmental!,
      social: defaults.social!
    };

    // Apply any overrides
    if (validated.overrides) {
      applyOverrides(config, validated.overrides);
    }

    // Run simulation
    const aggregator = new TBLAggregator();
    const result = await aggregator.runFullSimulation(config);

    // Format response
    const response = {
      billId: validated.billId,
      region: validated.region,
      scenario: validated.scenario,
      timeHorizon: validated.timeHorizon,
      summary: {
        people: {
          score: Math.round(result.people.predicted),
          confidence: result.people.confidence.map(c => Math.round(c))
        },
        planet: {
          score: Math.round(result.planet.predicted),
          confidence: result.planet.confidence.map(c => Math.round(c)),
          carbonDelta: Math.round(result.planet.carbonDelta)
        },
        profit: {
          score: Math.round(result.profit.predicted),
          confidence: result.profit.confidence.map(c => Math.round(c)),
          economicImpact: Math.round(result.profit.economicImpact)
        }
      },
      overallScore: Math.round(
        (result.people.predicted + result.planet.predicted + result.profit.predicted) / 3
      ),
      tradeOffs: result.tradeOffs.slice(0, 3),
      recommendations: result.recommendations.slice(0, 3),
      cached: false
    };

    // Cache result
    cache.set(cacheKey, { result: response, timestamp: Date.now() });

    res.json(response);
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
 * Get available scenario presets
 */
router.get('/presets', async (_req: Request, res: Response) => {
  res.json({
    presets: Object.entries(scenarioDefaults).map(([name, config]) => ({
      name,
      description: getPresetDescription(name),
      defaults: config
    }))
  });
});

/**
 * Clear sandbox cache
 */
router.delete('/cache', async (_req: Request, res: Response) => {
  const count = cache.size;
  cache.clear();
  res.json({ cleared: count });
});

/**
 * Apply numeric overrides to config
 */
function applyOverrides(
  config: PolicySimulation,
  overrides: Record<string, number>
): void {
  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split('.');
    let current: Record<string, unknown> = config as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) break;
      current = current[parts[i]] as Record<string, unknown>;
    }

    const lastPart = parts[parts.length - 1];
    if (current[lastPart] !== undefined) {
      current[lastPart] = value;
    }
  }
}

/**
 * Get human-readable preset description
 */
function getPresetDescription(name: string): string {
  switch (name) {
    case 'conservative':
      return 'Minimal regulatory change, traditional energy mix, modest social spending';
    case 'moderate':
      return 'Balanced approach with gradual clean energy transition and moderate reforms';
    case 'aggressive':
      return 'Ambitious environmental targets, significant local sourcing, strong social investment';
    default:
      return '';
  }
}

export default router;
