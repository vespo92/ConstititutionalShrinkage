/**
 * Business Transparency System - Employment Lifecycle Tracking
 *
 * Replaces traditional EEO regulations with radical transparency.
 * Every employment decision must be publicly disclosed with full reasoning.
 *
 * Core Principle: No privacy in business operations - society decides what's acceptable
 * through market forces, not bureaucratic regulations.
 */

export type EmploymentAction =
  | 'APPLICATION_RECEIVED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_EXTENDED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'HIRED'
  | 'NOT_HIRED'
  | 'PROMOTED'
  | 'DEMOTED'
  | 'COMPENSATION_CHANGED'
  | 'ROLE_CHANGED'
  | 'DISCIPLINARY_ACTION'
  | 'PERFORMANCE_REVIEW'
  | 'TERMINATED'
  | 'RESIGNED'
  | 'LAID_OFF';

export type TerminationReason =
  | 'PERFORMANCE'
  | 'MISCONDUCT'
  | 'REDUNDANCY'
  | 'BUSINESS_CLOSURE'
  | 'CULTURAL_FIT'
  | 'BUDGET_CUTS'
  | 'RESTRUCTURING'
  | 'ATTENDANCE'
  | 'POLICY_VIOLATION'
  | 'OTHER';

export interface PersonnelRecord {
  // Unique identifiers
  recordId: string;
  citizenId: string;  // Full public identifier - no anonymization
  businessId: string; // Registered business entity

  // Personal information (fully transparent)
  fullName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;

  // Employment lifecycle
  applicationDate: Date;
  lifecycleEvents: EmploymentEvent[];

  // Current status
  currentStatus: 'APPLICANT' | 'EMPLOYEE' | 'FORMER_EMPLOYEE' | 'REJECTED_APPLICANT';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface EmploymentEvent {
  eventId: string;
  timestamp: Date;
  action: EmploymentAction;

  // MANDATORY: Brutal honesty requirement
  publicReasoning: string;  // Must be detailed and truthful

  // Decision makers (transparent accountability)
  decisionMakerId: string;  // Who made this decision
  decisionMakerName: string;
  decisionMakerTitle: string;

  // Additional context based on action type
  details: EmploymentEventDetails;

  // Public visibility (always true - no hiding)
  isPublic: true;
}

export interface EmploymentEventDetails {
  // Hiring/Not Hiring
  positionTitle?: string;
  department?: string;
  proposedSalary?: number;
  rejectionFactors?: string[];  // Specific reasons for rejection

  // Termination
  terminationReason?: TerminationReason;
  severanceAmount?: number;
  severanceTerms?: string;
  eligibleForRehire?: boolean;

  // Performance
  performanceRating?: number;  // 1-10 scale
  performanceNotes?: string;
  improvementAreas?: string[];
  strengths?: string[];

  // Compensation
  previousSalary?: number;
  newSalary?: number;
  salaryChangeReason?: string;
  bonusAmount?: number;

  // Discipline
  violation?: string;
  disciplinaryAction?: string;
  priorWarnings?: number;
}

export class BusinessTransparencySystem {
  private personnelRecords: Map<string, PersonnelRecord> = new Map();
  private businessRegistry: Map<string, BusinessEntity> = new Map();

  /**
   * Register a business in the transparency system
   * All businesses must register to operate
   */
  registerBusiness(business: BusinessEntity): void {
    if (!business.businessId || !business.legalName) {
      throw new Error('Business must have ID and legal name');
    }

    this.businessRegistry.set(business.businessId, business);
    console.log(`✅ Business registered: ${business.legalName}`);
  }

  /**
   * Record an employment action with MANDATORY public reasoning
   * This replaces all EEO forms and compliance bureaucracy
   */
  recordEmploymentAction(
    citizenId: string,
    businessId: string,
    action: EmploymentAction,
    reasoning: string,
    decisionMaker: DecisionMaker,
    details: EmploymentEventDetails
  ): PersonnelRecord {
    // Validate business is registered
    if (!this.businessRegistry.has(businessId)) {
      throw new Error(`Business ${businessId} not registered in transparency system`);
    }

    // Enforce brutal honesty requirement
    if (!reasoning || reasoning.length < 50) {
      throw new Error(
        'TRANSPARENCY VIOLATION: Reasoning must be detailed (minimum 50 characters). ' +
        'You must be brutally honest about your decisions.'
      );
    }

    // Get or create personnel record
    const recordKey = `${citizenId}-${businessId}`;
    let record = this.personnelRecords.get(recordKey);

    if (!record) {
      // First interaction - create new record
      record = this.createPersonnelRecord(citizenId, businessId);
    }

    // Create employment event
    const event: EmploymentEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      action,
      publicReasoning: reasoning,
      decisionMakerId: decisionMaker.id,
      decisionMakerName: decisionMaker.name,
      decisionMakerTitle: decisionMaker.title,
      details,
      isPublic: true  // Always public - no exceptions
    };

