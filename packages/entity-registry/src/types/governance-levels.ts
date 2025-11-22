/**
 * GOVERNANCE LEVELS & JURISDICTIONS
 *
 * Hierarchical structure from Township → County → State → Federal
 * Each level has specific officials, record types, and data sources.
 */

import { OrganizationType } from './organizations';

/**
 * Governance level hierarchy
 */
export type GovernanceLevel =
  | 'TOWNSHIP'        // Smallest unit - townships, boroughs, villages
  | 'MUNICIPALITY'    // Cities, towns
  | 'COUNTY'          // County government
  | 'REGIONAL'        // Multi-county authorities, districts
  | 'STATE'           // State government
  | 'FEDERAL';        // Federal government

/**
 * Jurisdiction - a specific governmental unit
 */
export interface Jurisdiction {
  id: string;
  name: string;                         // e.g., "Manheim Township"
  level: GovernanceLevel;
  type: JurisdictionType;

  // === LOCATION ===
  state: string;                        // State code (PA, CA, etc.)
  county?: string;                      // County name (for local)
  fipsCode?: string;                    // Federal Information Processing Standard code
  censusGeoId?: string;                 // Census geographic ID

  // === HIERARCHY ===
  parentJurisdictionId?: string;        // Parent in hierarchy
  childJurisdictionIds: string[];       // Children in hierarchy

  // === GOVERNANCE ===
  governmentType: LocalGovernmentType;
  legislativeBodyName?: string;         // e.g., "Board of Supervisors"
  executiveTitle?: string;              // e.g., "Township Manager"

  // === POPULATION & TERRITORY ===
  population?: number;
  populationYear?: number;
  areaSqMiles?: number;

  // === CONTACT ===
  websiteUrl?: string;
  physicalAddress?: string;
  mailingAddress?: string;
  mainPhone?: string;
  clerkEmail?: string;

  // === DATA ACCESS ===
  foiaLawName: string;                  // e.g., "Right-to-Know Law"
  foiaContactEmail?: string;
  foiaResponseDays: number;             // Statutory response time
  hasOnlineRecords: boolean;
  recordsPortalUrl?: string;

  // === TRACKING STATUS ===
  trackingStatus: TrackingStatus;
  firstTrackedDate?: Date;
  lastUpdatedDate?: Date;
  documentersAssigned: number;

  // === METADATA ===
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Types of jurisdictions
 */
export type JurisdictionType =
  // Local
  | 'TOWNSHIP'
  | 'BOROUGH'
  | 'VILLAGE'
  | 'CITY'
  | 'TOWN'

  // County
  | 'COUNTY'
  | 'PARISH'              // Louisiana
  | 'BOROUGH_COUNTY'      // Alaska

  // Regional
  | 'SCHOOL_DISTRICT'
  | 'WATER_AUTHORITY'
  | 'TRANSIT_AUTHORITY'
  | 'SPECIAL_DISTRICT'

  // State
  | 'STATE'
  | 'COMMONWEALTH'        // PA, MA, VA, KY
  | 'TERRITORY'

  // Federal
  | 'FEDERAL'
  | 'CONGRESSIONAL_DISTRICT'
  | 'FEDERAL_JUDICIAL_DISTRICT';

/**
 * Form of local government
 */
export type LocalGovernmentType =
  // Township forms
  | 'FIRST_CLASS_TOWNSHIP'
  | 'SECOND_CLASS_TOWNSHIP'
  | 'TOWNSHIP_SUPERVISOR'

  // Municipal forms
  | 'MAYOR_COUNCIL_STRONG'      // Strong mayor
  | 'MAYOR_COUNCIL_WEAK'        // Weak mayor
  | 'COUNCIL_MANAGER'           // Professional manager
  | 'COMMISSION'                // Commission form
  | 'TOWN_MEETING'              // New England style
  | 'REPRESENTATIVE_TOWN_MEETING'

  // County forms
  | 'COMMISSION_COUNTY'
  | 'COUNCIL_ADMINISTRATOR'
  | 'COUNCIL_ELECTED_EXECUTIVE'
  | 'HOME_RULE_COUNTY'
  | 'CHARTER_COUNTY'

  // State
  | 'STATE_GOVERNMENT'

