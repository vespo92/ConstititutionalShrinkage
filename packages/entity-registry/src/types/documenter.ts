/**
 * DOCUMENTER & VERIFICATION SYSTEM
 *
 * Trusted documenters collect and verify government data.
 * Multi-party verification ensures accuracy without centralized control.
 */

import { GovernanceLevel, Jurisdiction } from './governance-levels';
import { ChangeRecord } from './change-tracking';

/**
 * Documenter verification level - determines what they can do
 */
export type DocumenterLevel =
  | 'CITIZEN'             // Any registered user - can submit, not verify
  | 'VERIFIED_RESIDENT'   // Proof of residency - can submit with higher weight
  | 'COMMUNITY_VERIFIER'  // Trained volunteer - can verify basic records
  | 'JOURNALIST'          // Credentialed press - can verify from sources
  | 'ELECTED_OFFICIAL'    // Current/former official - can verify official records
  | 'GOVERNMENT_STAFF'    // Government employee - can verify internal records
  | 'ARCHIVIST'           // Professional archivist - can verify historical records
  | 'AUDITOR'             // Certified auditor - can verify financial records
  | 'LEGAL_PROFESSIONAL'  // Attorney/paralegal - can verify legal records
  | 'ADMINISTRATOR';      // System admin - full access

/**
 * Documenter account
 */
export interface Documenter {
  id: string;
  personId: string;                     // Link to Person entity

  // === IDENTITY ===
  displayName: string;
  email: string;
  isAnonymous: boolean;                 // Can submit anonymously

  // === VERIFICATION STATUS ===
  level: DocumenterLevel;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationDocuments: string[];      // IDs of verification docs

  // === JURISDICTIONS ===
  primaryJurisdiction: string;          // Main jurisdiction they cover
  jurisdictions: DocumenterJurisdiction[];

  // === QUALIFICATIONS ===
  qualifications: Qualification[];
  specializations: DataSpecialization[];

  // === REPUTATION ===
  reputationScore: number;              // 0-100
  submissionCount: number;
  verificationCount: number;
  accuracyRate: number;                 // % of submissions verified accurate
  disputeRate: number;                  // % of submissions disputed

  // === TRUST METRICS ===
  trustScore: number;                   // Calculated trust (0-100)
  endorsements: DocumenterEndorsement[];
  flags: DocumenterFlag[];

  // === ACTIVITY ===
  lastActiveAt: Date;
  activeStreak: number;                 // Days of continuous activity
  totalContributions: number;

  // === ACCOUNT ===
  status: DocumenterStatus;
  createdAt: Date;
  updatedAt: Date;
  changeHistory: ChangeRecord[];
}

/**
 * Documenter status
 */
export type DocumenterStatus =
  | 'PENDING'             // Awaiting verification
  | 'ACTIVE'              // Verified and active
  | 'INACTIVE'            // No recent activity
  | 'SUSPENDED'           // Temporarily suspended
  | 'BANNED';             // Permanently banned

/**
 * Jurisdiction coverage for a documenter
 */
export interface DocumenterJurisdiction {
  jurisdictionId: string;
  jurisdictionName: string;
  level: GovernanceLevel;
  role: 'PRIMARY' | 'SECONDARY' | 'BACKUP';
  assignedAt: Date;
  lastContribution?: Date;
}

/**
 * Qualification credential
 */
export interface Qualification {
  type: QualificationType;
  description: string;
  issuedBy?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  documentId?: string;                  // Proof document
  verified: boolean;
  verifiedBy?: string;
}

/**
 * Types of qualifications
 */
export type QualificationType =
  | 'RESIDENCY'           // Proof of residence
  | 'GOVERNMENT_EMPLOYEE' // Current/former gov employee
  | 'ELECTED_OFFICIAL'    // Current/former elected
  | 'PRESS_CREDENTIAL'    // Journalist credential
  | 'LAW_LICENSE'         // Attorney bar membership
  | 'CPA_LICENSE'         // Certified Public Accountant
  | 'ARCHIVIST_CERT'      // Professional archivist
  | 'FOIA_TRAINING'       // FOIA request training
  | 'PLATFORM_TRAINING'   // Our platform training
  | 'BACKGROUND_CHECK';   // Passed background check

