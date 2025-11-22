/**
 * GIT-STYLE CHANGE TRACKING SYSTEM
 *
 * Every change to every entity is tracked like git commits.
 * Full blame, history, diff, and audit capabilities.
 *
 * "Who changed what, when, and WHY" - the core of government transparency.
 */

/**
 * Types of changes that can be made
 */
export type ChangeType =
  | 'CREATE'              // Entity created
  | 'UPDATE'              // Field(s) modified
  | 'DELETE'              // Entity deleted (soft delete)
  | 'RESTORE'             // Entity restored from deletion
  | 'MERGE'               // Merged with another entity
  | 'SPLIT'               // Split into multiple entities
  | 'TRANSFER'            // Ownership/control transferred
  | 'RECLASSIFY'          // Type/category changed
  | 'VERIFY'              // Verification status changed
  | 'SUSPEND'             // Entity suspended
  | 'REINSTATE'           // Entity reinstated
  | 'AMEND'               // Amendment (for laws/documents)
  | 'SIGN'                // Signature added
  | 'RATIFY'              // Ratification
  | 'VETO'                // Veto action
  | 'OVERRIDE'            // Veto override
  | 'SUNSET'              // Automatic expiration
  | 'REPEAL';             // Explicit repeal

/**
 * Core change record - like a git commit
 */
export interface ChangeRecord {
  // === COMMIT IDENTITY ===
  changeId: string;                     // Unique ID (like commit hash)
  commitHash: string;                   // SHA-256 hash of change content
  parentCommitHash?: string;            // Previous commit hash (for chain)

  // === WHAT CHANGED ===
  entityType: EntityType;               // Type of entity changed
  entityId: string;                     // ID of entity changed
  changeType: ChangeType;               // Type of change
  fieldChanges: FieldChange[];          // Specific field changes

  // === WHO MADE THE CHANGE ===
  changedBy: ChangeAuthor;              // Who made this change
  authorizedBy?: ChangeAuthor;          // Who authorized it (if different)

  // === WHEN ===
  timestamp: Date;                      // When change was made
  effectiveDate?: Date;                 // When change takes effect (may differ)

  // === WHY - MANDATORY REASONING ===
  reason: string;                       // REQUIRED: Why was this change made?
  legalBasis?: string;                  // Legal authority for change
  relatedDocuments: string[];           // Supporting document IDs

  // === VERIFICATION ===
  signature: string;                    // Cryptographic signature
  witnesses: Witness[];                 // Who witnessed this change
  verificationStatus: VerificationStatus;

  // === CONTEXT ===
  sessionId?: string;                   // Legislative/court session
  caseNumber?: string;                  // Legal case number
  billId?: string;                      // Related bill
  orderId?: string;                     // Executive order
  ruleId?: string;                      // Regulatory rule

  // === METADATA ===
  tags: string[];                       // Categorization tags
  isPublic: boolean;                    // Always true for government
  immutable: boolean;                   // Cannot be changed (constitutional)
}

/**
 * Entity types that can be tracked
 */
export type EntityType =
  // Core entities
  | 'PERSON'
  | 'ORGANIZATION'
  | 'ASSOCIATION'          // Person-Org or Org-Org relationship

  // Government documents
  | 'BILL'
  | 'BILL_PROPOSAL'
  | 'BILL_AMENDMENT'
  | 'BILL_SIGNING'
  | 'LAW'
  | 'EXECUTIVE_ORDER'
  | 'REGULATION'
  | 'RULING'
  | 'OPINION'

  // Legal proceedings
  | 'LEGAL_CASE'
  | 'COURT_FILING'
  | 'JUDGMENT'
  | 'SENTENCE'
  | 'APPEAL'
  | 'SETTLEMENT'

  // Voting
  | 'VOTE'
  | 'DELEGATION'
  | 'VOTING_SESSION'
  | 'ELECTION'
  | 'REFERENDUM'

  // Financial
  | 'BUDGET'
  | 'APPROPRIATION'
  | 'EXPENDITURE'
  | 'CONTRACT'
  | 'GRANT'
  | 'CAMPAIGN_CONTRIBUTION'
  | 'LOBBYING_DISCLOSURE'

  // Administrative
  | 'APPOINTMENT'
  | 'NOMINATION'
  | 'CONFIRMATION'
  | 'RESIGNATION'
  | 'IMPEACHMENT'
  | 'CENSURE';

/**
 * Specific field that was changed
 */
export interface FieldChange {
  fieldPath: string;                    // Dot notation path (e.g., "address.city")
  previousValue: any;                   // Value before change
  newValue: any;                        // Value after change
  changeReason?: string;                // Specific reason for this field
}

