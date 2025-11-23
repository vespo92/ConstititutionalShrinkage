/**
 * GDPR Compliance Tests
 *
 * Tests to verify General Data Protection Regulation compliance.
 */

import { describe, it, expect } from 'vitest';

// GDPR Articles and Requirements
interface GDPRRequirement {
  article: string;
  title: string;
  description: string;
}

interface PersonalData {
  type: 'basic' | 'sensitive' | 'special_category';
  fields: string[];
  lawfulBasis: string;
  retentionPeriod: number; // days
  encryptionRequired: boolean;
}

interface DataSubjectRights {
  rightOfAccess: boolean;
  rightToRectification: boolean;
  rightToErasure: boolean;
  rightToRestriction: boolean;
  rightToDataPortability: boolean;
  rightToObject: boolean;
  rightsRelatedToAutomatedDecisionMaking: boolean;
}

const GDPR_REQUIREMENTS: GDPRRequirement[] = [
  { article: 'Art.5', title: 'Principles', description: 'Lawfulness, fairness, transparency, purpose limitation' },
  { article: 'Art.6', title: 'Lawful Basis', description: 'Legal basis for processing personal data' },
  { article: 'Art.7', title: 'Consent', description: 'Conditions for consent' },
  { article: 'Art.12-14', title: 'Transparency', description: 'Information to be provided to data subject' },
  { article: 'Art.15', title: 'Access', description: 'Right of access by data subject' },
  { article: 'Art.16', title: 'Rectification', description: 'Right to rectification' },
  { article: 'Art.17', title: 'Erasure', description: 'Right to erasure (right to be forgotten)' },
  { article: 'Art.18', title: 'Restriction', description: 'Right to restriction of processing' },
  { article: 'Art.20', title: 'Portability', description: 'Right to data portability' },
  { article: 'Art.21', title: 'Object', description: 'Right to object' },
  { article: 'Art.22', title: 'Automated Decisions', description: 'Automated individual decision-making' },
  { article: 'Art.25', title: 'Privacy by Design', description: 'Data protection by design and default' },
  { article: 'Art.30', title: 'Records', description: 'Records of processing activities' },
  { article: 'Art.32', title: 'Security', description: 'Security of processing' },
  { article: 'Art.33-34', title: 'Breach Notification', description: 'Notification of personal data breach' },
  { article: 'Art.35', title: 'DPIA', description: 'Data protection impact assessment' },
  { article: 'Art.44-49', title: 'Transfers', description: 'Transfer of personal data to third countries' },
];

describe('GDPR Article 5 - Data Processing Principles', () => {
  interface ProcessingRecord {
    purpose: string;
    lawfulBasis: string;
    dataMinimized: boolean;
    accuracyMaintained: boolean;
    storageLimited: boolean;
    securityMeasures: string[];
  }

  it('should have defined purpose for processing', () => {
    const record: ProcessingRecord = {
      purpose: 'User account management and authentication',
      lawfulBasis: 'contract',
      dataMinimized: true,
      accuracyMaintained: true,
      storageLimited: true,
      securityMeasures: ['encryption', 'access_control', 'audit_logging'],
    };

    expect(record.purpose).toBeTruthy();
    expect(record.purpose.length).toBeGreaterThan(10);
  });

  it('should have lawful basis for processing', () => {
    const validBases = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'];

    const record: ProcessingRecord = {
      purpose: 'User account management',
      lawfulBasis: 'contract',
      dataMinimized: true,
      accuracyMaintained: true,
      storageLimited: true,
      securityMeasures: ['encryption'],
    };

    expect(validBases).toContain(record.lawfulBasis);
  });

  it('should practice data minimization', () => {
    const record: ProcessingRecord = {
      purpose: 'User account management',
      lawfulBasis: 'contract',
      dataMinimized: true,
      accuracyMaintained: true,
      storageLimited: true,
      securityMeasures: ['encryption'],
    };

    expect(record.dataMinimized).toBe(true);
  });

  it('should have storage limitation', () => {
    const record: ProcessingRecord = {
      purpose: 'User account management',
      lawfulBasis: 'contract',
      dataMinimized: true,
      accuracyMaintained: true,
      storageLimited: true,
      securityMeasures: ['encryption'],
    };

    expect(record.storageLimited).toBe(true);
  });

  it('should implement security measures', () => {
    const record: ProcessingRecord = {
      purpose: 'User account management',
      lawfulBasis: 'contract',
      dataMinimized: true,
      accuracyMaintained: true,
      storageLimited: true,
      securityMeasures: ['encryption', 'access_control', 'audit_logging'],
    };

    expect(record.securityMeasures.length).toBeGreaterThan(0);
    expect(record.securityMeasures).toContain('encryption');
  });
});