/**
 * Data type specialization
 */
export interface DataSpecialization {
  dataType: string;                     // e.g., 'LEGISLATION', 'COURT_RECORDS'
  level: 'NOVICE' | 'COMPETENT' | 'EXPERT';
  verifiedCount: number;                // Records verified of this type
  accuracyRate: number;
}

/**
 * Endorsement from another documenter
 */
export interface DocumenterEndorsement {
  endorserId: string;
  endorserName: string;
  endorserLevel: DocumenterLevel;
  category: string;                     // What they're endorsing
  statement: string;
  endorsedAt: Date;
  weight: number;                       // Based on endorser's reputation
}

/**
 * Flag/warning on a documenter
 */
export interface DocumenterFlag {
  id: string;
  type: FlagType;
  reason: string;
  recordId?: string;                    // Related record if applicable
  flaggedBy: string;
  flaggedAt: Date;
  status: 'PENDING' | 'RESOLVED' | 'UPHELD' | 'DISMISSED';
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

/**
 * Types of flags
 */
export type FlagType =
  | 'INACCURACY'          // Submitted inaccurate data
  | 'UNSOURCED'           // Failed to provide sources
  | 'CONFLICT_OF_INTEREST'// Undisclosed conflict
  | 'VANDALISM'           // Intentional bad data
  | 'SPAM'                // Spamming submissions
  | 'IMPERSONATION'       // Claiming false identity
  | 'HARASSMENT'          // Harassing other documenters
  | 'POLICY_VIOLATION';   // Other policy violation

/**
 * Data submission by a documenter
 */
export interface DataSubmission {
  id: string;
  documenterId: string;
  documenterName: string;

  // === WHAT ===
  entityType: string;                   // Type of entity being created/updated
  entityId?: string;                    // Existing entity ID (for updates)
  operation: 'CREATE' | 'UPDATE' | 'VERIFY' | 'DISPUTE';

  // === DATA ===
  data: Record<string, any>;            // The submitted data
  previousData?: Record<string, any>;   // Previous state (for updates)

  // === SOURCE ===
  sourceType: SourceType;
  sourceUrl?: string;
  sourceDocumentId?: string;
  sourceCitation: string;               // Full citation

  // === VERIFICATION ===
  status: SubmissionStatus;
  verifications: Verification[];
  disputes: Dispute[];

  // === TIMING ===
  submittedAt: Date;
  lastUpdatedAt: Date;
  processedAt?: Date;

  // === METADATA ===
  jurisdictionId: string;
  governanceLevel: GovernanceLevel;
  changeHistory: ChangeRecord[];
}

/**
 * Source types for submissions
 */
export type SourceType =
  | 'OFFICIAL_WEBSITE'    // Government website
  | 'OFFICIAL_API'        // Official API (Congress.gov, etc.)
  | 'FOIA_RESPONSE'       // FOIA request response
  | 'PUBLIC_MEETING'      // Attended public meeting
  | 'PUBLISHED_DOCUMENT'  // Published official document
  | 'NEWS_REPORT'         // News article
  | 'COURT_RECORD'        // Court filing/record
  | 'PERSONAL_OBSERVATION'// First-hand observation
  | 'OTHER_DOCUMENTER'    // Another documenter's verified record
  | 'OTHER';

/**
 * Submission status
 */
export type SubmissionStatus =
  | 'PENDING'             // Awaiting verification
  | 'UNDER_REVIEW'        // Being reviewed
  | 'VERIFIED'            // Verified accurate
  | 'REJECTED'            // Rejected as inaccurate
  | 'DISPUTED'            // Under dispute
  | 'MERGED'              // Merged with existing record
  | 'SUPERSEDED';         // Replaced by newer submission

/**
 * Verification of a submission
 */
export interface Verification {
  id: string;
  submissionId: string;
  verifierId: string;
  verifierName: string;
  verifierLevel: DocumenterLevel;

