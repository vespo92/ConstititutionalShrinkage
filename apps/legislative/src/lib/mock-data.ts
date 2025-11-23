/**
 * Mock Data for Development
 * Will be replaced with real API calls when backend is ready
 */

import type { Bill } from '@constitutional-shrinkage/governance-utils';
import { GovernanceLevel, LawStatus } from '@constitutional-shrinkage/constitutional-framework';
import type { Citizen, VerificationLevel } from '@constitutional-shrinkage/voting-system';

export const mockCitizen: Citizen = {
  id: 'citizen-001',
  publicKey: 'pk_test_abc123',
  regions: ['region-northeast', 'region-national'],
  votingPower: 1.0,
  delegations: [],
  reputation: 85,
  verificationLevel: 'full' as VerificationLevel,
};

export const mockBills: Bill[] = [
  {
    id: 'bill-001',
    title: 'Clean Energy Transition Act',
    content: `# Clean Energy Transition Act

## Purpose
To establish a framework for transitioning to 100% renewable energy by 2035.

## Section 1: Renewable Energy Standards
All electrical utilities shall derive at least:
- 50% of power from renewable sources by 2028
- 75% of power from renewable sources by 2032
- 100% of power from renewable sources by 2035

## Section 2: Incentives
Tax credits of 30% for:
- Solar panel installations
- Wind turbine deployment
- Battery storage systems

## Section 3: Enforcement
The Department of Energy shall:
- Monitor compliance quarterly
- Issue fines for non-compliance
- Publish annual progress reports`,
    version: '1.2.0',
    level: GovernanceLevel.FEDERAL,
    status: LawStatus.VOTING,
    sunsetDate: new Date('2035-12-31'),
    gitBranch: 'bill/clean-energy-transition-act',
    gitCommitHash: 'abc123def456',
    createdBy: 'citizen-001',
    createdAt: new Date('2025-01-15'),
    sponsor: 'Jane Smith',
    coSponsors: ['citizen-002', 'citizen-003', 'citizen-005'],
    amendments: [
      {
        id: 'amendment-001',
        billId: 'bill-001',
        proposedBy: 'citizen-002',
        description: 'Extend deadline for rural utilities',
        diff: '- 100% of power from renewable sources by 2035\n+ 100% of power from renewable sources by 2038 (rural utilities)\n+ 100% of power from renewable sources by 2035 (urban utilities)',
        status: 'proposed',
        createdAt: new Date('2025-02-01'),
      },
    ],
    votes: {
      for: 1245,
      against: 423,
      abstain: 87,
      total: 1755,
      quorumMet: true,
      approvalThresholdMet: true,
    },
  },
  {
    id: 'bill-002',
    title: 'Digital Privacy Protection Act',
    content: `# Digital Privacy Protection Act

## Purpose
To protect citizen data and establish digital privacy rights.

## Section 1: Data Rights
Citizens have the right to:
- Access all personal data held by organizations
- Request deletion of personal data
- Opt-out of data collection
- Port data to other services

## Section 2: Requirements for Organizations
Organizations must:
- Obtain explicit consent before data collection
- Provide clear privacy policies
- Implement security measures
- Report breaches within 72 hours

## Section 3: Penalties
Violations shall result in:
- First offense: Warning and mandatory compliance plan
- Second offense: Fine up to 4% of annual revenue
- Third offense: Operational restrictions`,
    version: '1.0.0',
    level: GovernanceLevel.FEDERAL,
    status: LawStatus.PROPOSED,
    sunsetDate: new Date('2030-12-31'),
    gitBranch: 'bill/digital-privacy-protection-act',
    createdBy: 'citizen-004',
    createdAt: new Date('2025-03-01'),
    sponsor: 'Alex Johnson',
    coSponsors: ['citizen-006'],
    amendments: [],
    votes: {
      for: 0,
      against: 0,
      abstain: 0,
      total: 0,
      quorumMet: false,
      approvalThresholdMet: false,
    },
  },
  {
    id: 'bill-003',
    title: 'Regional Transit Improvement Initiative',
    content: `# Regional Transit Improvement Initiative

## Purpose
To improve public transportation in the Northeast region.

## Section 1: Infrastructure
Investment in:
- Electric bus fleet expansion
- Rail line modernization
- Accessibility improvements

## Section 2: Funding
Allocation of $500 million over 5 years:
- Year 1: Infrastructure assessment ($50M)
- Years 2-3: Bus fleet upgrade ($150M)
- Years 3-5: Rail improvements ($300M)

## Section 3: Metrics
Success measured by:
- 20% increase in ridership
- 30% reduction in emissions
- 15% improvement in on-time performance`,
    version: '2.1.0',
    level: GovernanceLevel.REGIONAL,
    regionId: 'region-northeast',
    status: LawStatus.ACTIVE,
    sunsetDate: new Date('2030-06-30'),
    gitBranch: 'bill/regional-transit-improvement',
    gitCommitHash: 'xyz789abc012',
    createdBy: 'citizen-007',
    createdAt: new Date('2024-06-15'),
    ratifiedAt: new Date('2024-09-01'),
    sponsor: 'Maria Garcia',
    coSponsors: ['citizen-008', 'citizen-009', 'citizen-010', 'citizen-011'],
    amendments: [],
    votes: {
      for: 2341,
      against: 567,
      abstain: 145,
      total: 3053,
      quorumMet: true,
      approvalThresholdMet: true,
    },
  },
  {
    id: 'bill-004',
    title: 'Universal Basic Services Framework',
    content: `# Universal Basic Services Framework

## Purpose
To establish a framework for providing essential services to all citizens.

## Section 1: Covered Services
The following services shall be universally accessible:
- Healthcare (preventive and emergency)
- Education (K-12 and vocational training)
- Internet access (minimum 100 Mbps)
- Public transportation (within urban areas)

## Section 2: Implementation
Services shall be:
- Free at point of use
- Available regardless of income
- Accessible to persons with disabilities

## Section 3: Funding Model
Funded through:
- Progressive taxation adjustments
- Corporate contribution requirements
- Efficiency savings from consolidated services`,
    version: '0.3.0',
    level: GovernanceLevel.FEDERAL,
    status: LawStatus.DRAFT,
    sunsetDate: new Date('2040-12-31'),
    gitBranch: 'bill/universal-basic-services',
    createdBy: 'citizen-012',
    createdAt: new Date('2025-04-01'),
    sponsor: 'Robert Chen',
    coSponsors: [],
    amendments: [],
    votes: {
      for: 0,
      against: 0,
      abstain: 0,
      total: 0,
      quorumMet: false,
      approvalThresholdMet: false,
    },
  },
  {
    id: 'bill-005',
    title: 'Small Business Support Act',
    content: `# Small Business Support Act

## Purpose
To provide support and reduce barriers for small businesses.

## Section 1: Definition
Small business defined as:
- Fewer than 50 employees
- Annual revenue under $10 million
- Independently owned and operated

## Section 2: Support Measures
- Reduced regulatory compliance burden
- Streamlined permitting processes
- Access to low-interest loans
- Free business advisory services

## Section 3: Tax Benefits
- First-year revenue: 0% federal tax
- Years 2-3: 50% tax reduction
- Years 4-5: 25% tax reduction`,
    version: '1.1.0',
    level: GovernanceLevel.FEDERAL,
    status: LawStatus.UNDER_REVIEW,
    sunsetDate: new Date('2032-12-31'),
    gitBranch: 'bill/small-business-support',
    createdBy: 'citizen-015',
    createdAt: new Date('2025-02-15'),
    sponsor: 'Linda Williams',
    coSponsors: ['citizen-016', 'citizen-017'],
    amendments: [
      {
        id: 'amendment-002',
        billId: 'bill-005',
        proposedBy: 'citizen-018',
        description: 'Include micro-businesses with stricter benefits',
        diff: '+ ## Section 4: Micro-Business Enhancement\n+ Businesses with fewer than 5 employees qualify for:\n+ - Complete tax exemption for first 3 years\n+ - Priority access to government contracts',
        status: 'proposed',
        createdAt: new Date('2025-03-10'),
      },
    ],
    votes: {
      for: 0,
      against: 0,
      abstain: 0,
      total: 0,
      quorumMet: false,
      approvalThresholdMet: false,
    },
  },
];

