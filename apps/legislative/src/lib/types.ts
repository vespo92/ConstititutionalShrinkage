/**
 * Legislative Application Types
 * Extended types for the legislative UI application
 */

import type { Bill, BillDiff, Amendment } from '@constitutional-shrinkage/governance-utils';
import type { GovernanceLevel, LawStatus, ValidationResult, ConflictResult } from '@constitutional-shrinkage/constitutional-framework';
import type { Vote, VoteResults, VotingSession, Delegation, Citizen } from '@constitutional-shrinkage/voting-system';
import type { ImpactPrediction, TripleBottomLineScore } from '@constitutional-shrinkage/metrics';

// Re-export for convenience
export type {
  Bill,
  BillDiff,
  Amendment,
  GovernanceLevel,
  LawStatus,
  ValidationResult,
  ConflictResult,
  Vote,
  VoteResults,
  VotingSession,
  Delegation,
  Citizen,
  ImpactPrediction,
  TripleBottomLineScore,
};

// UI-specific types

export interface BillFormData {
  title: string;
  content: string;
  level: GovernanceLevel;
  regionId?: string;
  sunsetYears: number;
}

export interface BillSearchFilters {
  status?: LawStatus;
  level?: GovernanceLevel;
  regionId?: string;
  sponsor?: string;
  searchQuery?: string;
}

export interface BillListItem {
  id: string;
  title: string;
  sponsor: string;
  status: LawStatus;
  level: GovernanceLevel;
  createdAt: Date;
  votesFor: number;
  votesAgainst: number;
  hasConflicts: boolean;
}

export interface AmendmentFormData {
  description: string;
  proposedChanges: string;
}

export interface VoteCastData {
  billId: string;
  choice: 'for' | 'against' | 'abstain';
  isPublic: boolean;
}

export interface ConstitutionalCheckResult {
  isConstitutional: boolean;
  violations: ConstitutionalViolation[];
  warnings: ConstitutionalWarning[];
  score: number; // 0-100 compliance score
}

export interface ConstitutionalViolation {
  rightId: string;
  rightTitle: string;
  description: string;
  severity: 'critical' | 'major';
  suggestedFix?: string;
}

export interface ConstitutionalWarning {
  rightId: string;
  rightTitle: string;
  description: string;
  recommendation: string;
}

export interface DiffLine {
  type: 'addition' | 'deletion' | 'unchanged' | 'modification';
  content: string;
  lineNumber?: number;
  oldContent?: string;
}

export interface ParsedDiff {
  lines: DiffLine[];
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface ImpactAssessment {
  prediction: ImpactPrediction;
  confidence: number;
  methodology: string;
  keyFactors: string[];
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
