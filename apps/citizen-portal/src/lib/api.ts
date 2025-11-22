/**
 * API Client for Citizen Portal
 *
 * This module provides the API interface for communicating with the backend services.
 * It integrates with the voting-system and entity-registry packages.
 */

import type {
  Vote,
  VoteChoice,
  VotingSession,
  Delegation,
  DelegationScope,
  Citizen,
  VotingStats,
} from '@constitutional-shrinkage/voting-system';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// VOTING API
// ============================================

export const votingApi = {
  /**
   * Get active voting sessions for the current user
   */
  getActiveSessions: () =>
    apiFetch<VotingSession[]>('/voting/sessions/active'),

  /**
   * Get a specific voting session
   */
  getSession: (billId: string) =>
    apiFetch<VotingSession>(`/voting/sessions/${billId}`),

  /**
   * Cast a vote on a bill
   */
  castVote: (billId: string, choice: VoteChoice) =>
    apiFetch<Vote>('/voting/cast', {
      method: 'POST',
      body: JSON.stringify({ billId, choice }),
    }),

  /**
   * Get voting history for the current user
   */
  getVotingHistory: (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    choice?: VoteChoice;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.choice) searchParams.set('choice', params.choice);
    return apiFetch<Vote[]>(`/voting/history?${searchParams}`);
  },

  /**
   * Get voting statistics
   */
  getStats: () => apiFetch<VotingStats>('/voting/stats'),

  /**
   * Verify a vote using its cryptographic proof
   */
  verifyVote: (voteId: string, proof: string) =>
    apiFetch<{ valid: boolean; details: string }>('/voting/verify', {
      method: 'POST',
      body: JSON.stringify({ voteId, proof }),
    }),
};

// ============================================
// DELEGATION API
// ============================================

export const delegationApi = {
  /**
   * Get all delegations for the current user
   */
  getDelegations: () =>
    apiFetch<{ incoming: Delegation[]; outgoing: Delegation[] }>('/delegations'),

  /**
   * Create a new delegation
   */
  createDelegation: (params: {
    delegateId: string;
    scope: DelegationScope;
    category?: string;
    expiresAt?: Date;
  }) =>
    apiFetch<Delegation>('/delegations', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  /**
   * Revoke an existing delegation
   */
  revokeDelegation: (delegationId: string) =>
    apiFetch<{ success: boolean }>(`/delegations/${delegationId}`, {
      method: 'DELETE',
    }),

  /**
   * Get suggested delegates based on category and reputation
   */
  getSuggestedDelegates: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return apiFetch<Citizen[]>(`/delegations/suggested${params}`);
  },

  /**
   * Get delegation chain for a specific bill
   */
  getDelegationChain: (billId: string) =>
    apiFetch<{ chain: Citizen[]; finalVoter: Citizen }>(`/delegations/chain/${billId}`),
};

// ============================================
// CITIZEN API
// ============================================

export const citizenApi = {
  /**
   * Get current user profile
   */
  getProfile: () => apiFetch<Citizen>('/citizen/profile'),

  /**
   * Update user profile
   */
  updateProfile: (updates: Partial<Citizen>) =>
    apiFetch<Citizen>('/citizen/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  /**
   * Get a specific citizen by ID
   */
  getCitizen: (citizenId: string) =>
    apiFetch<Citizen>(`/citizen/${citizenId}`),

  /**
   * Search citizens by name or expertise
   */
  searchCitizens: (query: string, filters?: { expertise?: string; minReputation?: number }) => {
    const params = new URLSearchParams({ q: query });
    if (filters?.expertise) params.set('expertise', filters.expertise);
    if (filters?.minReputation) params.set('minReputation', filters.minReputation.toString());
    return apiFetch<Citizen[]>(`/citizen/search?${params}`);
  },

  /**
   * Get reputation breakdown
   */
  getReputationDetails: () =>
    apiFetch<{
      total: number;
      breakdown: {
        voting: number;
        delegation: number;
        participation: number;
        expertise: number;
      };
      history: { date: Date; score: number }[];
    }>('/citizen/reputation'),
};

// ============================================
// BILLS API
// ============================================

export interface Bill {
  id: string;
  title: string;
  summary: string;
  fullText: string;
  category: string;
  status: 'draft' | 'voting' | 'passed' | 'failed' | 'vetoed';
  sponsor: Citizen;
  cosponsors: Citizen[];
  introducedDate: Date;
  votingStartDate?: Date;
  votingEndDate?: Date;
  regions: string[];
  constitutionalCheck: {
    passed: boolean;
    issues: string[];
  };
}

export const billsApi = {
  /**
   * Get bills relevant to the current user
   */
  getRelevantBills: () => apiFetch<Bill[]>('/bills/relevant'),

  /**
   * Get a specific bill by ID
   */
  getBill: (billId: string) => apiFetch<Bill>(`/bills/${billId}`),

  /**
   * Search bills
   */
  searchBills: (query: string, filters?: {
    category?: string;
    status?: string;
    region?: string;
  }) => {
    const params = new URLSearchParams({ q: query });
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.region) params.set('region', filters.region);
    return apiFetch<Bill[]>(`/bills/search?${params}`);
  },

  /**
   * Get bill diff/changes
   */
  getBillDiff: (billId: string, version1: string, version2: string) =>
    apiFetch<{ diff: string; additions: number; deletions: number }>(
      `/bills/${billId}/diff?v1=${version1}&v2=${version2}`
    ),
};

// ============================================
// NOTIFICATIONS API
// ============================================

export interface Notification {
  id: string;
  type: 'vote' | 'delegation' | 'bill' | 'alert' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const notificationsApi = {
  /**
   * Get notifications for the current user
   */
  getNotifications: (params?: { limit?: number; unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');
    return apiFetch<Notification[]>(`/notifications?${searchParams}`);
  },

  /**
   * Mark notification as read
   */
  markAsRead: (notificationId: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${notificationId}/read`, {
      method: 'POST',
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    apiFetch<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  /**
   * Get unread count
   */
  getUnreadCount: () => apiFetch<{ count: number }>('/notifications/unread-count'),
};

// ============================================
// REGIONS API
// ============================================

export interface Region {
  id: string;
  name: string;
  type: 'Federal' | 'State' | 'Metropolitan Pod' | 'Interest Pod';
  population?: number;
  activeCitizens: number;
  activeBills: number;
  participationRate: number;
  description: string;
}

export const regionsApi = {
  /**
   * Get regions the user has joined
   */
  getJoinedRegions: () => apiFetch<Region[]>('/regions/joined'),

  /**
   * Get all available regions
   */
  getAllRegions: () => apiFetch<Region[]>('/regions'),

  /**
   * Join a region
   */
  joinRegion: (regionId: string) =>
    apiFetch<{ success: boolean }>(`/regions/${regionId}/join`, {
      method: 'POST',
    }),

  /**
   * Leave a region
   */
  leaveRegion: (regionId: string) =>
    apiFetch<{ success: boolean }>(`/regions/${regionId}/leave`, {
      method: 'POST',
    }),

  /**
   * Get region details
   */
  getRegion: (regionId: string) => apiFetch<Region>(`/regions/${regionId}`),

  /**
   * Get bills for a specific region
   */
  getRegionBills: (regionId: string) =>
    apiFetch<Bill[]>(`/regions/${regionId}/bills`),
};
