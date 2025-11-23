/**
 * API client for simulation service
 */

const API_BASE = '/api';

export interface SimulationSummary {
  id: string;
  billId: string;
  region: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface SimulationDetail extends SimulationSummary {
  config: Record<string, unknown>;
  result?: SimulationResult;
  error?: string;
}

export interface SimulationResult {
  people: DimensionResult;
  planet: DimensionResult & { carbonDelta: number };
  profit: DimensionResult & { economicImpact: number };
  sensitivities: SensitivityResult[];
  tradeOffs: TradeOff[];
  recommendations: Recommendation[];
}

export interface DimensionResult {
  predicted: number;
  confidence: [number, number];
  factors: Factor[];
  timeline: TimelineData;
}

export interface TimelineData {
  timestamps: string[];
  values: number[];
  confidenceLower: number[];
  confidenceUpper: number[];
}

export interface Factor {
  name: string;
  weight: number;
  value: number;
  description: string;
}

export interface SensitivityResult {
  parameter: string;
  baseValue: number;
  range: [number, number];
  impactOnPeople: number;
  impactOnPlanet: number;
  impactOnProfit: number;
  elasticity: number;
}

export interface TradeOff {
  dimension1: string;
  dimension2: string;
  correlation: number;
  description: string;
  mitigationStrategies?: string[];
}

export interface Recommendation {
  type: 'warning' | 'suggestion' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  relatedFactors: string[];
}

class SimulationAPI {
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Simulations
  async listSimulations(params?: {
    billId?: string;
    status?: string;
    limit?: number;
  }): Promise<{ simulations: SimulationSummary[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.billId) query.set('billId', params.billId);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.fetch(`/simulations?${query}`);
  }

  async getSimulation(id: string): Promise<SimulationDetail> {
    return this.fetch(`/simulations/${id}`);
  }

  async createSimulation(config: Record<string, unknown>): Promise<{ id: string }> {
    return this.fetch('/simulations', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async runSimulation(id: string): Promise<{ status: string; jobId: string }> {
    return this.fetch(`/simulations/${id}/run`, { method: 'POST' });
  }

  async getResults(id: string): Promise<SimulationResult> {
    return this.fetch(`/simulations/${id}/results`);
  }

  async deleteSimulation(id: string): Promise<void> {
    await this.fetch(`/simulations/${id}`, { method: 'DELETE' });
  }

  // Scenarios
  async listScenarios(): Promise<{ scenarios: Array<{ id: string; name: string }> }> {
    return this.fetch('/scenarios');
  }

  async getTemplates(): Promise<{ templates: Array<{ id: string; name: string }> }> {
    return this.fetch('/scenarios/templates');
  }

  // Analysis
  async runSensitivity(simulationId: string, parameters?: string[]): Promise<SensitivityResult[]> {
    const data = await this.fetch<{ results: SensitivityResult[] }>('/analyze/sensitivity', {
      method: 'POST',
      body: JSON.stringify({ simulationId, parameters })
    });
    return data.results;
  }

  async runMonteCarlo(
    simulationId: string,
    iterations: number,
    parameterRanges: Array<{ name: string; distribution: string; params: number[] }>
  ): Promise<Record<string, unknown>> {
    return this.fetch('/analyze/monte-carlo', {
      method: 'POST',
      body: JSON.stringify({ simulationId, iterations, parameterRanges })
    });
  }

  async comparePolicies(policyIds: string[], region: string, timeHorizon: number): Promise<Record<string, unknown>> {
    return this.fetch('/analyze/compare', {
      method: 'POST',
      body: JSON.stringify({ policyIds, region, timeHorizon })
    });
  }

  // Sandbox
  async quickSimulation(
    billId: string,
    region: string,
    scenario: 'conservative' | 'moderate' | 'aggressive'
  ): Promise<Record<string, unknown>> {
    return this.fetch('/sandbox/quick', {
      method: 'POST',
      body: JSON.stringify({ billId, region, scenario })
    });
  }

  async getPresets(): Promise<{ presets: Array<{ name: string; description: string }> }> {
    return this.fetch('/sandbox/presets');
  }
}

export const api = new SimulationAPI();
