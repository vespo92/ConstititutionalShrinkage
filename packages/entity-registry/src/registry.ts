/**
 * ENTITY REGISTRY
 *
 * The core "git for government" system.
 * Tracks all entities (people, organizations, documents) with full
 * version control, blame, and audit history.
 *
 * Every change is recorded. Every actor is tracked. Nothing is forgotten.
 */

// Simple ID and hash generation (replace with crypto in production)
function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}
import {
  Person,
  PersonSearchCriteria,
  PersonSummary,
  VerificationLevel,
  PersonStatus,
} from './types/people';
import {
  Organization,
  OrganizationType,
  OrganizationStatus,
  OrganizationSearchCriteria,
  OrganizationSummary,
  OwnershipStake,
  BeneficialOwner,
} from './types/organizations';
import {
  Association,
  AssociationType,
  AssociationObjectType,
  InvolvementType,
  InvolvementRecord,
  AssociationSearchCriteria,
  AssociationSummary,
  ConflictOfInterest,
  ConflictType,
  NetworkNode,
  NetworkEdge,
  InvolvementReport,
} from './types/associations';
import {
  ChangeRecord,
  ChangeType,
  EntityType,
  FieldChange,
  ChangeAuthor,
  BlameResult,
  FieldBlame,
  EntityDiff,
  HistoryQuery,
  HistoryEntry,
  ChangeTimeline,
  TimelineEntry,
  AuditMetadata,
} from './types/change-tracking';

/**
 * Main Entity Registry class
 * Singleton pattern for centralized tracking
 */
export class EntityRegistry {
  // === IN-MEMORY STORAGE (would be PostgreSQL in production) ===
  private people: Map<string, Person> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private associations: Map<string, Association> = new Map();
  private involvements: Map<string, InvolvementRecord> = new Map();
  private changes: Map<string, ChangeRecord> = new Map();
  private conflicts: Map<string, ConflictOfInterest> = new Map();

  // === INDEXES FOR FAST LOOKUPS ===
  private personByName: Map<string, string[]> = new Map();
  private orgByName: Map<string, string[]> = new Map();
  private associationsBySubject: Map<string, string[]> = new Map();
  private associationsByObject: Map<string, string[]> = new Map();
  private changesByEntity: Map<string, string[]> = new Map();

  // =========================================================================
  // PEOPLE MANAGEMENT
  // =========================================================================

  /**
   * Register a new person in the system
   */
  registerPerson(
    data: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory' | 'metadata'>,
    author: ChangeAuthor
  ): Person {
    const id = randomUUID();
    const now = new Date();

    const person: Person = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      changeHistory: [],
      metadata: this.createAuditMetadata(author.personId),
    };

    // Record the creation
    const changeRecord = this.recordChange({
      entityType: 'PERSON',
      entityId: id,
      changeType: 'CREATE',
      fieldChanges: [],
      changedBy: author,
      reason: `Registered new person: ${data.legalName}`,
    });

    person.changeHistory.push(changeRecord);
    this.people.set(id, person);
    this.indexPerson(person);

