/**
 * Entity Registry Tests
 * Tests for git-style entity tracking with blame and history
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EntityRegistry, entityRegistry } from '../src/registry';
import { VerificationLevel, PersonStatus } from '../src/types/people';
import { OrganizationType, OrganizationStatus } from '../src/types/organizations';
import { DelegationScope } from '../src/types/associations';

describe('EntityRegistry', () => {
  let registry: EntityRegistry;
  let testAuthor: { personId: string; personName: string; role: string };

  beforeEach(() => {
    registry = new EntityRegistry();
    testAuthor = {
      personId: 'admin-001',
      personName: 'System Admin',
      role: 'ADMIN',
    };
  });

  describe('Person Registration', () => {
    it('should register a new person', () => {
      const person = registry.registerPerson(
        {
          legalName: 'John Doe',
          preferredName: 'John',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
          contactInfo: {
            email: 'john@example.com',
            phone: '555-0100',
          },
        },
        testAuthor
      );

      expect(person.id).toBeDefined();
      expect(person.legalName).toBe('John Doe');
      expect(person.changeHistory).toHaveLength(1);
      expect(person.changeHistory[0].changeType).toBe('CREATE');
    });

    it('should set initial metadata', () => {
      const person = registry.registerPerson(
        {
          legalName: 'Jane Doe',
          dateOfBirth: new Date('1985-05-15'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );

      expect(person.metadata.version).toBe(1);
      expect(person.metadata.totalChanges).toBe(1);
      expect(person.metadata.lastChangedBy).toBe('admin-001');
    });
  });

  describe('Person Updates', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;
    });

    it('should update a person', () => {
      const updated = registry.updatePerson(
        personId,
        { reputation: 100 },
        testAuthor,
        'Increased reputation after verification'
      );

      expect(updated.reputation).toBe(100);
      expect(updated.changeHistory).toHaveLength(2);
    });

    it('should increment version on update', () => {
      const updated = registry.updatePerson(
        personId,
        { reputation: 75 },
        testAuthor,
        'Test update'
      );

      expect(updated.metadata.version).toBe(2);
    });

    it('should track field changes', () => {
      registry.updatePerson(
        personId,
        { reputation: 75 },
        testAuthor,
        'Test update'
      );

      const person = registry.getPerson(personId);
      const lastChange = person!.changeHistory[person!.changeHistory.length - 1];

      expect(lastChange.fieldChanges.some(fc => fc.fieldPath === 'reputation')).toBe(true);
    });

    it('should throw error for unknown person', () => {
      expect(() => {
        registry.updatePerson('unknown-id', { reputation: 100 }, testAuthor, 'Test');
      }).toThrow('Person not found');
    });
  });

  describe('Person Retrieval', () => {
    beforeEach(() => {
      registry.registerPerson(
        {
          legalName: 'Alice Smith',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );

      registry.registerPerson(
        {
          legalName: 'Bob Jones',
          dateOfBirth: new Date('1985-05-15'),
          primaryRegionId: 'region-002',
          regionIds: ['region-002'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
    });

    it('should search people by name', () => {
      const results = registry.searchPeople({ name: 'Alice' });
      expect(results).toHaveLength(1);
      expect(results[0].legalName).toBe('Alice Smith');
    });

    it('should search people by region', () => {
      const results = registry.searchPeople({ regionId: 'region-001' });
      expect(results).toHaveLength(1);
    });

    it('should search people by verification level', () => {
      const results = registry.searchPeople({ verificationLevel: VerificationLevel.VERIFIED });
      expect(results).toHaveLength(1);
      expect(results[0].legalName).toBe('Alice Smith');
    });

    it('should search people by minimum reputation', () => {
      const results = registry.searchPeople({ minReputation: 75 });
      expect(results).toHaveLength(1);
      expect(results[0].reputation).toBeGreaterThanOrEqual(75);
    });

    it('should return empty for no matches', () => {
      const results = registry.searchPeople({ name: 'NonExistent' });
      expect(results).toHaveLength(0);
    });
  });

  describe('Organization Registration', () => {
    it('should register a new organization', () => {
      const org = registry.registerOrganization(
        {
          legalName: 'ACME Corporation',
          type: OrganizationType.CORPORATION,
          status: OrganizationStatus.ACTIVE,
          headquarters: {
            address: '123 Main St',
            city: 'Detroit',
            state: 'MI',
            country: 'USA',
            postalCode: '48201',
          },
          registrationDate: new Date(),
          ownershipStructure: [],
          beneficialOwners: [],
          boardMembers: [],
          industryCategories: ['Manufacturing'],
        },
        testAuthor
      );

      expect(org.id).toBeDefined();
      expect(org.legalName).toBe('ACME Corporation');
      expect(org.type).toBe(OrganizationType.CORPORATION);
    });
  });

  describe('Organization Updates', () => {
    let orgId: string;

    beforeEach(() => {
      const org = registry.registerOrganization(
        {
          legalName: 'Test Corp',
          type: OrganizationType.CORPORATION,
          status: OrganizationStatus.ACTIVE,
          headquarters: {
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            postalCode: '12345',
          },
          registrationDate: new Date(),
          ownershipStructure: [],
          beneficialOwners: [],
          boardMembers: [],
          industryCategories: [],
        },
        testAuthor
      );
      orgId = org.id;
    });

    it('should update an organization', () => {
      const updated = registry.updateOrganization(
        orgId,
        { legalName: 'Test Corp Inc.' },
        testAuthor,
        'Name change'
      );

      expect(updated.legalName).toBe('Test Corp Inc.');
      expect(updated.changeHistory).toHaveLength(2);
    });

    it('should throw error for unknown organization', () => {
      expect(() => {
        registry.updateOrganization('unknown-id', {}, testAuthor, 'Test');
      }).toThrow('Organization not found');
    });
  });

  describe('Ownership Chain', () => {
    beforeEach(() => {
      // Register a person as owner
      const person = registry.registerPerson(
        {
          legalName: 'Owner Person',
          dateOfBirth: new Date('1970-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );

      // Register org owned by person
      registry.registerOrganization(
        {
          legalName: 'Owned Corp',
          type: OrganizationType.CORPORATION,
          status: OrganizationStatus.ACTIVE,
          headquarters: {
            address: '123 Test St',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            postalCode: '12345',
          },
          registrationDate: new Date(),
          ownershipStructure: [
            {
              ownerId: person.id,
              ownerName: 'Owner Person',
              ownerType: 'PERSON',
              percentageOwned: 100,
              votingRights: true,
              acquiredDate: new Date(),
            },
          ],
          beneficialOwners: [],
          boardMembers: [],
          industryCategories: [],
        },
        testAuthor
      );
    });

    it('should trace ownership chain', () => {
      const org = Array.from(registry['organizations'].values())[0];
      const chain = registry.getOwnershipChain(org.id);

      expect(chain).toHaveLength(1);
      expect(chain[0].percentageBeneficialOwnership).toBe(100);
    });
  });

  describe('Association Management', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'Test Person',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;
    });

    it('should create an association', () => {
      const association = registry.createAssociation(
        {
          subjectId: personId,
          subjectType: 'PERSON',
          subjectName: 'Test Person',
          objectId: 'bill-001',
          objectType: 'BILL',
          objectName: 'Test Bill',
          involvementType: 'BILL_SPONSOR',
          significance: 'PRIMARY',
          startDate: new Date(),
          isActive: true,
          verified: true,
          verificationSource: 'SYSTEM',
        },
        testAuthor
      );

      expect(association.id).toBeDefined();
      expect(association.involvementType).toBe('BILL_SPONSOR');
    });

    it('should retrieve associations for subject', () => {
      registry.createAssociation(
        {
          subjectId: personId,
          subjectType: 'PERSON',
          subjectName: 'Test Person',
          objectId: 'bill-001',
          objectType: 'BILL',
          objectName: 'Test Bill',
          involvementType: 'BILL_SPONSOR',
          significance: 'PRIMARY',
          startDate: new Date(),
          isActive: true,
          verified: true,
          verificationSource: 'SYSTEM',
        },
        testAuthor
      );

      const associations = registry.getAssociationsForSubject(personId);
      expect(associations).toHaveLength(1);
    });

    it('should retrieve associations for object', () => {
      registry.createAssociation(
        {
          subjectId: personId,
          subjectType: 'PERSON',
          subjectName: 'Test Person',
          objectId: 'bill-001',
          objectType: 'BILL',
          objectName: 'Test Bill',
          involvementType: 'BILL_SPONSOR',
          significance: 'PRIMARY',
          startDate: new Date(),
          isActive: true,
          verified: true,
          verificationSource: 'SYSTEM',
        },
        testAuthor
      );

      const associations = registry.getAssociationsForObject('bill-001');
      expect(associations).toHaveLength(1);
    });
  });

  describe('Blame Tracking', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'Test Person',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;

      // Make some updates
      registry.updatePerson(
        personId,
        { reputation: 75 },
        { personId: 'editor-001', personName: 'Editor', role: 'EDITOR' },
        'First update'
      );

      registry.updatePerson(
        personId,
        { reputation: 100 },
        testAuthor,
        'Second update'
      );
    });

    it('should get blame for entity', () => {
      const blame = registry.getBlame('PERSON', personId);

      expect(blame.entityId).toBe(personId);
      expect(blame.entityType).toBe('PERSON');
      expect(blame.fieldBlame.length).toBeGreaterThan(0);
    });

    it('should track contributors in blame', () => {
      const blame = registry.getBlame('PERSON', personId);

      expect(blame.overallResponsibility.length).toBeGreaterThan(0);
    });
  });

  describe('Diff Generation', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'Test Person',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;

      registry.updatePerson(personId, { reputation: 100 }, testAuthor, 'Update 1');
      registry.updatePerson(personId, { votingPower: 2 }, testAuthor, 'Update 2');
    });

    it('should generate diff between versions', () => {
      const diff = registry.getDiff('PERSON', personId, 0, 2);

      expect(diff.fromVersion).toBe(0);
      expect(diff.toVersion).toBe(2);
      expect(diff.changes.length).toBeGreaterThan(0);
    });

    it('should track authors in diff', () => {
      const diff = registry.getDiff('PERSON', personId, 0, 3);

      expect(diff.authors.length).toBeGreaterThan(0);
    });
  });

  describe('History Queries', () => {
    beforeEach(() => {
      // Create multiple entities with changes
      for (let i = 0; i < 3; i++) {
        registry.registerPerson(
          {
            legalName: `Person ${i}`,
            dateOfBirth: new Date('1990-01-01'),
            primaryRegionId: 'region-001',
            regionIds: ['region-001'],
            verificationLevel: VerificationLevel.BASIC,
            reputation: 50,
            votingPower: 1,
            status: PersonStatus.ACTIVE,
            delegations: [],
          },
          testAuthor
        );
      }
    });

    it('should query history', () => {
      const history = registry.getHistory({});

      expect(history.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter history by entity type', () => {
      const history = registry.getHistory({ entityType: 'PERSON' });

      expect(history.every(h => h.changeRecord.entityType === 'PERSON')).toBe(true);
    });

    it('should filter history by author', () => {
      const history = registry.getHistory({ authorId: 'admin-001' });

      expect(history.every(h => h.changeRecord.changedBy.personId === 'admin-001')).toBe(true);
    });

    it('should apply pagination', () => {
      const history = registry.getHistory({ limit: 2 });

      expect(history.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Timeline Generation', () => {
    beforeEach(() => {
      registry.registerPerson(
        {
          legalName: 'Timeline Test',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.BASIC,
          reputation: 50,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
    });

    it('should generate timeline', () => {
      const timeline = registry.getTimeline({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      });

      expect(timeline.entries.length).toBeGreaterThan(0);
      expect(timeline.totalChanges).toBeGreaterThan(0);
    });

    it('should include top contributors', () => {
      const timeline = registry.getTimeline({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      });

      expect(timeline.topContributors.length).toBeGreaterThan(0);
    });

    it('should include change type breakdown', () => {
      const timeline = registry.getTimeline({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      });

      expect(timeline.changeTypeBreakdown.length).toBeGreaterThan(0);
    });
  });

  describe('Network Graph', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'Network Center',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;

      registry.createAssociation(
        {
          subjectId: personId,
          subjectType: 'PERSON',
          subjectName: 'Network Center',
          objectId: 'org-001',
          objectType: 'ORGANIZATION',
          objectName: 'Test Org',
          involvementType: 'BOARD_MEMBER',
          significance: 'PRIMARY',
          startDate: new Date(),
          isActive: true,
          verified: true,
          verificationSource: 'SYSTEM',
        },
        testAuthor
      );
    });

    it('should build network graph', () => {
      const graph = registry.buildNetworkGraph(personId, 1);

      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    it('should include connection counts', () => {
      const graph = registry.buildNetworkGraph(personId, 1);
      const centerNode = graph.nodes.find(n => n.id === personId);

      expect(centerNode!.connectionCount).toBeGreaterThan(0);
    });
  });

  describe('Involvement Report', () => {
    let personId: string;

    beforeEach(() => {
      const person = registry.registerPerson(
        {
          legalName: 'Report Subject',
          dateOfBirth: new Date('1990-01-01'),
          primaryRegionId: 'region-001',
          regionIds: ['region-001'],
          verificationLevel: VerificationLevel.VERIFIED,
          reputation: 100,
          votingPower: 1,
          status: PersonStatus.ACTIVE,
          delegations: [],
        },
        testAuthor
      );
      personId = person.id;

      registry.createAssociation(
        {
          subjectId: personId,
          subjectType: 'PERSON',
          subjectName: 'Report Subject',
          objectId: 'bill-001',
          objectType: 'BILL',
          objectName: 'Test Bill',
          involvementType: 'BILL_SPONSOR',
          significance: 'PRIMARY',
          startDate: new Date(),
          isActive: true,
          verified: true,
          verificationSource: 'SYSTEM',
        },
        testAuthor
      );
    });

    it('should generate involvement report', () => {
      const report = registry.generateInvolvementReport(personId, 'PERSON');

      expect(report.subjectId).toBe(personId);
      expect(report.totalAssociations).toBeGreaterThan(0);
    });

    it('should categorize involvements', () => {
      const report = registry.generateInvolvementReport(personId, 'PERSON');

      expect(report.legislativeInvolvement).toBeDefined();
      expect(report.legislativeInvolvement.length).toBeGreaterThan(0);
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(entityRegistry).toBeInstanceOf(EntityRegistry);
    });
  });
});