  // === DECISION ===
  decision: 'VERIFY' | 'REJECT' | 'NEEDS_INFO';
  confidence: number;                   // 0-100
  reason: string;

  // === EVIDENCE ===
  supportingSourceUrl?: string;
  supportingDocumentId?: string;
  notes?: string;

  // === TIMING ===
  verifiedAt: Date;
}

/**
 * Dispute on a submission
 */
export interface Dispute {
  id: string;
  submissionId: string;
  disputerId: string;
  disputerName: string;

  // === CLAIM ===
  claimType: DisputeClaimType;
  description: string;
  suggestedCorrection?: Record<string, any>;

  // === EVIDENCE ===
  sourceUrl?: string;
  documentId?: string;

  // === RESOLUTION ===
  status: 'OPEN' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;

  // === TIMING ===
  filedAt: Date;
}

/**
 * Types of dispute claims
 */
export type DisputeClaimType =
  | 'FACTUAL_ERROR'       // Data is factually incorrect
  | 'SOURCE_INVALID'      // Source doesn't support claim
  | 'OUTDATED'            // Information is outdated
  | 'INCOMPLETE'          // Missing critical information
  | 'MISATTRIBUTION'      // Wrong person/org attributed
  | 'DUPLICATE'           // Duplicate of existing record
  | 'BIAS'                // Submission shows bias
  | 'OTHER';

/**
 * Verification workflow configuration
 */
export interface VerificationWorkflow {
  dataType: string;                     // Type of data
  governanceLevel: GovernanceLevel;

  // === REQUIREMENTS ===
  minVerifications: number;             // Minimum verifications needed
  minVerifierLevel: DocumenterLevel;    // Minimum verifier level
  requireSourceDocument: boolean;       // Must have source doc
  requireMultipleSources: boolean;      // Need 2+ sources

  // === TIMING ===
  verificationWindowHours: number;      // Time to complete verification
  expiresAfterDays?: number;           // Auto-reject if not verified

