import { z } from 'zod';

export const GovInfoPackageSchema = z.object({
  packageId: z.string(),
  title: z.string(),
  collectionCode: z.string(),
  collectionName: z.string().optional(),
  dateIssued: z.string(),
  lastModified: z.string().optional(),
  category: z.string().optional(),
  docClass: z.string().optional(),
  congress: z.string().optional(),
  session: z.string().optional(),
  governmentAuthor1: z.string().optional(),
  governmentAuthor2: z.string().optional(),
  publisher: z.string().optional(),
  branch: z.string().optional(),
  suDocClass: z.string().optional(),
  pages: z.number().optional(),
  download: z.object({
    pdfLink: z.string().url().optional(),
    xmlLink: z.string().url().optional(),
    htmlLink: z.string().url().optional(),
    txtLink: z.string().url().optional(),
  }).optional(),
});

export type GovInfoPackage = z.infer<typeof GovInfoPackageSchema>;

export const GovInfoCollectionSchema = z.object({
  collectionCode: z.string(),
  collectionName: z.string(),
  packageCount: z.number(),
  granuleCount: z.number().optional(),
});

export type GovInfoCollection = z.infer<typeof GovInfoCollectionSchema>;

export const FederalRegisterDocSchema = z.object({
  documentNumber: z.string(),
  title: z.string(),
  type: z.enum(['rule', 'proposed_rule', 'notice', 'presidential_document']),
  abstract: z.string().optional(),
  citation: z.string().optional(),
  publicationDate: z.string(),
  effectiveDate: z.string().optional(),
  agencies: z.array(z.object({
    name: z.string(),
    id: z.number().optional(),
  })).optional(),
  cfr: z.object({
    title: z.number(),
    part: z.string(),
  }).optional(),
  comments: z.object({
    open: z.boolean(),
    dueDate: z.string().optional(),
  }).optional(),
  htmlUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
});

export type FederalRegisterDoc = z.infer<typeof FederalRegisterDocSchema>;

export interface GovInfoSearchParams {
  collection?: string;
  congress?: number;
  docClass?: string;
  publishDateStart?: string;
  publishDateEnd?: string;
  pageSize?: number;
  offsetMark?: string;
}
