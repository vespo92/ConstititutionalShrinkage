/**
 * GOVERNMENT DATA TYPES
 *
 * All trackable government actions and documents.
 * Bills, legal proceedings, executive actions, financial records.
 * Everything version controlled with full blame history.
 */

import { ChangeRecord, AuditMetadata } from './change-tracking';
import { Association } from './associations';

// ============================================================================
// LEGISLATIVE DATA
// ============================================================================

/**
 * Bill status lifecycle
 */
export type BillStatus =
  | 'DRAFT'               // Being drafted
  | 'INTRODUCED'          // Formally introduced
  | 'IN_COMMITTEE'        // Under committee review
  | 'COMMITTEE_PASSED'    // Passed out of committee
  | 'COMMITTEE_FAILED'    // Died in committee
  | 'FLOOR_DEBATE'        // Being debated on floor
  | 'PASSED_CHAMBER'      // Passed one chamber
  | 'PASSED_BOTH'         // Passed both chambers
  | 'CONFERENCE'          // In conference committee
  | 'ENROLLED'            // Final version prepared
  | 'PRESENTED_TO_EXEC'   // Sent to executive
  | 'SIGNED'              // Signed into law
  | 'VETOED'              // Vetoed by executive
  | 'VETO_OVERRIDDEN'     // Veto overridden
  | 'POCKET_VETOED'       // Pocket veto
  | 'ENACTED'             // Became law
  | 'EXPIRED'             // Expired without action
  | 'WITHDRAWN'           // Withdrawn by sponsor
  | 'SUNSET'              // Automatically expired
  | 'REPEALED';           // Explicitly repealed

/**
 * Bill proposal - initial bill tracking
 */
export interface BillProposal {
  id: string;
  billNumber: string;                   // e.g., "H.R. 1234"
  shortTitle: string;
  fullTitle: string;

  // === CONTENT ===
  summary: string;
  fullText: string;
  wordCount: number;

  // === GIT-STYLE VERSION CONTROL ===
  version: string;                      // Semantic version
  gitBranch: string;
  commitHash: string;
  parentBillId?: string;                // If forked/amended from another
  diff?: string;                        // Diff from parent

  // === SPONSORS ===
  primarySponsorId: string;
  primarySponsorName: string;
  coSponsorIds: string[];
  coSponsorNames: string[];

  // === CATEGORIZATION ===
  chamber: 'HOUSE' | 'SENATE' | 'UNICAMERAL';
  session: string;                      // e.g., "117th Congress"
  committees: string[];                 // Assigned committees
  subjects: string[];                   // Subject tags
  governanceLevel: 'FEDERAL' | 'STATE' | 'LOCAL';
  jurisdictionId: string;

  // === STATUS ===
  status: BillStatus;
  statusHistory: StatusChange[];

  // === DATES ===
  introducedDate: Date;
  lastActionDate: Date;
  sunsetDate?: Date;                    // When law expires

  // === FISCAL ===
  cboScore?: CBOScore;                  // Budget impact estimate

  // === RELATIONSHIPS ===
  relatedBills: string[];
  amendingLaws: string[];               // Laws this would amend
  associations: Association[];          // All involved parties

  // === AUDIT ===
  createdAt: Date;
  updatedAt: Date;
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Status change record
 */
export interface StatusChange {
  fromStatus: BillStatus;
  toStatus: BillStatus;
  changedAt: Date;
  changedBy: string;
  reason: string;
  voteId?: string;                      // If changed by vote
}

/**
 * Congressional Budget Office score
 */
export interface CBOScore {
  scoreId: string;
  billId: string;
  scoredDate: Date;
  tenYearCost: number;                  // Cost over 10 years
  deficitImpact: number;
  revenueImpact: number;
  spendingImpact: number;
  assumptions: string[];
  uncertainties: string[];
  documentUrl: string;
}

/**
 * Bill signing record
 */
export interface BillSigning {
  id: string;
  billId: string;
  billNumber: string;
  billTitle: string;

  // === SIGNING DETAILS ===
  signedBy: string;                     // Executive who signed
  signedByName: string;
  signedAt: Date;
  signingLocation?: string;
  ceremonyAttendees: string[];          // People at signing

  // === SIGNING STATEMENT ===
  hasSigningStatement: boolean;
  signingStatementText?: string;
  signingStatementConcerns?: string[];

  // === BECOMES LAW ===
  publicLawNumber?: string;             // e.g., "P.L. 117-123"
  effectiveDate: Date;

  // === AUDIT ===
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Bill amendment
 */
export interface BillAmendment {
  id: string;
  billId: string;
  amendmentNumber: string;

  // === CONTENT ===
  title: string;
  description: string;
  fullText: string;
  diff: string;                         // What it changes

  // === SPONSOR ===
  sponsorId: string;
  sponsorName: string;
  coSponsorIds: string[];

