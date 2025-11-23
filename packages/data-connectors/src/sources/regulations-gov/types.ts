import { z } from 'zod';

export const DocketSchema = z.object({
  id: z.string(),
  type: z.literal('dockets'),
  attributes: z.object({
    agencyId: z.string(),
    docketType: z.enum(['Rulemaking', 'Nonrulemaking']),
    title: z.string(),
    objectId: z.string().optional(),
    effectiveDate: z.string().optional(),
    field1: z.string().optional(),
    field2: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    modifyDate: z.string(),
    displayProperties: z.unknown().optional(),
  }),
});

export type Docket = z.infer<typeof DocketSchema>;

export const DocumentSchema = z.object({
  id: z.string(),
  type: z.literal('documents'),
  attributes: z.object({
    agencyId: z.string(),
    commentEndDate: z.string().optional(),
    commentStartDate: z.string().optional(),
    docketId: z.string(),
    documentType: z.enum([
      'Rule',
      'Proposed Rule',
      'Notice',
      'Supporting & Related Material',
      'Public Submission',
      'Other',
    ]),
    frDocNum: z.string().optional(),
    objectId: z.string(),
    postedDate: z.string(),
    receiveDate: z.string().optional(),
    title: z.string(),
    withdrawn: z.boolean().optional(),
    openForComment: z.boolean().optional(),
    subtype: z.string().optional(),
    lastModifiedDate: z.string().optional(),
  }),
});

export type Document = z.infer<typeof DocumentSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  type: z.literal('comments'),
  attributes: z.object({
    agencyId: z.string(),
    category: z.string().optional(),
    comment: z.string().optional(),
    documentType: z.literal('Public Submission'),
    docketId: z.string(),
    duplicateComments: z.number().optional(),
    objectId: z.string(),
    postedDate: z.string(),
    receiveDate: z.string(),
    title: z.string(),
    withdrawn: z.boolean().optional(),
    organization: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    stateProvinceRegion: z.string().optional(),
    country: z.string().optional(),
  }),
});

export type Comment = z.infer<typeof CommentSchema>;

export interface RegulationsSearchParams {
  filter?: {
    searchTerm?: string;
    documentType?: string;
    postedDate?: string;
    lastModifiedDate?: string;
    agencyId?: string;
    docketId?: string;
    commentEndDate?: string;
  };
  sort?: string;
  page?: {
    size?: number;
    number?: number;
  };
}
