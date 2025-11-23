/**
 * Bill Zod Schemas
 *
 * Validation schemas for bill-related operations.
 */

import { z } from 'zod';
import {
  paginatedQuerySchema,
  uuidSchema,
  legislationLevelSchema,
  billStatusSchema,
  tblScoreSchema,
} from './common.schema.js';

// Query schemas
export const billListQuerySchema = paginatedQuerySchema.extend({
  status: billStatusSchema.optional(),
  category: z.string().optional(),
  region: uuidSchema.optional(),
  sponsor: uuidSchema.optional(),
  search: z.string().max(200).optional(),
  level: legislationLevelSchema.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title', 'votesCount']).default('createdAt'),
});

// Create/Update schemas
export const createBillSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  level: legislationLevelSchema,
  regionId: uuidSchema.optional(),
  categoryId: uuidSchema,
  sunsetYears: z.number().int().min(1).max(20).default(5),
});

export const updateBillSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).optional(),
});

export const forkBillSchema = z.object({
  newTitle: z.string().min(5).max(200).optional(),
  regionId: uuidSchema.optional(),
});

export const submitBillSchema = z.object({
  votingDuration: z.number().int().min(1).max(30).default(7), // days
  quorumThreshold: z.number().min(0).max(1).default(0.5),
});

// Response schemas
export const billResponseSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  content: z.string(),
  level: legislationLevelSchema,
  status: billStatusSchema,
  regionId: uuidSchema.optional(),
  categoryId: uuidSchema,
  sponsorId: uuidSchema,
  version: z.number(),
  sunsetDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const billDetailResponseSchema = billResponseSchema.extend({
  sponsor: z.object({
    id: uuidSchema,
    name: z.string(),
  }),
  region: z.object({
    id: uuidSchema,
    name: z.string(),
    level: z.string(),
  }).optional(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }),
  coSponsors: z.array(z.object({
    id: uuidSchema,
    name: z.string(),
  })),
  voteSession: z.object({
    id: uuidSchema,
    status: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).optional(),
  stats: z.object({
    views: z.number(),
    comments: z.number(),
    amendments: z.number(),
  }),
});

export const billHistoryResponseSchema = z.object({
  billId: uuidSchema,
  versions: z.array(z.object({
    version: z.number(),
    title: z.string(),
    content: z.string(),
    author: z.object({
      id: uuidSchema,
      name: z.string(),
    }),
    message: z.string().optional(),
    createdAt: z.string().datetime(),
  })),
});

export const billDiffResponseSchema = z.object({
  billId: uuidSchema,
  fromVersion: z.string(),
  toVersion: z.string(),
  diff: z.object({
    additions: z.array(z.object({
      line: z.number(),
      content: z.string(),
    })),
    deletions: z.array(z.object({
      line: z.number(),
      content: z.string(),
    })),
    modifications: z.array(z.object({
      line: z.number(),
      oldContent: z.string(),
      newContent: z.string(),
    })),
  }),
});

export const constitutionalCheckResponseSchema = z.object({
  billId: uuidSchema,
  valid: z.boolean(),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    section: z.string().optional(),
  })),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    section: z.string().optional(),
  })),
  rightsProtected: z.array(z.string()),
});

export const billImpactResponseSchema = z.object({
  billId: uuidSchema,
  impact: z.object({
    people: z.number(),
    planet: z.number(),
    profit: z.number(),
    composite: z.number(),
    tradeoffs: z.array(z.object({
      category: z.string(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
    })),
  }),
});

// Type exports
export type BillListQuery = z.infer<typeof billListQuerySchema>;
export type CreateBill = z.infer<typeof createBillSchema>;
export type UpdateBill = z.infer<typeof updateBillSchema>;
export type BillResponse = z.infer<typeof billResponseSchema>;
export type BillDetailResponse = z.infer<typeof billDetailResponseSchema>;
