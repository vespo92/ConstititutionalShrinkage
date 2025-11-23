/**
 * Composite model that aggregates all sub-models for TBL scoring
 */

import { CompositeModel, ModelConfig, ModelInput, ModelOutput } from './base-model';
import { GDPModel, EmploymentModel, SmallBusinessModel, EconomicModelInput } from './economic-model';
import { CarbonModel, ResourceModel, SupplyChainDistanceModel, RenewableAdoptionModel, EnvironmentalModelInput } from './environmental-model';
import { InequalityModel, AccessModel, ParticipationModel, WellbeingModel, SocialModelInput } from './social-model';
import type {
  PolicySimulation,
  SimulationResult,
  TBLScore,
  TradeOff,
  Recommendation,
  SensitivityResult,
  Factor
} from '../types';
import { correlation } from '../utils/distributions';

export interface TBLModelInput extends ModelInput {
  simulation: PolicySimulation;
}

/**
 * Triple Bottom Line Aggregator
 * Combines economic, environmental, and social models
 */
export class TBLAggregator extends CompositeModel {
  constructor() {
    super({
      name: 'TBL Aggregator',
      version: '1.0.0',
      description: 'Aggregates People, Planet, Profit impact scores',
      parameters: {
        peopleWeight: 0.333,
        planetWeight: 0.333,
        profitWeight: 0.334,
        confidenceFactor: 0.15
      },
      weights: {
        people: 0.333,
        planet: 0.333,
        profit: 0.334
      }
    });

    // Initialize sub-models
    this.initializeSubModels();
  }

  private initializeSubModels(): void {
    // Economic models (Profit)
    this.addSubModel('gdp', new GDPModel());
    this.addSubModel('employment', new EmploymentModel());
    this.addSubModel('smallBusiness', new SmallBusinessModel());

    // Environmental models (Planet)
    this.addSubModel('carbon', new CarbonModel());
    this.addSubModel('resource', new ResourceModel());
    this.addSubModel('supplyChain', new SupplyChainDistanceModel());
    this.addSubModel('renewable', new RenewableAdoptionModel());

    // Social models (People)
    this.addSubModel('inequality', new InequalityModel());
    this.addSubModel('access', new AccessModel());
    this.addSubModel('participation', new ParticipationModel());
    this.addSubModel('wellbeing', new WellbeingModel());
  }

