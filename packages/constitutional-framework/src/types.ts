/**
 * Core types for the Constitutional Framework
 * Defines the immutable rights and constitutional structure
 */

export enum RightCategory {
  INDIVIDUAL_SOVEREIGNTY = 'individual_sovereignty',
  PROPERTY_RIGHTS = 'property_rights',
  DUE_PROCESS = 'due_process',
  ANTI_COERCION = 'anti_coercion',
  FREEDOM_OF_EXPRESSION = 'freedom_of_expression',
  PRIVACY = 'privacy',
  BUSINESS_TRANSPARENCY = 'business_transparency',
}

export enum GovernanceLevel {
  IMMUTABLE = 'immutable', // Cannot be overridden
  FEDERAL = 'federal',
  SUPER_REGIONAL = 'super_regional',
  REGIONAL = 'regional',
  LOCAL = 'local',
}

export interface Right {
  id: string;
  category: RightCategory;
  title: string;
  description: string;
  level: GovernanceLevel;
  enforceable: boolean;
  exceptions: Exception[];
  createdAt: Date;
  lastModified: Date;
}

export interface Exception {
  id: string;
  condition: string;
  justification: string;
  sunsetDate?: Date; // Exceptions can expire
  requiredApprovalLevel: GovernanceLevel;
}

export interface Amendment {
  id: string;
  version: string;
  title: string;
  description: string;
  proposedBy: string;
  proposedDate: Date;
  ratifiedDate?: Date;
  status: AmendmentStatus;
  votesFor: number;
  votesAgainst: number;
  votesRequired: number;
  affectedRights: string[];
  gitCommitHash?: string;
}

export enum AmendmentStatus {
  PROPOSED = 'proposed',
  UNDER_REVIEW = 'under_review',
  VOTING = 'voting',
  RATIFIED = 'ratified',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Law {
  id: string;
  title: string;
  content: string;
  version: string;
  level: GovernanceLevel;
  regionId?: string;
  status: LawStatus;
  sunsetDate: Date;
  gitBranch: string;
  gitCommitHash?: string;
  createdBy: string;
  createdAt: Date;
  ratifiedAt?: Date;
}

export enum LawStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  UNDER_REVIEW = 'under_review',
  VOTING = 'voting',
  ACTIVE = 'active',
  SUNSET = 'sunset',
  REPEALED = 'repealed',
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Conflict[];
  resolution?: ConflictResolution;
}

export interface Conflict {
  lawId: string;
  rightId?: string;
  description: string;
  severity: ConflictSeverity;
  suggestedAction: string;
}

export enum ConflictSeverity {
  CONSTITUTIONAL_VIOLATION = 'constitutional_violation', // Cannot proceed
  LEGAL_CONFLICT = 'legal_conflict', // Needs resolution
  WARNING = 'warning', // Advisory only
}

export interface ConflictResolution {
  method: ResolutionMethod;
  winningLaw?: string;
  requiredChanges: string[];
}

export enum ResolutionMethod {
  HIERARCHY = 'hierarchy', // Higher level wins
  NEWER_SUPERSEDES = 'newer_supersedes',
  EXPLICIT_REPEAL = 'explicit_repeal',
  AMENDMENT_REQUIRED = 'amendment_required',
}

export interface Constitution {
  version: string;
  immutableRights: Right[];
  amendments: Amendment[];
  gitRepository: string;
  mainBranch: string;
  lastUpdated: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}
