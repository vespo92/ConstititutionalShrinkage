/**
 * Business Transparency - Employment Tests
 * Tests for employment tracking and transparency system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  BusinessTransparencySystem,
  recordHiring,
  recordRejection,
  recordTermination,
  DecisionMaker,
  BusinessEntity,
} from '../src/employment';

describe('BusinessTransparencySystem', () => {
  let system: BusinessTransparencySystem;
  let testBusiness: BusinessEntity;
  let testDecisionMaker: DecisionMaker;

  beforeEach(() => {
    system = new BusinessTransparencySystem();
    testBusiness = {
      businessId: 'ACME-001',
      legalName: 'ACME Corporation',
      industry: 'Manufacturing',
      headquarters: 'Detroit, MI',
      registrationDate: new Date(),
      employees: 500,
      publicContactEmail: 'transparency@acme.com',
      publicContactPhone: '555-0100',
    };
    testDecisionMaker = {
      id: 'mgr-001',
      name: 'Jane Smith',
      title: 'VP of Human Resources',
    };
  });

  describe('Business Registration', () => {
    it('should register a new business', () => {
      expect(() => {
        system.registerBusiness(testBusiness);
      }).not.toThrow();
    });

    it('should reject business without ID', () => {
      const invalidBusiness = { ...testBusiness, businessId: '' };
      expect(() => {
        system.registerBusiness(invalidBusiness);
      }).toThrow('Business must have ID and legal name');
    });

    it('should reject business without legal name', () => {
      const invalidBusiness = { ...testBusiness, legalName: '' };
      expect(() => {
        system.registerBusiness(invalidBusiness);
      }).toThrow('Business must have ID and legal name');
    });
  });

  describe('Employment Actions', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);
    });

    it('should record a hiring action', () => {
      const record = system.recordEmploymentAction(
        'citizen-001',
        'ACME-001',
        'HIRED',
        'Candidate demonstrated exceptional skills in Python and machine learning during technical interviews. Strong cultural fit with team values.',
        testDecisionMaker,
        {
          positionTitle: 'Senior Engineer',
          proposedSalary: 150000,
        }
      );

      expect(record.citizenId).toBe('citizen-001');
      expect(record.businessId).toBe('ACME-001');
      expect(record.currentStatus).toBe('EMPLOYEE');
      expect(record.lifecycleEvents).toHaveLength(1);
      expect(record.lifecycleEvents[0].action).toBe('HIRED');
    });

    it('should record a rejection action', () => {
      const record = system.recordEmploymentAction(
        'citizen-002',
        'ACME-001',
        'NOT_HIRED',
        'Candidate lacked required 5 years of experience in distributed systems. Technical assessment score was 45%, below our threshold of 70%.',
        testDecisionMaker,
        {
          positionTitle: 'Senior Engineer',
          rejectionFactors: ['Insufficient experience', 'Low technical assessment score'],
        }
      );

      expect(record.currentStatus).toBe('REJECTED_APPLICANT');
      expect(record.lifecycleEvents[0].action).toBe('NOT_HIRED');
    });

    it('should record a termination action', () => {
      // First hire the employee
      system.recordEmploymentAction(
        'citizen-003',
        'ACME-001',
        'HIRED',
        'Hired for strong database skills and positive attitude during interviews.',
        testDecisionMaker,
        { positionTitle: 'Database Admin' }
      );

      // Then terminate
      const record = system.recordEmploymentAction(
        'citizen-003',
        'ACME-001',
        'TERMINATED',
        'Employee consistently failed to meet performance targets over 3 consecutive quarters. Multiple documented coaching sessions did not result in improvement.',
        testDecisionMaker,
        {
          terminationReason: 'PERFORMANCE',
          severanceAmount: 25000,
          eligibleForRehire: false,
        }
      );

      expect(record.currentStatus).toBe('FORMER_EMPLOYEE');
      expect(record.lifecycleEvents).toHaveLength(2);
      expect(record.lifecycleEvents[1].action).toBe('TERMINATED');
    });

    it('should reject action on unregistered business', () => {
      expect(() => {
        system.recordEmploymentAction(
          'citizen-001',
          'UNREGISTERED-BIZ',
          'HIRED',
          'Detailed hiring reason with at least fifty characters explaining the decision.',
          testDecisionMaker,
          {}
        );
      }).toThrow('Business UNREGISTERED-BIZ not registered in transparency system');
    });

    it('should reject action with insufficient reasoning', () => {
      expect(() => {
        system.recordEmploymentAction(
          'citizen-001',
          'ACME-001',
          'HIRED',
          'Too short',
          testDecisionMaker,
          {}
        );
      }).toThrow('TRANSPARENCY VIOLATION');
    });

    it('should enforce minimum 50 character reasoning', () => {
      expect(() => {
        system.recordEmploymentAction(
          'citizen-001',
          'ACME-001',
          'HIRED',
          'a'.repeat(49), // Just under 50 chars
          testDecisionMaker,
          {}
        );
      }).toThrow('TRANSPARENCY VIOLATION');

      // 50 chars should work
      expect(() => {
        system.recordEmploymentAction(
          'citizen-001',
          'ACME-001',
          'HIRED',
          'a'.repeat(50),
          testDecisionMaker,
          {}
        );
      }).not.toThrow();
    });

    it('should track decision maker in events', () => {
      const record = system.recordEmploymentAction(
        'citizen-001',
        'ACME-001',
        'HIRED',
        'Detailed reasoning that meets the minimum character requirement for transparency.',
        testDecisionMaker,
        {}
      );

      expect(record.lifecycleEvents[0].decisionMakerId).toBe('mgr-001');
      expect(record.lifecycleEvents[0].decisionMakerName).toBe('Jane Smith');
      expect(record.lifecycleEvents[0].decisionMakerTitle).toBe('VP of Human Resources');
    });

    it('should mark all events as public', () => {
      const record = system.recordEmploymentAction(
        'citizen-001',
        'ACME-001',
        'HIRED',
        'This is a detailed public reasoning for the hiring decision with transparency.',
        testDecisionMaker,
        {}
      );

      expect(record.lifecycleEvents[0].isPublic).toBe(true);
    });
  });

  describe('Personnel History', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);
      system.registerBusiness({
        ...testBusiness,
        businessId: 'CORP-002',
        legalName: 'Other Corp',
      });

      // Create employment records
      system.recordEmploymentAction(
        'citizen-001',
        'ACME-001',
        'HIRED',
        'Hired for exceptional skills and experience that match our requirements perfectly.',
        testDecisionMaker,
        {}
      );

      system.recordEmploymentAction(
        'citizen-001',
        'CORP-002',
        'HIRED',
        'Hired as consultant for specialized project requiring unique expertise in the field.',
        testDecisionMaker,
        {}
      );
    });

    it('should get all personnel history for a citizen', () => {
      const history = system.getPersonnelHistory('citizen-001');
      expect(history).toHaveLength(2);
    });

    it('should filter personnel history by business', () => {
      const history = system.getPersonnelHistory('citizen-001', 'ACME-001');
      expect(history).toHaveLength(1);
      expect(history[0].businessId).toBe('ACME-001');
    });

    it('should return empty array for unknown citizen', () => {
      const history = system.getPersonnelHistory('unknown-citizen');
      expect(history).toHaveLength(0);
    });
  });

  describe('Business Employment History', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);

      for (let i = 1; i <= 3; i++) {
        system.recordEmploymentAction(
          `citizen-00${i}`,
          'ACME-001',
          'HIRED',
          `Hired citizen ${i} for their excellent qualifications and team fit assessment.`,
          testDecisionMaker,
          {}
        );
      }
    });

    it('should get all employment records for a business', () => {
      const history = system.getBusinessEmploymentHistory('ACME-001');
      expect(history).toHaveLength(3);
    });

    it('should return empty array for unknown business', () => {
      const history = system.getBusinessEmploymentHistory('UNKNOWN-BIZ');
      expect(history).toHaveLength(0);
    });
  });

  describe('Employment Pattern Analysis', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);

      // Create various employment records
      system.recordEmploymentAction('citizen-001', 'ACME-001', 'APPLICATION_RECEIVED',
        'Application received for Senior Engineer position from qualified candidate.',
        testDecisionMaker, {});
      system.recordEmploymentAction('citizen-001', 'ACME-001', 'HIRED',
        'Hired after successful interview process and positive reference checks.',
        testDecisionMaker, {});

      system.recordEmploymentAction('citizen-002', 'ACME-001', 'APPLICATION_RECEIVED',
        'Application received for Junior Developer position from recent graduate.',
        testDecisionMaker, {});
      system.recordEmploymentAction('citizen-002', 'ACME-001', 'NOT_HIRED',
        'Position filled by another candidate with more relevant project experience.',
        testDecisionMaker, { rejectionFactors: ['Position filled'] });

      system.recordEmploymentAction('citizen-003', 'ACME-001', 'APPLICATION_RECEIVED',
        'Application received for Marketing Manager position from industry veteran.',
        testDecisionMaker, {});
      system.recordEmploymentAction('citizen-003', 'ACME-001', 'HIRED',
        'Hired for excellent marketing strategy experience and leadership skills.',
        testDecisionMaker, {});
      system.recordEmploymentAction('citizen-003', 'ACME-001', 'TERMINATED',
        'Performance issues over multiple quarters despite coaching and support provided.',
        testDecisionMaker, { terminationReason: 'PERFORMANCE' });
    });

    it('should analyze employment patterns', () => {
      const analysis = system.analyzeEmploymentPatterns('ACME-001');

      expect(analysis.businessId).toBe('ACME-001');
      expect(analysis.businessName).toBe('ACME Corporation');
      expect(analysis.totalApplications).toBe(3);
      expect(analysis.totalHired).toBeGreaterThanOrEqual(2);
      expect(analysis.totalTerminated).toBe(1);
    });

    it('should calculate hiring rate', () => {
      const analysis = system.analyzeEmploymentPatterns('ACME-001');
      expect(analysis.hiringRate).toBeGreaterThan(0);
    });

    it('should track termination reasons', () => {
      const analysis = system.analyzeEmploymentPatterns('ACME-001');
      expect(analysis.terminationReasons).toBeDefined();
      expect(analysis.terminationReasons['PERFORMANCE']).toBe(1);
    });

    it('should throw error for unregistered business', () => {
      expect(() => {
        system.analyzeEmploymentPatterns('UNKNOWN-BIZ');
      }).toThrow('Business UNKNOWN-BIZ not found');
    });
  });

  describe('Search Decisions', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);

      system.recordEmploymentAction('citizen-001', 'ACME-001', 'HIRED',
        'Hired for excellent Python skills and collaborative attitude.',
        testDecisionMaker, {});

      system.recordEmploymentAction('citizen-002', 'ACME-001', 'TERMINATED',
        'Terminated due to consistent performance issues over multiple review periods.',
        { ...testDecisionMaker, id: 'mgr-002', name: 'John Doe' },
        { terminationReason: 'PERFORMANCE' });
    });

    it('should search decisions by action type', () => {
      const results = system.searchDecisions({ action: 'HIRED' });
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every(r => r.action === 'HIRED')).toBe(true);
    });

    it('should search decisions by business', () => {
      const results = system.searchDecisions({ businessId: 'ACME-001' });
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should search decisions by decision maker', () => {
      const results = system.searchDecisions({ decisionMakerId: 'mgr-002' });
      expect(results.length).toBe(1);
      expect(results[0].action).toBe('TERMINATED');
    });

    it('should search decisions by reasoning content', () => {
      const results = system.searchDecisions({ reasonContains: 'Python' });
      expect(results.length).toBe(1);
      expect(results[0].action).toBe('HIRED');
    });

    it('should return empty array when no matches', () => {
      const results = system.searchDecisions({ reasonContains: 'nonexistent term xyz' });
      expect(results).toHaveLength(0);
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      system.registerBusiness(testBusiness);
    });

    it('recordHiring should create a hiring record', () => {
      const record = recordHiring(
        system,
        'citizen-001',
        'ACME-001',
        'Software Engineer',
        120000,
        'Candidate demonstrated strong technical skills in all areas tested during interview.',
        testDecisionMaker
      );

      expect(record.currentStatus).toBe('EMPLOYEE');
      expect(record.lifecycleEvents[0].details.positionTitle).toBe('Software Engineer');
      expect(record.lifecycleEvents[0].details.proposedSalary).toBe(120000);
    });

    it('recordRejection should create a rejection record', () => {
      const record = recordRejection(
        system,
        'citizen-001',
        'ACME-001',
        'Software Engineer',
        'Candidate did not meet the minimum experience requirements for this senior role.',
        ['Insufficient experience', 'Missing required certifications'],
        testDecisionMaker
      );

      expect(record.currentStatus).toBe('REJECTED_APPLICANT');
      expect(record.lifecycleEvents[0].details.rejectionFactors).toContain('Insufficient experience');
    });

    it('recordTermination should create a termination record', () => {
      // First hire
      recordHiring(system, 'citizen-001', 'ACME-001', 'Engineer', 100000,
        'Hired based on strong technical interview performance and references.',
        testDecisionMaker);

      // Then terminate
      const record = recordTermination(
        system,
        'citizen-001',
        'ACME-001',
        'PERFORMANCE',
        'Employee failed to meet targets for three consecutive quarters despite coaching.',
        10000,
        false,
        testDecisionMaker
      );

      expect(record.currentStatus).toBe('FORMER_EMPLOYEE');
      expect(record.lifecycleEvents[1].details.terminationReason).toBe('PERFORMANCE');
      expect(record.lifecycleEvents[1].details.severanceAmount).toBe(10000);
      expect(record.lifecycleEvents[1].details.eligibleForRehire).toBe(false);
    });
  });
});