  // === STATUS ===
  status: 'PROPOSED' | 'ADOPTED' | 'REJECTED' | 'WITHDRAWN' | 'TABLED';
  proposedDate: Date;
  resolvedDate?: Date;

  // === VOTING ===
  voteId?: string;
  votesFor?: number;
  votesAgainst?: number;

  // === AUDIT ===
  changeHistory: ChangeRecord[];
}

// ============================================================================
// LEGAL PROCEEDINGS
// ============================================================================

/**
 * Case type
 */
export type CaseType =
  | 'CIVIL'
  | 'CRIMINAL'
  | 'CONSTITUTIONAL'
  | 'ADMINISTRATIVE'
  | 'BANKRUPTCY'
  | 'FAMILY'
  | 'PROBATE'
  | 'SMALL_CLAIMS'
  | 'APPELLATE'
  | 'SUPREME_COURT';

/**
 * Case status
 */
export type CaseStatus =
  | 'FILED'
  | 'PENDING'
  | 'DISCOVERY'
  | 'PRE_TRIAL'
  | 'TRIAL'
  | 'UNDER_ADVISEMENT'
  | 'JUDGMENT_ENTERED'
  | 'APPEALED'
  | 'REMANDED'
  | 'SETTLED'
  | 'DISMISSED'
  | 'CLOSED';

/**
 * Legal case record
 */
export interface LegalCase {
  id: string;
  caseNumber: string;                   // Court case number
  caseName: string;                     // e.g., "Smith v. Jones"

  // === COURT INFO ===
  court: string;                        // Court name
  courtLevel: 'TRIAL' | 'APPELLATE' | 'SUPREME';
  jurisdiction: string;
  judgeId?: string;
  judgeName?: string;
  judgeIds: string[];                   // For panel decisions

  // === CASE TYPE ===
  caseType: CaseType;
  subjectMatter: string[];

  // === PARTIES ===
  plaintiffs: CaseParty[];
  defendants: CaseParty[];
  intervenors: CaseParty[];
  amicusBriefs: AmicusBrief[];

  // === DATES ===
  filedDate: Date;
  serviceDate?: Date;
  trialDate?: Date;
  closedDate?: Date;

  // === STATUS ===
  status: CaseStatus;
  statusHistory: CaseStatusChange[];

  // === DOCKET ===
  docketEntries: DocketEntry[];

  // === OUTCOME ===
  outcome?: CaseOutcome;
  precedentialValue?: 'BINDING' | 'PERSUASIVE' | 'NONE';

  // === APPEALS ===
  appealedFrom?: string;                // Lower case ID
  appealedTo?: string;                  // Higher case ID
  appealHistory: AppealRecord[];

  // === ASSOCIATIONS ===
  associations: Association[];

  // === AUDIT ===
  createdAt: Date;
  updatedAt: Date;
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Party in a case
 */
export interface CaseParty {
  personId?: string;                    // If individual
  organizationId?: string;              // If organization
  name: string;
  partyType: 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT' | 'CLASS';
  role: 'PLAINTIFF' | 'DEFENDANT' | 'INTERVENOR' | 'THIRD_PARTY';
  attorneys: Attorney[];
  isClassRepresentative?: boolean;
  classSize?: number;
}

/**
 * Attorney in a case
 */
export interface Attorney {
  personId: string;
  name: string;
  barNumber: string;
  firm?: string;
  firmId?: string;
  leadAttorney: boolean;
}

/**
 * Amicus curiae brief
 */
export interface AmicusBrief {
  id: string;
  filerId: string;
  filerName: string;
  filerType: 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT';
  supportingSide: 'PLAINTIFF' | 'DEFENDANT' | 'NEITHER';
  filedDate: Date;
  summary: string;
  documentUrl: string;
}

/**
 * Case status change
 */
export interface CaseStatusChange {
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  changedAt: Date;
  changedBy: string;
  reason: string;
  orderNumber?: string;
}

/**
 * Docket entry
 */
export interface DocketEntry {
  entryNumber: number;
  filedDate: Date;
  filedBy: string;
  description: string;
  documentType: string;
  documentUrl?: string;
  sealed: boolean;
}

/**
 * Case outcome
 */
export interface CaseOutcome {
  outcomeType: 'JUDGMENT' | 'SETTLEMENT' | 'DISMISSAL' | 'DEFAULT' | 'REMAND';
  favoredParty?: 'PLAINTIFF' | 'DEFENDANT' | 'SPLIT' | 'NONE';
  damages?: number;
  injunctiveRelief?: string;
  declaratoryRelief?: string;
  summary: string;
  opinionText?: string;
  dissentText?: string;
  concurrenceText?: string;
  issuedDate: Date;
  issuedBy: string;
}

/**
 * Appeal record
 */
export interface AppealRecord {
  id: string;
  fromCaseId: string;
  toCaseId: string;
  appealedBy: string;
  filedDate: Date;
  grounds: string[];
  status: 'PENDING' | 'AFFIRMED' | 'REVERSED' | 'REMANDED' | 'DISMISSED';
  outcome?: string;
}

// ============================================================================
// EXECUTIVE ACTIONS
// ============================================================================

/**
 * Executive order
 */
export interface ExecutiveOrder {
  id: string;
  orderNumber: string;                  // e.g., "E.O. 14067"
  title: string;
  summary: string;
  fullText: string;