  // Federal
  | 'FEDERAL_GOVERNMENT';

/**
 * Tracking status for a jurisdiction
 */
export type TrackingStatus =
  | 'NOT_STARTED'         // Haven't begun tracking
  | 'FOIA_PENDING'        // FOIA requests submitted
  | 'DATA_COLLECTION'     // Actively collecting data
  | 'PARTIAL_COVERAGE'    // Some data tracked
  | 'FULL_COVERAGE'       // Complete tracking
  | 'MAINTAINED';         // Ongoing maintenance

/**
 * Officials by level - who to track at each tier
 */
export const OFFICIALS_BY_LEVEL: Record<GovernanceLevel, OfficialPosition[]> = {
  TOWNSHIP: [
    { title: 'Township Supervisor', type: 'ELECTED', typical_count: '3-5' },
    { title: 'Township Manager', type: 'APPOINTED', typical_count: '1' },
    { title: 'Township Secretary', type: 'ELECTED_OR_APPOINTED', typical_count: '1' },
    { title: 'Tax Collector', type: 'ELECTED', typical_count: '1' },
    { title: 'Township Solicitor', type: 'APPOINTED', typical_count: '1' },
    { title: 'Township Engineer', type: 'APPOINTED', typical_count: '1' },
    { title: 'Zoning Officer', type: 'APPOINTED', typical_count: '1' },
    { title: 'Planning Commission Member', type: 'APPOINTED', typical_count: '5-7' },
    { title: 'Zoning Hearing Board Member', type: 'APPOINTED', typical_count: '3-5' },
  ],

  MUNICIPALITY: [
    { title: 'Mayor', type: 'ELECTED', typical_count: '1' },
    { title: 'Council Member', type: 'ELECTED', typical_count: '5-9' },
    { title: 'City Manager', type: 'APPOINTED', typical_count: '0-1' },
    { title: 'City Clerk', type: 'ELECTED_OR_APPOINTED', typical_count: '1' },
    { title: 'City Solicitor', type: 'APPOINTED', typical_count: '1' },
    { title: 'Police Chief', type: 'APPOINTED', typical_count: '1' },
    { title: 'Fire Chief', type: 'APPOINTED', typical_count: '1' },
    { title: 'Public Works Director', type: 'APPOINTED', typical_count: '1' },
    { title: 'Finance Director', type: 'APPOINTED', typical_count: '1' },
  ],

  COUNTY: [
    { title: 'County Commissioner', type: 'ELECTED', typical_count: '3-9' },
    { title: 'County Executive', type: 'ELECTED', typical_count: '0-1' },
    { title: 'County Administrator', type: 'APPOINTED', typical_count: '0-1' },
    { title: 'Sheriff', type: 'ELECTED', typical_count: '1' },
    { title: 'District Attorney', type: 'ELECTED', typical_count: '1' },
    { title: 'County Treasurer', type: 'ELECTED', typical_count: '1' },
    { title: 'County Clerk', type: 'ELECTED', typical_count: '1' },
    { title: 'Recorder of Deeds', type: 'ELECTED', typical_count: '1' },
    { title: 'Register of Wills', type: 'ELECTED', typical_count: '1' },
    { title: 'Prothonotary', type: 'ELECTED', typical_count: '1' },
    { title: 'Controller', type: 'ELECTED', typical_count: '1' },
    { title: 'Coroner', type: 'ELECTED', typical_count: '1' },
    { title: 'County Assessor', type: 'ELECTED', typical_count: '1' },
    { title: 'Court of Common Pleas Judge', type: 'ELECTED', typical_count: '1-20+' },
  ],

  REGIONAL: [
    { title: 'Authority Board Member', type: 'APPOINTED', typical_count: '5-9' },
    { title: 'Authority Executive Director', type: 'APPOINTED', typical_count: '1' },
    { title: 'School Board Member', type: 'ELECTED', typical_count: '9' },
    { title: 'School Superintendent', type: 'APPOINTED', typical_count: '1' },
  ],

  STATE: [
    { title: 'Governor', type: 'ELECTED', typical_count: '1' },
    { title: 'Lieutenant Governor', type: 'ELECTED', typical_count: '1' },
    { title: 'Attorney General', type: 'ELECTED', typical_count: '1' },
    { title: 'Secretary of State', type: 'ELECTED_OR_APPOINTED', typical_count: '1' },
    { title: 'State Treasurer', type: 'ELECTED', typical_count: '1' },
    { title: 'Auditor General', type: 'ELECTED', typical_count: '1' },
    { title: 'State Senator', type: 'ELECTED', typical_count: '30-67' },
    { title: 'State Representative', type: 'ELECTED', typical_count: '40-400' },
    { title: 'Cabinet Secretary', type: 'APPOINTED', typical_count: '15-25' },
    { title: 'Supreme Court Justice', type: 'ELECTED_OR_APPOINTED', typical_count: '5-9' },
    { title: 'Superior Court Judge', type: 'ELECTED_OR_APPOINTED', typical_count: 'varies' },
  ],

  FEDERAL: [
    { title: 'President', type: 'ELECTED', typical_count: '1' },
    { title: 'Vice President', type: 'ELECTED', typical_count: '1' },
    { title: 'US Senator', type: 'ELECTED', typical_count: '100' },
    { title: 'US Representative', type: 'ELECTED', typical_count: '435' },
    { title: 'Cabinet Secretary', type: 'APPOINTED', typical_count: '15' },
    { title: 'Agency Head', type: 'APPOINTED', typical_count: '400+' },
    { title: 'US Attorney', type: 'APPOINTED', typical_count: '94' },
    { title: 'Federal Judge', type: 'APPOINTED', typical_count: '870+' },
    { title: 'Supreme Court Justice', type: 'APPOINTED', typical_count: '9' },
    { title: 'Ambassador', type: 'APPOINTED', typical_count: '190+' },
  ],
};

/**
 * Official position template
 */
export interface OfficialPosition {
  title: string;
  type: 'ELECTED' | 'APPOINTED' | 'ELECTED_OR_APPOINTED';
  typical_count: string;
}

/**
 * Data types available at each level
 */
export const DATA_TYPES_BY_LEVEL: Record<GovernanceLevel, DataTypeAvailability[]> = {
  TOWNSHIP: [
    { type: 'MEETING_MINUTES', availability: 'PUBLIC', typical_source: 'Township website/clerk' },
    { type: 'ORDINANCES', availability: 'PUBLIC', typical_source: 'Codified ordinances' },
    { type: 'RESOLUTIONS', availability: 'PUBLIC', typical_source: 'Meeting records' },
    { type: 'BUDGET', availability: 'PUBLIC', typical_source: 'Annual budget docs' },
    { type: 'CONTRACTS', availability: 'FOIA', typical_source: 'Bid awards' },
    { type: 'PERSONNEL', availability: 'PARTIAL_FOIA', typical_source: 'HR records' },
    { type: 'ZONING_DECISIONS', availability: 'PUBLIC', typical_source: 'Zoning board' },
    { type: 'PERMITS', availability: 'PUBLIC', typical_source: 'Permit office' },
  ],

  MUNICIPALITY: [
    { type: 'MEETING_MINUTES', availability: 'PUBLIC', typical_source: 'City website/clerk' },
    { type: 'ORDINANCES', availability: 'PUBLIC', typical_source: 'Municipal code' },
    { type: 'BUDGET', availability: 'PUBLIC', typical_source: 'Finance dept' },
    { type: 'CONTRACTS', availability: 'FOIA', typical_source: 'Purchasing' },
    { type: 'POLICE_REPORTS', availability: 'PARTIAL_FOIA', typical_source: 'Police dept' },
    { type: 'BUILDING_PERMITS', availability: 'PUBLIC', typical_source: 'Building dept' },
    { type: 'BUSINESS_LICENSES', availability: 'PUBLIC', typical_source: 'Clerk' },
  ],

  COUNTY: [
    { type: 'COURT_RECORDS', availability: 'PUBLIC', typical_source: 'Court system' },
    { type: 'PROPERTY_RECORDS', availability: 'PUBLIC', typical_source: 'Recorder of Deeds' },
    { type: 'ELECTION_RESULTS', availability: 'PUBLIC', typical_source: 'Board of Elections' },
    { type: 'TAX_RECORDS', availability: 'PUBLIC', typical_source: 'Treasurer' },
    { type: 'CRIMINAL_DOCKET', availability: 'PUBLIC', typical_source: 'DA/Court' },
    { type: 'CIVIL_DOCKET', availability: 'PUBLIC', typical_source: 'Prothonotary' },
    { type: 'DEATH_RECORDS', availability: 'RESTRICTED', typical_source: 'Coroner' },
    { type: 'SHERIFF_SALES', availability: 'PUBLIC', typical_source: 'Sheriff' },
  ],

  REGIONAL: [
    { type: 'BOARD_MINUTES', availability: 'PUBLIC', typical_source: 'Authority website' },
    { type: 'BUDGET', availability: 'PUBLIC', typical_source: 'Annual report' },
    { type: 'SCHOOL_BOARD_MINUTES', availability: 'PUBLIC', typical_source: 'District website' },
    { type: 'TEACHER_SALARIES', availability: 'PUBLIC', typical_source: 'State database' },
  ],

  STATE: [
    { type: 'LEGISLATION', availability: 'PUBLIC', typical_source: 'LegiScan/State website' },
    { type: 'ROLL_CALL_VOTES', availability: 'PUBLIC', typical_source: 'Legislature website' },
    { type: 'CAMPAIGN_FINANCE', availability: 'PUBLIC', typical_source: 'Sec of State' },
    { type: 'LOBBYING_DISCLOSURE', availability: 'PUBLIC', typical_source: 'Ethics commission' },
    { type: 'EXECUTIVE_ORDERS', availability: 'PUBLIC', typical_source: 'Governor website' },
    { type: 'STATE_CONTRACTS', availability: 'FOIA', typical_source: 'Procurement' },
    { type: 'COURT_OPINIONS', availability: 'PUBLIC', typical_source: 'Court system' },
    { type: 'REGULATORY_FILINGS', availability: 'PUBLIC', typical_source: 'Agency websites' },
  ],

  FEDERAL: [
    { type: 'LEGISLATION', availability: 'PUBLIC', typical_source: 'Congress.gov' },
    { type: 'ROLL_CALL_VOTES', availability: 'PUBLIC', typical_source: 'Congress.gov' },
    { type: 'CAMPAIGN_FINANCE', availability: 'PUBLIC', typical_source: 'FEC/OpenSecrets' },
    { type: 'LOBBYING_DISCLOSURE', availability: 'PUBLIC', typical_source: 'Senate LDA' },
    { type: 'EXECUTIVE_ORDERS', availability: 'PUBLIC', typical_source: 'Federal Register' },
    { type: 'FEDERAL_CONTRACTS', availability: 'PUBLIC', typical_source: 'USASpending' },
    { type: 'GRANTS', availability: 'PUBLIC', typical_source: 'USASpending' },
    { type: 'COURT_RECORDS', availability: 'PAID', typical_source: 'PACER' },
    { type: 'REGULATIONS', availability: 'PUBLIC', typical_source: 'Federal Register' },
    { type: 'AGENCY_FOIA', availability: 'FOIA', typical_source: 'Agency specific' },
  ],
};

/**
 * Data type availability info
 */
export interface DataTypeAvailability {
  type: string;
  availability: 'PUBLIC' | 'FOIA' | 'PARTIAL_FOIA' | 'PAID' | 'RESTRICTED';
  typical_source: string;
}

/**
 * External data source API/endpoint
 */
export interface DataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  apiUrl?: string;
  apiKeyRequired: boolean;
  rateLimit?: string;                   // e.g., "30000/month"
  dataTypes: string[];
  governanceLevels: GovernanceLevel[];
  coverage: string;                     // e.g., "All 50 states" or "Federal only"
  updateFrequency: string;              // e.g., "Real-time" or "Daily"
  cost: 'FREE' | 'FREEMIUM' | 'PAID';
  bulkDataAvailable: boolean;
}

