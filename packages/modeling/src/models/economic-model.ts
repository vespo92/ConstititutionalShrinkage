/**
 * Economic impact model for policy simulation
 */

import { BaseModel, ModelConfig, ModelInput, ModelOutput } from './base-model';
import type { Factor, TaxChange, SpendingChange } from '../types';

export interface EconomicModelInput extends ModelInput {
  baselineGdp: number;
  taxRateChanges: TaxChange[];
  spendingChanges: SpendingChange[];
  regulatoryBurden: number;
  employmentRate?: number;
  inflationRate?: number;
}

/**
 * GDP impact model
 */
export class GDPModel extends BaseModel {
  constructor() {
    super({
      name: 'GDP Impact Model',
      version: '1.0.0',
      description: 'Models the impact of policy changes on GDP',
      parameters: {
        taxMultiplier: -0.5,           // Tax increase reduces GDP
        spendingMultiplier: 1.2,       // Spending increase boosts GDP
        regulatoryDrag: -0.3,          // Regulatory burden reduces growth
        baseGrowthRate: 0.025,         // 2.5% baseline growth
        confidenceFactor: 0.15         // Standard error factor
      },
      weights: {
        tax: 0.4,
        spending: 0.35,
        regulatory: 0.25
      }
    });
  }

  async run(input: EconomicModelInput): Promise<ModelOutput> {
    const {
      baselineGdp,
      taxRateChanges,
      spendingChanges,
      regulatoryBurden,
      timeHorizon
    } = input;

    const factors: Factor[] = [];
    let totalImpact = 0;

    // Tax impact
    const taxImpact = this.calculateTaxImpact(taxRateChanges, baselineGdp);
    factors.push(this.createFactor(
      'Tax Policy Changes',
      this.config.weights.tax,
      taxImpact,
      `Impact from ${taxRateChanges.length} tax rate changes`
    ));
    totalImpact += taxImpact * this.config.weights.tax;

    // Spending impact
    const spendingImpact = this.calculateSpendingImpact(spendingChanges, baselineGdp);
    factors.push(this.createFactor(
      'Government Spending',
      this.config.weights.spending,
      spendingImpact,
      `Impact from ${spendingChanges.length} spending changes`
    ));
    totalImpact += spendingImpact * this.config.weights.spending;

    // Regulatory impact
    const regulatoryImpact = this.calculateRegulatoryImpact(regulatoryBurden);
    factors.push(this.createFactor(
      'Regulatory Environment',
      this.config.weights.regulatory,
      regulatoryImpact,
      `Regulatory burden index: ${regulatoryBurden}`
    ));
    totalImpact += regulatoryImpact * this.config.weights.regulatory;

    // Normalize to -100 to +100 scale
    const normalizedImpact = Math.max(-100, Math.min(100, totalImpact));

    // Calculate standard error
    const stdError = Math.abs(normalizedImpact) * this.config.parameters.confidenceFactor;
    const confidence = this.generateConfidenceInterval(normalizedImpact, stdError);

    // Generate timeline
    const timeline = this.generateTimeline(
      0,
      normalizedImpact,
      timeHorizon,
      stdError
    );

    return {
      predicted: normalizedImpact,
      confidence,
      factors,
      timeline
    };
  }

  private calculateTaxImpact(changes: TaxChange[], baselineGdp: number): number {
    if (!changes || changes.length === 0) return 0;

    let totalImpact = 0;
    for (const change of changes) {
      const rateChange = change.proposedRate - change.currentRate;
      const gdpShare = (change.affectedPopulation * rateChange) / 100;
      totalImpact += gdpShare * this.config.parameters.taxMultiplier;
    }

    // Normalize to -100 to +100 scale
    return Math.max(-100, Math.min(100, totalImpact * 10));
  }

  private calculateSpendingImpact(changes: SpendingChange[], baselineGdp: number): number {
    if (!changes || changes.length === 0) return 0;

    let totalChange = 0;
    for (const change of changes) {
      totalChange += (change.proposedAmount - change.currentAmount);
    }

    // Impact as percentage of GDP
    const gdpPercentage = (totalChange / baselineGdp) * 100;
    return Math.max(-100, Math.min(100,
      gdpPercentage * this.config.parameters.spendingMultiplier * 10
    ));
  }

  private calculateRegulatoryImpact(burden: number): number {
    // Burden from 0-100, higher burden means more negative impact
    const normalizedBurden = burden - 50;  // Center at 50
    return normalizedBurden * this.config.parameters.regulatoryDrag;
  }

