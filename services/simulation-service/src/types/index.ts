/**
 * Types for simulation service
 */

import type {
  PolicySimulation,
  SimulationResult,
  Scenario,
  MonteCarloConfig,
  MonteCarloResult,
  ComparisonResult,
  HistoricalPolicy,
  ActualOutcome,
  CalibrationResult,
  AccuracyReport
} from '@constitutional/modeling';

// API Request/Response types
export interface CreateSimulationRequest {
  billId: string;
  region: string;
  timeHorizon: number;
  confidenceLevel?: number;
  economic: {
    baselineGdp: number;
    taxRateChanges?: Array<{
      category: string;
      currentRate: number;
      proposedRate: number;
      affectedPopulation: number;
    }>;
    spendingChanges?: Array<{
      category: string;
      currentAmount: number;
      proposedAmount: number;
      effectiveDate: string;
    }>;
    regulatoryBurden: number;
  };
  environmental: {
    baselineCarbon: number;
    supplyChainLocality: number;
    energyMix: {
      coal: number;
      naturalGas: number;
      nuclear: number;
      solar: number;
      wind: number;
      hydro: number;
      other: number;
    };
    resourceConsumption: number;
  };
  social: {
    populationAffected: number;
    accessibilityChange: number;
    inequalityImpact: number;
  };
}

export interface SimulationResponse {
  id: string;
  billId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: SimulationResult;
  error?: string;
}

export interface RunSimulationResponse {
  id: string;
  status: 'running';
  message: string;
  estimatedDuration: number;
}

export interface CreateScenarioRequest {
  name: string;
  template: 'conservative' | 'moderate' | 'aggressive' | 'custom';
  region?: string;
  parameters: Record<string, number | string>;
}

export interface ScenarioResponse {
  id: string;
  name: string;
  template: string;
  region?: string;
  parameters: Record<string, number | string>;
  createdAt: string;
}

export interface CompareRequest {
  policyIds: string[];
  region: string;
  timeHorizon: number;
}

export interface SensitivityRequest {
  simulationId: string;
  parameters: string[];
  ranges?: Record<string, [number, number]>;
}

export interface MonteCarloRequest {
  simulationId: string;
  iterations: number;
  parameterRanges: Array<{
    name: string;
    distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal';
    params: number[];
  }>;
}

export interface QuickSandboxRequest {
  billId: string;
  region: string;
  scenario: 'conservative' | 'moderate' | 'aggressive';
}

// Internal types
export interface StoredSimulation {
  id: string;
  config: PolicySimulation;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: SimulationResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface StoredScenario {
  id: string;
  scenario: Scenario;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export modeling types
export type {
  PolicySimulation,
  SimulationResult,
  Scenario,
  MonteCarloConfig,
  MonteCarloResult,
  ComparisonResult,
  HistoricalPolicy,
  ActualOutcome,
  CalibrationResult,
  AccuracyReport
};