    // Add event to lifecycle
    record.lifecycleEvents.push(event);
    record.updatedAt = new Date();

    // Update current status
    record.currentStatus = this.determineStatus(action, record.currentStatus);

    // Store updated record
    this.personnelRecords.set(recordKey, record);

    // Log to public record
    this.logPublicRecord(record, event);

    return record;
  }

  /**
   * Get complete employment history for a citizen
   * Everything is public - anyone can query
   */
  getPersonnelHistory(citizenId: string, businessId?: string): PersonnelRecord[] {
    const records: PersonnelRecord[] = [];

    for (const [key, record] of this.personnelRecords) {
      if (record.citizenId === citizenId) {
        if (!businessId || record.businessId === businessId) {
          records.push(record);
        }
      }
    }

    return records;
  }

  /**
   * Get all employment actions by a business
   * Public accountability for all hiring/firing decisions
   */
  getBusinessEmploymentHistory(businessId: string): PersonnelRecord[] {
    const records: PersonnelRecord[] = [];

    for (const [key, record] of this.personnelRecords) {
      if (record.businessId === businessId) {
        records.push(record);
      }
    }

    return records;
  }

  /**
   * Analyze employment patterns for discrimination detection
   * Society decides what's acceptable - not government regulations
   */
  analyzeEmploymentPatterns(businessId: string): EmploymentPatternAnalysis {
    const records = this.getBusinessEmploymentHistory(businessId);
    const business = this.businessRegistry.get(businessId);

    if (!business) {
      throw new Error(`Business ${businessId} not found`);
    }

    // Calculate statistics
    const totalApplications = records.filter(r =>
      r.lifecycleEvents.some(e => e.action === 'APPLICATION_RECEIVED')
    ).length;

    const hired = records.filter(r =>
      r.currentStatus === 'EMPLOYEE' ||
      r.lifecycleEvents.some(e => e.action === 'HIRED')
    ).length;

    const terminated = records.filter(r =>
      r.lifecycleEvents.some(e => e.action === 'TERMINATED')
    ).length;

    const resigned = records.filter(r =>
      r.lifecycleEvents.some(e => e.action === 'RESIGNED')
    ).length;

    // Extract termination reasons
    const terminationReasons: Map<TerminationReason | 'N/A', number> = new Map();
    records.forEach(record => {
      const termEvents = record.lifecycleEvents.filter(e => e.action === 'TERMINATED');
      termEvents.forEach(event => {
        const reason = event.details.terminationReason || 'N/A';
        terminationReasons.set(reason, (terminationReasons.get(reason) || 0) + 1);
      });
    });

    // Calculate average tenure (for terminated/resigned employees)
    let totalTenureDays = 0;
    let employeesWithTenure = 0;

    records.forEach(record => {
      const hireEvent = record.lifecycleEvents.find(e => e.action === 'HIRED');
      const exitEvent = record.lifecycleEvents.find(e =>
        e.action === 'TERMINATED' || e.action === 'RESIGNED'
      );

      if (hireEvent && exitEvent) {
        const tenureDays = Math.floor(
          (exitEvent.timestamp.getTime() - hireEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalTenureDays += tenureDays;
        employeesWithTenure++;
      }
    });

    const avgTenureDays = employeesWithTenure > 0
      ? Math.round(totalTenureDays / employeesWithTenure)
      : 0;

    return {
      businessId,
      businessName: business.legalName,
      totalApplications,
      totalHired: hired,
      totalTerminated: terminated,
      totalResigned: resigned,
      currentEmployees: records.filter(r => r.currentStatus === 'EMPLOYEE').length,
      hiringRate: totalApplications > 0 ? hired / totalApplications : 0,
      terminationReasons: Object.fromEntries(terminationReasons),
      averageTenureDays: avgTenureDays,
      analysisDate: new Date()
    };
  }

  /**
   * Search for specific employment decisions
   * Public transparency enables citizen oversight
   */
  searchDecisions(query: {
    action?: EmploymentAction;
    businessId?: string;
    decisionMakerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    reasonContains?: string;
  }): EmploymentEvent[] {
    const results: EmploymentEvent[] = [];

    for (const [key, record] of this.personnelRecords) {
      // Filter by business if specified
      if (query.businessId && record.businessId !== query.businessId) {
        continue;
      }

      // Search through events
      for (const event of record.lifecycleEvents) {
        let matches = true;

        if (query.action && event.action !== query.action) {
          matches = false;
        }

        if (query.decisionMakerId && event.decisionMakerId !== query.decisionMakerId) {
          matches = false;
        }

        if (query.dateFrom && event.timestamp < query.dateFrom) {
          matches = false;
        }

        if (query.dateTo && event.timestamp > query.dateTo) {
          matches = false;
        }

        if (query.reasonContains &&
            !event.publicReasoning.toLowerCase().includes(query.reasonContains.toLowerCase())) {
          matches = false;
        }

        if (matches) {
          results.push(event);
        }
      }
    }

    return results;
  }

  // Private helper methods

  private createPersonnelRecord(citizenId: string, businessId: string): PersonnelRecord {
    return {
      recordId: this.generateRecordId(),
      citizenId,
      businessId,
      fullName: '',  // Would be populated from citizen registry
      contactEmail: '',
      contactPhone: '',
      address: '',
      applicationDate: new Date(),
      lifecycleEvents: [],
      currentStatus: 'APPLICANT',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private determineStatus(
    action: EmploymentAction,
    currentStatus: PersonnelRecord['currentStatus']
  ): PersonnelRecord['currentStatus'] {
    switch (action) {
      case 'HIRED':
        return 'EMPLOYEE';
      case 'NOT_HIRED':
        return 'REJECTED_APPLICANT';
      case 'TERMINATED':
      case 'RESIGNED':
      case 'LAID_OFF':
        return 'FORMER_EMPLOYEE';
      default:
        return currentStatus;
    }
  }

  private generateRecordId(): string {
    return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logPublicRecord(record: PersonnelRecord, event: EmploymentEvent): void {
    console.log('\n📋 PUBLIC EMPLOYMENT RECORD');
    console.log('================================');
    console.log(`Business: ${record.businessId}`);
    console.log(`Citizen: ${record.citizenId}`);
    console.log(`Action: ${event.action}`);
    console.log(`Decision Maker: ${event.decisionMakerName} (${event.decisionMakerTitle})`);
    console.log(`Reasoning: ${event.publicReasoning}`);
    console.log(`Timestamp: ${event.timestamp.toISOString()}`);
    console.log('================================\n');
  }
}

// Supporting interfaces

export interface BusinessEntity {
  businessId: string;
  legalName: string;
  industry: string;
  headquarters: string;
  registrationDate: Date;
  employees: number;
  publicContactEmail: string;
  publicContactPhone: string;
}

export interface DecisionMaker {
  id: string;
  name: string;
  title: string;
}

export interface EmploymentPatternAnalysis {
  businessId: string;
  businessName: string;
  totalApplications: number;
  totalHired: number;
  totalTerminated: number;
  totalResigned: number;
  currentEmployees: number;
  hiringRate: number;
  terminationReasons: Record<string, number>;
  averageTenureDays: number;
  analysisDate: Date;
}

/**
 * EXPORT PUBLIC API
 */

// Create employment record (replacing all EEO forms)
export function recordHiring(
  system: BusinessTransparencySystem,
  citizenId: string,
  businessId: string,
  position: string,
  salary: number,
  reasoning: string,
  decisionMaker: DecisionMaker
): PersonnelRecord {
  return system.recordEmploymentAction(
    citizenId,
    businessId,
    'HIRED',
    reasoning,
    decisionMaker,
    {
      positionTitle: position,
      proposedSalary: salary
    }
  );
}

export function recordRejection(
  system: BusinessTransparencySystem,
  citizenId: string,
  businessId: string,
  position: string,
  reasoning: string,
  rejectionFactors: string[],
  decisionMaker: DecisionMaker
): PersonnelRecord {
  return system.recordEmploymentAction(
    citizenId,
    businessId,
    'NOT_HIRED',
    reasoning,
    decisionMaker,
    {
      positionTitle: position,
      rejectionFactors
    }
  );
}

export function recordTermination(
  system: BusinessTransparencySystem,
  citizenId: string,
  businessId: string,
  reason: TerminationReason,
  detailedReasoning: string,
  severance: number,
  eligibleForRehire: boolean,
  decisionMaker: DecisionMaker
): PersonnelRecord {
  return system.recordEmploymentAction(
    citizenId,
    businessId,
    'TERMINATED',
    detailedReasoning,
    decisionMaker,
    {
      terminationReason: reason,
      severanceAmount: severance,
      eligibleForRehire
    }
  );
}

// Export main class
export default BusinessTransparencySystem;
