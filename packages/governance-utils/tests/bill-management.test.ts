/**
 * Bill Management Tests
 * Tests for git-style bill operations
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBill,
  forkBill,
  generateDiff,
  parseDiff,
  detectConflicts,
  mergeBill,
  addCoSponsor,
  proposeAmendment,
  Bill,
} from '../src/bill-management';
import { GovernanceLevel, LawStatus } from '@constitutional-shrinkage/constitutional-framework';

describe('Bill Management', () => {
  describe('createBill', () => {
    it('should create a new bill with all required fields', () => {
      const bill = createBill({
        title: 'Clean Air Act',
        content: 'This bill establishes standards for air quality...',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      expect(bill.id).toBeDefined();
      expect(bill.title).toBe('Clean Air Act');
      expect(bill.sponsor).toBe('citizen-001');
      expect(bill.status).toBe(LawStatus.DRAFT);
      expect(bill.version).toBe('1.0.0');
    });

    it('should set default sunset date to 5 years', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Test content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);

      // Should be within a day of 5 years from now
      const diffDays = Math.abs(bill.sunsetDate.getTime() - fiveYearsFromNow.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThan(1);
    });

    it('should allow custom sunset years', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Test content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
        sunsetYears: 10,
      });

      const tenYearsFromNow = new Date();
      tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

      const diffDays = Math.abs(bill.sunsetDate.getTime() - tenYearsFromNow.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeLessThan(1);
    });

    it('should generate a git branch name', () => {
      const bill = createBill({
        title: 'Clean Air Act 2025',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      expect(bill.gitBranch).toContain('bill/');
      expect(bill.gitBranch).toContain('clean-air-act');
    });

    it('should initialize with empty co-sponsors and amendments', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      expect(bill.coSponsors).toHaveLength(0);
      expect(bill.amendments).toHaveLength(0);
    });

    it('should initialize votes to zero', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      expect(bill.votes.for).toBe(0);
      expect(bill.votes.against).toBe(0);
      expect(bill.votes.abstain).toBe(0);
      expect(bill.votes.total).toBe(0);
      expect(bill.votes.quorumMet).toBe(false);
    });

    it('should assign region ID for regional bills', () => {
      const bill = createBill({
        title: 'Regional Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      expect(bill.regionId).toBe('region-001');
    });
  });

  describe('forkBill', () => {
    let originalBill: Bill;

    beforeEach(() => {
      originalBill = createBill({
        title: 'Original Bill',
        content: 'Original content here',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });
    });

    it('should create a forked bill with new ID', () => {
      const forkedBill = forkBill(originalBill, 'citizen-002', 'Modified content here');

      expect(forkedBill.id).not.toBe(originalBill.id);
      expect(forkedBill.parentBillId).toBe(originalBill.id);
    });

    it('should set new sponsor', () => {
      const forkedBill = forkBill(originalBill, 'citizen-002', 'Modified content');

      expect(forkedBill.sponsor).toBe('citizen-002');
    });

    it('should reset status to DRAFT', () => {
      originalBill.status = LawStatus.ACTIVE;
      const forkedBill = forkBill(originalBill, 'citizen-002', 'Modified content');

      expect(forkedBill.status).toBe(LawStatus.DRAFT);
    });

    it('should include diff from original', () => {
      const forkedBill = forkBill(originalBill, 'citizen-002', 'Modified content here');

      expect(forkedBill.diff).toBeDefined();
      expect(forkedBill.diff!.length).toBeGreaterThan(0);
    });

    it('should reset co-sponsors', () => {
      originalBill.coSponsors = ['citizen-003', 'citizen-004'];
      const forkedBill = forkBill(originalBill, 'citizen-002', 'Modified content');

      expect(forkedBill.coSponsors).toHaveLength(0);
    });
  });

  describe('generateDiff', () => {
    it('should generate diff for added lines', () => {
      const oldContent = 'Line 1\nLine 2';
      const newContent = 'Line 1\nLine 2\nLine 3';

      const diff = generateDiff(oldContent, newContent);

      expect(diff).toContain('+ Line 3');
    });

    it('should generate diff for removed lines', () => {
      const oldContent = 'Line 1\nLine 2\nLine 3';
      const newContent = 'Line 1\nLine 2';

      const diff = generateDiff(oldContent, newContent);

      expect(diff).toContain('- Line 3');
    });

    it('should generate diff for modified lines', () => {
      const oldContent = 'Line 1\nOriginal Line\nLine 3';
      const newContent = 'Line 1\nModified Line\nLine 3';

      const diff = generateDiff(oldContent, newContent);

      expect(diff).toContain('- Original Line');
      expect(diff).toContain('+ Modified Line');
    });

    it('should show unchanged lines', () => {
      const oldContent = 'Line 1\nLine 2';
      const newContent = 'Line 1\nModified Line 2';

      const diff = generateDiff(oldContent, newContent);

      expect(diff).toContain('  Line 1');
    });

    it('should handle empty content', () => {
      const diff = generateDiff('', 'New content');
      expect(diff).toContain('+ New content');
    });
  });

  describe('parseDiff', () => {
    it('should parse additions', () => {
      const diff = '  Line 1\n+ Added line\n  Line 2';
      const parsed = parseDiff(diff);

      expect(parsed.additions).toContain('Added line');
    });

    it('should parse deletions', () => {
      const diff = '  Line 1\n- Removed line\n  Line 2';
      const parsed = parseDiff(diff);

      expect(parsed.deletions).toContain('Removed line');
    });

    it('should parse modifications', () => {
      const diff = '  Line 1\n- Old line\n+ New line\n  Line 2';
      const parsed = parseDiff(diff);

      expect(parsed.modifications).toHaveLength(1);
      expect(parsed.modifications[0].before).toBe('Old line');
      expect(parsed.modifications[0].after).toBe('New line');
    });
  });

  describe('detectConflicts', () => {
    it('should detect conflict when bills have same level and region', () => {
      const bill1 = createBill({
        title: 'Air Quality Standards',
        content: 'This bill establishes air quality standards for emissions',
        sponsor: 'citizen-001',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      const bill2 = createBill({
        title: 'Emissions Standards',
        content: 'This bill establishes standards for air quality emissions',
        sponsor: 'citizen-002',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      const hasConflict = detectConflicts(bill1, bill2);
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict for different regions', () => {
      const bill1 = createBill({
        title: 'Regional Tax',
        content: 'Tax policy for region one',
        sponsor: 'citizen-001',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      const bill2 = createBill({
        title: 'Regional Tax',
        content: 'Tax policy for region two',
        sponsor: 'citizen-002',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-002',
      });

      const hasConflict = detectConflicts(bill1, bill2);
      expect(hasConflict).toBe(false);
    });

    it('should not detect conflict for different governance levels', () => {
      const bill1 = createBill({
        title: 'Federal Tax',
        content: 'Federal tax policy',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const bill2 = createBill({
        title: 'Regional Tax',
        content: 'Regional tax policy',
        sponsor: 'citizen-002',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
      });

      const hasConflict = detectConflicts(bill1, bill2);
      expect(hasConflict).toBe(false);
    });
  });

  describe('mergeBill', () => {
    it('should merge bill when requirements are met', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      bill.votes = {
        for: 100,
        against: 20,
        abstain: 10,
        total: 130,
        quorumMet: true,
        approvalThresholdMet: true,
      };

      const mergedBill = mergeBill(bill);

      expect(mergedBill.status).toBe(LawStatus.ACTIVE);
      expect(mergedBill.ratifiedAt).toBeDefined();
      expect(mergedBill.gitCommitHash).toBeDefined();
    });

    it('should throw error when quorum not met', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      bill.votes = {
        for: 5,
        against: 1,
        abstain: 0,
        total: 6,
        quorumMet: false,
        approvalThresholdMet: true,
      };

      expect(() => mergeBill(bill)).toThrow('voting requirements not met');
    });

    it('should throw error when approval threshold not met', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      bill.votes = {
        for: 10,
        against: 90,
        abstain: 0,
        total: 100,
        quorumMet: true,
        approvalThresholdMet: false,
      };

      expect(() => mergeBill(bill)).toThrow('voting requirements not met');
    });
  });

  describe('addCoSponsor', () => {
    it('should add a co-sponsor', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const updatedBill = addCoSponsor(bill, 'citizen-002');

      expect(updatedBill.coSponsors).toContain('citizen-002');
    });

    it('should not add duplicate co-sponsor', () => {
      let bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      bill = addCoSponsor(bill, 'citizen-002');
      bill = addCoSponsor(bill, 'citizen-002');

      expect(bill.coSponsors.filter(c => c === 'citizen-002')).toHaveLength(1);
    });

    it('should preserve existing co-sponsors', () => {
      let bill = createBill({
        title: 'Test Bill',
        content: 'Content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      bill = addCoSponsor(bill, 'citizen-002');
      bill = addCoSponsor(bill, 'citizen-003');

      expect(bill.coSponsors).toContain('citizen-002');
      expect(bill.coSponsors).toContain('citizen-003');
    });
  });

  describe('proposeAmendment', () => {
    it('should create an amendment proposal', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Original content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const amendment = proposeAmendment(
        bill,
        'citizen-002',
        'Minor wording change',
        'Modified content'
      );

      expect(amendment.id).toBeDefined();
      expect(amendment.billId).toBe(bill.id);
      expect(amendment.proposedBy).toBe('citizen-002');
      expect(amendment.description).toBe('Minor wording change');
      expect(amendment.status).toBe('proposed');
    });

    it('should include diff in amendment', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Original content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const amendment = proposeAmendment(
        bill,
        'citizen-002',
        'Minor change',
        'Modified content'
      );

      expect(amendment.diff).toBeDefined();
      expect(amendment.diff).toContain('-');
      expect(amendment.diff).toContain('+');
    });

    it('should set createdAt timestamp', () => {
      const bill = createBill({
        title: 'Test Bill',
        content: 'Original content',
        sponsor: 'citizen-001',
        level: GovernanceLevel.FEDERAL,
      });

      const amendment = proposeAmendment(
        bill,
        'citizen-002',
        'Change',
        'Modified content'
      );

      expect(amendment.createdAt).toBeInstanceOf(Date);
    });
  });
});
