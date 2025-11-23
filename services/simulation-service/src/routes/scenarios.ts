/**
 * Scenario management routes
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { Scenario } from '@constitutional/modeling';
import { validateScenario } from '@constitutional/modeling';

const router = Router();

// In-memory storage
const scenarios = new Map<string, { scenario: Scenario; createdAt: Date; updatedAt: Date }>();

// Initialize default templates
const defaultTemplates: Record<string, Scenario> = {
  conservative: {
    name: 'Conservative',
    template: 'conservative',
    parameters: {
      economicGrowthRate: 0.02,
      regulatoryChange: -10,
      environmentalStrictness: 20,
      socialSpending: 5
    }
  },
  moderate: {
    name: 'Moderate',
    template: 'moderate',
    parameters: {
      economicGrowthRate: 0.03,
      regulatoryChange: 0,
      environmentalStrictness: 40,
      socialSpending: 15
    }
  },
  aggressive: {
    name: 'Aggressive',
    template: 'aggressive',
    parameters: {
      economicGrowthRate: 0.05,
      regulatoryChange: 20,
      environmentalStrictness: 70,
      socialSpending: 30
    }
  }
};

// Validation schema
const createScenarioSchema = z.object({
  name: z.string().min(1).max(100),
  template: z.enum(['conservative', 'moderate', 'aggressive', 'custom']),
  region: z.string().optional(),
  parameters: z.record(z.union([z.number(), z.string()]))
});

const updateScenarioSchema = createScenarioSchema.partial();

/**
 * Create a new scenario
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createScenarioSchema.parse(req.body);

    const scenario: Scenario = {
      id: uuidv4(),
      name: validated.name,
      template: validated.template,
      region: validated.region,
      parameters: validated.parameters,
      createdAt: new Date()
    };

    // Validate scenario
    const validation = validateScenario(scenario);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid scenario',
        details: validation.errors
      });
    }

    scenarios.set(scenario.id!, {
      scenario,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      id: scenario.id,
      name: scenario.name,
      template: scenario.template,
      region: scenario.region,
      parameters: scenario.parameters,
      createdAt: scenario.createdAt?.toISOString()
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
 * List all scenarios
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { template, region } = req.query;

    let results = Array.from(scenarios.values());

    if (template) {
      results = results.filter(s => s.scenario.template === template);
    }

    if (region) {
      results = results.filter(s => s.scenario.region === region);
    }

    // Sort by creation date descending
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      scenarios: results.map(s => ({
        id: s.scenario.id,
        name: s.scenario.name,
        template: s.scenario.template,
        region: s.scenario.region,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString()
      })),
      total: results.length
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get templates
 */
router.get('/templates', async (_req: Request, res: Response) => {
  res.json({
    templates: Object.entries(defaultTemplates).map(([key, template]) => ({
      id: key,
      name: template.name,
      parameters: template.parameters
    }))
  });
});

/**
 * Get a specific scenario
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stored = scenarios.get(req.params.id);

    if (!stored) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    res.json({
      id: stored.scenario.id,
      name: stored.scenario.name,
      template: stored.scenario.template,
      region: stored.scenario.region,
      parameters: stored.scenario.parameters,
      createdAt: stored.createdAt.toISOString(),
      updatedAt: stored.updatedAt.toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update a scenario
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const stored = scenarios.get(req.params.id);

    if (!stored) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const validated = updateScenarioSchema.parse(req.body);

    const updated: Scenario = {
      ...stored.scenario,
      ...validated,
      id: stored.scenario.id
    };

    // Validate updated scenario
    const validation = validateScenario(updated);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid scenario',
        details: validation.errors
      });
    }

    scenarios.set(req.params.id, {
      scenario: updated,
      createdAt: stored.createdAt,
      updatedAt: new Date()
    });

    res.json({
      id: updated.id,
      name: updated.name,
      template: updated.template,
      region: updated.region,
      parameters: updated.parameters,
      updatedAt: new Date().toISOString()
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
 * Delete a scenario
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = scenarios.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
