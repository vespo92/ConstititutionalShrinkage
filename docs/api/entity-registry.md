# Entity Registry API

> Git-style government entity tracking - ".git for Government"

## Installation

```typescript
import {
  EntityRegistry,
  entityRegistry,
  Person,
  Organization,
  Association,
  ChangeRecord,
} from '@constitutional-shrinkage/entity-registry';
```

## Overview

The Entity Registry package provides:
- Complete tracking of people, organizations, and their relationships
- Git-style version control with blame, diff, and history
- Conflict of interest detection
- Network analysis and visualization
- Full audit trail for all government actions

**Core Philosophy:** *"Every change is recorded. Every actor is tracked. Nothing is forgotten."*

---

## Class: EntityRegistry

### Constructor

```typescript
const registry = new EntityRegistry();
```

---

## People Management

### `registerPerson(data, author): Person`

Register a new person in the system.

**Parameters:**
- `data` - Person data (excluding auto-generated fields)
- `author: ChangeAuthor` - Who is registering this person

**Returns:** `Person`

**Example:**
```typescript
const author = {
  personId: 'admin-001',
  personName: 'System Admin',
  role: 'ADMIN',
  officialCapacity: true,
};

const senator = entityRegistry.registerPerson({
  legalName: 'Jane Smith',
  preferredName: 'Senator Smith',
  dateOfBirth: new Date('1970-01-15'),
  contactEmail: 'jane.smith@senate.gov',
  contactPhone: '555-0100',
  primaryRegionId: 'CA',
  regionIds: ['CA', 'US'],
  verificationLevel: 'FULL_KYC',
  votingPower: 1.0,
  reputation: 85,
  expertiseAreas: ['ENVIRONMENT', 'FINANCE'],
  status: 'ACTIVE',
  publicKey: 'pk_senate_js_001',
}, author);

console.log(`Registered: ${senator.id}`);
```

---

### `updatePerson(personId, updates, author, reason): Person`

Update a person's information with full audit trail.

**Parameters:**
- `personId: string` - Person to update
- `updates: Partial<Person>` - Fields to update
- `author: ChangeAuthor` - Who is making the change
- `reason: string` - Why the change is being made

**Returns:** `Person`

**Throws:** `Person not found: ${personId}`

**Example:**
```typescript
const updated = entityRegistry.updatePerson(
  senator.id,
  { reputation: 90, status: 'ACTIVE' },
  author,
  'Reputation increased after successful legislation'
);

console.log(`Version: ${updated.metadata.version}`);
console.log(`Total changes: ${updated.metadata.totalChanges}`);
```

---

### `getPerson(personId): Person | undefined`

Get a person by their ID.

**Example:**
```typescript
const person = entityRegistry.getPerson('person-001');
if (person) {
  console.log(`Found: ${person.legalName}`);
}
```

---

### `searchPeople(criteria): PersonSummary[]`

Search for people matching criteria.

**Parameters:**
- `criteria: PersonSearchCriteria`

**Example:**
```typescript
const senators = entityRegistry.searchPeople({
  regionId: 'CA',
  verificationLevel: 'FULL_KYC',
  minReputation: 70,
  status: 'ACTIVE',
});

senators.forEach(s => {
  console.log(`${s.legalName} - Rep: ${s.reputation}`);
});
```

---

## Organization Management

### `registerOrganization(data, author): Organization`

Register a new organization.

**Example:**
```typescript
const company = entityRegistry.registerOrganization({
  legalName: 'GreenEnergy Corp',
  tradingNames: ['GreenEnergy', 'GE Solar'],
  organizationType: 'CORPORATION',
  status: 'ACTIVE',
  jurisdiction: 'DE',
  registrationNumber: 'DE-12345678',
  taxId: '12-3456789',
  foundedDate: new Date('2010-03-15'),
  headquartersAddress: '123 Solar Way, San Francisco, CA',
  regionIds: ['CA', 'US'],
  ownershipStructure: [
    {
      ownerId: 'person-founder',
      ownerName: 'John Founder',
      ownerType: 'PERSON',
      percentageOwned: 51,
      votingRights: true,
      acquiredDate: new Date('2010-03-15'),
    },
  ],
  annualRevenue: 50000000,
  employeeCount: 250,
  industryClassifications: ['ENERGY', 'CLEAN_TECH'],
}, author);
```

---

### `updateOrganization(orgId, updates, author, reason): Organization`

Update an organization with audit trail.

**Example:**
```typescript
const updated = entityRegistry.updateOrganization(
  company.id,
  { employeeCount: 300, annualRevenue: 75000000 },
  author,
  'Annual report filing'
);
```

---

### `getOwnershipChain(orgId): BeneficialOwner[]`

Trace ownership to ultimate beneficial owners.

**Example:**
```typescript
const owners = entityRegistry.getOwnershipChain(company.id);

owners.forEach(owner => {
  console.log(`${owner.personName}: ${owner.percentageBeneficialOwnership}%`);
  console.log(`  Chain: ${owner.ownershipChain.join(' -> ')}`);
});
```