  async calibrate(historicalData: Array<{ input: ModelInput; actualOutput: number }>): Promise<void> {
    // Simple calibration: adjust multipliers based on error
    if (historicalData.length < 10) return;

    let taxError = 0;
    let spendingError = 0;

    for (const data of historicalData) {
      const output = await this.run(data.input as EconomicModelInput);
      const error = data.actualOutput - output.predicted;
      taxError += error;
      spendingError += error;
    }

    // Adjust multipliers slightly
    this.config.parameters.taxMultiplier *= (1 + taxError / historicalData.length / 100);
    this.config.parameters.spendingMultiplier *= (1 + spendingError / historicalData.length / 100);

    this.calibrated = true;
  }
}

/**
 * Employment impact model
 */
export class EmploymentModel extends BaseModel {
  constructor() {
    super({
      name: 'Employment Impact Model',
      version: '1.0.0',
      description: 'Models the impact of policy changes on employment',
      parameters: {
        gdpEmploymentElasticity: 0.5,  // 1% GDP change = 0.5% employment change
        minimumWageEffect: -0.15,       // Minimum wage increases reduce employment
        laborRegulationEffect: -0.1,    // Regulations reduce flexibility
        confidenceFactor: 0.2
      },
      weights: {
        gdpEffect: 0.6,
        directPolicy: 0.4
      }
    });
  }

  async run(input: EconomicModelInput): Promise<ModelOutput> {
    const { regulatoryBurden, timeHorizon } = input;

    const factors: Factor[] = [];

    // GDP-driven employment effect
    const gdpImpact = (input.baselineGdp > 0 ? 10 : -10) *
                       this.config.parameters.gdpEmploymentElasticity;
    factors.push(this.createFactor(
      'GDP-Driven Employment',
      this.config.weights.gdpEffect,
      gdpImpact,
      'Employment changes driven by economic growth'
    ));

    // Regulatory effect on employment
    const regulatoryEffect = (regulatoryBurden - 50) *
                             this.config.parameters.laborRegulationEffect;
    factors.push(this.createFactor(
      'Labor Regulations',
      this.config.weights.directPolicy,
      regulatoryEffect,
      'Direct policy effects on labor market'
    ));

    const totalImpact = this.aggregateFactors(factors);
    const stdError = Math.abs(totalImpact) * this.config.parameters.confidenceFactor;

    return {
      predicted: Math.max(-100, Math.min(100, totalImpact)),
      confidence: this.generateConfidenceInterval(totalImpact, stdError),
      factors,
      timeline: this.generateTimeline(0, totalImpact, timeHorizon, stdError)
    };
  }

  async calibrate(): Promise<void> {
    this.calibrated = true;
  }
}

/**
 * Small business impact model
 */
export class SmallBusinessModel extends BaseModel {
  constructor() {
    super({
      name: 'Small Business Impact Model',
      version: '1.0.0',
      description: 'Models policy impacts on small businesses',
      parameters: {
        regulatoryComplianceCost: -0.8,  // Higher burden hurts small biz more
        accessToCapital: 0.5,
        taxBurdenSensitivity: -0.6,
        confidenceFactor: 0.25
      },
      weights: {
        regulatory: 0.4,
        financial: 0.35,
        market: 0.25
      }
    });
  }

  async run(input: EconomicModelInput): Promise<ModelOutput> {
    const { regulatoryBurden, taxRateChanges, timeHorizon } = input;

    const factors: Factor[] = [];

    // Regulatory compliance burden
    const regImpact = (regulatoryBurden - 50) * this.config.parameters.regulatoryComplianceCost;
    factors.push(this.createFactor(
      'Regulatory Compliance',
      this.config.weights.regulatory,
      regImpact,
      'Cost of regulatory compliance for small businesses'
    ));

    // Tax burden
    const avgTaxChange = taxRateChanges.length > 0
      ? taxRateChanges.reduce((sum, tc) => sum + (tc.proposedRate - tc.currentRate), 0) / taxRateChanges.length
      : 0;
    const taxImpact = avgTaxChange * this.config.parameters.taxBurdenSensitivity;
    factors.push(this.createFactor(
      'Tax Burden',
      this.config.weights.financial,
      taxImpact,
      'Effect of tax changes on small business viability'
    ));

    // Market conditions (simplified)
    const marketImpact = this.config.parameters.accessToCapital * 10;
    factors.push(this.createFactor(
      'Market Access',
      this.config.weights.market,
      marketImpact,
      'Access to markets and capital'
    ));

    const totalImpact = this.aggregateFactors(factors);
    const stdError = Math.abs(totalImpact) * this.config.parameters.confidenceFactor;

    return {
      predicted: Math.max(-100, Math.min(100, totalImpact)),
      confidence: this.generateConfidenceInterval(totalImpact, stdError),
      factors,
      timeline: this.generateTimeline(0, totalImpact, timeHorizon, stdError)
    };
  }

  async calibrate(): Promise<void> {
    this.calibrated = true;
  }
}
