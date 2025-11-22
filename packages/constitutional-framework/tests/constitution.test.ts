/**
 * Constitutional Framework Tests
 * Tests for the core constitutional validation and rights management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConstitutionalFramework,
  IMMUTABLE_RIGHTS,
  constitutionalFramework,
} from '../src/constitution';
import { GovernanceLevel, LawStatus, RightCategory, ConflictSeverity } from '../src/types';

describe('ConstitutionalFramework', () => {
  let framework: ConstitutionalFramework;

  beforeEach(() => {
    framework = new ConstitutionalFramework();
  });

  describe('IMMUTABLE_RIGHTS', () => {
    it('should have 7 immutable rights defined', () => {
      expect(IMMUTABLE_RIGHTS).toHaveLength(7);
    });

    it('should include right to self-determination', () => {
      const selfDetermination = IMMUTABLE_RIGHTS.find(r => r.id === 'right-001');
      expect(selfDetermination).toBeDefined();
      expect(selfDetermination?.category).toBe(RightCategory.INDIVIDUAL_SOVEREIGNTY);
      expect(selfDetermination?.level).toBe(GovernanceLevel.IMMUTABLE);
    });

    it('should include freedom of speech', () => {
      const freeSpeech = IMMUTABLE_RIGHTS.find(r => r.id === 'right-002');
      expect(freeSpeech).toBeDefined();
      expect(freeSpeech?.category).toBe(RightCategory.FREEDOM_OF_EXPRESSION);
      expect(freeSpeech?.exceptions).toHaveLength(1);
    });

    it('should include right to privacy in the home', () => {
      const privacy = IMMUTABLE_RIGHTS.find(r => r.id === 'right-003');
      expect(privacy).toBeDefined();
      expect(privacy?.category).toBe(RightCategory.PRIVACY);
    });

    it('should include due process rights', () => {
      const dueProcess = IMMUTABLE_RIGHTS.find(r => r.id === 'right-004');
      expect(dueProcess).toBeDefined();
      expect(dueProcess?.category).toBe(RightCategory.DUE_PROCESS);
    });

    it('should include freedom from victimless crime prosecution', () => {
      const antiCoercion = IMMUTABLE_RIGHTS.find(r => r.id === 'right-005');
      expect(antiCoercion).toBeDefined();
      expect(antiCoercion?.category).toBe(RightCategory.ANTI_COERCION);
    });

    it('should include property rights', () => {
      const propertyRights = IMMUTABLE_RIGHTS.find(r => r.id === 'right-006');
      expect(propertyRights).toBeDefined();
      expect(propertyRights?.category).toBe(RightCategory.PROPERTY_RIGHTS);
    });

    it('should include business transparency rights', () => {
      const businessTransparency = IMMUTABLE_RIGHTS.find(r => r.id === 'right-007');
      expect(businessTransparency).toBeDefined();
      expect(businessTransparency?.category).toBe(RightCategory.BUSINESS_TRANSPARENCY);
    });

    it('all rights should be at IMMUTABLE governance level', () => {
      IMMUTABLE_RIGHTS.forEach(right => {
        expect(right.level).toBe(GovernanceLevel.IMMUTABLE);
      });
    });

    it('all rights should be enforceable', () => {
      IMMUTABLE_RIGHTS.forEach(right => {
        expect(right.enforceable).toBe(true);
      });
    });
  });

  describe('getConstitution', () => {
    it('should return the constitution object', () => {
      const constitution = framework.getConstitution();
      expect(constitution).toBeDefined();
      expect(constitution.version).toBe('1.0.0');
      expect(constitution.immutableRights).toHaveLength(7);
    });

    it('should return a copy, not the original', () => {
      const constitution1 = framework.getConstitution();
      const constitution2 = framework.getConstitution();
      expect(constitution1).not.toBe(constitution2);
    });
  });

  describe('getImmutableRights', () => {
    it('should return all immutable rights', () => {
      const rights = framework.getImmutableRights();
      expect(rights).toHaveLength(7);
    });

    it('should return a copy, not the original array', () => {
      const rights1 = framework.getImmutableRights();
      const rights2 = framework.getImmutableRights();
      expect(rights1).not.toBe(rights2);
    });
  });

  describe('getApplicableRights', () => {
    it('should return all immutable rights for any governance level', () => {
      const rights = framework.getApplicableRights(GovernanceLevel.FEDERAL);
      expect(rights.length).toBeGreaterThanOrEqual(7);
    });

    it('should return immutable rights for regional level', () => {
      const rights = framework.getApplicableRights(GovernanceLevel.REGIONAL);
      expect(rights.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('validateLaw', () => {
    it('should reject laws without sunset date', () => {
      const law = {
        id: 'test-law-001',
        title: 'Test Law',
        content: 'This is a valid law content that does not violate any rights.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        gitBranch: 'bill/test-law',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.validateLaw(law as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_SUNSET')).toBe(true);
    });

    it('should reject laws with past sunset date', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const law = {
        id: 'test-law-002',
        title: 'Test Law',
        content: 'This is a valid law content that does not violate any rights.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: pastDate,
        gitBranch: 'bill/test-law',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.validateLaw(law as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_SUNSET')).toBe(true);
    });

    it('should reject laws with empty content', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'test-law-003',
        title: 'Test Law',
        content: '',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/test-law',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.validateLaw(law as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_CONTENT')).toBe(true);
    });

    it('should accept valid laws', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'test-law-004',
        title: 'Valid Test Law',
        content: 'This is a valid law that promotes public safety without violating any constitutional rights.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/valid-test-law',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.validateLaw(law as any);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('checkConflicts', () => {
    it('should detect privacy violations', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'surveillance-law',
        title: 'Surveillance Law',
        content: 'All citizens must have mandatory surveillance devices in their homes and required tracking of all movements.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/surveillance',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.checkConflicts(law as any);
      expect(result.hasConflict).toBe(true);
      expect(result.conflicts.some(c => c.severity === ConflictSeverity.CONSTITUTIONAL_VIOLATION)).toBe(true);
    });

    it('should detect anti-coercion violations', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'victimless-crime-law',
        title: 'Victimless Crime Law',
        content: 'Any victimless activity shall be criminal and subject to prosecution.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/victimless-crime',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.checkConflicts(law as any);
      expect(result.hasConflict).toBe(true);
    });

    it('should detect due process violations', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'no-trial-law',
        title: 'Summary Justice Law',
        content: 'Suspects may be detained without trial and are presumed guilty with no legal representation.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/summary-justice',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.checkConflicts(law as any);
      expect(result.hasConflict).toBe(true);
    });

    it('should not flag compliant laws', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const law = {
        id: 'safe-law',
        title: 'Public Park Maintenance',
        content: 'This law establishes guidelines for maintaining public parks and green spaces.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/park-maintenance',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const result = framework.checkConflicts(law as any);
      expect(result.hasConflict).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('checkCompatibility', () => {
    it('should validate compatible federal and regional laws', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const federalLaw = {
        id: 'federal-env-law',
        title: 'Federal Environmental Standards',
        content: 'Establishes minimum environmental standards for all regions.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.ACTIVE,
        sunsetDate: futureDate,
        gitBranch: 'bill/federal-env',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const regionalLaw = {
        id: 'regional-env-law',
        title: 'Regional Environmental Standards',
        content: 'Establishes stricter environmental standards for our region, exceeding federal minimums.',
        version: '1.0.0',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/regional-env',
        createdBy: 'citizen-002',
        createdAt: new Date(),
      };

      const isCompatible = framework.checkCompatibility(regionalLaw as any, federalLaw as any);
      expect(isCompatible).toBe(true);
    });

    it('should reject incompatible laws (constitutional violations)', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      const federalLaw = {
        id: 'federal-law',
        title: 'Valid Federal Law',
        content: 'A valid federal law.',
        version: '1.0.0',
        level: GovernanceLevel.FEDERAL,
        status: LawStatus.ACTIVE,
        sunsetDate: futureDate,
        gitBranch: 'bill/federal',
        createdBy: 'citizen-001',
        createdAt: new Date(),
      };

      const unconstitutionalRegionalLaw = {
        id: 'bad-regional-law',
        title: 'Unconstitutional Regional Law',
        content: 'This law requires mandatory surveillance and required tracking of all citizens.',
        version: '1.0.0',
        level: GovernanceLevel.REGIONAL,
        regionId: 'region-001',
        status: LawStatus.DRAFT,
        sunsetDate: futureDate,
        gitBranch: 'bill/bad-regional',
        createdBy: 'citizen-002',
        createdAt: new Date(),
      };

      const isCompatible = framework.checkCompatibility(unconstitutionalRegionalLaw as any, federalLaw as any);
      expect(isCompatible).toBe(false);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(constitutionalFramework).toBeInstanceOf(ConstitutionalFramework);
    });

    it('singleton should have all immutable rights', () => {
      const rights = constitutionalFramework.getImmutableRights();
      expect(rights).toHaveLength(7);
    });
  });
});