    return person;
  }

  /**
   * Update a person's information
   */
  updatePerson(
    personId: string,
    updates: Partial<Person>,
    author: ChangeAuthor,
    reason: string
  ): Person {
    const person = this.people.get(personId);
    if (!person) {
      throw new Error(`Person not found: ${personId}`);
    }

    const fieldChanges = this.calculateFieldChanges(person, updates);

    const updatedPerson: Person = {
      ...person,
      ...updates,
      id: personId, // Prevent ID change
      updatedAt: new Date(),
      metadata: {
        ...person.metadata,
        version: person.metadata.version + 1,
        lastModified: new Date(),
        totalChanges: person.metadata.totalChanges + 1,
        lastChangedBy: author.personId,
      },
    };

    const changeRecord = this.recordChange({
      entityType: 'PERSON',
      entityId: personId,
      changeType: 'UPDATE',
      fieldChanges,
      changedBy: author,
      reason,
    });

    updatedPerson.changeHistory.push(changeRecord);
    this.people.set(personId, updatedPerson);
    this.indexPerson(updatedPerson);

    return updatedPerson;
  }

  /**
   * Get a person by ID
   */
  getPerson(personId: string): Person | undefined {
    return this.people.get(personId);
  }

  /**
   * Search for people
   */
  searchPeople(criteria: PersonSearchCriteria): PersonSummary[] {
    const results: PersonSummary[] = [];

    for (const person of this.people.values()) {
      if (this.matchesPersonCriteria(person, criteria)) {
        results.push(this.toPersonSummary(person));
      }
    }

    return results;
  }

  // =========================================================================
  // ORGANIZATION MANAGEMENT
  // =========================================================================

  /**
   * Register a new organization
   */
  registerOrganization(
    data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory' | 'metadata'>,
    author: ChangeAuthor
  ): Organization {
    const id = randomUUID();
    const now = new Date();

    const org: Organization = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      changeHistory: [],
      metadata: this.createAuditMetadata(author.personId),
    };

    const changeRecord = this.recordChange({
      entityType: 'ORGANIZATION',
      entityId: id,
      changeType: 'CREATE',
      fieldChanges: [],
      changedBy: author,
      reason: `Registered new organization: ${data.legalName}`,
    });

    org.changeHistory.push(changeRecord);
    this.organizations.set(id, org);
    this.indexOrganization(org);

    return org;
  }

  /**
   * Update an organization
   */
  updateOrganization(
    orgId: string,
    updates: Partial<Organization>,
    author: ChangeAuthor,
    reason: string
  ): Organization {
    const org = this.organizations.get(orgId);
    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    const fieldChanges = this.calculateFieldChanges(org, updates);

    const updatedOrg: Organization = {
      ...org,
      ...updates,
      id: orgId,
      updatedAt: new Date(),
      metadata: {
        ...org.metadata,
        version: org.metadata.version + 1,
        lastModified: new Date(),
        totalChanges: org.metadata.totalChanges + 1,
        lastChangedBy: author.personId,
      },
    };

    const changeRecord = this.recordChange({
      entityType: 'ORGANIZATION',
      entityId: orgId,
      changeType: 'UPDATE',
      fieldChanges,
      changedBy: author,
      reason,
    });

    updatedOrg.changeHistory.push(changeRecord);
    this.organizations.set(orgId, updatedOrg);
    this.indexOrganization(updatedOrg);

    return updatedOrg;
  }

  /**
   * Get organization by ID
   */
  getOrganization(orgId: string): Organization | undefined {
    return this.organizations.get(orgId);
  }

  /**
   * Get full ownership chain to ultimate beneficial owners
   */
  getOwnershipChain(orgId: string): BeneficialOwner[] {
    const org = this.organizations.get(orgId);
    if (!org) return [];

    const beneficialOwners: BeneficialOwner[] = [];
    const visited = new Set<string>();

    const traverse = (currentOrgId: string, chain: string[], percentage: number) => {
      if (visited.has(currentOrgId)) return;
      visited.add(currentOrgId);

      const currentOrg = this.organizations.get(currentOrgId);
      if (!currentOrg) return;

      for (const stake of currentOrg.ownershipStructure) {
        const newChain = [...chain, currentOrgId];
        const effectivePercentage = (percentage * stake.percentageOwned) / 100;

        if (stake.ownerType === 'PERSON') {
          beneficialOwners.push({
            personId: stake.ownerId,
            personName: stake.ownerName,
            percentageBeneficialOwnership: effectivePercentage,
            ownershipChain: newChain,
            controlType: stake.votingRights ? 'VOTING' : 'OWNERSHIP',
            verifiedDate: new Date(),
          });
        } else {
          traverse(stake.ownerId, newChain, effectivePercentage);
        }
      }
    };

    traverse(orgId, [], 100);
    return beneficialOwners;
  }

  // =========================================================================
  // ASSOCIATION MANAGEMENT - THE HEART OF TRACKING
  // =========================================================================

  /**
   * Create an association between entities
   */
  createAssociation(
    data: Omit<Association, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>,
    author: ChangeAuthor
  ): Association {
    const id = randomUUID();
    const now = new Date();

    const association: Association = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      changeHistory: [],
    };

    const changeRecord = this.recordChange({
      entityType: 'ASSOCIATION',
      entityId: id,
      changeType: 'CREATE',
      fieldChanges: [],
      changedBy: author,
      reason: `Created association: ${data.subjectName} -> ${data.objectName} (${data.involvementType})`,
    });

    association.changeHistory.push(changeRecord);
    this.associations.set(id, association);
    this.indexAssociation(association);

    // Check for conflicts of interest
    this.detectConflictsOfInterest(association, author);

    return association;
  }

  /**
   * Record a specific involvement action
   */
  recordInvolvement(
    associationId: string,
    action: string,
    details: string,
    author: ChangeAuthor,
    additionalData?: Partial<InvolvementRecord>
  ): InvolvementRecord {
    const association = this.associations.get(associationId);
    if (!association) {
      throw new Error(`Association not found: ${associationId}`);
    }

    const id = randomUUID();
    const now = new Date();

    const involvement: InvolvementRecord = {
      id,
      associationId,
      action,
      actionDate: now,
      details,
      documentIds: additionalData?.documentIds || [],
      mediaUrls: additionalData?.mediaUrls || [],
      witnesses: additionalData?.witnesses || [],
      recordedAt: now,
      recordedBy: author.personId,
      signature: this.signData({ id, action, details, author }),
      changeHistory: [],
      ...additionalData,
    };

    const changeRecord = this.recordChange({
      entityType: 'ASSOCIATION',
      entityId: associationId,
      changeType: 'UPDATE',
      fieldChanges: [{
        fieldPath: 'involvementRecords',
        previousValue: null,
        newValue: involvement,
        changeReason: action,
      }],
      changedBy: author,
      reason: `Recorded involvement: ${action}`,
    });

    involvement.changeHistory.push(changeRecord);
    this.involvements.set(id, involvement);

    return involvement;
  }

  /**
   * Get all associations for a subject (person or org)
   */
  getAssociationsForSubject(subjectId: string): Association[] {
    const associationIds = this.associationsBySubject.get(subjectId) || [];
    return associationIds
      .map(id => this.associations.get(id))
      .filter((a): a is Association => a !== undefined);
  }

  /**
   * Get all associations for an object (bill, case, etc.)
   */
  getAssociationsForObject(objectId: string): Association[] {
    const associationIds = this.associationsByObject.get(objectId) || [];
    return associationIds
      .map(id => this.associations.get(id))
      .filter((a): a is Association => a !== undefined);
  }

  /**
   * Search associations
   */
  searchAssociations(criteria: AssociationSearchCriteria): AssociationSummary[] {
    const results: AssociationSummary[] = [];

    for (const association of this.associations.values()) {
      if (this.matchesAssociationCriteria(association, criteria)) {
        results.push(this.toAssociationSummary(association));
      }
    }

    return results;
  }

  // =========================================================================
  // GIT-STYLE BLAME & HISTORY
  // =========================================================================

  /**
   * Get blame for an entity - who is responsible for what
   */
  getBlame(entityType: EntityType, entityId: string): BlameResult {
    const changeIds = this.changesByEntity.get(`${entityType}:${entityId}`) || [];
    const changes = changeIds
      .map(id => this.changes.get(id))
      .filter((c): c is ChangeRecord => c !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const fieldBlame = new Map<string, FieldBlame>();
    const contributors = new Map<string, ChangeAuthor>();

    for (const change of changes) {
      contributors.set(change.changedBy.personId, change.changedBy);

      for (const fieldChange of change.fieldChanges) {
        const existing = fieldBlame.get(fieldChange.fieldPath);
        const fieldContributors = existing?.contributors || [];

        if (!fieldContributors.find(c => c.personId === change.changedBy.personId)) {
          fieldContributors.push(change.changedBy);
        }

        fieldBlame.set(fieldChange.fieldPath, {
          fieldPath: fieldChange.fieldPath,
          currentValue: fieldChange.newValue,
          lastChangedBy: change.changedBy,
          lastChangedAt: change.timestamp,
          changeId: change.changeId,
          reason: change.reason,
          totalChanges: (existing?.totalChanges || 0) + 1,
          contributors: fieldContributors,
        });
      }
    }

    return {
      entityId,
      entityType,
      fieldBlame: Array.from(fieldBlame.values()),
      overallResponsibility: this.calculateResponsibilityChain(changes),
    };
  }

  /**
   * Get diff between two versions
   */
  getDiff(entityType: EntityType, entityId: string, fromVersion: number, toVersion: number): EntityDiff {
    const changeIds = this.changesByEntity.get(`${entityType}:${entityId}`) || [];
    const allChanges = changeIds
      .map(id => this.changes.get(id))
      .filter((c): c is ChangeRecord => c !== undefined)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Get changes between versions
    const relevantChanges = allChanges.slice(fromVersion, toVersion);

    const fieldChanges: FieldChange[] = [];
    const addedFields = new Set<string>();
    const removedFields = new Set<string>();
    const authors = new Map<string, ChangeAuthor>();

    for (const change of relevantChanges) {
      authors.set(change.changedBy.personId, change.changedBy);

      for (const fc of change.fieldChanges) {
        if (fc.previousValue === null || fc.previousValue === undefined) {
          addedFields.add(fc.fieldPath);
        }
        if (fc.newValue === null || fc.newValue === undefined) {
          removedFields.add(fc.fieldPath);
        }
        fieldChanges.push(fc);
      }
    }

    return {
      entityId,
      entityType,
      fromVersion,
      toVersion,
      fromCommitHash: allChanges[fromVersion]?.commitHash || '',
      toCommitHash: allChanges[toVersion - 1]?.commitHash || '',
      changes: fieldChanges,
      addedFields: Array.from(addedFields),
      removedFields: Array.from(removedFields),
      authors: Array.from(authors.values()),
      timespan: {
        start: relevantChanges[0]?.timestamp || new Date(),
        end: relevantChanges[relevantChanges.length - 1]?.timestamp || new Date(),
      },
    };
  }

  /**
   * Get change history
   */
  getHistory(query: HistoryQuery): HistoryEntry[] {
    let changes = Array.from(this.changes.values());

    // Apply filters
    if (query.entityId) {
      changes = changes.filter(c => c.entityId === query.entityId);
    }
    if (query.entityType) {
      changes = changes.filter(c => c.entityType === query.entityType);
    }
    if (query.authorId) {
      changes = changes.filter(c => c.changedBy.personId === query.authorId);
    }
    if (query.changeType) {
      changes = changes.filter(c => c.changeType === query.changeType);
    }
    if (query.dateRange) {
      changes = changes.filter(c =>
        c.timestamp >= query.dateRange!.start && c.timestamp <= query.dateRange!.end
      );
    }
    if (query.fieldPath) {
      changes = changes.filter(c =>
        c.fieldChanges.some(fc => fc.fieldPath === query.fieldPath)
      );
    }

    // Sort by timestamp descending
    changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    changes = changes.slice(offset, offset + limit);

    return changes.map(c => ({ changeRecord: c }));
  }

  /**
   * Get timeline of changes
   */
  getTimeline(
    dateRange: { start: Date; end: Date },
    filters?: { entityType?: EntityType; authorId?: string }
  ): ChangeTimeline {
    let changes = Array.from(this.changes.values())
      .filter(c => c.timestamp >= dateRange.start && c.timestamp <= dateRange.end);

    if (filters?.entityType) {
      changes = changes.filter(c => c.entityType === filters.entityType);
    }
    if (filters?.authorId) {
      changes = changes.filter(c => c.changedBy.personId === filters.authorId);
    }

    changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Calculate stats
    const contributorCounts = new Map<string, { author: ChangeAuthor; count: number }>();
    const typeCounts = new Map<ChangeType, number>();

    for (const change of changes) {
      const existing = contributorCounts.get(change.changedBy.personId);
      if (existing) {
        existing.count++;
      } else {
        contributorCounts.set(change.changedBy.personId, {
          author: change.changedBy,
          count: 1,
        });
      }

      typeCounts.set(change.changeType, (typeCounts.get(change.changeType) || 0) + 1);
    }

    return {
      entries: changes.map(c => this.toTimelineEntry(c)),
      dateRange,
      totalChanges: changes.length,
      topContributors: Array.from(contributorCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(c => ({ author: c.author, changeCount: c.count })),
      changeTypeBreakdown: Array.from(typeCounts.entries())
        .map(([type, count]) => ({ type, count })),
    };
  }

  // =========================================================================
  // CONFLICT OF INTEREST DETECTION
  // =========================================================================

  /**
   * Detect potential conflicts of interest
   */
  detectConflictsOfInterest(association: Association, author: ChangeAuthor): ConflictOfInterest[] {
    const detected: ConflictOfInterest[] = [];

    // Only check person associations
    if (association.subjectType !== 'PERSON') return detected;

    const person = this.people.get(association.subjectId);
    if (!person) return detected;

    // Get all associations for this person
    const allAssociations = this.getAssociationsForSubject(association.subjectId);

    // Check for government role + private interest conflicts
    const governmentRoles = allAssociations.filter(a =>
      ['ELECTED_REPRESENTATIVE', 'ELECTED_EXECUTIVE', 'APPOINTED_OFFICIAL', 'COMMITTEE_MEMBER']
        .includes(a.involvementType as string)
    );

    const privateInterests = allAssociations.filter(a =>
      ['OWNER', 'BOARD_MEMBER', 'EXECUTIVE', 'INVESTOR', 'LOBBYIST']
        .includes(a.involvementType as string)
    );

    for (const govRole of governmentRoles) {
      for (const privateInterest of privateInterests) {
        // Check if the private interest could be affected by government role
        if (this.couldAffect(govRole, privateInterest)) {
          const conflict: ConflictOfInterest = {
            id: randomUUID(),
            personId: association.subjectId,
            personName: association.subjectName,
            conflictType: this.determineConflictType(privateInterest.involvementType),
            description: `Person holds ${govRole.involvementType} position while having ${privateInterest.involvementType} relationship with ${privateInterest.objectName}`,
            severity: this.assessConflictSeverity(govRole, privateInterest),
            governmentRole: {
              organizationId: govRole.objectId,
              organizationName: govRole.objectName,
              role: govRole.involvementType,
            },
            privateInterest: {
              entityId: privateInterest.objectId,
              entityName: privateInterest.objectName,
              relationshipType: privateInterest.involvementType,
              financialValue: privateInterest.financialValue,
            },
            affectedActions: [],
            status: 'DETECTED',
            detectedAt: new Date(),
            detectedBy: 'SYSTEM',
            changeHistory: [],
          };

          this.conflicts.set(conflict.id, conflict);
          detected.push(conflict);
        }
      }
    }

    return detected;
  }

  /**
   * Get all conflicts for a person
   */
  getConflictsForPerson(personId: string): ConflictOfInterest[] {
    return Array.from(this.conflicts.values())
      .filter(c => c.personId === personId);
  }

  // =========================================================================
  // INVOLVEMENT REPORT GENERATION
  // =========================================================================

  /**
   * Generate comprehensive involvement report
   */
  generateInvolvementReport(subjectId: string, subjectType: 'PERSON' | 'ORGANIZATION'): InvolvementReport {
    const associations = this.getAssociationsForSubject(subjectId);
    const subject = subjectType === 'PERSON'
      ? this.people.get(subjectId)
      : this.organizations.get(subjectId);

    const summaries = associations.map(a => this.toAssociationSummary(a));

    // Categorize by involvement area
    const legislative = summaries.filter(s =>
      s.involvementType.startsWith('BILL_') || ['COMMITTEE_MEMBER', 'COMMITTEE_CHAIR'].includes(s.involvementType)
    );
    const judicial = summaries.filter(s =>
      s.involvementType.startsWith('CASE_') || s.involvementType.includes('OPINION') || s.involvementType.includes('JUDGE')
    );
    const executive = summaries.filter(s =>
      s.involvementType.startsWith('EXECUTIVE_') || s.involvementType.includes('REGULATION')
    );
    const financial = summaries.filter(s =>
      ['CAMPAIGN_DONOR', 'LOBBYIST', 'CONTRACT_RECIPIENT', 'GRANT_RECIPIENT', 'INVESTOR'].includes(s.involvementType)
    );
    const organizational = summaries.filter(s =>
      ['OWNER', 'BOARD_MEMBER', 'EXECUTIVE', 'EMPLOYEE', 'FOUNDER'].includes(s.involvementType)
    );

    const conflicts = subjectType === 'PERSON'
      ? this.getConflictsForPerson(subjectId)
      : [];

    const totalFinancialValue = associations.reduce((sum, a) => sum + (a.financialValue || 0), 0);

    return {
      subjectId,
      subjectName: subjectType === 'PERSON'
        ? (subject as Person)?.legalName || 'Unknown'
        : (subject as Organization)?.legalName || 'Unknown',
      subjectType,
      totalAssociations: associations.length,
      activeAssociations: associations.filter(a => a.isActive).length,
      totalFinancialValue,
      legislativeInvolvement: legislative,
      judicialInvolvement: judicial,
      executiveInvolvement: executive,
      financialInvolvement: financial,
      organizationalInvolvement: organizational,
      conflictsOfInterest: conflicts,
      topConnections: this.getTopConnections(subjectId),
      centralityRank: this.calculateCentralityRank(subjectId),
      recentActivity: this.getRecentInvolvements(subjectId),
      generatedAt: new Date(),
    };
  }

  // =========================================================================
  // NETWORK ANALYSIS
  // =========================================================================

  /**
   * Build network graph for visualization
   */
  buildNetworkGraph(centerEntityId: string, depth: number = 2): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
    const nodes = new Map<string, NetworkNode>();
    const edges: NetworkEdge[] = [];
    const visited = new Set<string>();

    const traverse = (entityId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(entityId)) return;
      visited.add(entityId);

      const associations = [
        ...this.getAssociationsForSubject(entityId),
        ...this.getAssociationsForObject(entityId),
      ];

      for (const assoc of associations) {
        // Add nodes
        if (!nodes.has(assoc.subjectId)) {
          nodes.set(assoc.subjectId, {
            id: assoc.subjectId,
            type: assoc.subjectType,
            name: assoc.subjectName,
            metadata: {},
            connectionCount: 0,
            centralityScore: 0,
          });
        }
        if (!nodes.has(assoc.objectId)) {
          nodes.set(assoc.objectId, {
            id: assoc.objectId,
            type: this.mapObjectTypeToNodeType(assoc.objectType),
            name: assoc.objectName,
            metadata: {},
            connectionCount: 0,
            centralityScore: 0,
          });
        }

        // Add edge
        edges.push({
          sourceId: assoc.subjectId,
          targetId: assoc.objectId,
          associationId: assoc.id,
          involvementType: assoc.involvementType,
          weight: assoc.significance === 'PRIMARY' ? 1.0 : 0.5,
          startDate: assoc.startDate,
          endDate: assoc.endDate,
          isActive: assoc.isActive,
        });

        // Traverse connected entities
        if (assoc.subjectId !== entityId) {
          traverse(assoc.subjectId, currentDepth + 1);
        }
        if (assoc.objectId !== entityId) {
          traverse(assoc.objectId, currentDepth + 1);
        }
      }
    };

    traverse(centerEntityId, 0);

    // Calculate connection counts
    for (const edge of edges) {
      const sourceNode = nodes.get(edge.sourceId);
      const targetNode = nodes.get(edge.targetId);
      if (sourceNode) sourceNode.connectionCount++;
      if (targetNode) targetNode.connectionCount++;
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }

  // =========================================================================
  // PRIVATE HELPER METHODS
  // =========================================================================

  private recordChange(params: {
    entityType: EntityType;
    entityId: string;
    changeType: ChangeType;
    fieldChanges: FieldChange[];
    changedBy: ChangeAuthor;
    reason: string;
    authorizedBy?: ChangeAuthor;
    legalBasis?: string;
    relatedDocuments?: string[];
  }): ChangeRecord {
    const changeId = randomUUID();
    const timestamp = new Date();

    const changeContent = JSON.stringify({
      ...params,
      changeId,
      timestamp: timestamp.toISOString(),
    });

    const commitHash = simpleHash(changeContent);

    // Get parent commit
    const entityKey = `${params.entityType}:${params.entityId}`;
    const existingChanges = this.changesByEntity.get(entityKey) || [];
    const parentCommitHash = existingChanges.length > 0
      ? this.changes.get(existingChanges[existingChanges.length - 1])?.commitHash
      : undefined;

    const changeRecord: ChangeRecord = {
      changeId,
      commitHash,
      parentCommitHash,
      entityType: params.entityType,
      entityId: params.entityId,
      changeType: params.changeType,
      fieldChanges: params.fieldChanges,
      changedBy: params.changedBy,
      authorizedBy: params.authorizedBy,
      timestamp,
      reason: params.reason,
      legalBasis: params.legalBasis,
      relatedDocuments: params.relatedDocuments || [],
      signature: this.signData(changeContent),
      witnesses: [],
      verificationStatus: 'VERIFIED',
      tags: [],
      isPublic: true,
      immutable: false,
    };

    this.changes.set(changeId, changeRecord);

    // Update index
    if (!this.changesByEntity.has(entityKey)) {
      this.changesByEntity.set(entityKey, []);
    }
    this.changesByEntity.get(entityKey)!.push(changeId);

    return changeRecord;
  }

  private calculateFieldChanges(original: any, updates: Partial<any>): FieldChange[] {
    const changes: FieldChange[] = [];

    for (const [key, newValue] of Object.entries(updates)) {
      const previousValue = original[key];
      if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
        changes.push({
          fieldPath: key,
          previousValue,
          newValue,
        });
      }
    }

    return changes;
  }

  private createAuditMetadata(createdBy: string): AuditMetadata {
    const now = new Date();
    return {
      version: 1,
      firstCreated: now,
      lastModified: now,
      totalChanges: 1,
      lastChangedBy: createdBy,
      checksumHash: '',
    };
  }

  private signData(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return simpleHash(content);
  }

  private indexPerson(person: Person): void {
    const nameLower = person.legalName.toLowerCase();
    if (!this.personByName.has(nameLower)) {
      this.personByName.set(nameLower, []);
    }
    const existing = this.personByName.get(nameLower)!;
    if (!existing.includes(person.id)) {
      existing.push(person.id);
    }
  }

  private indexOrganization(org: Organization): void {
    const nameLower = org.legalName.toLowerCase();
    if (!this.orgByName.has(nameLower)) {
      this.orgByName.set(nameLower, []);
    }
    const existing = this.orgByName.get(nameLower)!;
    if (!existing.includes(org.id)) {
      existing.push(org.id);
    }
  }

  private indexAssociation(association: Association): void {
    // Index by subject
    if (!this.associationsBySubject.has(association.subjectId)) {
      this.associationsBySubject.set(association.subjectId, []);
    }
    this.associationsBySubject.get(association.subjectId)!.push(association.id);

    // Index by object
    if (!this.associationsByObject.has(association.objectId)) {
      this.associationsByObject.set(association.objectId, []);
    }
    this.associationsByObject.get(association.objectId)!.push(association.id);
  }

  private matchesPersonCriteria(person: Person, criteria: PersonSearchCriteria): boolean {
    if (criteria.name && !person.legalName.toLowerCase().includes(criteria.name.toLowerCase())) {
      return false;
    }
    if (criteria.regionId && !person.regionIds.includes(criteria.regionId)) {
      return false;
    }
    if (criteria.verificationLevel && person.verificationLevel !== criteria.verificationLevel) {
      return false;
    }
    if (criteria.status && person.status !== criteria.status) {
      return false;
    }
    if (criteria.minReputation && person.reputation < criteria.minReputation) {
      return false;
    }
    return true;
  }

  private matchesAssociationCriteria(association: Association, criteria: AssociationSearchCriteria): boolean {
    if (criteria.subjectId && association.subjectId !== criteria.subjectId) return false;
    if (criteria.subjectType && association.subjectType !== criteria.subjectType) return false;
    if (criteria.objectId && association.objectId !== criteria.objectId) return false;
    if (criteria.objectType && association.objectType !== criteria.objectType) return false;
    if (criteria.involvementType && association.involvementType !== criteria.involvementType) return false;
    if (criteria.isActive !== undefined && association.isActive !== criteria.isActive) return false;
    if (criteria.hasFinancialValue && !association.financialValue) return false;
    if (criteria.minFinancialValue && (association.financialValue || 0) < criteria.minFinancialValue) return false;
    if (criteria.verified !== undefined && association.verified !== criteria.verified) return false;
    return true;
  }

  private toPersonSummary(person: Person): PersonSummary {
    const associations = this.getAssociationsForSubject(person.id);
    return {
      id: person.id,
      legalName: person.legalName,
      preferredName: person.preferredName,
      primaryRegionId: person.primaryRegionId,
      verificationLevel: person.verificationLevel,
      reputation: person.reputation,
      status: person.status,
      currentRoles: [],
      organizationCount: associations.filter(a => a.objectType === 'ORGANIZATION').length,
      billsSponsored: associations.filter(a => a.involvementType === 'BILL_SPONSOR').length,
      votescast: associations.filter(a => a.involvementType.startsWith('BILL_VOTER')).length,
    };
  }

  private toAssociationSummary(association: Association): AssociationSummary {
    return {
      id: association.id,
      subjectName: association.subjectName,
      subjectType: association.subjectType,
      involvementType: association.involvementType,
      objectName: association.objectName,
      objectType: association.objectType,
      startDate: association.startDate,
      isActive: association.isActive,
      significance: association.significance,
      financialValue: association.financialValue,
    };
  }

  private toTimelineEntry(change: ChangeRecord): TimelineEntry {
    return {
      timestamp: change.timestamp,
      changeId: change.changeId,
      entityType: change.entityType,
      entityId: change.entityId,
      entityName: '', // Would need entity lookup
      changeType: change.changeType,
      summary: change.reason,
      author: change.changedBy,
      significance: this.assessChangeSignificance(change),
    };
  }

  private assessChangeSignificance(change: ChangeRecord): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (['SIGN', 'RATIFY', 'VETO', 'OVERRIDE', 'REPEAL'].includes(change.changeType)) {
      return 'CRITICAL';
    }
    if (['CREATE', 'DELETE', 'AMEND'].includes(change.changeType)) {
      return 'HIGH';
    }
    if (['UPDATE', 'VERIFY'].includes(change.changeType)) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private calculateResponsibilityChain(changes: ChangeRecord[]): { role: string; personId: string; personName: string; action: string; timestamp: Date; accountability: number }[] {
    const responsibility = new Map<string, { personId: string; personName: string; actions: string[]; latest: Date }>();

    for (const change of changes) {
      const key = change.changedBy.personId;
      const existing = responsibility.get(key);
      if (existing) {
        existing.actions.push(change.changeType);
        if (change.timestamp > existing.latest) {
          existing.latest = change.timestamp;
        }
      } else {
        responsibility.set(key, {
          personId: change.changedBy.personId,
          personName: change.changedBy.personName,
          actions: [change.changeType],
          latest: change.timestamp,
        });
      }
    }

    return Array.from(responsibility.values()).map(r => ({
      role: 'CONTRIBUTOR',
      personId: r.personId,
      personName: r.personName,
      action: r.actions.join(', '),
      timestamp: r.latest,
      accountability: Math.min(100, r.actions.length * 10),
    }));
  }

  private couldAffect(govRole: Association, privateInterest: Association): boolean {
    // Simple heuristic - in production would have more sophisticated analysis
    return govRole.isActive && privateInterest.isActive;
  }

  private determineConflictType(involvementType: InvolvementType): ConflictType {
    if (['OWNER', 'INVESTOR'].includes(involvementType)) return 'OWNERSHIP_STAKE';
    if (involvementType === 'BOARD_MEMBER') return 'BOARD_MEMBERSHIP';
    if (involvementType === 'LOBBYIST') return 'LOBBYING_RELATIONSHIP';
    if (involvementType === 'CAMPAIGN_DONOR') return 'CAMPAIGN_CONTRIBUTION';
    if (['EMPLOYEE', 'EXECUTIVE'].includes(involvementType)) return 'EMPLOYMENT';
    return 'FINANCIAL_INTEREST';
  }

  private assessConflictSeverity(govRole: Association, privateInterest: Association): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (privateInterest.financialValue && privateInterest.financialValue > 1000000) return 'CRITICAL';
    if (govRole.significance === 'PRIMARY' && privateInterest.significance === 'PRIMARY') return 'HIGH';
    if (govRole.significance === 'PRIMARY' || privateInterest.significance === 'PRIMARY') return 'MEDIUM';
    return 'LOW';
  }

  private getTopConnections(subjectId: string): { entity: NetworkNode; connectionStrength: number }[] {
    const { nodes, edges } = this.buildNetworkGraph(subjectId, 1);
    return nodes
      .filter(n => n.id !== subjectId)
      .map(n => ({
        entity: n,
        connectionStrength: edges.filter(e => e.sourceId === n.id || e.targetId === n.id).length,
      }))
      .sort((a, b) => b.connectionStrength - a.connectionStrength)
      .slice(0, 10);
  }

  private calculateCentralityRank(subjectId: string): number {
    const associations = this.getAssociationsForSubject(subjectId);
    // Simple degree centrality - would use PageRank or similar in production
    return associations.length;
  }

  private getRecentInvolvements(subjectId: string): InvolvementRecord[] {
    return Array.from(this.involvements.values())
      .filter(i => {
        const assoc = this.associations.get(i.associationId);
        return assoc?.subjectId === subjectId;
      })
      .sort((a, b) => b.actionDate.getTime() - a.actionDate.getTime())
      .slice(0, 10);
  }

  private mapObjectTypeToNodeType(objectType: AssociationObjectType): 'PERSON' | 'ORGANIZATION' | 'DOCUMENT' | 'PROCEEDING' | 'FINANCIAL' {
    if (objectType === 'PERSON') return 'PERSON';
    if (objectType === 'ORGANIZATION') return 'ORGANIZATION';
    if (['LEGAL_CASE', 'COURT_RULING', 'COURT_ORDER', 'HEARING', 'INVESTIGATION'].includes(objectType)) return 'PROCEEDING';
    if (['BUDGET', 'CONTRACT', 'GRANT', 'CAMPAIGN', 'PAC'].includes(objectType)) return 'FINANCIAL';
    return 'DOCUMENT';
  }
}

// Export singleton instance
export const entityRegistry = new EntityRegistry();
