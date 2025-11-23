/**
 * Base model class for all simulation models
 */

import type { TimeSeriesData, Factor, TBLScore } from '../types';

export interface ModelConfig {
  name: string;
  version: string;
  description: string;
  parameters: Record<string, number>;
  weights: Record<string, number>;
}

export interface ModelInput {
  baseValue: number;
  changes: Record<string, number>;
  timeHorizon: number;
  region?: string;
}

export interface ModelOutput {
  predicted: number;
  confidence: [number, number];
  factors: Factor[];
  timeline: TimeSeriesData;
}

/**
 * Abstract base class for simulation models
 */
export abstract class BaseModel {
  protected config: ModelConfig;
  protected calibrated: boolean = false;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  /**
   * Get model name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get model version
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Run the model with given input
   */
  abstract run(input: ModelInput): Promise<ModelOutput>;

  /**
   * Calibrate model with historical data
   */
  abstract calibrate(historicalData: Array<{
    input: ModelInput;
    actualOutput: number;
  }>): Promise<void>;

  /**
   * Get parameter value
   */
  getParameter(name: string): number | undefined {
    return this.config.parameters[name];
  }

  /**
   * Set parameter value
   */
  setParameter(name: string, value: number): void {
    this.config.parameters[name] = value;
  }

  /**
   * Get all parameters
   */
  getParameters(): Record<string, number> {
    return { ...this.config.parameters };
  }

  /**
   * Check if model is calibrated
   */
  isCalibrated(): boolean {
    return this.calibrated;
  }

  /**
   * Generate confidence interval
   */
  protected generateConfidenceInterval(
    predicted: number,
    stdError: number,
    confidenceLevel: number = 0.95
  ): [number, number] {
    // Z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576
    };

    const z = zScores[confidenceLevel] || 1.96;
    const margin = z * stdError;

    return [predicted - margin, predicted + margin];
  }

  /**
   * Generate timeline projection
   */
  protected generateTimeline(
    startValue: number,
    endValue: number,
    years: number,
    stdError: number
  ): TimeSeriesData {
    const timestamps: Date[] = [];
    const values: number[] = [];
    const confidenceLower: number[] = [];
    const confidenceUpper: number[] = [];

    const now = new Date();

    for (let i = 0; i <= years; i++) {
      const date = new Date(now);
      date.setFullYear(date.getFullYear() + i);
      timestamps.push(date);

      // Linear interpolation with increasing uncertainty
      const t = i / years;
      const value = startValue + (endValue - startValue) * t;
      const uncertainty = stdError * (1 + t * 0.5);  // Uncertainty grows over time

      values.push(value);
      confidenceLower.push(value - 1.96 * uncertainty);
      confidenceUpper.push(value + 1.96 * uncertainty);
    }

    return { timestamps, values, confidenceLower, confidenceUpper };
  }

  /**
   * Create factor from contribution
   */
  protected createFactor(
    name: string,
    weight: number,
    value: number,
    description: string
  ): Factor {
    return { name, weight, value, description };
  }

  /**
   * Aggregate factors into overall score
   */
  protected aggregateFactors(factors: Factor[]): number {
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = factors.reduce((sum, f) => sum + f.weight * f.value, 0);
    return weightedSum / totalWeight;
  }

  /**
   * Apply decay factor based on time
   */
  protected applyTimeDecay(value: number, years: number, halfLife: number): number {
    return value * Math.pow(0.5, years / halfLife);
  }

  /**
   * Apply growth factor based on time
   */
  protected applyTimeGrowth(value: number, years: number, annualRate: number): number {
    return value * Math.pow(1 + annualRate, years);
  }
}

/**
 * Composite model that combines multiple sub-models
 */
export abstract class CompositeModel extends BaseModel {
  protected subModels: Map<string, BaseModel> = new Map();

  /**
   * Add a sub-model
   */
  addSubModel(key: string, model: BaseModel): void {
    this.subModels.set(key, model);
  }

  /**
   * Get a sub-model
   */
  getSubModel(key: string): BaseModel | undefined {
    return this.subModels.get(key);
  }

  /**
   * Run all sub-models
   */
  protected async runSubModels(input: ModelInput): Promise<Map<string, ModelOutput>> {
    const results = new Map<string, ModelOutput>();

    for (const [key, model] of this.subModels) {
      results.set(key, await model.run(input));
    }

    return results;
  }

  /**
   * Aggregate TBL scores from sub-models
   */
  protected aggregateTBLScores(
    scores: TBLScore[],
    weights?: number[]
  ): TBLScore {
    const effectiveWeights = weights || scores.map(() => 1);
    const totalWeight = effectiveWeights.reduce((a, b) => a + b, 0);

    let people = 0;
    let planet = 0;
    let profit = 0;

    for (let i = 0; i < scores.length; i++) {
      const weight = effectiveWeights[i] / totalWeight;
      people += scores[i].people * weight;
      planet += scores[i].planet * weight;
      profit += scores[i].profit * weight;
    }

    return { people, planet, profit };
  }
}
