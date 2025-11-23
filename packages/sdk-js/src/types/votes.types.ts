/**
 * Vote-related types
 */

import { ListParams } from './common.types';

export interface VoteSession {
  id: string;
  billId: string;
  status: VoteSessionStatus;
  startedAt: string;
  endsAt: string;
  tally: VoteTally;
  participationRate: number;
  quorumMet: boolean;
}

export type VoteSessionStatus = 'scheduled' | 'active' | 'ended';

export interface VoteTally {
  yes: number;
  no: number;
  abstain: number;
}

export interface VoteSessionListParams extends ListParams {
  status?: VoteSessionStatus;
  billId?: string;
}

export interface DetailedTally {
  sessionId: string;
  billId: string;
  overall: VoteTally;
  participationRate: number;
  quorumMet: boolean;
  totalEligibleVoters: number;
  totalVotesCast: number;
  byRegion: Array<{
    regionId: string;
    regionName: string;
    tally: VoteTally;
    participationRate: number;
  }>;
  byDemographic?: {
    ageGroups: Array<{
      group: string;
      yes: number;
      no: number;
      abstain: number;
    }>;
  };
  timeline: Array<{
    timestamp: string;
    cumulativeVotes: number;
  }>;
}

export interface VotingStatistics {
  period: string;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageParticipationRate: number;
  averageVotesPerSession: number;
  passRate: number;
  topCategories: Array<{
    category: string;
    sessions: number;
    avgParticipation: number;
  }>;
}
