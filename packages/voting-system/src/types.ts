/**
 * Voting System Types
 * Types for secure, transparent voting with liquid democracy
 */

export enum VoteChoice {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain',
}

export interface Vote {
  voteId: string;
  citizenId: string;
  billId: string;
  choice: VoteChoice;
  weight: number;
  timestamp: Date;
  cryptographicProof: string;
  delegationChain?: string[];
  isPublic: boolean;
}

export interface VotingSession {
  billId: string;
  startDate: Date;
  endDate: Date;
  quorum: QuorumRules;
  currentResults: VoteResults;
  participationRate: number;
  status: VotingStatus;
}

export enum VotingStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CLOSED = 'closed',
  FINALIZED = 'finalized',
}

export interface QuorumRules {
  minimumParticipation: number; // e.g., 0.20 for 20%
  approvalThreshold: number; // e.g., 0.60 for 60%
  urgencyModifier?: number; // Faster for emergencies
  impactScaling?: number; // Higher threshold for bigger changes
}

export interface VoteResults {
  for: number;
  against: number;
  abstain: number;
  total: number;
  weightedFor: number;
  weightedAgainst: number;
  weightedAbstain: number;
  quorumMet: boolean;
  passed: boolean;
}

export interface Delegation {
  delegatorId: string;
  delegateId: string;
  scope: DelegationScope;
  category?: string;
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}

export enum DelegationScope {
  ALL = 'all',
  CATEGORY = 'category',
  SINGLE_BILL = 'single_bill',
}

export interface Citizen {
  id: string;
  publicKey: string;
  regions: string[];
  votingPower: number;
  delegations: Delegation[];
  reputation: number;
  verificationLevel: VerificationLevel;
}

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  BASIC = 'basic',
  BIOMETRIC = 'biometric',
  FULL = 'full',
}

export interface VotingStats {
  totalEligible: number;
  totalVoted: number;
  participationRate: number;
  averageTimeToVote: number;
  delegationRate: number;
}
