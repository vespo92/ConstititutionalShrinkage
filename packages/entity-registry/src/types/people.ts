/**
 * PEOPLE TRACKING SYSTEM
 *
 * Complete tracking of individuals in the governance system.
 * Every person has a full audit trail - like `git blame` for democracy.
 */

import { ChangeRecord, AuditMetadata } from './change-tracking';

/**
 * Verification levels for identity - determines trust level
 */
export type VerificationLevel =
  | 'UNVERIFIED'      // No verification
  | 'EMAIL_VERIFIED'  // Email confirmed
  | 'ID_VERIFIED'     // Government ID checked
  | 'BIOMETRIC'       // Fingerprint/face verified
  | 'FULL_KYC';       // Full Know Your Customer

/**
 * Person status in the system
 */
export type PersonStatus =
  | 'ACTIVE'          // Currently active citizen
  | 'INACTIVE'        // Voluntarily inactive
  | 'SUSPENDED'       // Temporarily suspended
  | 'DECEASED'        // Passed away
  | 'EMIGRATED';      // Left jurisdiction

/**
 * Core Person entity - every individual in the system
 */
export interface Person {
  // === IDENTITY ===
  id: string;                           // Immutable UUID
  publicKey: string;                    // Cryptographic identity

  // === BASIC INFO ===
  legalName: string;                    // Full legal name
  preferredName?: string;               // How they want to be called
  dateOfBirth: Date;
  placeOfBirth?: string;

  // === CONTACT ===
  contactEmail: string;
  contactPhone?: string;

  // === LOCATION ===
  primaryRegionId: string;              // Main jurisdiction
  regionIds: string[];                  // All affiliated regions

  // === VERIFICATION ===
  verificationLevel: VerificationLevel;
  verificationDate?: Date;
  verifiedBy?: string;                  // Who verified them

  // === GOVERNANCE PARTICIPATION ===
  votingPower: number;                  // Base voting weight (usually 1.0)
  reputation: number;                   // 0-100 reputation score
  expertiseAreas: ExpertiseArea[];      // Areas of demonstrated expertise

  // === STATUS ===
  status: PersonStatus;
  statusReason?: string;

  // === AUDIT ===
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                    // Who created this record
  changeHistory: ChangeRecord[];        // Full git-style history

  // === METADATA ===
  metadata: AuditMetadata;
}

/**
 * Expertise areas for liquid democracy delegation
 */
export interface ExpertiseArea {
  category: string;                     // e.g., "healthcare", "finance", "environment"
  level: 'NOVICE' | 'INTERMEDIATE' | 'EXPERT' | 'AUTHORITY';
  verifiedCredentials: string[];        // Degrees, certifications, etc.
  endorsements: Endorsement[];          // Who vouches for their expertise
  score: number;                        // 0-100 calculated score
}

/**
 * Endorsement from another person
 */
export interface Endorsement {
  endorserId: string;                   // Person giving endorsement
  endorserName: string;
  category: string;
  statement: string;                    // Why they endorse
  date: Date;
  weight: number;                       // Based on endorser's own expertise
}

/**
 * Person roles in government/organizations
 */
export type PersonRole =
  // === ELECTED POSITIONS ===
  | 'ELECTED_REPRESENTATIVE'
  | 'ELECTED_EXECUTIVE'
  | 'ELECTED_JUDGE'

  // === APPOINTED POSITIONS ===
  | 'APPOINTED_OFFICIAL'
  | 'APPOINTED_JUDGE'
  | 'APPOINTED_ADMINISTRATOR'

  // === ORGANIZATIONAL ROLES ===
  | 'OWNER'
  | 'BOARD_MEMBER'
  | 'EXECUTIVE_OFFICER'
  | 'EMPLOYEE'
  | 'CONTRACTOR'
  | 'CONSULTANT'
  | 'LOBBYIST'
  | 'REGISTERED_AGENT'

  // === CIVIC ROLES ===
  | 'CITIZEN'
  | 'RESIDENT'
  | 'VOTER'
  | 'DELEGATE'           // Receives delegated votes
  | 'DELEGATOR'          // Delegates their vote
  | 'BILL_SPONSOR'
  | 'BILL_COSPONSOR'
  | 'WITNESS'
  | 'PETITIONER'
  | 'AMICUS_CURIAE'      // Friend of the court

  // === LEGAL ROLES ===
  | 'PLAINTIFF'
  | 'DEFENDANT'
  | 'PROSECUTOR'
  | 'DEFENSE_ATTORNEY'
  | 'JUDGE'
  | 'JUROR'
  | 'BAILIFF'
  | 'COURT_REPORTER';

/**
 * Search/filter criteria for people
 */
export interface PersonSearchCriteria {
  name?: string;                        // Fuzzy name match
  regionId?: string;                    // Filter by region
  verificationLevel?: VerificationLevel;
  status?: PersonStatus;
  role?: PersonRole;
  expertiseCategory?: string;
  minReputation?: number;
  organizationId?: string;              // Associated with org
  involvedInBillId?: string;            // Involved in specific bill
  dateRange?: { start: Date; end: Date };
}

/**
 * Person summary for lists/searches
 */
export interface PersonSummary {
  id: string;
  legalName: string;
  preferredName?: string;
  primaryRegionId: string;
  verificationLevel: VerificationLevel;
  reputation: number;
  status: PersonStatus;
  currentRoles: PersonRole[];
  organizationCount: number;
  billsSponsored: number;
  votescast: number;
}
