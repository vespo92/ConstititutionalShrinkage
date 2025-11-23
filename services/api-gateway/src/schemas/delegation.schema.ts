/**
 * Delegation Zod Schemas
 *
 * Validation schemas for liquid democracy delegation operations.
 */

import { z } from 'zod';
import { paginatedQuerySchema, uuidSchema, delegationScopeSchema } from './common.schema.js';

// Query schemas
export const delegationListQuerySchema = paginatedQuerySchema.extend({
  scope: delegationScopeSchema.optional(),
  active: z.coerce.boolean().optional(),
  direction: z.enum(['outgoing', 'incoming', 'both']).default('both'),
});

export const checkCircularQuerySchema = z.object({
  delegateId: uuidSchema,
  scope: delegationScopeSchema.optional(),
  category: z.string().optional(),
});

export const delegationSuggestionsQuerySchema = z.object({
  category: z.string().optional(),
  region: uuidSchema.optional(),
});

// Create/Update schemas
export const createDelegationSchema = z.object({
  delegateId: uuidSchema,
  scope: delegationScopeSchema,
  category: z.string().optional(),
  billId: uuidSchema.optional(),
  expiresAt: z.string().datetime().optional(),
}).refine((data) => {
  // Category required for CATEGORY scope
  if (data.scope === 'CATEGORY' && !data.category) {
    return false;
  }
  // Bill ID required for SINGLE_BILL scope
  if (data.scope === 'SINGLE_BILL' && !data.billId) {
    return false;
  }
  return true;
}, {
  message: 'Category is required for CATEGORY scope, Bill ID is required for SINGLE_BILL scope',
});

export const updateDelegationSchema = z.object({
  expiresAt: z.string().datetime().optional(),
});

// Response schemas
export const delegationResponseSchema = z.object({
  id: uuidSchema,
  delegatorId: uuidSchema,
  delegateId: uuidSchema,
  scope: delegationScopeSchema,
  category: z.string().optional(),
  billId: uuidSchema.optional(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export const delegationDetailSchema = delegationResponseSchema.extend({
  delegator: z.object({
    id: uuidSchema,
    name: z.string(),
  }),
  delegate: z.object({
    id: uuidSchema,
    name: z.string(),
    reputation: z.number(),
    expertise: z.array(z.string()),
  }),
  votesUsed: z.number(),
});

export const delegationListResponseSchema = z.object({
  userId: uuidSchema,
  outgoing: z.array(delegationDetailSchema),
  incoming: z.array(delegationDetailSchema),
  summary: z.object({
    totalOutgoing: z.number(),
    totalIncoming: z.number(),
    effectiveVotingPower: z.number(),
  }),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const delegationChainSchema = z.object({
  delegationId: uuidSchema,
  chain: z.array(z.object({
    step: z.number(),
    personId: uuidSchema,
    personName: z.string(),
    delegationType: delegationScopeSchema,
  })),
  totalWeight: z.number(),
  depth: z.number(),
});

export const checkCircularResponseSchema = z.object({
  delegatorId: uuidSchema,
  delegateId: uuidSchema,
  wouldCreateCycle: z.boolean(),
  potentialCycle: z.array(z.object({
    personId: uuidSchema,
    personName: z.string(),
  })),
});

export const delegationSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    personId: uuidSchema,
    personName: z.string(),
    reputation: z.number(),
    expertise: z.array(z.string()),
    alignmentScore: z.number(),
    currentDelegatorCount: z.number(),
    reason: z.string(),
  })),
  basedOn: z.object({
    category: z.string().optional(),
    region: uuidSchema.optional(),
    userExpertise: z.array(z.string()),
  }),
});

export const effectiveVotingPowerSchema = z.object({
  userId: uuidSchema,
  baseVotingPower: z.number(),
  delegatedPower: z.number(),
  totalPower: z.number(),
  breakdown: z.array(z.object({
    sourceId: uuidSchema,
    sourceName: z.string(),
    scope: delegationScopeSchema,
    power: z.number(),
    depth: z.number(),
  })),
});

export const incomingDelegationsSchema = z.object({
  userId: uuidSchema,
  delegations: z.array(delegationDetailSchema),
  totalWeight: z.number(),
  byCategory: z.record(z.number()),
});

export const outgoingDelegationsSchema = z.object({
  userId: uuidSchema,
  delegations: z.array(delegationDetailSchema),
  totalDelegated: z.number(),
  byCategory: z.record(z.number()),
});

// Type exports
export type DelegationListQuery = z.infer<typeof delegationListQuerySchema>;
export type CreateDelegation = z.infer<typeof createDelegationSchema>;
export type UpdateDelegation = z.infer<typeof updateDelegationSchema>;
export type DelegationResponse = z.infer<typeof delegationResponseSchema>;
export type DelegationChain = z.infer<typeof delegationChainSchema>;
export type EffectiveVotingPower = z.infer<typeof effectiveVotingPowerSchema>;