  async run(input: TBLModelInput): Promise<ModelOutput> {
    const { simulation } = input;

    // Prepare sub-model inputs
    const economicInput: EconomicModelInput = {
      baseValue: simulation.economic.baselineGdp,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      baselineGdp: simulation.economic.baselineGdp,
      taxRateChanges: simulation.economic.taxRateChanges,
      spendingChanges: simulation.economic.spendingChanges,
      regulatoryBurden: simulation.economic.regulatoryBurden
    };

    const environmentalInput: EnvironmentalModelInput = {
      baseValue: simulation.environmental.baselineCarbon,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      baselineCarbon: simulation.environmental.baselineCarbon,
      supplyChainLocality: simulation.environmental.supplyChainLocality,
      energyMix: simulation.environmental.energyMix,
      resourceConsumption: simulation.environmental.resourceConsumption
    };

    const socialInput: SocialModelInput = {
      baseValue: 50,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      populationAffected: simulation.social.populationAffected,
      accessibilityChange: simulation.social.accessibilityChange,
      inequalityImpact: simulation.social.inequalityImpact
    };

    // Run all sub-models
    const gdpResult = await (this.getSubModel('gdp') as GDPModel).run(economicInput);
    const employmentResult = await (this.getSubModel('employment') as EmploymentModel).run(economicInput);
    const smallBizResult = await (this.getSubModel('smallBusiness') as SmallBusinessModel).run(economicInput);

    const carbonResult = await (this.getSubModel('carbon') as CarbonModel).run(environmentalInput);
    const resourceResult = await (this.getSubModel('resource') as ResourceModel).run(environmentalInput);
    const supplyChainResult = await (this.getSubModel('supplyChain') as SupplyChainDistanceModel).run(environmentalInput);
    const renewableResult = await (this.getSubModel('renewable') as RenewableAdoptionModel).run(environmentalInput);

    const inequalityResult = await (this.getSubModel('inequality') as InequalityModel).run(socialInput);
    const accessResult = await (this.getSubModel('access') as AccessModel).run(socialInput);
    const participationResult = await (this.getSubModel('participation') as ParticipationModel).run(socialInput);
    const wellbeingResult = await (this.getSubModel('wellbeing') as WellbeingModel).run(socialInput);

    // Aggregate scores
    const profitScore = this.weightedAverage([
      { value: gdpResult.predicted, weight: 0.4 },
      { value: employmentResult.predicted, weight: 0.35 },
      { value: smallBizResult.predicted, weight: 0.25 }
    ]);

    const planetScore = this.weightedAverage([
      { value: carbonResult.predicted, weight: 0.35 },
      { value: resourceResult.predicted, weight: 0.25 },
      { value: supplyChainResult.predicted, weight: 0.2 },
      { value: renewableResult.predicted, weight: 0.2 }
    ]);

    const peopleScore = this.weightedAverage([
      { value: inequalityResult.predicted, weight: 0.3 },
      { value: accessResult.predicted, weight: 0.3 },
      { value: participationResult.predicted, weight: 0.15 },
      { value: wellbeingResult.predicted, weight: 0.25 }
    ]);

    // Combine all factors
    const factors: Factor[] = [
      ...gdpResult.factors,
      ...employmentResult.factors,
      ...carbonResult.factors,
      ...inequalityResult.factors
    ];

    // Overall score
    const overallScore = this.weightedAverage([
      { value: peopleScore, weight: this.config.weights.people },
      { value: planetScore, weight: this.config.weights.planet },
      { value: profitScore, weight: this.config.weights.profit }
    ]);

    const stdError = Math.abs(overallScore) * this.config.parameters.confidenceFactor;

    return {
      predicted: overallScore,
      confidence: this.generateConfidenceInterval(overallScore, stdError),
      factors,
      timeline: this.generateTimeline(0, overallScore, input.timeHorizon, stdError)
    };
  }

  private weightedAverage(items: Array<{ value: number; weight: number }>): number {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = items.reduce((sum, item) => sum + item.value * item.weight, 0);
    return weightedSum / totalWeight;
  }

  async calibrate(): Promise<void> {
    // Calibrate all sub-models
    for (const [, model] of this.subModels) {
      await model.calibrate([]);
    }
    this.calibrated = true;
  }

  /**
   * Run full simulation and return complete result
   */
  async runFullSimulation(simulation: PolicySimulation): Promise<Omit<SimulationResult, 'id' | 'createdAt'>> {
    const input: TBLModelInput = {
      baseValue: 0,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      simulation
    };

    // Prepare sub-model inputs
    const economicInput: EconomicModelInput = {
      baseValue: simulation.economic.baselineGdp,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      baselineGdp: simulation.economic.baselineGdp,
      taxRateChanges: simulation.economic.taxRateChanges,
      spendingChanges: simulation.economic.spendingChanges,
      regulatoryBurden: simulation.economic.regulatoryBurden
    };

    const environmentalInput: EnvironmentalModelInput = {
      baseValue: simulation.environmental.baselineCarbon,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      baselineCarbon: simulation.environmental.baselineCarbon,
      supplyChainLocality: simulation.environmental.supplyChainLocality,
      energyMix: simulation.environmental.energyMix,
      resourceConsumption: simulation.environmental.resourceConsumption
    };

    const socialInput: SocialModelInput = {
      baseValue: 50,
      changes: {},
      timeHorizon: simulation.timeHorizon,
      region: simulation.region,
      populationAffected: simulation.social.populationAffected,
      accessibilityChange: simulation.social.accessibilityChange,
      inequalityImpact: simulation.social.inequalityImpact
    };

    // Run models for each dimension
    const gdpResult = await (this.getSubModel('gdp') as GDPModel).run(economicInput);
    const employmentResult = await (this.getSubModel('employment') as EmploymentModel).run(economicInput);
    const smallBizResult = await (this.getSubModel('smallBusiness') as SmallBusinessModel).run(economicInput);

    const carbonResult = await (this.getSubModel('carbon') as CarbonModel).run(environmentalInput);
    const resourceResult = await (this.getSubModel('resource') as ResourceModel).run(environmentalInput);

    const inequalityResult = await (this.getSubModel('inequality') as InequalityModel).run(socialInput);
    const accessResult = await (this.getSubModel('access') as AccessModel).run(socialInput);
    const wellbeingResult = await (this.getSubModel('wellbeing') as WellbeingModel).run(socialInput);

    // Calculate aggregate scores
    const profitScore = this.weightedAverage([
      { value: gdpResult.predicted, weight: 0.4 },
      { value: employmentResult.predicted, weight: 0.35 },
      { value: smallBizResult.predicted, weight: 0.25 }
    ]);

    const planetScore = this.weightedAverage([
      { value: carbonResult.predicted, weight: 0.5 },
      { value: resourceResult.predicted, weight: 0.5 }
    ]);

    const peopleScore = this.weightedAverage([
      { value: inequalityResult.predicted, weight: 0.35 },
      { value: accessResult.predicted, weight: 0.35 },
      { value: wellbeingResult.predicted, weight: 0.3 }
    ]);

    // Identify trade-offs
    const tradeOffs = this.identifyTradeOffs({ people: peopleScore, planet: planetScore, profit: profitScore });

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      { people: peopleScore, planet: planetScore, profit: profitScore },
      tradeOffs
    );