  // === ISSUED BY ===
  issuedById: string;
  issuedByName: string;
  issuedByTitle: string;

  // === DATES ===
  signedDate: Date;
  effectiveDate: Date;
  expirationDate?: Date;

  // === STATUS ===
  status: 'ACTIVE' | 'REVOKED' | 'SUPERSEDED' | 'EXPIRED' | 'ENJOINED';
  revokedBy?: string;                   // Order that revoked this
  supersededBy?: string;                // Order that superseded this

  // === LEGAL ===
  legalAuthority: string[];             // Statutory basis
  affectedAgencies: string[];
  implementingRegulations: string[];

  // === CHALLENGES ===
  legalChallenges: string[];            // Case IDs

  // === ASSOCIATIONS ===
  associations: Association[];

  // === AUDIT ===
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

// ============================================================================
// FINANCIAL RECORDS
// ============================================================================

/**
 * Campaign contribution
 */
export interface CampaignContribution {
  id: string;
  filingId: string;                     // FEC filing ID

  // === FROM ===
  donorId: string;
  donorName: string;
  donorType: 'INDIVIDUAL' | 'PAC' | 'ORGANIZATION' | 'PARTY';
  donorEmployer?: string;
  donorOccupation?: string;

  // === TO ===
  recipientId: string;
  recipientName: string;
  recipientType: 'CANDIDATE' | 'PAC' | 'PARTY' | 'COMMITTEE';
  electionCycle: string;                // e.g., "2024"

  // === AMOUNT ===
  amount: number;
  aggregateAmount: number;              // Total this cycle
  contributionDate: Date;
  contributionType: 'MONETARY' | 'IN_KIND';

  // === EARMARKING ===
  earmarkedFor?: string;
  conduitId?: string;

  // === AUDIT ===
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Lobbying disclosure
 */
export interface LobbyingDisclosure {
  id: string;
  filingId: string;

  // === REGISTRANT ===
  registrantId: string;
  registrantName: string;
  registrantType: 'LOBBYING_FIRM' | 'SELF_EMPLOYED' | 'ORGANIZATION';

  // === CLIENT ===
  clientId: string;
  clientName: string;
  clientIndustry: string;

  // === LOBBYISTS ===
  lobbyists: LobbyistInfo[];

  // === ACTIVITY ===
  reportingPeriod: { start: Date; end: Date };
  incomeOrExpense: number;
  specificIssues: string[];
  housesLobbied: ('HOUSE' | 'SENATE' | 'EXECUTIVE')[];
  agenciesLobbied: string[];
  billsLobbied: string[];               // Bill IDs

  // === CONTACTS ===
  coveredOfficials: CoveredOfficial[];

  // === AUDIT ===
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Lobbyist information
 */
export interface LobbyistInfo {
  personId: string;
  name: string;
  coveredPosition?: string;             // Former govt position
  newLobbyist: boolean;
}

/**
 * Covered official contacted
 */
export interface CoveredOfficial {
  personId?: string;
  name: string;
  title: string;
  agency: string;
  contactDates: Date[];
}

/**
 * Government contract
 */
export interface GovernmentContract {
  id: string;
  contractNumber: string;
  piid: string;                         // Procurement ID

  // === PARTIES ===
  awardingAgencyId: string;
  awardingAgencyName: string;
  fundingAgencyId?: string;
  contractorId: string;
  contractorName: string;
  contractorDuns?: string;

  // === VALUE ===
  baseValue: number;
  totalObligated: number;
  potentialValue: number;               // Including options

  // === TYPE ===
  contractType: string;                 // Fixed price, cost plus, etc.
  naicsCode: string;
  productOrService: string;

  // === DATES ===
  signedDate: Date;
  effectiveDate: Date;
  completionDate: Date;

  // === COMPETITION ===
  competitionType: 'FULL_OPEN' | 'LIMITED' | 'SOLE_SOURCE' | 'SET_ASIDE';
  bidsReceived?: number;
  setAsideType?: string;                // Small business, etc.

  // === PERFORMANCE ===
  placeOfPerformance: string;
  performanceStatus: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETE' | 'TERMINATED';

  // === MODIFICATIONS ===
  modifications: ContractModification[];

  // === ASSOCIATIONS ===
  associations: Association[];

  // === AUDIT ===
  changeHistory: ChangeRecord[];
  metadata: AuditMetadata;
}

/**
 * Contract modification
 */
export interface ContractModification {
  modNumber: string;
  modDate: Date;
  obligationChange: number;
  description: string;
  reason: string;
}
