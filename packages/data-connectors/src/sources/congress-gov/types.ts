import { z } from 'zod';

// Congress.gov API response schemas
export const CongressBillSchema = z.object({
  congress: z.number(),
  type: z.string(),
  number: z.number(),
  title: z.string(),
  originChamber: z.string(),
  originChamberCode: z.string(),
  introducedDate: z.string(),
  updateDate: z.string().optional(),
  url: z.string().url(),
  policyArea: z.object({
    name: z.string(),
  }).optional(),
  sponsors: z.array(z.object({
    bioguideId: z.string(),
    fullName: z.string(),
    party: z.string().optional(),
    state: z.string().optional(),
    district: z.number().optional(),
  })).optional(),
  cosponsors: z.object({
    count: z.number(),
    countIncludingWithdrawnCosponsors: z.number().optional(),
  }).optional(),
  latestAction: z.object({
    actionDate: z.string(),
    text: z.string(),
  }).optional(),
  constitutionalAuthorityStatementText: z.string().optional(),
  subjects: z.object({
    count: z.number(),
  }).optional(),
  summaries: z.object({
    count: z.number(),
  }).optional(),
});

export type CongressBill = z.infer<typeof CongressBillSchema>;

export const CongressVoteSchema = z.object({
  congress: z.number(),
  session: z.number(),
  rollNumber: z.number(),
  chamber: z.string(),
  date: z.string(),
  question: z.string(),
  result: z.string(),
  url: z.string().url(),
  yeas: z.number().optional(),
  nays: z.number().optional(),
  notVoting: z.number().optional(),
  present: z.number().optional(),
});

export type CongressVote = z.infer<typeof CongressVoteSchema>;

export const CongressMemberSchema = z.object({
  bioguideId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string().optional(),
  party: z.string().optional(),
  state: z.string(),
  district: z.number().optional(),
  chamber: z.string().optional(),
  url: z.string().url().optional(),
  terms: z.array(z.object({
    congress: z.number(),
    chamber: z.string(),
    startYear: z.number(),
    endYear: z.number().optional(),
  })).optional(),
  depiction: z.object({
    imageUrl: z.string().url(),
    attribution: z.string().optional(),
  }).optional(),
});

export type CongressMember = z.infer<typeof CongressMemberSchema>;

export const CommitteeSchema = z.object({
  systemCode: z.string(),
  name: z.string(),
  chamber: z.string(),
  type: z.string().optional(),
  url: z.string().url().optional(),
  parent: z.object({
    systemCode: z.string(),
    name: z.string(),
  }).optional(),
});

export type Committee = z.infer<typeof CommitteeSchema>;

export const AmendmentSchema = z.object({
  congress: z.number(),
  type: z.string(),
  number: z.number(),
  purpose: z.string().optional(),
  description: z.string().optional(),
  latestAction: z.object({
    actionDate: z.string(),
    text: z.string(),
  }).optional(),
  url: z.string().url().optional(),
});

export type Amendment = z.infer<typeof AmendmentSchema>;

export const BillActionSchema = z.object({
  actionCode: z.string().optional(),
  actionDate: z.string(),
  text: z.string(),
  type: z.string().optional(),
  sourceSystem: z.object({
    code: z.number().optional(),
    name: z.string(),
  }).optional(),
});

export type BillAction = z.infer<typeof BillActionSchema>;

// API Query Parameters
export interface BillsParams {
  congress?: number;
  type?: 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';
  limit?: number;
  offset?: number;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc' | 'number+asc' | 'number+desc';
}

export interface VotesParams {
  congress?: number;
  chamber?: 'house' | 'senate';
  limit?: number;
  offset?: number;
}

export interface MembersParams {
  congress?: number;
  chamber?: 'house' | 'senate';
  limit?: number;
  offset?: number;
  currentMember?: boolean;
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    count: number;
    next?: string;
    previous?: string;
  };
}

export type PaginatedBills = PaginatedResponse<CongressBill>;
export type PaginatedVotes = PaginatedResponse<CongressVote>;
export type PaginatedMembers = PaginatedResponse<CongressMember>;