    // Generate sensitivity results (simplified)
    const sensitivities = this.generateSensitivities(simulation);

    return {
      billId: simulation.billId,
      simulationId: simulation.id || '',
      status: 'completed',
      completedAt: new Date(),

      people: {
        predicted: peopleScore,
        confidence: this.generateConfidenceInterval(peopleScore, Math.abs(peopleScore) * 0.15),
        factors: [...inequalityResult.factors, ...accessResult.factors, ...wellbeingResult.factors],
        timeline: wellbeingResult.timeline
      },

      planet: {
        predicted: planetScore,
        confidence: this.generateConfidenceInterval(planetScore, Math.abs(planetScore) * 0.18),
        carbonDelta: simulation.environmental.baselineCarbon * (planetScore / 100),
        factors: [...carbonResult.factors, ...resourceResult.factors],
        timeline: carbonResult.timeline
      },

      profit: {
        predicted: profitScore,
        confidence: this.generateConfidenceInterval(profitScore, Math.abs(profitScore) * 0.15),
        economicImpact: simulation.economic.baselineGdp * (profitScore / 100),
        factors: [...gdpResult.factors, ...employmentResult.factors, ...smallBizResult.factors],
        timeline: gdpResult.timeline
      },

      sensitivities,
      tradeOffs,
      recommendations
    };
  }

  private identifyTradeOffs(scores: TBLScore): TradeOff[] {
    const tradeOffs: TradeOff[] = [];

    // Check for opposing directions
    if (scores.people > 20 && scores.profit < -20) {
      tradeOffs.push({
        dimension1: 'people',
        dimension2: 'profit',
        correlation: -0.7,
        description: 'Social benefits may come at economic cost',
        mitigationStrategies: [
          'Phase in changes gradually',
          'Target subsidies to affected industries',
          'Invest in workforce transition programs'
        ]
      });
    }

    if (scores.planet > 20 && scores.profit < -20) {
      tradeOffs.push({
        dimension1: 'planet',
        dimension2: 'profit',
        correlation: -0.6,
        description: 'Environmental protection may impact short-term profits',
        mitigationStrategies: [
          'Provide transition support for affected businesses',
          'Create green economy incentives',
          'Develop carbon credit programs'
        ]
      });
    }

    if (scores.people < -20 && scores.profit > 20) {
      tradeOffs.push({
        dimension1: 'profit',
        dimension2: 'people',
        correlation: -0.5,
        description: 'Economic growth may widen inequality',
        mitigationStrategies: [
          'Implement progressive tax adjustments',
          'Strengthen social safety nets',
          'Invest in education and training'
        ]
      });
    }

    return tradeOffs;
  }

  private generateRecommendations(scores: TBLScore, tradeOffs: TradeOff[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Balanced outcome
    if (scores.people > 10 && scores.planet > 10 && scores.profit > 10) {
      recommendations.push({
        type: 'opportunity',
        title: 'Balanced Positive Outcome',
        description: 'This policy shows positive impacts across all dimensions. Consider accelerating implementation.',
        confidence: 0.85,
        relatedFactors: ['Triple Bottom Line']
      });
    }

    // Warning for negative impacts
    if (scores.people < -30) {
      recommendations.push({
        type: 'warning',
        title: 'Significant Negative Social Impact',
        description: 'Consider mitigation measures to address inequality and accessibility concerns.',
        confidence: 0.8,
        relatedFactors: ['Social Impact', 'Inequality']
      });
    }

    if (scores.planet < -30) {
      recommendations.push({
        type: 'warning',
        title: 'Environmental Concerns',
        description: 'Policy may have significant negative environmental effects. Consider environmental safeguards.',
        confidence: 0.75,
        relatedFactors: ['Carbon Emissions', 'Resource Usage']
      });
    }

    // Trade-off mitigation
    for (const tradeOff of tradeOffs) {
      recommendations.push({
        type: 'suggestion',
        title: `Address ${tradeOff.dimension1}-${tradeOff.dimension2} Trade-off`,
        description: tradeOff.mitigationStrategies?.[0] || 'Consider balancing measures',
        confidence: 0.7,
        relatedFactors: [tradeOff.dimension1, tradeOff.dimension2]
      });
    }

    return recommendations;
  }

  private generateSensitivities(simulation: PolicySimulation): SensitivityResult[] {
    const sensitivities: SensitivityResult[] = [];

    // Key parameters to analyze
    sensitivities.push({
      parameter: 'Regulatory Burden',
      baseValue: simulation.economic.regulatoryBurden,
      range: [simulation.economic.regulatoryBurden * 0.5, simulation.economic.regulatoryBurden * 1.5],
      impactOnPeople: -5,
      impactOnPlanet: 10,
      impactOnProfit: -15,
      elasticity: -0.3
    });

    sensitivities.push({
      parameter: 'Supply Chain Locality',
      baseValue: simulation.environmental.supplyChainLocality,
      range: [20, 80],
      impactOnPeople: 5,
      impactOnPlanet: 20,
      impactOnProfit: -5,
      elasticity: 0.4
    });

    sensitivities.push({
      parameter: 'Time Horizon',
      baseValue: simulation.timeHorizon,
      range: [1, 20],
      impactOnPeople: 15,
      impactOnPlanet: 25,
      impactOnProfit: 10,
      elasticity: 0.2
    });

    return sensitivities;
  }
}

