/**
 * Integration Tests - Bill Workflow
 * Tests the complete legislative workflow from bill creation to law enactment
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createBill, forkBill, mergeBill, proposeAmendment } from '../../packages/governance-utils/src/bill-management';
import { ConstitutionalFramework } from '../../packages/constitutional-framework/src/constitution';
import { VotingSystem } from '../../packages/voting-system/src/voting';
import { GovernanceLevel, LawStatus, VoteChoice, VotingStatus, DelegationScope } from '../../packages/constitutional-framework/src/types';

describe('Bill Workflow Integration', () => {
  let framework: ConstitutionalFramework;
  let votingSystem: VotingSystem;

  beforeEach(() => {
    framework = new ConstitutionalFramework();
    votingSystem = new VotingSystem();

    // Register citizens for voting
    for (let i = 1; i <= 10; i++) {
      votingSystem.registerCitizen({
        id: `citizen-${i.toString().padStart(3, '0')}`,
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });
    }
  });

  describe('Complete Bill Lifecycle', () => {
    it('should create, validate, vote on, and merge a bill', () => {
      // Step 1: Create a bill
      const bill = createBill({
        title: 'Public Parks Enhancement Act',
        content: 'This bill allocates funds for improving public parks across all regions.',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
        sunsetYears: 5,
      });

      expect(bill.status).toBe(LawStatus.DRAFT);
      expect(bill.id).toBeDefined();

      // Step 2: Validate against constitution
      const validation = framework.validateLaw(bill as any);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 3: Create voting session
      const session = votingSystem.createSession({
        billId: bill.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: {
          minimumParticipation: 0.2,
          approvalThreshold: 0.6,
          urgencyModifier: 1,
          impactScaling: 1,
        },
      });

      expect(session.status).toBe(VotingStatus.ACTIVE);

      // Step 4: Cast votes (7 for, 2 against, 1 abstain)
      for (let i = 1; i <= 7; i++) {
        votingSystem.castVote({
          citizenId: `citizen-${i.toString().padStart(3, '0')}`,
          billId: bill.id,
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: `pk${i}`, algorithm: 'Ed25519', timestamp: new Date() },
        });
      }

      for (let i = 8; i <= 9; i++) {
        votingSystem.castVote({
          citizenId: `citizen-${i.toString().padStart(3, '0')}`,
          billId: bill.id,
          choice: VoteChoice.AGAINST,
          signature: { signature: 'b'.repeat(64), publicKey: `pk${i}`, algorithm: 'Ed25519', timestamp: new Date() },
        });
      }

      votingSystem.castVote({
        citizenId: 'citizen-010',
        billId: bill.id,
        choice: VoteChoice.ABSTAIN,
        signature: { signature: 'c'.repeat(64), publicKey: 'pk10', algorithm: 'Ed25519', timestamp: new Date() },
      });

      // Step 5: Check results
      const results = votingSystem.getResults(bill.id);
      expect(results.for).toBe(7);
      expect(results.against).toBe(2);
      expect(results.abstain).toBe(1);
      expect(results.total).toBe(10);

      // Step 6: Merge bill (simulate quorum met and threshold met)
      bill.votes = {
        for: results.for,
        against: results.against,
        abstain: results.abstain,
        total: results.total,
        quorumMet: true,
        approvalThresholdMet: true,
      };

      const law = mergeBill(bill);
      expect(law.status).toBe(LawStatus.ACTIVE);
      expect(law.ratifiedAt).toBeDefined();
    });

    it('should reject unconstitutional bills', () => {
      // Create a bill that violates due process
      const badBill = createBill({
        title: 'Summary Justice Act',
        content: 'All suspects shall be detained without trial and presumed guilty without legal representation.',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      // Validate against constitution
      const validation = framework.validateLaw(badBill as any);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // Check for constitutional violation
      const conflicts = framework.checkConflicts(badBill as any);
      expect(conflicts.hasConflict).toBe(true);
    });

    it('should handle bill forking and amendments', () => {
      // Create original bill
      const originalBill = createBill({
        title: 'Education Funding Act',
        content: 'Allocate $1 billion to public education.',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      // Fork the bill with changes
      const forkedBill = forkBill(
        originalBill,
        'citizen-002',
        'Allocate $2 billion to public education with additional teacher support.'
      );

      expect(forkedBill.parentBillId).toBe(originalBill.id);
      expect(forkedBill.sponsor).toBe('citizen-002');
      expect(forkedBill.diff).toBeDefined();

      // Propose amendment
      const amendment = proposeAmendment(
        originalBill,
        'citizen-003',
        'Increase funding amount',
        'Allocate $1.5 billion to public education.'
      );

      expect(amendment.billId).toBe(originalBill.id);
      expect(amendment.status).toBe('proposed');
    });
  });

  describe('Liquid Democracy Integration', () => {
    it('should handle vote delegation in bill workflow', () => {
      // Citizen 001 delegates to citizen 002
      votingSystem.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });

      // Create bill
      const bill = createBill({
        title: 'Delegation Test Bill',
        content: 'Testing liquid democracy delegation system.',
        sponsor: 'citizen-003',
        level: GovernanceLevel.FEDERAL,
      });

      // Create voting session
      votingSystem.createSession({
        billId: bill.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: {
          minimumParticipation: 0.2,
          approvalThreshold: 0.6,
          urgencyModifier: 1,
          impactScaling: 1,
        },
      });

      // Citizen 002 votes (should have extra weight from delegation)
      const vote = votingSystem.castVote({
        citizenId: 'citizen-002',
        billId: bill.id,
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
      });

      // Vote weight should be 2 (own + delegated)
      expect(vote.weight).toBe(2);

      // Check delegation chain
      expect(vote.delegationChain).toContain('citizen-001');
    });
  });

  describe('Regional Bill Compatibility', () => {
    it('should validate regional law compatibility with federal law', () => {
      const federalLaw = createBill({
        title: 'Federal Environmental Standards',
        content: 'Establishes minimum air quality standards.',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const regionalLaw = createBill({
        title: 'Regional Environmental Standards',
        content: 'Establishes stricter air quality standards exceeding federal minimums.',
        sponsor: 'citizen-002',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      const isCompatible = framework.checkCompatibility(
        regionalLaw as any,
        federalLaw as any
      );

      expect(isCompatible).toBe(true);
    });
  });
});

describe('Multi-Region Bill Processing', () => {
  let votingSystem: VotingSystem;
  let framework: ConstitutionalFramework;

  beforeEach(() => {
    framework = new ConstitutionalFramework();
    votingSystem = new VotingSystem();

    // Register citizens from different regions
    for (let i = 1; i <= 5; i++) {
      votingSystem.registerCitizen({
        id: `region1-citizen-${i}`,
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });
    }

    for (let i = 1; i <= 5; i++) {
      votingSystem.registerCitizen({
        id: `region2-citizen-${i}`,
        regions: ['region-002'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });
    }
  });

  it('should process regional bills independently', () => {
    const region1Bill = createBill({
      title: 'Region 1 Local Tax',
      content: 'Local sales tax adjustment for region 1.',
      sponsor: 'region1-citizen-1',
      level: GovernanceLevel.REGIONAL,
      regionId: 'region-001',
    });

    const region2Bill = createBill({
      title: 'Region 2 Local Tax',
      content: 'Local sales tax adjustment for region 2.',
      sponsor: 'region2-citizen-1',
      level: GovernanceLevel.REGIONAL,
      regionId: 'region-002',
    });

    // Both should be valid independently
    expect(framework.validateLaw(region1Bill as any).valid).toBe(true);
    expect(framework.validateLaw(region2Bill as any).valid).toBe(true);

    // Create separate voting sessions
    votingSystem.createSession({
      billId: region1Bill.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      quorum: { minimumParticipation: 0.4, approvalThreshold: 0.6, urgencyModifier: 1, impactScaling: 1 },
    });

    votingSystem.createSession({
      billId: region2Bill.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      quorum: { minimumParticipation: 0.4, approvalThreshold: 0.6, urgencyModifier: 1, impactScaling: 1 },
    });

    // Region 1 citizens vote on region 1 bill
    for (let i = 1; i <= 4; i++) {
      votingSystem.castVote({
        citizenId: `region1-citizen-${i}`,
        billId: region1Bill.id,
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: `pk-r1-${i}`, algorithm: 'Ed25519', timestamp: new Date() },
      });
    }

    // Region 2 citizens vote on region 2 bill
    for (let i = 1; i <= 3; i++) {
      votingSystem.castVote({
        citizenId: `region2-citizen-${i}`,
        billId: region2Bill.id,
        choice: VoteChoice.FOR,
        signature: { signature: 'b'.repeat(64), publicKey: `pk-r2-${i}`, algorithm: 'Ed25519', timestamp: new Date() },
      });
    }

    const region1Results = votingSystem.getResults(region1Bill.id);
    const region2Results = votingSystem.getResults(region2Bill.id);

    expect(region1Results.for).toBe(4);
    expect(region2Results.for).toBe(3);
  });
});
