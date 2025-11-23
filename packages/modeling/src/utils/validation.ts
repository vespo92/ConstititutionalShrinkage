/**
 * Validation utilities for simulation parameters and results
 */

import type { PolicySimulation, Scenario, ValidationResult } from '../types';

/**
 * Validate policy simulation configuration
 */
export function validateSimulation(simulation: PolicySimulation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!simulation.billId) {
    errors.push('Bill ID is required');
  }

  if (!simulation.region) {
    errors.push('Region is required');
  }

  // Time horizon validation
  if (simulation.timeHorizon <= 0) {
    errors.push('Time horizon must be positive');
  } else if (simulation.timeHorizon > 50) {
    warnings.push('Time horizons over 50 years have high uncertainty');
  }

  // Confidence level
  if (simulation.confidenceLevel < 0.5 || simulation.confidenceLevel > 0.99) {
    errors.push('Confidence level must be between 0.5 and 0.99');
  }

  // Economic parameters
  if (simulation.economic) {
    if (simulation.economic.baselineGdp < 0) {
      errors.push('Baseline GDP cannot be negative');
    }

    if (simulation.economic.regulatoryBurden < 0 || simulation.economic.regulatoryBurden > 100) {
      errors.push('Regulatory burden must be between 0 and 100');
    }

    for (const taxChange of simulation.economic.taxRateChanges || []) {
      if (taxChange.currentRate < 0 || taxChange.proposedRate < 0) {
        errors.push(`Invalid tax rate for ${taxChange.category}`);
      }
      if (taxChange.proposedRate > 100) {
        warnings.push(`Tax rate over 100% for ${taxChange.category}`);
      }
    }
  }

  // Environmental parameters
  if (simulation.environmental) {
    if (simulation.environmental.baselineCarbon < 0) {
      errors.push('Baseline carbon cannot be negative');
    }

    if (simulation.environmental.supplyChainLocality < 0 ||
        simulation.environmental.supplyChainLocality > 100) {
      errors.push('Supply chain locality must be between 0 and 100');
    }

    if (simulation.environmental.energyMix) {
      const mix = simulation.environmental.energyMix;
      const total = mix.coal + mix.naturalGas + mix.nuclear +
                    mix.solar + mix.wind + mix.hydro + mix.other;
      if (Math.abs(total - 100) > 1) {
        warnings.push('Energy mix percentages do not sum to 100%');
      }
    }
  }

  // Social parameters
  if (simulation.social) {
    if (simulation.social.populationAffected < 0) {
      errors.push('Population affected cannot be negative');
    }

    if (simulation.social.accessibilityChange < -100 ||
        simulation.social.accessibilityChange > 100) {
      errors.push('Accessibility change must be between -100 and 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate scenario configuration
 */
export function validateScenario(scenario: Scenario): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!scenario.name || scenario.name.trim() === '') {
    errors.push('Scenario name is required');
  }

  const validTemplates = ['conservative', 'moderate', 'aggressive', 'custom'];
  if (!validTemplates.includes(scenario.template)) {
    errors.push(`Invalid template: ${scenario.template}`);
  }

  if (scenario.template === 'custom' && Object.keys(scenario.parameters).length === 0) {
    warnings.push('Custom scenario has no parameters defined');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate TBL score is in valid range
 */
export function validateTBLScore(score: { people: number; planet: number; profit: number }): boolean {
  const inRange = (val: number) => val >= -100 && val <= 100;
  return inRange(score.people) && inRange(score.planet) && inRange(score.profit);
}

/**
 * Clamp value to range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp TBL scores to valid range
 */
export function clampTBLScore(score: { people: number; planet: number; profit: number }): {
  people: number;
  planet: number;
  profit: number;
} {
  return {
    people: clamp(score.people, -100, 100),
    planet: clamp(score.planet, -100, 100),
    profit: clamp(score.profit, -100, 100)
  };
}

/**
 * Check if object has required properties
 */
export function hasRequiredProps<T extends object>(
  obj: T,
  props: (keyof T)[]
): boolean {
  return props.every(prop => obj[prop] !== undefined && obj[prop] !== null);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().slice(0, 1000);
}

/**
 * Validate array is non-empty
 */
export function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}
