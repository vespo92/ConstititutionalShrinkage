/**
 * Vote Zod Schemas
 *
 * Validation schemas for voting operations.
 */

import { z } from 'zod';
import { paginatedQuerySchema, uuidSchema, voteChoiceSchema, billStatusSchema } from './common.schema.js';

// Query schemas
export const voteHistoryQuerySchema = paginatedQuerySchema.extend({
  choice: voteChoiceSchema.optional(),
  billStatus: billStatusSchema.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Cast vote schema
export const castVoteSchema = z.object({
  billId: uuidSchema,
  choice: voteChoiceSchema,
  isPublic: z.boolean().default(false),
  signature: z.string().optional(), // Digital signature for verification
});

// Response schemas
export const voteReceiptSchema = z.object({
  voteId: uuidSchema,
  billId: uuidSchema,
  choice: voteChoiceSchema,
  weight: z.number(),
  receipt: z.string(), // Cryptographic proof
  timestamp: z.string().datetime(),
});

export const voteDetailSchema = z.object({
  voteId: uuidSchema,
  billId: uuidSchema,
  choice: voteChoiceSchema,
  weight: z.number(),
  timestamp: z.string().datetime(),
  isPublic: z.boolean(),
  cryptographicProof: z.string(),
  verified: z.boolean(),
  isDelegated: z.boolean().optional(),
  delegatorId: uuidSchema.optional(),
});

export const voteVerificationSchema = z.object({
  proof: z.string(),
  valid: z.boolean(),
  billId: uuidSchema,
  timestamp: z.string().datetime(),
  // Note: Choice and voter identity remain private unless vote was public
});

export const voteHistoryResponseSchema = z.object({
  userId: uuidSchema,
  votes: z.array(z.object({
    voteId: uuidSchema,
    billId: uuidSchema,
    billTitle: z.string(),
    choice: voteChoiceSchema,
    weight: z.number(),
    timestamp: z.string().datetime(),
    billOutcome: z.enum(['passed', 'rejected', 'pending']).optional(),
  })),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  summary: z.object({
    totalVotes: z.number(),
    forVotes: z.number(),
    againstVotes: z.number(),
    abstainVotes: z.number(),
  }),
});

export const voteResultsSchema = z.object({
  billId: uuidSchema,
  results: z.object({
    for: z.number(),
    against: z.number(),
    abstain: z.number(),
    total: z.number(),
    weightedFor: z.number(),
    weightedAgainst: z.number(),
    quorumMet: z.boolean(),
    passed: z.boolean(),
  }),
  breakdown: z.object({
    byRegion: z.record(z.object({
      for: z.number(),
      against: z.number(),
      abstain: z.number(),
    })).optional(),
    byVerificationLevel: z.record(z.object({
      for: z.number(),
      against: z.number(),
      abstain: z.number(),
    })).optional(),
  }).optional(),
});

export const votingSessionSchema = z.object({
  sessionId: uuidSchema,
  billId: uuidSchema,
  status: z.enum(['SCHEDULED', 'ACTIVE', 'CLOSED', 'TALLYING', 'FINALIZED']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  quorumThreshold: z.number(),
  currentParticipation: z.number(),
  quorumMet: z.boolean(),
});

export const globalVoteStatsSchema = z.object({
  totalVotes: z.number(),
  totalVoters: z.number(),
  averageParticipation: z.number(),
  delegationRate: z.number(),
  activeSessions: z.number(),
  recentActivity: z.array(z.object({
    billId: uuidSchema,
    billTitle: z.string(),
    action: z.string(),
    timestamp: z.string().datetime(),
  })),
});

export const delegatedVotesSchema = z.object({
  userId: uuidSchema,
  delegatedVotes: z.array(z.object({
    voteId: uuidSchema,
    billId: uuidSchema,
    billTitle: z.string(),
    delegateId: uuidSchema,
    delegateName: z.string(),
    choice: voteChoiceSchema,
    timestamp: z.string().datetime(),
    canOverride: z.boolean(),
  })),
});

export const voteOverrideSchema = z.object({
  newChoice: voteChoiceSchema,
});

export const voteOverrideResponseSchema = z.object({
  overriddenVoteId: uuidSchema,
  newVoteId: uuidSchema,
  message: z.string(),
});

// Type exports
export type VoteHistoryQuery = z.infer<typeof voteHistoryQuerySchema>;
export type CastVote = z.infer<typeof castVoteSchema>;
export type VoteReceipt = z.infer<typeof voteReceiptSchema>;
export type VoteResults = z.infer<typeof voteResultsSchema>;
export type VotingSession = z.infer<typeof votingSessionSchema>;
