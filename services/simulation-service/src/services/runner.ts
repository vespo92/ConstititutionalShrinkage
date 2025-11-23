/**
 * Simulation runner service
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TBLAggregator,
  PolicySimulation,
  SimulationResult,
  validateSimulation
} from '@constitutional/modeling';
import type { StoredSimulation } from '../types';

// In-memory storage (replace with database in production)
const simulations = new Map<string, StoredSimulation>();

export class SimulationRunner {
  private aggregator: TBLAggregator;

  constructor() {
    this.aggregator = new TBLAggregator();
  }

  /**
   * Create a new simulation
   */
  async create(config: PolicySimulation): Promise<StoredSimulation> {
    // Validate configuration
    const validation = validateSimulation(config);
    if (!validation.valid) {
      throw new Error(`Invalid simulation config: ${validation.errors.join(', ')}`);
    }

    const id = uuidv4();
    const simulation: StoredSimulation = {
      id,
      config: { ...config, id },
      status: 'pending',
      createdAt: new Date()
    };

    simulations.set(id, simulation);
    return simulation;
  }

  /**
   * Get simulation by ID
   */
  async get(id: string): Promise<StoredSimulation | null> {
    return simulations.get(id) || null;
  }

  /**
   * List all simulations
   */
  async list(options?: {
    billId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<StoredSimulation[]> {
    let results = Array.from(simulations.values());

    if (options?.billId) {
      results = results.filter(s => s.config.billId === options.billId);
    }

    if (options?.status) {
      results = results.filter(s => s.status === options.status);
    }

    // Sort by creation date descending
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return results.slice(offset, offset + limit);
  }

  /**
   * Run a simulation
   */
  async run(id: string): Promise<SimulationResult> {
    const simulation = simulations.get(id);
    if (!simulation) {
      throw new Error(`Simulation not found: ${id}`);
    }

    if (simulation.status === 'running') {
      throw new Error('Simulation is already running');
    }

    // Update status
    simulation.status = 'running';
    simulations.set(id, simulation);

    try {
      // Run the simulation
      const result = await this.aggregator.runFullSimulation(simulation.config);

      // Update with results
      simulation.status = 'completed';
      simulation.result = {
        ...result,
        id: uuidv4(),
        createdAt: simulation.createdAt
      } as SimulationResult;
      simulation.completedAt = new Date();

      simulations.set(id, simulation);
      return simulation.result;
    } catch (error) {
      simulation.status = 'failed';
      simulation.error = error instanceof Error ? error.message : 'Unknown error';
      simulations.set(id, simulation);
      throw error;
    }
  }

  /**
   * Delete a simulation
   */
  async delete(id: string): Promise<boolean> {
    return simulations.delete(id);
  }

  /**
   * Get simulation results
   */
  async getResults(id: string): Promise<SimulationResult | null> {
    const simulation = simulations.get(id);
    return simulation?.result || null;
  }
}

// Singleton instance
export const simulationRunner = new SimulationRunner();