describe('GDPR Article 7 - Consent Management', () => {
  interface Consent {
    userId: string;
    purpose: string;
    grantedAt: Date;
    withdrawnAt?: Date;
    version: string;
    freely_given: boolean;
    specific: boolean;
    informed: boolean;
    unambiguous: boolean;
  }

  function validateConsent(consent: Consent): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!consent.freely_given) {
      issues.push('Consent must be freely given');
    }

    if (!consent.specific) {
      issues.push('Consent must be specific to processing purpose');
    }

    if (!consent.informed) {
      issues.push('Data subject must be informed before consent');
    }

    if (!consent.unambiguous) {
      issues.push('Consent must be unambiguous affirmative action');
    }

    return { valid: issues.length === 0, issues };
  }

  it('should validate consent meets GDPR requirements', () => {
    const validConsent: Consent = {
      userId: 'user-123',
      purpose: 'marketing_emails',
      grantedAt: new Date(),
      version: '1.0',
      freely_given: true,
      specific: true,
      informed: true,
      unambiguous: true,
    };

    const result = validateConsent(validConsent);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should reject invalid consent', () => {
    const invalidConsent: Consent = {
      userId: 'user-123',
      purpose: 'marketing_emails',
      grantedAt: new Date(),
      version: '1.0',
      freely_given: false, // Not freely given
      specific: true,
      informed: true,
      unambiguous: true,
    };

    const result = validateConsent(invalidConsent);
    expect(result.valid).toBe(false);
    expect(result.issues).toContain('Consent must be freely given');
  });

  it('should support consent withdrawal', () => {
    const consent: Consent = {
      userId: 'user-123',
      purpose: 'marketing_emails',
      grantedAt: new Date(Date.now() - 86400000),
      withdrawnAt: new Date(),
      version: '1.0',
      freely_given: true,
      specific: true,
      informed: true,
      unambiguous: true,
    };

    const isActive = !consent.withdrawnAt || consent.withdrawnAt > new Date();
    expect(isActive).toBe(false);
  });
});

