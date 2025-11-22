/**
 * ORGANIZATION TRACKING SYSTEM
 *
 * Complete tracking of all organizations - government, business, non-profit.
 * Full ownership chains, subsidiary relationships, and influence tracking.
 */

import { ChangeRecord, AuditMetadata } from './change-tracking';

/**
 * Types of organizations in the system
 */
export type OrganizationType =
  // === GOVERNMENT ===
  | 'FEDERAL_GOVERNMENT'
  | 'STATE_GOVERNMENT'
  | 'LOCAL_GOVERNMENT'
  | 'GOVERNMENT_AGENCY'
  | 'GOVERNMENT_CORPORATION'
  | 'LEGISLATIVE_BODY'
  | 'JUDICIAL_BODY'
  | 'EXECUTIVE_BRANCH'
  | 'REGULATORY_AGENCY'
  | 'LAW_ENFORCEMENT'
  | 'MILITARY'

  // === BUSINESS ===
  | 'CORPORATION'
  | 'LLC'
  | 'PARTNERSHIP'
  | 'SOLE_PROPRIETORSHIP'
  | 'COOPERATIVE'
  | 'B_CORPORATION'
  | 'PUBLIC_BENEFIT_CORP'
  | 'HOLDING_COMPANY'
  | 'SUBSIDIARY'
  | 'JOINT_VENTURE'

  // === NON-PROFIT ===
  | 'NONPROFIT_501C3'
  | 'NONPROFIT_501C4'
  | 'FOUNDATION'
  | 'CHARITY'
  | 'RELIGIOUS_ORG'
  | 'EDUCATIONAL_INSTITUTION'
  | 'RESEARCH_INSTITUTION'

  // === POLITICAL ===
  | 'POLITICAL_PARTY'
  | 'PAC'                    // Political Action Committee
  | 'SUPER_PAC'
  | 'LOBBYING_FIRM'
  | 'CAMPAIGN_COMMITTEE'
  | 'ADVOCACY_GROUP'

  // === LABOR/PROFESSIONAL ===
  | 'LABOR_UNION'
  | 'TRADE_ASSOCIATION'
  | 'PROFESSIONAL_ASSOCIATION'
  | 'GUILD'

  // === FINANCIAL ===
  | 'BANK'
  | 'CREDIT_UNION'
  | 'INVESTMENT_FUND'
  | 'HEDGE_FUND'
  | 'PRIVATE_EQUITY'
  | 'VENTURE_CAPITAL'
  | 'INSURANCE_COMPANY'
  | 'TRUST'
  | 'ESTATE';

/**
 * Organization status
 */
export type OrganizationStatus =
  | 'ACTIVE'              // Currently operating
  | 'INACTIVE'            // Not currently operating
  | 'SUSPENDED'           // Operations suspended
  | 'DISSOLVED'           // Legally dissolved
  | 'MERGED'              // Merged into another org
  | 'ACQUIRED'            // Acquired by another org
  | 'BANKRUPT'            // In bankruptcy proceedings
  | 'UNDER_INVESTIGATION'; // Under government investigation

/**
 * Core Organization entity
 */
export interface Organization {
  // === IDENTITY ===
  id: string;                           // Immutable UUID
  registrationNumber: string;           // Official registration ID
  taxId?: string;                       // Tax identification number

  // === BASIC INFO ===
  legalName: string;                    // Official legal name
  tradeName?: string;                   // DBA / trade name
  type: OrganizationType;
  industry?: string;                    // Primary industry (NAICS code)
  description: string;

  // === LOCATION ===
  headquartersAddress: Address;
  jurisdictionOfIncorporation: string;  // Where legally formed
  operatingRegions: string[];           // All regions where active

  // === DATES ===
  foundedDate: Date;
  incorporationDate?: Date;
  dissolutionDate?: Date;

  // === CONTACT ===
  publicContactEmail: string;
  publicContactPhone?: string;
  website?: string;
  registeredAgent?: RegisteredAgent;

  // === FINANCIALS ===
  employeeCount: number;
  annualRevenue?: number;               // Last reported
  marketCap?: number;                   // For public companies
  fiscalYearEnd?: string;               // e.g., "December 31"

  // === OWNERSHIP STRUCTURE ===
  isPubliclyTraded: boolean;
  stockSymbol?: string;
  stockExchange?: string;
  ownershipStructure: OwnershipStake[];
  ultimateBeneficialOwners: BeneficialOwner[];

