/**
 * Monte Carlo simulation service
 */

import {
  TBLAggregator,
  PolicySimulation,
  MonteCarloResult,
  TBLScore,
  sampleDistribution,
  computeDistributionStats,
  percentiles as computePercentiles
} from '@constitutional/modeling';
import type { MonteCarloConfig, ParameterRange } from '@constitutional/modeling';

export class MonteCarloService {
  private aggregator: TBLAggregator;

  constructor() {
    this.aggregator = new TBLAggregator();
  }

  /**
   * Run Monte Carlo simulation
   */
  async run(
    baseSimulation: PolicySimulation,
    config: MonteCarloConfig
  ): Promise<MonteCarloResult> {
    const { iterations, parameterRanges } = config;

    const peopleScores: number[] = [];
    const planetScores: number[] = [];
    const profitScores: number[] = [];

    // Run iterations
    for (let i = 0; i < iterations; i++) {
      // Create varied simulation
      const variedSimulation = this.applyVariation(baseSimulation, parameterRanges);

      // Run simulation
      const result = await this.aggregator.runFullSimulation(variedSimulation);

      peopleScores.push(result.people.predicted);
      planetScores.push(result.planet.predicted);
      profitScores.push(result.profit.predicted);
    }

    // Compute distributions
    const peopleDistribution = computeDistributionStats(peopleScores);
    const planetDistribution = computeDistributionStats(planetScores);
    const profitDistribution = computeDistributionStats(profitScores);

    // Compute percentiles
    const percentileValues = [5, 25, 50, 75, 95];
    const peoplePercentiles = computePercentiles(peopleScores, percentileValues);
    const planetPercentiles = computePercentiles(planetScores, percentileValues);
    const profitPercentiles = computePercentiles(profitScores, percentileValues);

    // Build percentile TBL scores
    const percentileScores: Record<string, TBLScore> = {};
    for (const p of percentileValues) {
      percentileScores[`p${p}`] = {
        people: peoplePercentiles[p],
        planet: planetPercentiles[p],
        profit: profitPercentiles[p]
      };
    }

    // Risk analysis
    const negativeCount = peopleScores.filter((_, i) =>
      peopleScores[i] < 0 || planetScores[i] < 0 || profitScores[i] < 0
    ).length;

    const worstCase: TBLScore = {
      people: peopleDistribution.min,
      planet: planetDistribution.min,
      profit: profitDistribution.min
    };

    const bestCase: TBLScore = {
      people: peopleDistribution.max,
      planet: planetDistribution.max,
      profit: profitDistribution.max
    };

    return {
      iterations,
      outcomes: {
        people: {
          ...peopleDistribution,
          samples: peopleScores
        },
        planet: {
          ...planetDistribution,
          samples: planetScores
        },
        profit: {
          ...profitDistribution,
          samples: profitScores
        }
      },
      percentiles: {
        p5: percentileScores['p5'],
        p25: percentileScores['p25'],
        p50: percentileScores['p50'],
        p75: percentileScores['p75'],
        p95: percentileScores['p95']
      },
      riskAnalysis: {
        probabilityOfNegativeOutcome: negativeCount / iterations,
        worstCase,
        bestCase
      }
    };
  }

  /**
   * Apply parameter variation to simulation
   */
  private applyVariation(
    simulation: PolicySimulation,
    parameterRanges: ParameterRange[]
  ): PolicySimulation {
    const varied = JSON.parse(JSON.stringify(simulation)) as PolicySimulation;

    for (const range of parameterRanges) {
      const value = sampleDistribution(range.distribution, range.params);
      this.setParameter(varied, range.name, value);
    }

    return varied;
  }

  /**
   * Set a parameter by path
   */
  private setParameter(obj: PolicySimulation, path: string, value: number): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = obj as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) return;
      current = current[part] as Record<string, unknown>;
    }

    const lastPart = parts[parts.length - 1];
    if (current[lastPart] !== undefined) {
      current[lastPart] = value;
    }
  }
}

export const monteCarloService = new MonteCarloService();
