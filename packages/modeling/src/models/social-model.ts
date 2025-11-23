/**
 * Social impact model for policy simulation
 */

import { BaseModel, ModelConfig, ModelInput, ModelOutput } from './base-model';
import type { Factor } from '../types';

export interface SocialModelInput extends ModelInput {
  populationAffected: number;
  accessibilityChange: number;      // -100 to +100
  inequalityImpact: number;         // Gini coefficient delta (-0.1 to +0.1)
  educationAccess?: number;         // Index 0-100
  healthcareAccess?: number;        // Index 0-100
  housingAffordability?: number;    // Index 0-100
}

/**
 * Inequality model
 */
export class InequalityModel extends BaseModel {
  constructor() {
    super({
      name: 'Inequality Impact Model',
      version: '1.0.0',
      description: 'Models the impact of policies on economic inequality',
      parameters: {
        giniSensitivity: 500,          // Scaling factor for Gini changes
        progressiveTaxEffect: 0.3,
        wealthTransferEffect: 0.5,
        confidenceFactor: 0.2
      },
      weights: {
        income: 0.4,
        wealth: 0.35,
        opportunity: 0.25
      }
    });
  }

  async run(input: SocialModelInput): Promise<ModelOutput> {
    const { inequalityImpact, accessibilityChange, timeHorizon } = input;

    const factors: Factor[] = [];

    // Income inequality effect
    const incomeImpact = -inequalityImpact * this.config.parameters.giniSensitivity;
    factors.push(this.createFactor(
      'Income Distribution',
      this.config.weights.income,
      Math.max(-100, Math.min(100, incomeImpact)),
      `Gini coefficient change: ${(inequalityImpact * 100).toFixed(2)}%`
    ));

    // Wealth concentration
    const wealthImpact = -inequalityImpact * this.config.parameters.giniSensitivity * 0.8;
    factors.push(this.createFactor(
      'Wealth Concentration',
      this.config.weights.wealth,
      Math.max(-100, Math.min(100, wealthImpact)),
      'Impact on wealth distribution'
    ));

    // Economic opportunity
    const opportunityImpact = accessibilityChange * 0.7;
    factors.push(this.createFactor(
      'Economic Opportunity',
      this.config.weights.opportunity,
      opportunityImpact,
      'Access to economic opportunities'
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
 * Access to services model
 */
export class AccessModel extends BaseModel {
  constructor() {
    super({
      name: 'Service Access Model',
      version: '1.0.0',
      description: 'Models access to essential services',
      parameters: {
        educationWeight: 0.35,
        healthcareWeight: 0.35,
        housingWeight: 0.30,
        confidenceFactor: 0.18
      },
      weights: {
        education: 0.35,
        healthcare: 0.35,
        housing: 0.30
      }
    });
  }

  async run(input: SocialModelInput): Promise<ModelOutput> {
    const {
      educationAccess = 50,
      healthcareAccess = 50,
      housingAffordability = 50,
      accessibilityChange,
      timeHorizon
    } = input;

    const factors: Factor[] = [];

    // Education access
    const eduImpact = (educationAccess - 50) + accessibilityChange * 0.3;
    factors.push(this.createFactor(
      'Education Access',
      this.config.weights.education,
      Math.max(-100, Math.min(100, eduImpact)),
      `Education accessibility index: ${educationAccess}`
    ));

    // Healthcare access
    const healthImpact = (healthcareAccess - 50) + accessibilityChange * 0.4;
    factors.push(this.createFactor(
      'Healthcare Access',
      this.config.weights.healthcare,
      Math.max(-100, Math.min(100, healthImpact)),
      `Healthcare accessibility index: ${healthcareAccess}`
    ));

    // Housing affordability
    const housingImpact = (housingAffordability - 50) + accessibilityChange * 0.3;
    factors.push(this.createFactor(
      'Housing Affordability',
      this.config.weights.housing,
      Math.max(-100, Math.min(100, housingImpact)),
      `Housing affordability index: ${housingAffordability}`
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
 * Democratic participation model
 */
export class ParticipationModel extends BaseModel {
  constructor() {
    super({
      name: 'Democratic Participation Model',
      version: '1.0.0',
      description: 'Models civic engagement and democratic participation',
      parameters: {
        votingEaseFactor: 0.4,
        transparencyFactor: 0.3,
        engagementFactor: 0.3,
        confidenceFactor: 0.22
      },
      weights: {
        voting: 0.4,
        transparency: 0.3,
        engagement: 0.3
      }
    });
  }

  async run(input: SocialModelInput): Promise<ModelOutput> {
    const { accessibilityChange, timeHorizon } = input;

    const factors: Factor[] = [];

    // Voting access
    const votingImpact = accessibilityChange * this.config.parameters.votingEaseFactor;
    factors.push(this.createFactor(
      'Voting Accessibility',
      this.config.weights.voting,
      votingImpact,
      'Ease of participating in elections'
    ));

    // Government transparency
    const transparencyImpact = accessibilityChange * this.config.parameters.transparencyFactor * 0.8;
    factors.push(this.createFactor(
      'Government Transparency',
      this.config.weights.transparency,
      transparencyImpact,
      'Access to government information'
    ));

    // Civic engagement opportunities
    const engagementImpact = accessibilityChange * this.config.parameters.engagementFactor * 0.6;
    factors.push(this.createFactor(
      'Civic Engagement',
      this.config.weights.engagement,
      engagementImpact,
      'Opportunities for civic participation'
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
 * Wellbeing model
 */
export class WellbeingModel extends BaseModel {
  constructor() {
    super({
      name: 'Wellbeing Model',
      version: '1.0.0',
      description: 'Models overall societal wellbeing',
      parameters: {
        economicFactor: 0.25,
        socialFactor: 0.35,
        healthFactor: 0.25,
        environmentalFactor: 0.15,
        confidenceFactor: 0.25
      },
      weights: {
        economic: 0.25,
        social: 0.35,
        health: 0.25,
        environmental: 0.15
      }
    });
  }

  async run(input: SocialModelInput): Promise<ModelOutput> {
    const {
      accessibilityChange,
      inequalityImpact,
      healthcareAccess = 50,
      timeHorizon
    } = input;

    const factors: Factor[] = [];

    // Economic wellbeing
    const economicImpact = -inequalityImpact * 200 + accessibilityChange * 0.2;
    factors.push(this.createFactor(
      'Economic Wellbeing',
      this.config.weights.economic,
      Math.max(-100, Math.min(100, economicImpact)),
      'Financial security and opportunity'
    ));

    // Social connections
    const socialImpact = accessibilityChange * 0.5;
    factors.push(this.createFactor(
      'Social Connections',
      this.config.weights.social,
      socialImpact,
      'Community bonds and social support'
    ));

    // Health outcomes
    const healthImpact = (healthcareAccess - 50) * 0.8 + accessibilityChange * 0.2;
    factors.push(this.createFactor(
      'Health Outcomes',
      this.config.weights.health,
      Math.max(-100, Math.min(100, healthImpact)),
      'Physical and mental health'
    ));

    // Environmental quality
    const envImpact = accessibilityChange * 0.3;
    factors.push(this.createFactor(
      'Environmental Quality',
      this.config.weights.environmental,
      envImpact,
      'Quality of living environment'
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