/**
 * Known external data sources
 */
export const EXTERNAL_DATA_SOURCES: DataSource[] = [
  {
    id: 'congress-gov',
    name: 'Congress.gov API',
    description: 'Official Library of Congress API for federal legislation',
    url: 'https://www.congress.gov',
    apiUrl: 'https://api.congress.gov/v3',
    apiKeyRequired: true,
    dataTypes: ['LEGISLATION', 'AMENDMENTS', 'VOTES', 'MEMBERS', 'COMMITTEES'],
    governanceLevels: ['FEDERAL'],
    coverage: 'Federal only',
    updateFrequency: 'Real-time',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
  {
    id: 'propublica-congress',
    name: 'ProPublica Congress API',
    description: 'Congressional data from 1995+',
    url: 'https://projects.propublica.org/api-docs/congress-api/',
    apiUrl: 'https://api.propublica.org/congress/v1',
    apiKeyRequired: true,
    dataTypes: ['LEGISLATION', 'VOTES', 'MEMBERS', 'COMMITTEES', 'STATEMENTS'],
    governanceLevels: ['FEDERAL'],
    coverage: 'Federal only, 1995+',
    updateFrequency: 'Daily',
    cost: 'FREE',
    bulkDataAvailable: false,
  },
  {
    id: 'legiscan',
    name: 'LegiScan API',
    description: 'State and federal legislation tracking',
    url: 'https://legiscan.com',
    apiUrl: 'https://api.legiscan.com',
    apiKeyRequired: true,
    rateLimit: '30000/month',
    dataTypes: ['LEGISLATION', 'VOTES', 'SPONSORS', 'BILL_TEXT'],
    governanceLevels: ['STATE', 'FEDERAL'],
    coverage: 'All 50 states + Congress',
    updateFrequency: 'Real-time',
    cost: 'FREEMIUM',
    bulkDataAvailable: true,
  },
  {
    id: 'opensecrets',
    name: 'OpenSecrets',
    description: 'Campaign finance and lobbying data',
    url: 'https://www.opensecrets.org',
    apiUrl: 'https://www.opensecrets.org/api',
    apiKeyRequired: true,
    dataTypes: ['CAMPAIGN_FINANCE', 'LOBBYING', 'PERSONAL_FINANCES'],
    governanceLevels: ['FEDERAL', 'STATE'],
    coverage: 'Federal + some states',
    updateFrequency: 'Varies by dataset',
    cost: 'FREEMIUM',
    bulkDataAvailable: true,
  },
  {
    id: 'fec',
    name: 'FEC API',
    description: 'Federal Election Commission official data',
    url: 'https://www.fec.gov/data',
    apiUrl: 'https://api.open.fec.gov/v1',
    apiKeyRequired: true,
    dataTypes: ['CAMPAIGN_FINANCE', 'CANDIDATES', 'COMMITTEES', 'FILINGS'],
    governanceLevels: ['FEDERAL'],
    coverage: 'Federal elections',
    updateFrequency: 'As filed',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
  {
    id: 'usaspending',
    name: 'USASpending API',
    description: 'Federal spending, contracts, and grants',
    url: 'https://www.usaspending.gov',
    apiUrl: 'https://api.usaspending.gov',
    apiKeyRequired: false,
    dataTypes: ['CONTRACTS', 'GRANTS', 'LOANS', 'DIRECT_PAYMENTS'],
    governanceLevels: ['FEDERAL'],
    coverage: 'All federal spending',
    updateFrequency: 'Real-time',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
  {
    id: 'federal-register',
    name: 'Federal Register API',
    description: 'Regulations, executive orders, notices',
    url: 'https://www.federalregister.gov',
    apiUrl: 'https://www.federalregister.gov/api/v1',
    apiKeyRequired: false,
    dataTypes: ['REGULATIONS', 'EXECUTIVE_ORDERS', 'NOTICES', 'RULES'],
    governanceLevels: ['FEDERAL'],
    coverage: 'Federal regulations',
    updateFrequency: 'Daily',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
  {
    id: 'open-states',
    name: 'Open States',
    description: 'State legislative data',
    url: 'https://openstates.org',
    apiUrl: 'https://v3.openstates.org',
    apiKeyRequired: true,
    dataTypes: ['LEGISLATION', 'LEGISLATORS', 'VOTES', 'COMMITTEES'],
    governanceLevels: ['STATE'],
    coverage: 'All 50 states',
    updateFrequency: 'Varies',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
  {
    id: 'govtrack',
    name: 'GovTrack',
    description: 'Congressional tracking and analysis',
    url: 'https://www.govtrack.us',
    apiUrl: 'https://www.govtrack.us/api/v2',
    apiKeyRequired: false,
    dataTypes: ['LEGISLATION', 'VOTES', 'MEMBERS', 'ANALYSIS'],
    governanceLevels: ['FEDERAL'],
    coverage: 'Congress',
    updateFrequency: 'Daily',
    cost: 'FREE',
    bulkDataAvailable: true,
  },
];
