// Public API Types

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  tier: RateLimitTier;
  organizationId?: string;
  permissions: string[];
  rateLimit: RateLimitConfig;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export type RateLimitTier = 'free' | 'developer' | 'organization' | 'government';

export interface RateLimitConfig {
  requestsPerMinute: number | 'unlimited';
  requestsPerDay: number | 'unlimited';
  webhooks: number | 'unlimited';
}

export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitConfig> = {
  free: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    webhooks: 5,
  },
  developer: {
    requestsPerMinute: 300,
    requestsPerDay: 10000,
    webhooks: 20,
  },
  organization: {
    requestsPerMinute: 1000,
    requestsPerDay: 100000,
    webhooks: 100,
  },
  government: {
    requestsPerMinute: 'unlimited',
    requestsPerDay: 'unlimited',
    webhooks: 'unlimited',
  },
};

export interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
  'X-RateLimit-RetryAfter'?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Webhook types
export type WebhookEvent =
  | 'bill.created'
  | 'bill.updated'
  | 'bill.status_changed'
  | 'bill.submitted'
  | 'bill.passed'
  | 'bill.rejected'
  | 'bill.sunset'
  | 'vote.session_created'
  | 'vote.session_started'
  | 'vote.session_ended'
  | 'vote.threshold_reached'
  | 'region.pod_created'
  | 'region.metrics_updated'
  | 'system.maintenance'
  | 'system.rate_limit_warning';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  apiKeyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookPayload<T = unknown> {
  id: string;
  type: WebhookEvent;
  created: string;
  data: T;
  api_version: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  response?: {
    statusCode: number;
    body?: string;
  };
}

// Bill types for public API
export interface PublicBill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  region?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  votingEndsAt?: string;
  author: {
    id: string;
    displayName: string;
  };
  metrics?: {
    supporters: number;
    opposers: number;
    comments: number;
  };
}

// Vote types for public API
export interface PublicVoteSession {
  id: string;
  billId: string;
  status: 'scheduled' | 'active' | 'ended';
  startedAt: string;
  endsAt: string;
  tally: {
    yes: number;
    no: number;
    abstain: number;
  };
  participationRate: number;
  quorumMet: boolean;
}

// Region types for public API
export interface PublicRegion {
  id: string;
  name: string;
  type: 'city' | 'county' | 'state' | 'federal';
  parentId?: string;
  population: number;
  activeCitizens: number;
  metrics: {
    tblScore: number;
    participationRate: number;
    billsActive: number;
    billsPassed: number;
  };
}

// Usage tracking
export interface UsageRecord {
  apiKeyId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
}