export const regions = [
  { id: 'region-national', name: 'National', level: GovernanceLevel.FEDERAL },
  { id: 'region-northeast', name: 'Northeast', level: GovernanceLevel.REGIONAL },
  { id: 'region-southeast', name: 'Southeast', level: GovernanceLevel.REGIONAL },
  { id: 'region-midwest', name: 'Midwest', level: GovernanceLevel.REGIONAL },
  { id: 'region-southwest', name: 'Southwest', level: GovernanceLevel.REGIONAL },
  { id: 'region-west', name: 'West', level: GovernanceLevel.REGIONAL },
  { id: 'region-pacific', name: 'Pacific', level: GovernanceLevel.REGIONAL },
];

export const statusLabels: Record<LawStatus, string> = {
  [LawStatus.DRAFT]: 'Draft',
  [LawStatus.PROPOSED]: 'Proposed',
  [LawStatus.UNDER_REVIEW]: 'Under Review',
  [LawStatus.VOTING]: 'Voting',
  [LawStatus.ACTIVE]: 'Active Law',
  [LawStatus.SUNSET]: 'Sunset',
  [LawStatus.REPEALED]: 'Repealed',
};

export const levelLabels: Record<GovernanceLevel, string> = {
  [GovernanceLevel.IMMUTABLE]: 'Immutable',
  [GovernanceLevel.FEDERAL]: 'Federal',
  [GovernanceLevel.SUPER_REGIONAL]: 'Super Regional',
  [GovernanceLevel.REGIONAL]: 'Regional',
  [GovernanceLevel.LOCAL]: 'Local',
};