  // === ESCALATION ===
  escalateAfterDisputes: number;        // Disputes before escalation
  escalateTo: DocumenterLevel;          // Who handles escalation
}

/**
 * Default verification workflows by data type
 */
export const DEFAULT_VERIFICATION_WORKFLOWS: VerificationWorkflow[] = [
  {
    dataType: 'MEETING_MINUTES',
    governanceLevel: 'TOWNSHIP',
    minVerifications: 1,
    minVerifierLevel: 'VERIFIED_RESIDENT',
    requireSourceDocument: true,
    requireMultipleSources: false,
    verificationWindowHours: 168,       // 1 week
    escalateAfterDisputes: 2,
    escalateTo: 'COMMUNITY_VERIFIER',
  },
  {
    dataType: 'LEGISLATION',
    governanceLevel: 'STATE',
    minVerifications: 2,
    minVerifierLevel: 'COMMUNITY_VERIFIER',
    requireSourceDocument: true,
    requireMultipleSources: false,
    verificationWindowHours: 72,
    escalateAfterDisputes: 1,
    escalateTo: 'ADMINISTRATOR',
  },
  {
    dataType: 'CAMPAIGN_FINANCE',
    governanceLevel: 'FEDERAL',
    minVerifications: 2,
    minVerifierLevel: 'COMMUNITY_VERIFIER',
    requireSourceDocument: true,
    requireMultipleSources: true,
    verificationWindowHours: 48,
    escalateAfterDisputes: 1,
    escalateTo: 'AUDITOR',
  },
  {
    dataType: 'COURT_RECORDS',
    governanceLevel: 'COUNTY',
    minVerifications: 1,
    minVerifierLevel: 'LEGAL_PROFESSIONAL',
    requireSourceDocument: true,
    requireMultipleSources: false,
    verificationWindowHours: 72,
    escalateAfterDisputes: 1,
    escalateTo: 'ADMINISTRATOR',
  },
];

/**
 * Reputation calculation factors
 */
export interface ReputationFactors {
  submissionAccuracy: number;           // Weight for accurate submissions
  verificationAccuracy: number;         // Weight for accurate verifications
  volumeBonus: number;                  // Bonus for high volume
  consistencyBonus: number;             // Bonus for consistent activity
  endorsementWeight: number;            // Weight of endorsements
  flagPenalty: number;                  // Penalty per flag
  disputeLossPenalty: number;           // Penalty for lost disputes
}

/**
 * Default reputation calculation
 */
export const DEFAULT_REPUTATION_FACTORS: ReputationFactors = {
  submissionAccuracy: 0.4,              // 40% weight
  verificationAccuracy: 0.3,            // 30% weight
  volumeBonus: 0.1,                     // 10% bonus
  consistencyBonus: 0.1,                // 10% bonus
  endorsementWeight: 0.1,               // 10% from endorsements
  flagPenalty: 5,                       // -5 per upheld flag
  disputeLossPenalty: 2,                // -2 per lost dispute
};

/**
 * Trust score calculation (combines level + reputation + activity)
 */
export function calculateTrustScore(documenter: Documenter): number {
  const levelScores: Record<DocumenterLevel, number> = {
    CITIZEN: 10,
    VERIFIED_RESIDENT: 25,
    COMMUNITY_VERIFIER: 40,
    JOURNALIST: 50,
    ELECTED_OFFICIAL: 60,
    GOVERNMENT_STAFF: 55,
    ARCHIVIST: 55,
    AUDITOR: 60,
    LEGAL_PROFESSIONAL: 55,
    ADMINISTRATOR: 100,
  };

  const baseScore = levelScores[documenter.level];
  const reputationBonus = documenter.reputationScore * 0.3;
  const accuracyBonus = documenter.accuracyRate * 0.2;
  const volumeBonus = Math.min(documenter.submissionCount / 100, 10);

  const flagPenalty = documenter.flags.filter(f => f.status === 'UPHELD').length * 5;

  return Math.max(0, Math.min(100,
    baseScore + reputationBonus + accuracyBonus + volumeBonus - flagPenalty
  ));
}

/**
 * Check if documenter can verify a submission
 */
export function canVerify(
  documenter: Documenter,
  submission: DataSubmission,
  workflow: VerificationWorkflow
): { allowed: boolean; reason?: string } {
  // Can't verify own submissions
  if (documenter.id === submission.documenterId) {
    return { allowed: false, reason: 'Cannot verify own submissions' };
  }

  // Check level requirement
  const levelOrder: DocumenterLevel[] = [
    'CITIZEN', 'VERIFIED_RESIDENT', 'COMMUNITY_VERIFIER', 'JOURNALIST',
    'GOVERNMENT_STAFF', 'ARCHIVIST', 'LEGAL_PROFESSIONAL', 'AUDITOR',
    'ELECTED_OFFICIAL', 'ADMINISTRATOR'
  ];

  const documenterRank = levelOrder.indexOf(documenter.level);
  const requiredRank = levelOrder.indexOf(workflow.minVerifierLevel);

  if (documenterRank < requiredRank) {
    return { allowed: false, reason: `Requires ${workflow.minVerifierLevel} level or higher` };
  }

  // Check if already verified by this documenter
  if (submission.verifications.some(v => v.verifierId === documenter.id)) {
    return { allowed: false, reason: 'Already verified by this documenter' };
  }

  // Check trust score
  if (documenter.trustScore < 30) {
    return { allowed: false, reason: 'Trust score too low' };
  }

  return { allowed: true };
}
