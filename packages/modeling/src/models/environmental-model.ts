/**
 * Environmental impact model for policy simulation
 */

import { BaseModel, ModelConfig, ModelInput, ModelOutput } from './base-model';
import type { Factor, EnergyMix } from '../types';

export interface EnvironmentalModelInput extends ModelInput {
  baselineCarbon: number;        // tons CO2/year
  supplyChainLocality: number;   // % local sourcing
  energyMix: EnergyMix;
  resourceConsumption: number;   // Index 0-100
}

/**
 * Carbon emissions model
 */
export class CarbonModel extends BaseModel {
  private emissionFactors: Record<string, number> = {
    coal: 0.91,         // kg CO2 per kWh
    naturalGas: 0.41,
    nuclear: 0.012,
    solar: 0.041,
    wind: 0.011,
    hydro: 0.024,
    other: 0.3
  };

  constructor() {
    super({
      name: 'Carbon Emissions Model',
      version: '1.0.0',
      description: 'Models carbon emission impacts from policy changes',
      parameters: {
        baselineIntensity: 0.4,    // kg CO2 per $ GDP
        transportEmissionFactor: 0.15,
        industrialFactor: 0.35,
        confidenceFactor: 0.18
      },
      weights: {
        energy: 0.45,
        transport: 0.25,
        industrial: 0.30
      }
    });
  }

  async run(input: EnvironmentalModelInput): Promise<ModelOutput> {
    const { baselineCarbon, supplyChainLocality, energyMix, timeHorizon } = input;

    const factors: Factor[] = [];

    // Energy mix impact
    const energyImpact = this.calculateEnergyMixImpact(energyMix);
    factors.push(this.createFactor(
      'Energy Mix',
      this.config.weights.energy,
      energyImpact,
      `Carbon intensity from energy sources`
    ));

    // Supply chain impact (more local = less transport emissions)
    const transportImpact = this.calculateTransportImpact(supplyChainLocality);
    factors.push(this.createFactor(
      'Supply Chain Transport',
      this.config.weights.transport,
      transportImpact,
      `${supplyChainLocality}% local sourcing`
    ));

    // Industrial process emissions
    const industrialImpact = this.calculateIndustrialImpact(
      input.resourceConsumption
    );
    factors.push(this.createFactor(
      'Industrial Processes',
      this.config.weights.industrial,
      industrialImpact,
      'Emissions from industrial activities'
    ));

    const totalImpact = this.aggregateFactors(factors);
    const carbonDelta = this.calculateCarbonDelta(baselineCarbon, totalImpact);

    const stdError = Math.abs(totalImpact) * this.config.parameters.confidenceFactor;

    return {
      predicted: Math.max(-100, Math.min(100, totalImpact)),
      confidence: this.generateConfidenceInterval(totalImpact, stdError),
      factors,
      timeline: this.generateTimeline(0, totalImpact, timeHorizon, stdError)
    };
  }

  private calculateEnergyMixImpact(mix: EnergyMix): number {
    // Calculate weighted carbon intensity
    const intensity =
      mix.coal * this.emissionFactors.coal +
      mix.naturalGas * this.emissionFactors.naturalGas +
      mix.nuclear * this.emissionFactors.nuclear +
      mix.solar * this.emissionFactors.solar +
      mix.wind * this.emissionFactors.wind +
      mix.hydro * this.emissionFactors.hydro +
      mix.other * this.emissionFactors.other;

    // Normalize: lower intensity = positive impact (good for planet)
    // 0.5 kg CO2/kWh is baseline; below = positive, above = negative
    const baselineIntensity = 0.5;
    const percentageChange = ((baselineIntensity - intensity) / baselineIntensity) * 100;

    return Math.max(-100, Math.min(100, percentageChange));
  }

  private calculateTransportImpact(localityPercent: number): number {
    // More local sourcing = fewer transport emissions = positive impact
    // 50% local is baseline
    const baseline = 50;
    return (localityPercent - baseline) * 1.5;
  }

  private calculateIndustrialImpact(resourceConsumption: number): number {
    // Lower consumption = positive impact
    // 50 is baseline
    return (50 - resourceConsumption) * 0.8;
  }

  private calculateCarbonDelta(baseline: number, impactPercent: number): number {
    return baseline * (impactPercent / 100);
  }

  async calibrate(): Promise<void> {
    this.calibrated = true;
  }
}

/**
 * Resource consumption model
 */
export class ResourceModel extends BaseModel {
  constructor() {
    super({
      name: 'Resource Consumption Model',
      version: '1.0.0',
      description: 'Models resource usage and conservation impacts',
      parameters: {
        waterIntensity: 0.3,
        materialIntensity: 0.35,
        landUseIntensity: 0.25,
        wasteGeneration: 0.1,
        confidenceFactor: 0.2
      },
      weights: {
        water: 0.3,
        materials: 0.3,
        land: 0.25,
        waste: 0.15
      }
    });
  }