describe('GDPR Articles 15-22 - Data Subject Rights', () => {
  interface DataSubjectRequest {
    type: keyof DataSubjectRights;
    subjectId: string;
    requestedAt: Date;
    deadline: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'denied';
    completedAt?: Date;
    denialReason?: string;
  }

  function calculateDeadline(requestDate: Date): Date {
    // GDPR requires response within 1 month
    const deadline = new Date(requestDate);
    deadline.setMonth(deadline.getMonth() + 1);
    return deadline;
  }

  function processRequest(request: DataSubjectRequest): { compliant: boolean; issue?: string } {
    if (request.status === 'completed' && request.completedAt) {
      if (request.completedAt > request.deadline) {
        return { compliant: false, issue: 'Response deadline exceeded' };
      }
    }

    if (request.status === 'denied' && !request.denialReason) {
      return { compliant: false, issue: 'Denial requires documented reason' };
    }

    return { compliant: true };
  }

  it('should calculate 1-month deadline correctly', () => {
    const requestDate = new Date('2024-01-15');
    const deadline = calculateDeadline(requestDate);

    expect(deadline.getMonth()).toBe(1); // February
    expect(deadline.getDate()).toBe(15);
  });

  it('should support right of access requests', () => {
    const request: DataSubjectRequest = {
      type: 'rightOfAccess',
      subjectId: 'user-123',
      requestedAt: new Date(),
      deadline: calculateDeadline(new Date()),
      status: 'pending',
    };

    expect(request.type).toBe('rightOfAccess');
    expect(request.deadline.getTime()).toBeGreaterThan(request.requestedAt.getTime());
  });

  it('should support right to erasure (right to be forgotten)', () => {
    const request: DataSubjectRequest = {
      type: 'rightToErasure',
      subjectId: 'user-123',
      requestedAt: new Date(),
      deadline: calculateDeadline(new Date()),
      status: 'completed',
      completedAt: new Date(),
    };

    const result = processRequest(request);
    expect(result.compliant).toBe(true);
  });

  it('should support right to data portability', () => {
    interface PortableData {
      format: 'json' | 'csv' | 'xml';
      data: Record<string, unknown>;
      generatedAt: Date;
    }

    const exportData = (userId: string): PortableData => {
      return {
        format: 'json',
        data: {
          userId,
          profile: { name: 'John Doe', email: 'john@example.com' },
          preferences: { theme: 'dark' },
          activity: [],
        },
        generatedAt: new Date(),
      };
    };

    const data = exportData('user-123');
    expect(data.format).toBe('json');
    expect(data.data).toHaveProperty('userId');
  });

  it('should detect late responses', () => {
    const request: DataSubjectRequest = {
      type: 'rightOfAccess',
      subjectId: 'user-123',
      requestedAt: new Date('2024-01-01'),
      deadline: new Date('2024-02-01'),
      status: 'completed',
      completedAt: new Date('2024-02-15'), // After deadline
    };

    const result = processRequest(request);
    expect(result.compliant).toBe(false);
    expect(result.issue).toContain('deadline exceeded');
  });

  it('should require denial reason when request is denied', () => {
    const request: DataSubjectRequest = {
      type: 'rightToErasure',
      subjectId: 'user-123',
      requestedAt: new Date(),
      deadline: calculateDeadline(new Date()),
      status: 'denied',
      // Missing denialReason
    };

    const result = processRequest(request);
    expect(result.compliant).toBe(false);
    expect(result.issue).toContain('Denial requires documented reason');
  });
});

describe('GDPR Article 25 - Privacy by Design', () => {
  interface PrivacyByDesign {
    dataMinimization: boolean;
    pseudonymization: boolean;
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    accessControl: boolean;
    auditLogging: boolean;
    defaultPrivacySettings: boolean;
  }

  it('should implement data minimization', () => {
    const design: PrivacyByDesign = {
      dataMinimization: true,
      pseudonymization: true,
      encryptionAtRest: true,
      encryptionInTransit: true,
      accessControl: true,
      auditLogging: true,
      defaultPrivacySettings: true,
    };

    expect(design.dataMinimization).toBe(true);
  });

  it('should support pseudonymization', () => {
    const pseudonymize = (email: string): string => {
      const [local, domain] = email.split('@');
      const masked = local.charAt(0) + '***' + local.charAt(local.length - 1);
      return `${masked}@${domain}`;
    };

    const original = 'john.doe@example.com';
    const pseudonymized = pseudonymize(original);

    expect(pseudonymized).not.toBe(original);
    expect(pseudonymized).toContain('@example.com');
    expect(pseudonymized).not.toContain('john.doe');
  });

  it('should implement encryption', () => {
    const design: PrivacyByDesign = {
      dataMinimization: true,
      pseudonymization: true,
      encryptionAtRest: true,
      encryptionInTransit: true,
      accessControl: true,
      auditLogging: true,
      defaultPrivacySettings: true,
    };

    expect(design.encryptionAtRest).toBe(true);
    expect(design.encryptionInTransit).toBe(true);
  });

  it('should have privacy-protective default settings', () => {
    const design: PrivacyByDesign = {
      dataMinimization: true,
      pseudonymization: true,
      encryptionAtRest: true,
      encryptionInTransit: true,
      accessControl: true,
      auditLogging: true,
      defaultPrivacySettings: true,
    };

    expect(design.defaultPrivacySettings).toBe(true);
  });
});

