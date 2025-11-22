/**
 * ASSOCIATIONS & INVOLVEMENT TRACKING
 *
 * The relationship graph between People, Organizations, and Government Actions.
 * This is the core of "git blame for democracy" - tracking WHO was involved
 * in WHAT, in WHAT CAPACITY, and WHEN.
 */

import { ChangeRecord } from './change-tracking';
import { PersonRole } from './people';

/**
 * Types of involvement a person can have
 */
export type InvolvementType =
  // === LEGISLATIVE INVOLVEMENT ===
  | 'BILL_SPONSOR'            // Primary sponsor of legislation
  | 'BILL_COSPONSOR'          // Co-sponsor
  | 'BILL_AUTHOR'             // Wrote the bill text
  | 'BILL_AMENDMENT_AUTHOR'   // Authored an amendment
  | 'BILL_VOTER_FOR'          // Voted in favor
  | 'BILL_VOTER_AGAINST'      // Voted against
  | 'BILL_VOTER_ABSTAIN'      // Abstained
  | 'BILL_SIGNER'             // Signed into law (executive)
  | 'BILL_VETO'               // Vetoed the bill
  | 'VETO_OVERRIDE_VOTER'     // Voted to override veto
  | 'COMMITTEE_MEMBER'        // On reviewing committee
  | 'COMMITTEE_CHAIR'         // Chaired committee
  | 'FLOOR_MANAGER'           // Managed floor debate
  | 'FILIBUSTER'              // Participated in filibuster
  | 'CLOTURE_VOTER'           // Voted on cloture

  // === EXECUTIVE INVOLVEMENT ===
  | 'EXECUTIVE_ORDER_AUTHOR'
  | 'EXECUTIVE_ORDER_SIGNER'
  | 'PROCLAMATION_AUTHOR'
  | 'PROCLAMATION_SIGNER'
  | 'REGULATION_AUTHOR'
  | 'REGULATION_APPROVER'
  | 'BUDGET_AUTHOR'
  | 'BUDGET_APPROVER'

  // === JUDICIAL INVOLVEMENT ===
  | 'CASE_PLAINTIFF'
  | 'CASE_DEFENDANT'
  | 'CASE_JUDGE'
  | 'CASE_JUROR'
  | 'CASE_PROSECUTOR'
  | 'CASE_DEFENSE_ATTORNEY'
  | 'CASE_WITNESS'
  | 'CASE_EXPERT_WITNESS'
  | 'AMICUS_CURIAE'           // Friend of court brief
  | 'OPINION_AUTHOR'          // Wrote court opinion
  | 'OPINION_CONCURRENCE'     // Wrote concurring opinion
  | 'OPINION_DISSENT'         // Wrote dissenting opinion
  | 'SENTENCE_ISSUER'
  | 'APPEAL_FILER'
  | 'APPEAL_RESPONDENT'

  // === APPOINTMENT INVOLVEMENT ===
  | 'NOMINEE'
  | 'NOMINATOR'
  | 'CONFIRMATION_VOTER_FOR'
  | 'CONFIRMATION_VOTER_AGAINST'
  | 'APPOINTEE'
  | 'APPOINTER'

  // === FINANCIAL INVOLVEMENT ===
  | 'CAMPAIGN_DONOR'
  | 'CAMPAIGN_RECIPIENT'
  | 'PAC_CONTRIBUTOR'
  | 'PAC_BENEFICIARY'
  | 'LOBBYIST'
  | 'LOBBYING_CLIENT'
  | 'CONTRACT_AWARDER'
  | 'CONTRACT_RECIPIENT'
  | 'GRANT_AWARDER'
  | 'GRANT_RECIPIENT'
  | 'BUDGET_BENEFICIARY'

  // === ORGANIZATIONAL INVOLVEMENT ===
  | 'FOUNDER'
  | 'OWNER'
  | 'BOARD_MEMBER'
  | 'BOARD_CHAIR'
  | 'CEO'
  | 'CFO'
  | 'COO'
  | 'EXECUTIVE'
  | 'DIRECTOR'
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'CONTRACTOR'
  | 'CONSULTANT'
  | 'ADVISOR'
  | 'INVESTOR'
  | 'CREDITOR'
  | 'AUDITOR'
  | 'REGISTERED_AGENT'

  // === CIVIC INVOLVEMENT ===
  | 'PETITIONER'              // Filed petition
  | 'PETITION_SIGNER'         // Signed petition
  | 'PUBLIC_COMMENTER'        // Submitted public comment
  | 'HEARING_WITNESS'         // Testified at hearing
  | 'REFERENDUM_PROPONENT'
  | 'REFERENDUM_OPPONENT'
  | 'BALLOT_INITIATIVE_AUTHOR'
  | 'RECALL_PROPONENT'
  | 'RECALL_TARGET'

  // === INVESTIGATIVE INVOLVEMENT ===
  | 'INVESTIGATION_TARGET'
  | 'INVESTIGATION_LEAD'
  | 'WHISTLEBLOWER'
  | 'COOPERATING_WITNESS'
  | 'IMMUNITY_RECIPIENT'
  | 'SUBPOENA_ISSUER'
  | 'SUBPOENA_RECIPIENT'

  // === DELEGATION ===
  | 'VOTE_DELEGATOR'          // Delegated their vote
  | 'VOTE_DELEGATE';          // Received delegated votes

