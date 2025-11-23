/**
 * Bill Analysis Schemas
 * Zod schemas for validating AI analysis outputs
 */

import { z } from 'zod';

export const BillSummarySchema = z.object({
  summary: z.string().min(100).describe('2-3 paragraph plain language summary'),
  keyPoints: z.array(z.string()).min(1).max(10).describe('Key bullet points'),
  affectedGroups: z.array(z.string()).describe('Groups affected by this legislation'),
  tldr: z.string().max(200).describe('Single sentence summary'),
  readingLevel: z.string().optional().describe('Estimated reading level'),
  wordCount: z.number().optional().describe('Word count of original bill'),
});

export type BillSummary = z.infer<typeof BillSummarySchema>;

export const TermDefinitionSchema = z.object({
  term: z.string().describe('Legal term'),
  definition: z.string().describe('Plain language definition'),
  context: z.string().describe('How it applies in this context'),
});

export type TermDefinition = z.infer<typeof TermDefinitionSchema>;

export const SectionExplanationSchema = z.object({
  section: z.string().describe('The section being explained'),
  explanation: z.string().describe('Plain language explanation'),
  legalTerms: z.array(TermDefinitionSchema).describe('Legal terms defined'),
});

export type SectionExplanation = z.infer<typeof SectionExplanationSchema>;

export const ChangeExplanationSchema = z.object({
  changeType: z.enum(['addition', 'removal', 'modification']),
  originalText: z.string().optional(),
  newText: z.string().optional(),
  explanation: z.string().describe('What the change means'),
  impact: z.string().describe('Impact of this change'),
});

export type ChangeExplanation = z.infer<typeof ChangeExplanationSchema>;

export const DiffExplanationSchema = z.object({
  changes: z.array(ChangeExplanationSchema),
  overallImpact: z.string().describe('Overall impact of all changes'),
  significanceLevel: z.enum(['minor', 'moderate', 'major', 'critical']),
});

export type DiffExplanation = z.infer<typeof DiffExplanationSchema>;

export const CategoryClassificationSchema = z.object({
  category: z.string().describe('Category name'),
  confidence: z.number().min(0).max(1).describe('Confidence score'),
  subcategories: z.array(z.string()).describe('Applicable subcategories'),
});

export type CategoryClassification = z.infer<typeof CategoryClassificationSchema>;

export const KeywordExtractionSchema = z.object({
  keywords: z.array(z.string()).describe('Extracted keywords'),
  legalTerms: z.array(z.string()).optional().describe('Legal terminology'),
  entities: z.array(z.string()).optional().describe('Named entities'),
});

export type KeywordExtraction = z.infer<typeof KeywordExtractionSchema>;

export const BillAnalysisSchema = z.object({
  billId: z.string(),
  summary: BillSummarySchema,
  categories: z.array(z.string()),
  keywords: z.array(z.string()),
  analysisDate: z.string().datetime(),
});

export type BillAnalysis = z.infer<typeof BillAnalysisSchema>;

// Validation helpers
export function validateBillSummary(data: unknown): BillSummary {
  return BillSummarySchema.parse(data);
}

export function validateSectionExplanation(data: unknown): SectionExplanation {
  return SectionExplanationSchema.parse(data);
}

export function validateDiffExplanation(data: unknown): DiffExplanation {
  return DiffExplanationSchema.parse(data);
}

export function safeParseBillSummary(data: unknown): { success: boolean; data?: BillSummary; error?: z.ZodError } {
  const result = BillSummarySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