/**
 * Who made the change
 */
export interface ChangeAuthor {
  personId: string;                     // Person ID
  personName: string;                   // Name for display
  role: string;                         // Role when making change
  organizationId?: string;              // Acting on behalf of org
  organizationName?: string;
  officialCapacity: boolean;            // Acting in official capacity?
  delegatedFrom?: string;               // If acting as delegate
}

/**
 * Witness to a change
 */
export interface Witness {
  personId: string;
  personName: string;
  role: string;
  timestamp: Date;
  signature: string;
}

/**
 * Verification status of a change
 */
export type VerificationStatus =
  | 'PENDING'             // Awaiting verification
  | 'VERIFIED'            // Verified as authentic
  | 'DISPUTED'            // Authenticity disputed
  | 'REJECTED'            // Failed verification
  | 'SUPERSEDED';         // Replaced by newer change

/**
 * Audit metadata attached to all entities
 */
export interface AuditMetadata {
  version: number;                      // Current version number
  firstCreated: Date;
  lastModified: Date;
  totalChanges: number;
  lastChangedBy: string;
  checksumHash: string;                 // Hash of current state
  blockchainAnchor?: BlockchainAnchor;  // Blockchain proof
}

/**
 * Blockchain anchor for immutability proof
 */
export interface BlockchainAnchor {
  chainId: string;                      // Which blockchain
  blockNumber: number;
  transactionHash: string;
  anchoredAt: Date;
  merkleRoot: string;                   // Merkle root of batch
  proofPath: string[];                  // Merkle proof
}

/**
 * Git blame result - who is responsible for what
 */
export interface BlameResult {
  entityId: string;
  entityType: EntityType;
  fieldBlame: FieldBlame[];             // Blame for each field
  overallResponsibility: ResponsibilityChain[];
}

/**
 * Blame for a specific field
 */
export interface FieldBlame {
  fieldPath: string;
  currentValue: any;
  lastChangedBy: ChangeAuthor;
  lastChangedAt: Date;
  changeId: string;
  reason: string;
  totalChanges: number;
  contributors: ChangeAuthor[];         // Everyone who ever changed it
}

/**
 * Chain of responsibility for an entity
 */
export interface ResponsibilityChain {
  role: string;                         // e.g., "SPONSOR", "SIGNER", "AUTHOR"
  personId: string;
  personName: string;
  action: string;                       // What they did
  timestamp: Date;
  accountability: number;               // 0-100 accountability score
}

/**
 * Diff between two versions of an entity
 */
export interface EntityDiff {
  entityId: string;
  entityType: EntityType;
  fromVersion: number;
  toVersion: number;
  fromCommitHash: string;
  toCommitHash: string;
  changes: FieldChange[];
  addedFields: string[];
  removedFields: string[];
  authors: ChangeAuthor[];              // Who made changes between versions
  timespan: { start: Date; end: Date };
}

/**
 * History query options
 */
export interface HistoryQuery {
  entityId?: string;                    // Specific entity
  entityType?: EntityType;              // Filter by type
  authorId?: string;                    // Filter by author
  changeType?: ChangeType;              // Filter by change type
  dateRange?: { start: Date; end: Date };
  fieldPath?: string;                   // Specific field
  limit?: number;                       // Max results
  offset?: number;                      // Pagination
  includeRelated?: boolean;             // Include related entities
}

/**
 * History entry for display
 */
export interface HistoryEntry {
  changeRecord: ChangeRecord;
  entitySnapshot?: any;                 // State after this change
  relatedChanges?: ChangeRecord[];      // Related changes
}

/**
 * Timeline of changes across entities
 */
export interface ChangeTimeline {
  entries: TimelineEntry[];
  dateRange: { start: Date; end: Date };
  totalChanges: number;
  topContributors: { author: ChangeAuthor; changeCount: number }[];
  changeTypeBreakdown: { type: ChangeType; count: number }[];
}

/**
 * Single timeline entry
 */
export interface TimelineEntry {
  timestamp: Date;
  changeId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  changeType: ChangeType;
  summary: string;                      // Human-readable summary
  author: ChangeAuthor;
  significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Conflict detection when same field changed by multiple authors
 */
export interface ChangeConflict {
  entityId: string;
  fieldPath: string;
  conflictingChanges: ChangeRecord[];
  resolutionStatus: 'UNRESOLVED' | 'RESOLVED' | 'OVERRIDDEN';
  resolvedBy?: ChangeAuthor;
  resolution?: string;
}