/**
 * Trade-off analyzer for policy comparison
 */
export class TradeOffAnalyzer {
  /**
   * Analyze trade-offs between multiple policies
   */
  analyzeTradeOffs(outcomes: TBLScore[]): {
    correlations: Record<string, number>;
    dominantDimension: string;
    weakestDimension: string;
  } {
    const peopleValues = outcomes.map(o => o.people);
    const planetValues = outcomes.map(o => o.planet);
    const profitValues = outcomes.map(o => o.profit);

    const correlations = {
      'people-planet': correlation(peopleValues, planetValues),
      'people-profit': correlation(peopleValues, profitValues),
      'planet-profit': correlation(planetValues, profitValues)
    };

    const avgPeople = peopleValues.reduce((a, b) => a + b, 0) / peopleValues.length;
    const avgPlanet = planetValues.reduce((a, b) => a + b, 0) / planetValues.length;
    const avgProfit = profitValues.reduce((a, b) => a + b, 0) / profitValues.length;

    const dimensions = [
      { name: 'people', avg: avgPeople },
      { name: 'planet', avg: avgPlanet },
      { name: 'profit', avg: avgProfit }
    ];

    dimensions.sort((a, b) => b.avg - a.avg);

    return {
      correlations,
      dominantDimension: dimensions[0].name,
      weakestDimension: dimensions[2].name
    };
  }
}
