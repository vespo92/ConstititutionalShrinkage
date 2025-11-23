/**
 * Bill-related types
 */

import { ListParams } from './common.types';

export interface Bill {
  id: string;
  title: string;
  summary: string;
  status: BillStatus;
  category: string;
  region?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  votingEndsAt?: string;
  author: {
    id: string;
    displayName: string;
  };
  metrics?: {
    supporters: number;
    opposers: number;
    comments: number;
  };
}

export type BillStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'voting'
  | 'passed'
  | 'rejected'
  | 'enacted'
  | 'sunset';

export interface BillListParams extends ListParams {
  status?: BillStatus;
  category?: string;
  region?: string;
  search?: string;
}

export interface BillVersion {
  version: number;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
  summary: string;
}

export interface BillDiff {
  billId: string;
  fromVersion: number;
  toVersion: number;
  changes: Array<{
    section: string;
    type: 'added' | 'modified' | 'removed';
    before?: string;
    after?: string;
  }>;
}

export interface BillDiffParams {
  fromVersion?: number;
  toVersion?: number;
}

export interface Amendment {
  id: string;
  billId: string;
  title: string;
  status: string;
  author: {
    id: string;
    displayName: string;
  };
  createdAt: string;
  supporters: number;
}
