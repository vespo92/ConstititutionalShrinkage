/**
 * Impact Report Schemas
 * Zod schemas for validating TBL impact analysis outputs
 */

import { z } from 'zod';

export const FactorSchema = z.object({
  name: z.string().describe('Name of the factor'),
  impact: z.number().min(-100).max(100).describe('Impact score'),
  description: z.string().describe('Description of the impact'),
  confidence: z.number().min(0).max(1).describe('Confidence in this assessment'),
});

export type Factor = z.infer<typeof FactorSchema>;

export const PeopleImpactSchema = z.object({
  score: z.number().min(-100).max(100),
  factors: z.array(FactorSchema),
  affectedPopulation: z.number().describe('Number of people affected'),
  inequalityImpact: z.string().describe('Impact on inequality'),
  demographics: z.array(z.string()).describe('Demographics most affected'),
});

export type PeopleImpact = z.infer<typeof PeopleImpactSchema>;

export const PlanetImpactSchema = z.object({
  score: z.number().min(-100).max(100),
  factors: z.array(FactorSchema),
  carbonImpact: z.number().describe('Carbon impact in tons CO2'),
  resourceImpact: z.string().describe('Resource consumption impact'),
  sustainabilityRating: z.enum(['A', 'B', 'C', 'D', 'F']),
});

export type PlanetImpact = z.infer<typeof PlanetImpactSchema>;

export const ProfitImpactSchema = z.object({
  score: z.number().min(-100).max(100),
  factors: z.array(FactorSchema),
  economicImpact: z.number().describe('Economic impact in dollars'),
  jobsImpact: z.number().describe('Jobs created or lost'),
  gdpEffect: z.string().describe('Effect on GDP'),
});

export type ProfitImpact = z.infer<typeof ProfitImpactSchema>;

export const TBLImpactReportSchema = z.object({
  people: PeopleImpactSchema,
  planet: PlanetImpactSchema,
  profit: ProfitImpactSchema,
  overall: z.number().min(-100).max(100).describe('Overall TBL score'),
  confidence: z.number().min(0).max(1).describe('Overall confidence'),
  methodology: z.string().describe('Methodology used'),
  region: z.string().describe('Region analyzed'),
  analysisDate: z.string().datetime(),
});

export type TBLImpactReport = z.infer<typeof TBLImpactReportSchema>;

export const RegionalComparisonSchema = z.object({
  billId: z.string(),
  regions: z.array(z.object({
    region: z.string(),
    impact: TBLImpactReportSchema,
  })),
  summary: z.string().describe('Summary of regional comparison'),
});

export type RegionalComparison = z.infer<typeof RegionalComparisonSchema>;

export const OutcomePredictionSchema = z.object({
  predictedOutcome: z.enum(['pass', 'fail', 'uncertain']),
  confidence: z.number().min(0).max(1),
  predictedYesPercentage: z.number().min(0).max(100),
  predictedNoPercentage: z.number().min(0).max(100),
  keyFactors: z.array(z.string()),
  swingVoters: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()).optional(),
});

export type OutcomePrediction = z.infer<typeof OutcomePredictionSchema>;

// Validation helpers
export function validateTBLImpactReport(data: unknown): TBLImpactReport {
  return TBLImpactReportSchema.parse(data);
}

export function validateOutcomePrediction(data: unknown): OutcomePrediction {
  return OutcomePredictionSchema.parse(data);
}

export function safeParseImpactReport(data: unknown): { success: boolean; data?: TBLImpactReport; error?: z.ZodError } {
  const result = TBLImpactReportSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// Helper to calculate overall TBL score
export function calculateOverallScore(
  people: number,
  planet: number,
  profit: number,
  weights = { people: 0.4, planet: 0.35, profit: 0.25 }
): number {
  return (
    people * weights.people +
    planet * weights.planet +
    profit * weights.profit
  );
}
