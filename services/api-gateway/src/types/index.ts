/**
 * TypeScript Type Definitions
 *
 * Core types used across the API Gateway.
 */

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

// Re-export schema types
export * from '../schemas/common.schema.js';
export * from '../schemas/bill.schema.js';
export * from '../schemas/vote.schema.js';
export * from '../schemas/delegation.schema.js';

// Authentication types
export interface AuthenticatedUser {
  id: string;
  email: string;
  verificationLevel: VerificationLevel;
  votingPower: number;
  regions: string[];
  roles: string[];
  expertise?: string[];
}

export type VerificationLevel =
  | 'NONE'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'DOCUMENT_VERIFIED'
  | 'FULL_KYC'
  | 'GOVERNMENT_VERIFIED';

// Note: Fastify types are extended in middleware/auth.ts
// This file only exports types, not module augmentations to avoid conflicts

// API Request/Response types (standalone, doesn't extend FastifyRequest)
export interface APIRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> {
  body: TBody;
  query: TQuery;
  params: TParams;
  user?: AuthenticatedUser;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    type: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Entity types
export interface Bill {
  id: string;
  title: string;
  content: string;
  level: LegislationLevel;
  status: BillStatus;
  regionId?: string;
  categoryId: string;
  sponsorId: string;
  version: number;
  sunsetDate: string;
  createdAt: string;
  updatedAt: string;
}

export type LegislationLevel = 'IMMUTABLE' | 'FEDERAL' | 'REGIONAL' | 'LOCAL';

export type BillStatus =
  | 'DRAFT'
  | 'IN_COMMITTEE'
  | 'SCHEDULED'
  | 'VOTING'
  | 'PASSED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'EXPIRED';

export interface Vote {
  id: string;
  billId: string;
  userId: string;
  choice: VoteChoice;
  weight: number;
  isPublic: boolean;
  cryptographicProof: string;
  timestamp: string;
  isDelegated?: boolean;
  delegatorId?: string;
}

export type VoteChoice = 'for' | 'against' | 'abstain';

export interface Delegation {
  id: string;
  delegatorId: string;
  delegateId: string;
  scope: DelegationScope;
  category?: string;
  billId?: string;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type DelegationScope = 'ALL' | 'CATEGORY' | 'SINGLE_BILL';

export interface Region {
  id: string;
  name: string;
  level: RegionLevel;
  parentRegionId?: string;
  population?: number;
  activeVoters?: number;
}

export type RegionLevel = 'FEDERAL' | 'REGIONAL' | 'LOCAL';

export interface Person {
  id: string;
  displayName: string;
  verificationLevel: VerificationLevel;
  role: PersonRole;
  primaryRegionId?: string;
  reputation: number;
  expertiseAreas: string[];
  memberSince: string;
}

export type PersonRole = 'CITIZEN' | 'REPRESENTATIVE' | 'OFFICIAL' | 'EXPERT';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  industry?: string;
  transparencyScore: number;
  registrationDate: string;
}

export type OrganizationType =
  | 'CORPORATION'
  | 'NON_PROFIT'
  | 'GOVERNMENT'
  | 'UNION'
  | 'PAC'
  | 'OTHER';

// Triple Bottom Line types
export interface TBLScore {
  people: number;
  planet: number;
  profit: number;
  composite: number;
}

export interface TBLBreakdown {
  people: {
    healthcareAccess: number;
    educationQuality: number;
    socialMobility: number;
    civilRights: number;
  };
  planet: {
    carbonReduction: number;
    biodiversity: number;
    resourceEfficiency: number;
    pollutionControl: number;
  };
  profit: {
    economicGrowth: number;
    jobCreation: number;
    fiscalResponsibility: number;
    marketStability: number;
  };
}

// Voting session types
export interface VotingSession {
  id: string;
  billId: string;
  status: VotingSessionStatus;
  startDate: string;
  endDate: string;
  quorumThreshold: number;
  currentParticipation: number;
}

export type VotingSessionStatus =
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'CLOSED'
  | 'TALLYING'
  | 'FINALIZED';

// Route handler types
export type RouteHandler<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> = (
  request: APIRequest<TBody, TQuery, TParams>,
  reply: FastifyReply
) => Promise<unknown>;

// Service types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Hook types
export type PreHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>;

export type ErrorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => void;