---

## Association Management

### `createAssociation(data, author): Association`

Create a relationship between entities (person sponsoring bill, executive at company, etc.).

**Example:**
```typescript
// Senator sponsors a bill
const sponsorship = entityRegistry.createAssociation({
  associationType: 'PERSON_TO_DOCUMENT',
  subjectType: 'PERSON',
  subjectId: senator.id,
  subjectName: senator.legalName,
  objectType: 'BILL',
  objectId: 'bill-clean-energy',
  objectName: 'Clean Energy Investment Act',
  involvementType: 'BILL_SPONSOR',
  startDate: new Date(),
  isActive: true,
  significance: 'PRIMARY',
  verified: true,
  sourceDocuments: ['senate-record-001'],
}, author);

// Person serves on board
const boardMembership = entityRegistry.createAssociation({
  associationType: 'PERSON_TO_ORGANIZATION',
  subjectType: 'PERSON',
  subjectId: 'person-exec',
  subjectName: 'John Executive',
  objectType: 'ORGANIZATION',
  objectId: company.id,
  objectName: company.legalName,
  involvementType: 'BOARD_MEMBER',
  startDate: new Date('2020-01-01'),
  isActive: true,
  significance: 'PRIMARY',
  verified: true,
  financialValue: 250000, // Compensation
  sourceDocuments: ['sec-filing-001'],
}, author);
```

---

### `recordInvolvement(associationId, action, details, author, additionalData?): InvolvementRecord`

Record a specific action within an association.

**Example:**
```typescript
// Record that senator voted on the bill
const voteRecord = entityRegistry.recordInvolvement(
  sponsorship.id,
  'VOTED_FOR',
  'Voted in favor of the bill during floor vote',
  author,
  {
    documentIds: ['vote-record-123'],
    witnesses: ['clerk-senate'],
  }
);
```

---

### `getAssociationsForSubject(subjectId): Association[]`

Get all associations where entity is the subject.

**Example:**
```typescript
const senatorAssociations = entityRegistry.getAssociationsForSubject(senator.id);

senatorAssociations.forEach(a => {
  console.log(`${a.involvementType}: ${a.objectName}`);
});
```

---

### `getAssociationsForObject(objectId): Association[]`

Get all associations for a specific object (bill, case, etc.).

**Example:**
```typescript
// Who's involved with this bill?
const billInvolvement = entityRegistry.getAssociationsForObject('bill-clean-energy');

billInvolvement.forEach(a => {
  console.log(`${a.subjectName} - ${a.involvementType}`);
});
```

---

## Git-Style Blame & History

### `getBlame(entityType, entityId): BlameResult`

Get blame information - who is responsible for what.

**Example:**
```typescript
const blame = entityRegistry.getBlame('BILL', 'bill-clean-energy');

console.log('Field-by-field blame:');
blame.fieldBlame.forEach(fb => {
  console.log(`  ${fb.fieldPath}: Last changed by ${fb.lastChangedBy.personName}`);
  console.log(`    Reason: ${fb.reason}`);
  console.log(`    Total changes: ${fb.totalChanges}`);
});

console.log('\nOverall responsibility chain:');
blame.overallResponsibility.forEach(r => {
  console.log(`  ${r.personName}: ${r.action} (${r.accountability}% accountability)`);
});
```

---

### `getDiff(entityType, entityId, fromVersion, toVersion): EntityDiff`

Get diff between two versions.

**Example:**
```typescript
const diff = entityRegistry.getDiff('BILL', 'bill-clean-energy', 1, 5);

console.log(`Changes from v${diff.fromVersion} to v${diff.toVersion}`);
console.log(`Time span: ${diff.timespan.start} - ${diff.timespan.end}`);
console.log(`Authors: ${diff.authors.map(a => a.personName).join(', ')}`);

diff.changes.forEach(c => {
  console.log(`  ${c.fieldPath}: ${c.previousValue} -> ${c.newValue}`);
});
```

---

### `getHistory(query): HistoryEntry[]`

Query change history with filters.

**Example:**
```typescript
const history = entityRegistry.getHistory({
  entityId: 'bill-clean-energy',
  entityType: 'BILL',
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-12-31'),
  },
  limit: 50,
});

history.forEach(entry => {
  const cr = entry.changeRecord;
  console.log(`${cr.timestamp}: ${cr.changeType} by ${cr.changedBy.personName}`);
  console.log(`  Reason: ${cr.reason}`);
});
```

---

### `getTimeline(dateRange, filters?): ChangeTimeline`

Get a timeline of changes for visualization.

**Example:**
```typescript
const timeline = entityRegistry.getTimeline(
  { start: new Date('2025-01-01'), end: new Date('2025-03-31') },
  { entityType: 'BILL' }
);

console.log(`Total changes: ${timeline.totalChanges}`);

console.log('Top contributors:');
timeline.topContributors.forEach(c => {
  console.log(`  ${c.author.personName}: ${c.changeCount} changes`);
});

console.log('Change type breakdown:');
timeline.changeTypeBreakdown.forEach(b => {
  console.log(`  ${b.type}: ${b.count}`);
});
```

