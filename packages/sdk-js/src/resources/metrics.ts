import { HttpClient } from '../utils/request';
import { SingleResponse } from '../types/common.types';

export interface PlatformOverview {
  timestamp: string;
  platform: {
    totalRegions: number;
    totalCitizens: number;
    activeCitizens: number;
    totalBills: number;
    activeBills: number;
  };
  participation: {
    averageRate: number;
    trend: string;
    highestRegion: { id: string; name: string; rate: number };
    lowestRegion: { id: string; name: string; rate: number };
  };
  legislation: {
    billsPassedThisMonth: number;
    billsRejectedThisMonth: number;
    averageTimeToPass: string;
    citizenProposals: number;
  };
  tbl: {
    averageScore: number;
    people: number;
    planet: number;
    profit: number;
  };
}

export interface TBLMetrics {
  period: string;
  regionId: string;
  scores: {
    overall: number;
    people: {
      score: number;
      components: Record<string, number>;
    };
    planet: {
      score: number;
      components: Record<string, number>;
    };
    profit: {
      score: number;
      components: Record<string, number>;
    };
  };
  trends: {
    weekly: number[];
    monthly: number[];
  };
  topPerformers: Array<{
    regionId: string;
    name: string;
    score: number;
  }>;
}

export interface GovernanceMetrics {
  efficiency: {
    averageBillPassTime: string;
    comparedToTraditional: string;
    automatedProcessingRate: number;
  };
  transparency: {
    publicDataAvailability: number;
    votingTransparency: number;
    spendingVisibility: number;
  };
  participation: {
    citizenEngagement: number;
    delegationUtilization: number;
    proposalSubmissionRate: number;
    commentEngagement: number;
  };
  accountability: {
    sunsetEnforcement: number;
    metricsCompliance: number;
    conflictResolutionTime: string;
  };
  cost: {
    operationalCostReduction: number;
    costPerCitizen: number;
    automationSavings: number;
  };
}

export interface ComparisonResult {
  regions: string[];
  metrics: string[];
  data: Array<{
    regionId: string;
    regionName: string;
    values: Record<string, number>;
  }>;
}

export class MetricsResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Get platform-wide metrics overview
   */
  async getOverview(): Promise<PlatformOverview> {
    const response = await this.client.get<SingleResponse<PlatformOverview>>(
      '/v1/metrics/overview'
    );
    return response.data;
  }

  /**
   * Get Triple Bottom Line scores
   */
  async getTBL(params: { regionId?: string; period?: string } = {}): Promise<TBLMetrics> {
    const response = await this.client.get<SingleResponse<TBLMetrics>>(
      '/v1/metrics/tbl',
      params
    );
    return response.data;
  }

  /**
   * Get governance health metrics
   */
  async getGovernance(): Promise<GovernanceMetrics> {
    const response = await this.client.get<SingleResponse<GovernanceMetrics>>(
      '/v1/metrics/governance'
    );
    return response.data;
  }

  /**
   * Compare metrics across regions
   */
  async compare(params: {
    regions: string[];
    metrics?: string[];
  }): Promise<ComparisonResult> {
    const response = await this.client.get<SingleResponse<ComparisonResult>>(
      '/v1/metrics/compare',
      {
        regions: params.regions.join(','),
        metrics: params.metrics?.join(','),
      }
    );
    return response.data;
  }

  /**
   * Get TBL score for a specific region
   */
  async getRegionTBL(
    regionId: string,
    params: { period?: string } = {}
  ): Promise<TBLMetrics> {
    return this.getTBL({ ...params, regionId });
  }
}