  // === HIERARCHY ===
  parentOrganizationId?: string;        // Immediate parent
  ultimateParentId?: string;            // Top of ownership chain
  subsidiaryIds: string[];              // Direct subsidiaries

  // === STATUS ===
  status: OrganizationStatus;
  statusReason?: string;

  // === COMPLIANCE ===
  licenses: License[];
  certifications: Certification[];
  regulatoryFilings: RegulatoryFiling[];

  // === AUDIT ===
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  changeHistory: ChangeRecord[];

  // === METADATA ===
  metadata: AuditMetadata;
}

/**
 * Physical address
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Registered agent for legal service
 */
export interface RegisteredAgent {
  name: string;
  address: Address;
  agentType: 'INDIVIDUAL' | 'COMPANY';
  appointedDate: Date;
}

/**
 * Ownership stake in an organization
 */
export interface OwnershipStake {
  ownerId: string;                      // Person or Organization ID
  ownerType: 'PERSON' | 'ORGANIZATION';
  ownerName: string;
  percentageOwned: number;              // 0-100
  shareClass?: string;                  // e.g., "Class A Common"
  votingRights: boolean;
  votingPower?: number;                 // May differ from ownership %
  acquiredDate: Date;
  acquisitionMethod: 'FOUNDING' | 'PURCHASE' | 'GRANT' | 'INHERITANCE' | 'MERGER';
}

/**
 * Ultimate beneficial owner (human at end of ownership chain)
 */
export interface BeneficialOwner {
  personId: string;
  personName: string;
  percentageBeneficialOwnership: number;
  ownershipChain: string[];             // Path through entities
  controlType: 'OWNERSHIP' | 'VOTING' | 'OTHER_CONTROL';
  verifiedDate: Date;
}

/**
 * Business or professional license
 */
export interface License {
  licenseId: string;
  type: string;
  issuingAuthority: string;
  issuedDate: Date;
  expirationDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  licenseNumber: string;
}

/**
 * Certification (ISO, B-Corp, etc.)
 */
export interface Certification {
  certificationId: string;
  name: string;
  issuingBody: string;
  issuedDate: Date;
  expirationDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  verificationUrl?: string;
}

/**
 * Regulatory filing (SEC, FEC, etc.)
 */
export interface RegulatoryFiling {
  filingId: string;
  filingType: string;                   // e.g., "10-K", "Form D", "FEC Form 1"
  regulatoryBody: string;
  filingDate: Date;
  periodCovered?: { start: Date; end: Date };
  documentUrl?: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';
}

/**
 * Organization relationship types
 */
export type OrganizationRelationshipType =
  | 'PARENT_SUBSIDIARY'       // Parent owns subsidiary
  | 'JOINT_VENTURE'           // Joint ownership
  | 'AFFILIATE'               // Related but not owned
  | 'FRANCHISOR_FRANCHISEE'
  | 'CONTRACTOR'              // Contracted relationship
  | 'VENDOR_CLIENT'
  | 'PARTNER'                 // Business partnership
  | 'MERGER_TARGET'           // Being acquired
  | 'SPIN_OFF'                // Spun off from
  | 'LOBBIES_FOR'             // Lobbying relationship
  | 'REGULATES'               // Regulatory relationship
  | 'FUNDS'                   // Funding relationship
  | 'COMPETES_WITH';          // Competitor

/**
 * Relationship between organizations
 */
export interface OrganizationRelationship {
  id: string;
  sourceOrgId: string;
  sourceOrgName: string;
  targetOrgId: string;
  targetOrgName: string;
  relationshipType: OrganizationRelationshipType;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  financialValue?: number;              // Dollar value if applicable
  changeHistory: ChangeRecord[];
}

/**
 * Search/filter criteria for organizations
 */
export interface OrganizationSearchCriteria {
  name?: string;                        // Fuzzy name match
  type?: OrganizationType;
  status?: OrganizationStatus;
  industry?: string;
  regionId?: string;
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
  ownedByPersonId?: string;
  ownedByOrgId?: string;
  regulatedBy?: string;
  hasLicense?: string;
  dateRange?: { start: Date; end: Date };
}

/**
 * Organization summary for lists/searches
 */
export interface OrganizationSummary {
  id: string;
  legalName: string;
  tradeName?: string;
  type: OrganizationType;
  status: OrganizationStatus;
  industry?: string;
  headquarters: string;                 // City, State
  parentOrgName?: string;
  subsidiaryCount: number;
  employeeCount: number;
  activeLicenses: number;
}