/**
 * Core Association - links Person/Org to anything
 */
export interface Association {
  // === IDENTITY ===
  id: string;                           // Unique association ID
  associationType: AssociationType;

  // === WHO ===
  subjectType: 'PERSON' | 'ORGANIZATION';
  subjectId: string;
  subjectName: string;

  // === TO WHAT ===
  objectType: AssociationObjectType;
  objectId: string;
  objectName: string;

  // === HOW ===
  involvementType: InvolvementType;
  role?: PersonRole;                    // More specific role if applicable
  description?: string;

  // === WHEN ===
  startDate: Date;
  endDate?: Date;                       // Null = ongoing
  isActive: boolean;

  // === WEIGHT/SIGNIFICANCE ===
  significance: 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'PERIPHERAL';
  impactScore?: number;                 // 0-100 calculated impact

  // === FINANCIAL DETAILS (if applicable) ===
  financialValue?: number;
  financialType?: 'SALARY' | 'DONATION' | 'CONTRACT' | 'INVESTMENT' | 'GRANT' | 'OTHER';

  // === VERIFICATION ===
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
  sourceDocuments: string[];            // Document IDs proving association

  // === AUDIT ===
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  changeHistory: ChangeRecord[];
}

/**
 * What can be associated with
 */
export type AssociationObjectType =
  // People & Orgs
  | 'PERSON'
  | 'ORGANIZATION'

  // Legislative
  | 'BILL'
  | 'BILL_PROPOSAL'
  | 'BILL_AMENDMENT'
  | 'LAW'
  | 'EXECUTIVE_ORDER'
  | 'REGULATION'

  // Judicial
  | 'LEGAL_CASE'
  | 'COURT_RULING'
  | 'COURT_ORDER'

  // Voting
  | 'VOTE'
  | 'VOTING_SESSION'
  | 'ELECTION'
  | 'REFERENDUM'

  // Financial
  | 'BUDGET'
  | 'CONTRACT'
  | 'GRANT'
  | 'CAMPAIGN'
  | 'PAC'
  | 'LOBBYING_REGISTRATION'

  // Administrative
  | 'APPOINTMENT'
  | 'NOMINATION'
  | 'INVESTIGATION'
  | 'HEARING'
  | 'COMMITTEE';

/**
 * Type of association relationship
 */
export type AssociationType =
  | 'PERSON_TO_ORGANIZATION'   // Person involved with org
  | 'PERSON_TO_PERSON'         // Person involved with person
  | 'PERSON_TO_DOCUMENT'       // Person involved with bill/law/etc.
  | 'PERSON_TO_PROCEEDING'     // Person involved with case/hearing
  | 'PERSON_TO_FINANCIAL'      // Person involved with financial matter
  | 'ORG_TO_ORGANIZATION'      // Org involved with org
  | 'ORG_TO_DOCUMENT'          // Org involved with bill/law/etc.
  | 'ORG_TO_PROCEEDING'        // Org involved with case/hearing
  | 'ORG_TO_FINANCIAL';        // Org involved with financial matter

/**
 * Involvement record - detailed tracking of specific involvement
 */
export interface InvolvementRecord {
  id: string;
  associationId: string;                // Link to association

  // === SPECIFIC ACTION ===
  action: string;                       // What they did
  actionDate: Date;
  actionLocation?: string;

  // === DETAILS ===
  details: string;                      // Full description
  publicStatement?: string;             // Any public statement made
  votingRecord?: VotingDetail;          // If a vote was cast
  financialDetail?: FinancialDetail;    // If money was involved

  // === DOCUMENTATION ===
  documentIds: string[];                // Supporting documents
  mediaUrls: string[];                  // Videos, transcripts, etc.

  // === WITNESSES ===
  witnesses: {
    personId: string;
    personName: string;
    capacity: string;
  }[];

  // === AUDIT ===
  recordedAt: Date;
  recordedBy: string;
  signature: string;
  changeHistory: ChangeRecord[];
}

/**
 * Voting detail for legislative involvement
 */
