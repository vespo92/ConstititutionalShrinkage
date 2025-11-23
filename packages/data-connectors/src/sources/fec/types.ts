import { z } from 'zod';

export const FecCandidateSchema = z.object({
  candidateId: z.string(),
  name: z.string(),
  party: z.string().optional(),
  partyFull: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  office: z.enum(['H', 'S', 'P']).optional(), // House, Senate, President
  officeFull: z.string().optional(),
  electionYears: z.array(z.number()).optional(),
  cycles: z.array(z.number()).optional(),
  incumbentChallenge: z.string().optional(),
  principalCommittees: z.array(z.object({
    committeeId: z.string(),
    name: z.string(),
    designation: z.string().optional(),
  })).optional(),
});

export type FecCandidate = z.infer<typeof FecCandidateSchema>;

export const FecCommitteeSchema = z.object({
  committeeId: z.string(),
  name: z.string(),
  treasurerName: z.string().optional(),
  committeeType: z.string().optional(),
  committeeTypeFull: z.string().optional(),
  designation: z.string().optional(),
  designationFull: z.string().optional(),
  party: z.string().optional(),
  partyFull: z.string().optional(),
  state: z.string().optional(),
  filingFrequency: z.string().optional(),
  candidateIds: z.array(z.string()).optional(),
  cycles: z.array(z.number()).optional(),
});

export type FecCommittee = z.infer<typeof FecCommitteeSchema>;

export const FecContributionSchema = z.object({
  transactionId: z.string().optional(),
  committeeId: z.string(),
  committeeName: z.string().optional(),
  contributorName: z.string(),
  contributorCity: z.string().optional(),
  contributorState: z.string().optional(),
  contributorZip: z.string().optional(),
  contributorEmployer: z.string().optional(),
  contributorOccupation: z.string().optional(),
  contributionReceiptDate: z.string(),
  contributionReceiptAmount: z.number(),
  memoText: z.string().optional(),
  receiptType: z.string().optional(),
  isIndividual: z.boolean().optional(),
});

export type FecContribution = z.infer<typeof FecContributionSchema>;

export const FecFilingSchema = z.object({
  filingId: z.number(),
  committeeId: z.string(),
  committeeName: z.string().optional(),
  formType: z.string(),
  reportType: z.string().optional(),
  reportTypeFull: z.string().optional(),
  coverageStartDate: z.string().optional(),
  coverageEndDate: z.string().optional(),
  receiptDate: z.string(),
  totalReceipts: z.number().optional(),
  totalDisbursements: z.number().optional(),
  cashOnHandEndPeriod: z.number().optional(),
  debtsOwed: z.number().optional(),
});

export type FecFiling = z.infer<typeof FecFilingSchema>;

export interface FecSearchParams {
  cycle?: number | number[];
  state?: string | string[];
  party?: string | string[];
  office?: 'H' | 'S' | 'P';
  district?: string;
  sort?: string;
  sortHide?: boolean;
  perPage?: number;
  page?: number;
}
