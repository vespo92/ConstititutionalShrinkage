/**
 * Type definitions for Citizen Portal
 *
 * These types extend and complement the types from the core packages
 * for use within the Citizen Portal application.
 */

// Re-export types from packages for convenience
export {
  VerificationLevel,
  type Vote,
  type VoteChoice,
  type VotingSession,
  type VotingStatus,
  type QuorumRules,
  type VoteResults,
  type Delegation,
  type DelegationScope,
  type Citizen,
  type VotingStats,
} from '@constitutional-shrinkage/voting-system';

// ============================================
// UI-SPECIFIC TYPES
// ============================================

/**
 * Extended bill type with UI-specific fields
 */
export interface BillWithUI {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: 'draft' | 'voting' | 'passed' | 'failed' | 'vetoed';
  votingEnds?: Date;
  participation: number;
  yourVote: 'for' | 'against' | 'abstain' | null;
  forPercentage: number;
  quorumMet: boolean;
  isUrgent?: boolean;
  delegateVoted?: boolean;
  delegateName?: string;
}

/**
 * Delegation with UI display info
 */
export interface DelegationWithUI {
  id: string;
  type: 'incoming' | 'outgoing';
  person: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  category: string;
  createdAt: Date;
  votesUsed: number;
  active: boolean;
}

/**
 * Notification for UI display
 */
export interface NotificationUI {
  id: string;
  type: 'vote' | 'delegation' | 'bill' | 'alert' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Region with UI display info
 */
export interface RegionUI {
  id: string;
  name: string;
  type: string;
  population: number | null;
  activeCitizens: number;
  activeBills: number;
  participationRate: number;
  isJoined: boolean;
  description: string;
}

/**
 * User profile with UI display info
 */
export interface UserProfileUI {
  id: string;
  name: string;
  preferredName?: string;
  avatar: string;
  email: string;
  phone?: string;
  location: string;
  memberSince: Date;
  reputation: number;
  verificationLevel: 'UNVERIFIED' | 'BASIC' | 'BIOMETRIC' | 'FULL';
  votingPower: number;
  effectiveVotingPower: number; // Including delegations
  stats: {
    votesCast: number;
    delegators: number;
    delegating: number;
    participationRate: number;
  };
  expertise: ExpertiseAreaUI[];
  achievements: AchievementUI[];
}

/**
 * Expertise area for profile display
 */
export interface ExpertiseAreaUI {
  category: string;
  level: 'Novice' | 'Intermediate' | 'Expert' | 'Authority';
  score: number;
  verified: boolean;
  credentials?: string[];
}

/**
 * Achievement for profile display
 */
export interface AchievementUI {
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

/**
 * Vote record for history display
 */
export interface VoteRecordUI {
  id: string;
  billId: string;
  billTitle: string;
  category: string;
  choice: 'for' | 'against' | 'abstain';
  timestamp: Date;
  delegatedBy?: string;
  delegateVoted?: boolean;
  delegateName?: string;
  billPassed: boolean | null;
  forPercentage: number;
  participation: number;
  cryptoProof: string;
  weight: number;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface VoteHistoryFilters {
  choice?: 'for' | 'against' | 'abstain' | 'delegated';
  category?: string;
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

export interface BillSearchFilters {
  status?: string;
  category?: string;
  region?: string;
  searchQuery?: string;
}

export interface DelegateSearchFilters {
  category?: string;
  minReputation?: number;
  searchQuery?: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateDelegationForm {
  delegateId: string;
  scope: 'all' | 'category' | 'single_bill';
  category?: string;
  billId?: string;
  expiresAt?: Date;
}

export interface VoteCastForm {
  billId: string;
  choice: 'for' | 'against' | 'abstain';
  comment?: string;
}

export interface ProfileUpdateForm {
  preferredName?: string;
  bio?: string;
  location?: string;
  privacySettings?: {
    showVotes: boolean;
    showDelegations: boolean;
    showReputation: boolean;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
