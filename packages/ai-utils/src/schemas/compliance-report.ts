/**
 * Compliance Report Schemas
 * Zod schemas for validating compliance analysis outputs
 */

import { z } from 'zod';

export const IssueSeveritySchema = z.enum(['critical', 'warning', 'info']);
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

export const ConstitutionalIssueSchema = z.object({
  severity: IssueSeveritySchema,
  article: z.string().describe('Constitutional article'),
  section: z.string().optional().describe('Specific section'),
  description: z.string().describe('Description of the issue'),
  excerpt: z.string().describe('Problematic text from the bill'),
  suggestion: z.string().describe('How to fix the issue'),
  confidence: z.number().min(0).max(1).describe('Confidence in this finding'),
});

export type ConstitutionalIssue = z.infer<typeof ConstitutionalIssueSchema>;

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  relevance: z.number().min(0).max(1),
});

export type Article = z.infer<typeof ArticleSchema>;

export const ComplianceReportSchema = z.object({
  score: z.number().min(0).max(100).describe('Overall compliance score'),
  compliant: z.boolean().describe('Whether the bill is compliant'),
  issues: z.array(ConstitutionalIssueSchema).describe('List of issues found'),
  relevantArticles: z.array(ArticleSchema).describe('Relevant constitutional articles'),
  recommendations: z.array(z.string()).describe('Recommendations for improvement'),
  analysisDate: z.string().datetime(),
  billId: z.string().optional(),
});

export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

export const RightAnalysisSchema = z.object({
  rightId: z.string(),
  rightName: z.string(),
  compliant: z.boolean(),
  concerns: z.array(z.string()).describe('Concerns about this right'),
  protections: z.array(z.string()).describe('How this right is protected'),
  analysis: z.string().describe('Detailed analysis'),
});

export type RightAnalysis = z.infer<typeof RightAnalysisSchema>;

export const LegalConflictSchema = z.object({
  conflictingLawId: z.string(),
  conflictingLawTitle: z.string(),
  conflictType: z.enum(['direct', 'indirect', 'potential']),
  description: z.string(),
  resolution: z.string().describe('How to resolve the conflict'),
});

export type LegalConflict = z.infer<typeof LegalConflictSchema>;

export const ConflictReportSchema = z.object({
  conflicts: z.array(LegalConflictSchema),
  analyzed: z.number().describe('Number of laws analyzed'),
  potentialConflicts: z.number(),
  directConflicts: z.number(),
  analysisDate: z.string().datetime(),
});

export type ConflictReport = z.infer<typeof ConflictReportSchema>;

// Validation helpers
export function validateComplianceReport(data: unknown): ComplianceReport {
  return ComplianceReportSchema.parse(data);
}

export function validateRightAnalysis(data: unknown): RightAnalysis {
  return RightAnalysisSchema.parse(data);
}

export function validateConflictReport(data: unknown): ConflictReport {
  return ConflictReportSchema.parse(data);
}

export function safeParseComplianceReport(data: unknown): { success: boolean; data?: ComplianceReport; error?: z.ZodError } {
  const result = ComplianceReportSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