---

## Conflict of Interest Detection

### `detectConflictsOfInterest(association, author): ConflictOfInterest[]`

Automatically detect potential conflicts. Called automatically when creating associations.

**Example:**
```typescript
// This is called automatically, but can be called manually:
const conflicts = entityRegistry.detectConflictsOfInterest(boardMembership, author);

if (conflicts.length > 0) {
  console.log('Conflicts detected!');
  conflicts.forEach(c => {
    console.log(`  ${c.personName}: ${c.description}`);
    console.log(`  Severity: ${c.severity}`);
    console.log(`  Government role: ${c.governmentRole.role} at ${c.governmentRole.organizationName}`);
    console.log(`  Private interest: ${c.privateInterest.relationshipType} with ${c.privateInterest.entityName}`);
  });
}
```

---

### `getConflictsForPerson(personId): ConflictOfInterest[]`

Get all detected conflicts for a person.

**Example:**
```typescript
const conflicts = entityRegistry.getConflictsForPerson(senator.id);

if (conflicts.length > 0) {
  console.log(`${conflicts.length} conflicts of interest detected`);
}
```

---

## Network Analysis

### `buildNetworkGraph(centerEntityId, depth?): { nodes, edges }`

Build a network graph for visualization.

**Example:**
```typescript
const network = entityRegistry.buildNetworkGraph(senator.id, 2);

console.log(`Nodes: ${network.nodes.length}`);
console.log(`Edges: ${network.edges.length}`);

// Use with visualization library
network.nodes.forEach(node => {
  console.log(`${node.name} (${node.type}) - ${node.connectionCount} connections`);
});
```

---

### `generateInvolvementReport(subjectId, subjectType): InvolvementReport`

Generate comprehensive involvement report.

**Example:**
```typescript
const report = entityRegistry.generateInvolvementReport(senator.id, 'PERSON');

console.log(`=== Involvement Report: ${report.subjectName} ===`);
console.log(`Total associations: ${report.totalAssociations}`);
console.log(`Active associations: ${report.activeAssociations}`);
console.log(`Total financial value: $${report.totalFinancialValue}`);
console.log(`Centrality rank: ${report.centralityRank}`);

console.log('\nLegislative involvement:');
report.legislativeInvolvement.forEach(l => {
  console.log(`  - ${l.involvementType}: ${l.objectName}`);
});

console.log('\nConflicts of interest:');
report.conflictsOfInterest.forEach(c => {
  console.log(`  - ${c.description} (${c.severity})`);
});
```

---

## Types

### `VerificationLevel`

```typescript
type VerificationLevel =
  | 'NONE'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'DOCUMENT_VERIFIED'
  | 'FULL_KYC'
  | 'GOVERNMENT_VERIFIED';
```

### `InvolvementType`

```typescript
type InvolvementType =
  // Legislative
  | 'BILL_SPONSOR' | 'BILL_COSPONSOR' | 'BILL_VOTER_FOR' | 'BILL_VOTER_AGAINST'
  | 'AMENDMENT_PROPOSER' | 'COMMITTEE_MEMBER' | 'COMMITTEE_CHAIR'
  // Executive
  | 'EXECUTIVE_ORDER_SIGNER' | 'REGULATION_AUTHOR' | 'APPOINTED_OFFICIAL'
  // Judicial
  | 'CASE_JUDGE' | 'CASE_PROSECUTOR' | 'CASE_DEFENDANT' | 'OPINION_AUTHOR'
  // Financial
  | 'CAMPAIGN_DONOR' | 'LOBBYIST' | 'CONTRACT_RECIPIENT' | 'GRANT_RECIPIENT'
  // Organizational
  | 'OWNER' | 'BOARD_MEMBER' | 'EXECUTIVE' | 'EMPLOYEE' | 'INVESTOR'
  // ... and more
```

### `EntityType`

```typescript
type EntityType = 'PERSON' | 'ORGANIZATION' | 'ASSOCIATION' | 'BILL' | 'CASE' | 'REGULATION';
```

### `ChangeType`

```typescript
type ChangeType =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'MERGE' | 'FORK'
  | 'SIGN' | 'RATIFY' | 'VETO' | 'OVERRIDE' | 'AMEND' | 'REPEAL'
  | 'VERIFY' | 'DISPUTE' | 'RESOLVE';
```

---

## Best Practices

1. **Always provide authors** - Every change needs attribution
2. **Include reasons** - Document why changes are made
3. **Verify before trusting** - Use verification levels appropriately
4. **Monitor conflicts** - Review detected conflicts regularly
5. **Use source documents** - Link to official records when possible
6. **Build networks gradually** - Start with depth 1, expand as needed
