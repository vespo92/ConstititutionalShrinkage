/**
 * Common Zod Schemas
 *
 * Shared validation schemas used across the API.
 */

import { z } from 'zod';

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const paginatedQuerySchema = paginationSchema.merge(sortSchema);

// Common ID types
export const uuidSchema = z.string().uuid();
export const idParamSchema = z.object({ id: uuidSchema });

// Date/time
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Response wrappers
export const paginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  code: z.number(),
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string().optional(),
});

// Enums
export const legislationLevelSchema = z.enum(['IMMUTABLE', 'FEDERAL', 'REGIONAL', 'LOCAL']);

export const billStatusSchema = z.enum([
  'DRAFT',
  'IN_COMMITTEE',
  'SCHEDULED',
  'VOTING',
  'PASSED',
  'REJECTED',
  'ACTIVE',
  'EXPIRED',
]);

export const voteChoiceSchema = z.enum(['for', 'against', 'abstain']);

export const delegationScopeSchema = z.enum(['ALL', 'CATEGORY', 'SINGLE_BILL']);

export const verificationLevelSchema = z.enum([
  'NONE',
  'EMAIL_VERIFIED',
  'PHONE_VERIFIED',
  'DOCUMENT_VERIFIED',
  'FULL_KYC',
  'GOVERNMENT_VERIFIED',
]);

export const organizationTypeSchema = z.enum([
  'CORPORATION',
  'NON_PROFIT',
  'GOVERNMENT',
  'UNION',
  'PAC',
  'OTHER',
]);

export const regionLevelSchema = z.enum(['FEDERAL', 'REGIONAL', 'LOCAL']);

// TBL Scores
export const tblScoreSchema = z.object({
  people: z.number().min(0).max(100),
  planet: z.number().min(0).max(100),
  profit: z.number().min(0).max(100),
  composite: z.number().min(0).max(100),
});

// Type exports
export type Pagination = z.infer<typeof paginationSchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
export type LegislationLevel = z.infer<typeof legislationLevelSchema>;
export type BillStatus = z.infer<typeof billStatusSchema>;
export type VoteChoice = z.infer<typeof voteChoiceSchema>;
export type DelegationScope = z.infer<typeof delegationScopeSchema>;
export type VerificationLevel = z.infer<typeof verificationLevelSchema>;
export type OrganizationType = z.infer<typeof organizationTypeSchema>;
export type RegionLevel = z.infer<typeof regionLevelSchema>;
export type TBLScore = z.infer<typeof tblScoreSchema>;