  async run(input: EnvironmentalModelInput): Promise<ModelOutput> {
    const { resourceConsumption, supplyChainLocality, timeHorizon } = input;

    const factors: Factor[] = [];

    // Water resources
    const waterImpact = (50 - resourceConsumption) * this.config.parameters.waterIntensity;
    factors.push(this.createFactor(
      'Water Resources',
      this.config.weights.water,
      waterImpact,
      'Impact on water consumption and quality'
    ));

    // Material resources
    const materialImpact = (50 - resourceConsumption) * this.config.parameters.materialIntensity;
    factors.push(this.createFactor(
      'Material Resources',
      this.config.weights.materials,
      materialImpact,
      'Raw material consumption changes'
    ));

    // Land use
    const landImpact = (supplyChainLocality - 50) * this.config.parameters.landUseIntensity;
    factors.push(this.createFactor(
      'Land Use',
      this.config.weights.land,
      landImpact,
      'Changes in land use patterns'
    ));

    // Waste generation
    const wasteImpact = (50 - resourceConsumption) * this.config.parameters.wasteGeneration * 2;
    factors.push(this.createFactor(
      'Waste Generation',
      this.config.weights.waste,
      wasteImpact,
      'Waste production and management'
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
 * Supply chain sustainability model
 */
export class SupplyChainDistanceModel extends BaseModel {
  constructor() {
    super({
      name: 'Supply Chain Distance Model',
      version: '1.0.0',
      description: 'Models environmental impact of supply chain geography',
      parameters: {
        emissionPerMile: 0.0002,    // tons CO2 per mile per unit
        localMultiplier: 0.8,       // Bonus for local sourcing
        internationalPenalty: 1.3,  // Penalty for international
        confidenceFactor: 0.15
      },
      weights: {
        distance: 0.5,
        mode: 0.3,
        frequency: 0.2
      }
    });
  }

  async run(input: EnvironmentalModelInput): Promise<ModelOutput> {
    const { supplyChainLocality, timeHorizon } = input;

    const factors: Factor[] = [];

    // Distance-based emissions
    const distanceImpact = this.calculateDistanceImpact(supplyChainLocality);
    factors.push(this.createFactor(
      'Supply Chain Distance',
      this.config.weights.distance,
      distanceImpact,
      `${supplyChainLocality}% local sourcing reduces transport distance`
    ));

    // Transport mode mix (assumption: more local = more efficient modes)
    const modeImpact = (supplyChainLocality - 50) * 0.5;
    factors.push(this.createFactor(
      'Transport Mode',
      this.config.weights.mode,
      modeImpact,
      'Shift toward lower-emission transport modes'
    ));

    // Shipping frequency
    const frequencyImpact = (supplyChainLocality - 50) * 0.3;
    factors.push(this.createFactor(
      'Shipping Frequency',
      this.config.weights.frequency,
      frequencyImpact,
      'Optimization of shipping schedules'
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

  private calculateDistanceImpact(localityPercent: number): number {
    // Higher locality = shorter supply chains = positive environmental impact
    // Scale: 0% local = -50 impact, 100% local = +50 impact
    return (localityPercent - 50);
  }

  async calibrate(): Promise<void> {
    this.calibrated = true;
  }
}

/**
 * Renewable energy adoption model
 */
export class RenewableAdoptionModel extends BaseModel {
  constructor() {
    super({
      name: 'Renewable Energy Adoption Model',
      version: '1.0.0',
      description: 'Models transition to renewable energy sources',
      parameters: {
        adoptionRate: 0.05,         // Base annual adoption rate
        policyAcceleration: 1.5,    // Policy-driven acceleration
        costReductionCurve: 0.1,    // Learning curve effect
        confidenceFactor: 0.22
      },
      weights: {
        currentMix: 0.4,
        trend: 0.35,
        policy: 0.25
      }
    });
  }

  async run(input: EnvironmentalModelInput): Promise<ModelOutput> {
    const { energyMix, timeHorizon } = input;

    const factors: Factor[] = [];

    // Current renewable share
    const renewableShare = energyMix.solar + energyMix.wind + energyMix.hydro;
    const currentImpact = (renewableShare - 30) * 1.2;  // 30% baseline
    factors.push(this.createFactor(
      'Current Renewable Share',
      this.config.weights.currentMix,
      currentImpact,
      `${renewableShare.toFixed(1)}% renewable energy`
    ));

    // Projected growth trend
    const trendImpact = renewableShare * this.config.parameters.adoptionRate * timeHorizon;
    factors.push(this.createFactor(
      'Adoption Trend',
      this.config.weights.trend,
      Math.min(50, trendImpact),
      `Projected growth over ${timeHorizon} years`
    ));

    // Policy support effect
    const policyImpact = 15 * this.config.parameters.policyAcceleration;
    factors.push(this.createFactor(
      'Policy Support',
      this.config.weights.policy,
      policyImpact,
      'Government incentives and mandates'
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