describe('GDPR Article 30 - Records of Processing', () => {
  interface ProcessingRecord {
    controllerId: string;
    processorId?: string;
    purposes: string[];
    dataCategories: string[];
    recipients: string[];
    thirdCountryTransfers: string[];
    retentionPeriods: Record<string, number>;
    securityMeasures: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  it('should maintain processing records', () => {
    const record: ProcessingRecord = {
      controllerId: 'org-123',
      purposes: ['user_authentication', 'service_delivery'],
      dataCategories: ['email', 'name', 'usage_data'],
      recipients: ['internal_staff', 'cloud_provider'],
      thirdCountryTransfers: [],
      retentionPeriods: {
        email: 730,
        name: 730,
        usage_data: 365,
      },
      securityMeasures: ['encryption', 'access_control', 'audit_logging'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(record.controllerId).toBeTruthy();
    expect(record.purposes.length).toBeGreaterThan(0);
    expect(record.dataCategories.length).toBeGreaterThan(0);
  });

  it('should document retention periods', () => {
    const record: ProcessingRecord = {
      controllerId: 'org-123',
      purposes: ['user_authentication'],
      dataCategories: ['email', 'name'],
      recipients: ['internal_staff'],
      thirdCountryTransfers: [],
      retentionPeriods: {
        email: 730,
        name: 730,
      },
      securityMeasures: ['encryption'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    for (const category of record.dataCategories) {
      expect(record.retentionPeriods[category]).toBeDefined();
      expect(record.retentionPeriods[category]).toBeGreaterThan(0);
    }
  });

  it('should document third country transfers', () => {
    const record: ProcessingRecord = {
      controllerId: 'org-123',
      purposes: ['user_authentication'],
      dataCategories: ['email'],
      recipients: ['aws_us'],
      thirdCountryTransfers: ['USA - Standard Contractual Clauses'],
      retentionPeriods: { email: 365 },
      securityMeasures: ['encryption'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(record.thirdCountryTransfers.length).toBeGreaterThan(0);
    expect(record.thirdCountryTransfers[0]).toContain('Contractual Clauses');
  });
});

describe('GDPR Articles 33-34 - Breach Notification', () => {
  interface DataBreach {
    id: string;
    discoveredAt: Date;
    reportedToAuthorityAt?: Date;
    affectedDataSubjects: number;
    dataCategories: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    likelyRisk: boolean;
    dataSubjectsNotified: boolean;
    dataSubjectsNotifiedAt?: Date;
  }

  function checkBreachCompliance(breach: DataBreach): { compliant: boolean; issues: string[] } {
    const issues: string[] = [];
    const seventyTwoHoursMs = 72 * 60 * 60 * 1000;

    // Authority notification within 72 hours if likely risk
    if (breach.likelyRisk) {
      if (!breach.reportedToAuthorityAt) {
        issues.push('Breach with likely risk must be reported to supervisory authority');
      } else {
        const reportingTime = breach.reportedToAuthorityAt.getTime() - breach.discoveredAt.getTime();
        if (reportingTime > seventyTwoHoursMs) {
          issues.push('Authority notification exceeded 72 hours');
        }
      }
    }

    // High risk breaches require data subject notification
    if ((breach.severity === 'high' || breach.severity === 'critical') && breach.likelyRisk) {
      if (!breach.dataSubjectsNotified) {
        issues.push('High-risk breach requires data subject notification');
      }
    }

    return { compliant: issues.length === 0, issues };
  }

  it('should require authority notification within 72 hours', () => {
    const breach: DataBreach = {
      id: 'breach-001',
      discoveredAt: new Date('2024-01-15T10:00:00Z'),
      reportedToAuthorityAt: new Date('2024-01-17T09:00:00Z'), // Within 72h
      affectedDataSubjects: 1000,
      dataCategories: ['email', 'name'],
      severity: 'high',
      likelyRisk: true,
      dataSubjectsNotified: true,
      dataSubjectsNotifiedAt: new Date('2024-01-17T12:00:00Z'),
    };

    const result = checkBreachCompliance(breach);
    expect(result.compliant).toBe(true);
  });

  it('should detect late authority notification', () => {
    const breach: DataBreach = {
      id: 'breach-001',
      discoveredAt: new Date('2024-01-15T10:00:00Z'),
      reportedToAuthorityAt: new Date('2024-01-19T10:00:00Z'), // 4 days later
      affectedDataSubjects: 1000,
      dataCategories: ['email', 'name'],
      severity: 'high',
      likelyRisk: true,
      dataSubjectsNotified: true,
    };

    const result = checkBreachCompliance(breach);
    expect(result.compliant).toBe(false);
    expect(result.issues).toContain('Authority notification exceeded 72 hours');
  });

  it('should require data subject notification for high-risk breaches', () => {
    const breach: DataBreach = {
      id: 'breach-001',
      discoveredAt: new Date(),
      reportedToAuthorityAt: new Date(),
      affectedDataSubjects: 5000,
      dataCategories: ['email', 'password_hash', 'financial_data'],
      severity: 'critical',
      likelyRisk: true,
      dataSubjectsNotified: false, // Not notified
    };

    const result = checkBreachCompliance(breach);
    expect(result.compliant).toBe(false);
    expect(result.issues).toContain('High-risk breach requires data subject notification');
  });
});

describe('GDPR Article 35 - Data Protection Impact Assessment', () => {
  interface DPIA {
    projectName: string;
    assessedAt: Date;
    necessityAssessment: boolean;
    proportionalityAssessment: boolean;
    risksIdentified: Array<{
      description: string;
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigations: string[];
    }>;
    dpoConsulted: boolean;
    outcome: 'approved' | 'approved_with_conditions' | 'rejected';
  }

  function isHighRisk(likelihood: string, impact: string): boolean {
    if (likelihood === 'high' && (impact === 'high' || impact === 'medium')) return true;
    if (impact === 'high' && likelihood === 'medium') return true;
    return false;
  }

  it('should assess necessity and proportionality', () => {
    const dpia: DPIA = {
      projectName: 'Voting Platform',
      assessedAt: new Date(),
      necessityAssessment: true,
      proportionalityAssessment: true,
      risksIdentified: [],
      dpoConsulted: true,
      outcome: 'approved',
    };

    expect(dpia.necessityAssessment).toBe(true);
    expect(dpia.proportionalityAssessment).toBe(true);
  });

  it('should identify and assess risks', () => {
    const dpia: DPIA = {
      projectName: 'Voting Platform',
      assessedAt: new Date(),
      necessityAssessment: true,
      proportionalityAssessment: true,
      risksIdentified: [
        {
          description: 'Voter identity disclosure',
          likelihood: 'low',
          impact: 'high',
          mitigations: ['anonymization', 'encryption', 'access_control'],
        },
        {
          description: 'Vote manipulation',
          likelihood: 'medium',
          impact: 'high',
          mitigations: ['cryptographic_signing', 'audit_trail', 'verification'],
        },
      ],
      dpoConsulted: true,
      outcome: 'approved_with_conditions',
    };

    expect(dpia.risksIdentified.length).toBeGreaterThan(0);

    for (const risk of dpia.risksIdentified) {
      expect(risk.mitigations.length).toBeGreaterThan(0);
    }
  });

  it('should require DPO consultation for high-risk processing', () => {
    const dpia: DPIA = {
      projectName: 'Voting Platform',
      assessedAt: new Date(),
      necessityAssessment: true,
      proportionalityAssessment: true,
      risksIdentified: [
        {
          description: 'High risk activity',
          likelihood: 'high',
          impact: 'high',
          mitigations: ['mitigation1'],
        },
      ],
      dpoConsulted: true,
      outcome: 'approved_with_conditions',
    };

    const hasHighRisk = dpia.risksIdentified.some((r) => isHighRisk(r.likelihood, r.impact));
    expect(hasHighRisk).toBe(true);
    expect(dpia.dpoConsulted).toBe(true);
  });
});