export interface VotingDetail {
  voteId: string;
  billId: string;
  billTitle: string;
  vote: 'FOR' | 'AGAINST' | 'ABSTAIN' | 'NOT_VOTING' | 'PRESENT';
  weight: number;                       // Including delegations
  delegatedFrom: string[];              // Who delegated to them
  explanation?: string;                 // Why they voted this way
}

/**
 * Financial detail for financial involvements
 */
export interface FinancialDetail {
  amount: number;
  currency: string;
  transactionType: string;
  transactionDate: Date;
  sourceAccountType?: string;
  destinationAccountType?: string;
  disclosureDocument?: string;
}

/**
 * Network graph node for visualization
 */
export interface NetworkNode {
  id: string;
  type: 'PERSON' | 'ORGANIZATION' | 'DOCUMENT' | 'PROCEEDING' | 'FINANCIAL';
  name: string;
  metadata: Record<string, any>;
  connectionCount: number;
  centralityScore: number;              // How connected/influential
}

/**
 * Network graph edge
 */
export interface NetworkEdge {
  sourceId: string;
  targetId: string;
  associationId: string;
  involvementType: InvolvementType;
  weight: number;                       // Strength of connection
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Conflict of interest detection
 */
export interface ConflictOfInterest {
  id: string;
  personId: string;
  personName: string;

  // === THE CONFLICT ===
  conflictType: ConflictType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // === INVOLVED ENTITIES ===
  governmentRole: {
    organizationId: string;
    organizationName: string;
    role: string;
  };
  privateInterest: {
    entityId: string;
    entityName: string;
    relationshipType: string;
    financialValue?: number;
  };

  // === AFFECTED ACTIONS ===
  affectedActions: {
    actionType: string;
    actionId: string;
    actionDescription: string;
    date: Date;
  }[];

  // === STATUS ===
  status: 'DETECTED' | 'DISCLOSED' | 'RECUSED' | 'WAIVED' | 'VIOLATED';
  disclosureDate?: Date;
  recusalDate?: Date;
  waiverGrantedBy?: string;

  // === AUDIT ===
  detectedAt: Date;
  detectedBy: string;                   // System or person who flagged it
  changeHistory: ChangeRecord[];
}

/**
 * Types of conflicts of interest
 */
export type ConflictType =
  | 'FINANCIAL_INTEREST'      // Owns stock/assets affected by decision
  | 'EMPLOYMENT'              // Current or former employer affected
  | 'FAMILY_RELATIONSHIP'     // Family member affected
  | 'CAMPAIGN_CONTRIBUTION'   // Received money from affected party
  | 'LOBBYING_RELATIONSHIP'   // Was lobbied by affected party
  | 'BOARD_MEMBERSHIP'        // Serves on board of affected entity
  | 'OWNERSHIP_STAKE'         // Owns part of affected entity
  | 'CONTRACTUAL'             // Has contract with affected party
  | 'REVOLVING_DOOR';         // Recently moved between gov and private

/**
 * Search criteria for associations
 */
export interface AssociationSearchCriteria {
  subjectId?: string;
  subjectType?: 'PERSON' | 'ORGANIZATION';
  objectId?: string;
  objectType?: AssociationObjectType;
  involvementType?: InvolvementType;
  dateRange?: { start: Date; end: Date };
  isActive?: boolean;
  minSignificance?: 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'PERIPHERAL';
  hasFinancialValue?: boolean;
  minFinancialValue?: number;
  verified?: boolean;
}

/**
 * Association summary for display
 */
export interface AssociationSummary {
  id: string;
  subjectName: string;
  subjectType: 'PERSON' | 'ORGANIZATION';
  involvementType: InvolvementType;
  objectName: string;
  objectType: AssociationObjectType;
  startDate: Date;
  isActive: boolean;
  significance: string;
  financialValue?: number;
}

/**
 * Full involvement report for a person or organization
 */
export interface InvolvementReport {
  subjectId: string;
  subjectName: string;
  subjectType: 'PERSON' | 'ORGANIZATION';

  // === SUMMARY STATS ===
  totalAssociations: number;
  activeAssociations: number;
  totalFinancialValue: number;

  // === BY CATEGORY ===
  legislativeInvolvement: AssociationSummary[];
  judicialInvolvement: AssociationSummary[];
  executiveInvolvement: AssociationSummary[];
  financialInvolvement: AssociationSummary[];
  organizationalInvolvement: AssociationSummary[];

  // === CONFLICTS ===
  conflictsOfInterest: ConflictOfInterest[];

  // === NETWORK ===
  topConnections: { entity: NetworkNode; connectionStrength: number }[];
  centralityRank: number;               // Rank in network influence

  // === TIMELINE ===
  recentActivity: InvolvementRecord[];

  // === GENERATED ===
  generatedAt: Date;
}
