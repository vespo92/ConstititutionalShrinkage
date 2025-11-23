/**
 * Search Schemas
 *
 * Zod schemas for request/response validation.
 */

import { z } from 'zod';

// Searchable type enum
const searchableTypeSchema = z.enum(['bills', 'people', 'organizations', 'regions', 'all']);

// Global search query schema
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: searchableTypeSchema.default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filters: z.string().optional(), // JSON string of filters
  sort: z.string().default('_score'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// Bill search query schema
export const billSearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  region: z.string().uuid().optional(),
  level: z.enum(['FEDERAL', 'STATE', 'LOCAL']).optional(),
  sponsor: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['_score', 'createdAt', 'votingEndsAt', 'participation']).default('_score'),
});

export type BillSearchQueryInput = z.infer<typeof billSearchQuerySchema>;

// People search query schema
export const peopleSearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  region: z.string().uuid().optional(),
  expertise: z.string().optional(),
  verificationLevel: z.string().optional(),
  role: z.string().optional(),
  minReputation: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['_score', 'reputation', 'delegationsReceived', 'lastActiveAt']).default('_score'),
});

export type PeopleSearchQueryInput = z.infer<typeof peopleSearchQuerySchema>;

// Organization search query schema
export const organizationSearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  type: z.string().optional(),
  industry: z.string().optional(),
  region: z.string().uuid().optional(),
  minTransparencyScore: z.coerce.number().min(0).max(100).optional(),
  verificationStatus: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['_score', 'transparencyScore', 'lobbyingActivity', 'createdAt']).default('_score'),
});

export type OrganizationSearchQueryInput = z.infer<typeof organizationSearchQuerySchema>;

// Suggestions query schema
export const suggestQuerySchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters'),
  type: searchableTypeSchema.default('all'),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SuggestQueryInput = z.infer<typeof suggestQuerySchema>;

// Index document schema (for manual indexing)
export const indexBillSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    title: z.string(),
    content: z.string(),
    status: z.string(),
    level: z.string(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    regionId: z.string().optional(),
    regionName: z.string().optional(),
    sponsorId: z.string().optional(),
    sponsorName: z.string().optional(),
    coSponsors: z.array(z.string()).optional(),
    version: z.string().optional(),
    sunsetDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
    votesFor: z.number().optional(),
    votesAgainst: z.number().optional(),
    participation: z.number().optional(),
    impactPeople: z.number().optional(),
    impactPlanet: z.number().optional(),
    impactProfit: z.number().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type IndexBillInput = z.infer<typeof indexBillSchema>;

// Index person schema
export const indexPersonSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    legalName: z.string(),
    preferredName: z.string().optional(),
    primaryRegionId: z.string().optional(),
    regionIds: z.array(z.string()).optional(),
    regionNames: z.array(z.string()).optional(),
    verificationLevel: z.string().optional(),
    status: z.string().optional(),
    votingPower: z.number().optional(),
    reputation: z.number().optional(),
    expertiseAreas: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
    billsSponsored: z.number().optional(),
    votesCount: z.number().optional(),
    delegationsReceived: z.number().optional(),
    createdAt: z.string(),
    lastActiveAt: z.string().optional(),
  }),
});

export type IndexPersonInput = z.infer<typeof indexPersonSchema>;

// Reindex trigger schema (admin only)
export const reindexSchema = z.object({
  type: z.enum(['bills', 'people', 'organizations', 'all']).default('all'),
  fullSync: z.boolean().default(false),
  since: z.string().datetime().optional(),
});

export type ReindexInput = z.infer<typeof reindexSchema>;

// Delete from index schema
export const deleteIndexSchema = z.object({
  type: z.enum(['bills', 'people', 'organizations']),
  id: z.string().uuid(),
});

export type DeleteIndexInput = z.infer<typeof deleteIndexSchema>;
