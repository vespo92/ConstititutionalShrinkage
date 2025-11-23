import { z } from 'zod';

// Time series data point
export const TimeSeriesPointSchema = z.object({
  timestamp: z.string().or(z.date()),
  value: z.number(),
});
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;

// Voting analytics types
export const VotingOverviewSchema = z.object({
  totalVotes: z.number(),
  activeSessions: z.number(),
  participationRate: z.number(),
  avgTimeToVote: z.number(),
});
export type VotingOverview = z.infer<typeof VotingOverviewSchema>;

export const VotingSessionSchema = z.object({
  id: z.string(),
  billId: z.string(),
  billTitle: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  totalVotes: z.number(),
  yesVotes: z.number(),
  noVotes: z.number(),
  abstainVotes: z.number(),
  participationRate: z.number(),
  status: z.enum(['active', 'completed', 'cancelled']),
});
export type VotingSession = z.infer<typeof VotingSessionSchema>;

// Legislation analytics types
export const LegislationOverviewSchema = z.object({
  totalBills: z.number(),
  passageRate: z.number(),
  avgDaysToPass: z.number(),
  pendingReview: z.number(),
});
export type LegislationOverview = z.infer<typeof LegislationOverviewSchema>;

export const BillLifecycleSchema = z.object({
  draft: z.number(),
  review: z.number(),
  voting: z.number(),
  passed: z.number(),
  rejected: z.number(),
  sunset: z.number(),
});
export type BillLifecycle = z.infer<typeof BillLifecycleSchema>;

// Regional analytics types
export const RegionOverviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  population: z.number(),
  activePods: z.number(),
  participationRate: z.number(),
  tblScore: z.number(),
});
export type RegionOverview = z.infer<typeof RegionOverviewSchema>;

// Triple Bottom Line types
export const TBLScoreSchema = z.object({
  people: z.number(),
  planet: z.number(),
  profit: z.number(),
  overall: z.number(),
});
export type TBLScore = z.infer<typeof TBLScoreSchema>;

export const TBLMetricsSchema = z.object({
  people: z.object({
    citizenSatisfaction: z.number(),
    equalityIndex: z.number(),
    participationRate: z.number(),
    accessScore: z.number(),
  }),
  planet: z.object({
    carbonReduction: z.number(),
    localSupplyChainPct: z.number(),
    renewableEnergy: z.number(),
    wasteReduction: z.number(),
  }),
  profit: z.object({
    costSavings: z.number(),
    economicGrowth: z.number(),
    jobsCreated: z.number(),
    smallBusinessGrowth: z.number(),
  }),
});
export type TBLMetrics = z.infer<typeof TBLMetricsSchema>;

// Engagement analytics types
export const EngagementOverviewSchema = z.object({
  activeCitizens: z.number(),
  dailyActiveUsers: z.number(),
  activeDelegations: z.number(),
  avgSessionTime: z.number(),
});
export type EngagementOverview = z.infer<typeof EngagementOverviewSchema>;

// Report types
export const ReportConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['summary', 'regional', 'tbl', 'engagement', 'policy']),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  filters: z.record(z.any()).optional(),
  schedule: z.string().optional(),
});
export type ReportConfig = z.infer<typeof ReportConfigSchema>;

export const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  createdAt: z.string(),
  status: z.enum(['ready', 'generating', 'scheduled', 'failed']),
  data: z.any().optional(),
});
export type Report = z.infer<typeof ReportSchema>;

// Real-time stream types
export interface RealTimeVotingData {
  sessionId: string;
  currentTally: {
    yes: number;
    no: number;
    abstain: number;
  };
  participationRate: number;
  recentVotes: number;
}

export interface RealTimeSystemHealth {
  apiLatency: number;
  activeUsers: number;
  queueDepth: number;
  errorRate: number;
}

export interface RealTimeEngagement {
  activeUsers: number;
  billsViewed: number;
  searchQueries: number;
}
