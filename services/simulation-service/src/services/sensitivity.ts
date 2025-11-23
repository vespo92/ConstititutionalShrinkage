/**
 * Sensitivity analysis service
 */

import {
  TBLAggregator,
  PolicySimulation,
  SensitivityResult
} from '@constitutional/modeling';
import { simulationRunner } from './runner';

export class SensitivityService {
  private aggregator: TBLAggregator;

  constructor() {
    this.aggregator = new TBLAggregator();
  }

  /**
   * Run sensitivity analysis on a simulation
   */
  async analyze(
    simulationId: string,
    parameters: string[],
    customRanges?: Record<string, [number, number]>
  ): Promise<SensitivityResult[]> {
    const simulation = await simulationRunner.get(simulationId);
    if (!simulation) {
      throw new Error(`Simulation not found: ${simulationId}`);
    }

    const results: SensitivityResult[] = [];

    for (const paramPath of parameters) {
      const result = await this.analyzeParameter(
        simulation.config,
        paramPath,
        customRanges?.[paramPath]
      );
      results.push(result);
    }

    // Sort by elasticity magnitude
    results.sort((a, b) => Math.abs(b.elasticity) - Math.abs(a.elasticity));

    return results;
  }

  /**
   * Analyze sensitivity of a single parameter
   */
  private async analyzeParameter(
    baseConfig: PolicySimulation,
    paramPath: string,
    customRange?: [number, number]
  ): Promise<SensitivityResult> {
    const baseValue = this.getParameter(baseConfig, paramPath);
    if (baseValue === undefined) {
      throw new Error(`Parameter not found: ${paramPath}`);
    }

    // Determine range
    const range: [number, number] = customRange || [
      baseValue * 0.5,
      baseValue * 1.5
    ];

    // Run baseline
    const baseResult = await this.aggregator.runFullSimulation(baseConfig);
    const basePeople = baseResult.people.predicted;
    const basePlanet = baseResult.planet.predicted;
    const baseProfit = baseResult.profit.predicted;

    // Run with low value
    const lowConfig = this.cloneWithParameter(baseConfig, paramPath, range[0]);
    const lowResult = await this.aggregator.runFullSimulation(lowConfig);

    // Run with high value
    const highConfig = this.cloneWithParameter(baseConfig, paramPath, range[1]);
    const highResult = await this.aggregator.runFullSimulation(highConfig);

    // Calculate impacts
    const impactOnPeople = (highResult.people.predicted - lowResult.people.predicted) / 2;
    const impactOnPlanet = (highResult.planet.predicted - lowResult.planet.predicted) / 2;
    const impactOnProfit = (highResult.profit.predicted - lowResult.profit.predicted) / 2;

    // Calculate elasticity (% change in output / % change in input)
    const paramChange = (range[1] - range[0]) / baseValue;
    const avgOutputChange = (
      Math.abs(highResult.people.predicted - basePeople) +
      Math.abs(highResult.planet.predicted - basePlanet) +
      Math.abs(highResult.profit.predicted - baseProfit)
    ) / 3;
    const elasticity = paramChange !== 0 ? avgOutputChange / (paramChange * 100) : 0;

    return {
      parameter: paramPath,
      baseValue,
      range,
      impactOnPeople,
      impactOnPlanet,
      impactOnProfit,
      elasticity
    };
  }

  /**
   * Get parameter value by path
   */
  private getParameter(config: PolicySimulation, path: string): number | undefined {
    const parts = path.split('.');
    let current: Record<string, unknown> = config as unknown as Record<string, unknown>;

    for (const part of parts) {
      if (current[part] === undefined) return undefined;
      if (typeof current[part] === 'object') {
        current = current[part] as Record<string, unknown>;
      } else {
        return current[part] as number;
      }
    }

    return undefined;
  }

  /**
   * Clone config with modified parameter
   */
  private cloneWithParameter(
    config: PolicySimulation,
    path: string,
    value: number
  ): PolicySimulation {
    const clone = JSON.parse(JSON.stringify(config)) as PolicySimulation;
    const parts = path.split('.');
    let current: Record<string, unknown> = clone as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    return clone;
  }

  /**
   * Get default parameters for sensitivity analysis
   */
  getDefaultParameters(): string[] {
    return [
      'economic.regulatoryBurden',
      'economic.baselineGdp',
      'environmental.supplyChainLocality',
      'environmental.baselineCarbon',
      'environmental.resourceConsumption',
      'social.accessibilityChange',
      'social.inequalityImpact',
      'timeHorizon'
    ];
  }
}

export const sensitivityService = new SensitivityService();
