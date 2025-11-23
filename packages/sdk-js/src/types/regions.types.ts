/**
 * Region-related types
 */

import { ListParams } from './common.types';

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  parentId?: string;
  population: number;
  activeCitizens: number;
  metrics: RegionMetrics;
  children?: Array<{
    id: string;
    name: string;
    type: RegionType;
  }>;
}

export type RegionType = 'city' | 'county' | 'state' | 'federal';

export interface RegionMetrics {
  tblScore: number;
  participationRate: number;
  billsActive: number;
  billsPassed: number;
}

export interface RegionListParams extends ListParams {
  type?: RegionType;
  parentId?: string;
}

export interface DetailedRegionMetrics {
  regionId: string;
  regionName: string;
  period: string;
  tbl: {
    overall: number;
    people: number;
    planet: number;
    profit: number;
    trend: string;
  };
  participation: {
    rate: number;
    activeUsers: number;
    totalEligible: number;
    trend: string;
  };
  legislation: {
    billsActive: number;
    billsPassed: number;
    billsRejected: number;
    averageTimeToPass: string;
  };
  governance: {
    delegationRate: number;
    averageCommentsPerBill: number;
    citizenProposalRate: number;
  };
  historical: Array<{
    date: string;
    tblScore: number;
    participationRate: number;
  }>;
}

export interface RegionMetricsParams {
  metrics?: string[];
  period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year';
}

export interface Leaderboard {
  parentRegion: {
    id: string;
    name: string;
  };
  metric: string;
  leaderboard: Array<{
    rank: number;
    regionId: string;
    regionName: string;
    score: number;
    change: number;
  }>;
}
