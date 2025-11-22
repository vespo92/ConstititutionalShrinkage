# Governance Utils API

> Git-style bill management and cryptographic utilities.

## Installation

```typescript
import {
  createBill,
  forkBill,
  mergeBill,
  generateDiff,
  parseDiff,
  proposeAmendment,
  addCoSponsor,
  detectConflicts,
  generateKeyPair,
  generateProof,
  verifyIdentity,
} from '@constitutional-shrinkage/governance-utils';
```

## Overview

The Governance Utils package provides:
- Bill creation and lifecycle management
- Git-style forking, merging, and diffing
- Amendment proposals
- Cryptographic key generation and signing
- Identity verification

---

## Bill Management Functions

### `createBill(params): Bill`

Create a new legislative bill.

**Parameters:**
```typescript
{
  title: string;           // Bill title
  content: string;         // Full bill text
  sponsor: string;         // Primary sponsor ID
  level: GovernanceLevel;  // FEDERAL, REGIONAL, LOCAL
  regionId?: string;       // Region ID if regional
  sunsetYears?: number;    // Years until expiration (default: 5)
}
```

**Returns:** `Bill` - The created bill

**Example:**
```typescript
import { createBill } from '@constitutional-shrinkage/governance-utils';
import { GovernanceLevel } from '@constitutional-shrinkage/constitutional-framework';

const bill = createBill({
  title: 'Clean Energy Investment Act',
  content: `
    Section 1. Purpose
    This act promotes investment in clean energy infrastructure.

    Section 2. Tax Incentives
    Businesses investing in renewable energy receive a 30% tax credit.

    Section 3. Reporting Requirements
    Annual reporting on energy usage and carbon reduction.
  `,
  sponsor: 'senator-green',
  level: GovernanceLevel.FEDERAL,
  sunsetYears: 10,
});

console.log(`Bill ID: ${bill.id}`);
console.log(`Git branch: ${bill.gitBranch}`);
console.log(`Sunset date: ${bill.sunsetDate}`);
```

---

### `forkBill(originalBill, proposer, proposedChanges): Bill`

Fork an existing bill to propose changes (like git fork).

**Parameters:**
- `originalBill: Bill` - The bill to fork
- `proposer: string` - ID of person proposing changes
- `proposedChanges: string` - Modified bill content

**Returns:** `Bill` - The forked bill with diff

**Example:**
```typescript
const forkedBill = forkBill(
  originalBill,
  'senator-progressive',
  `
    Section 1. Purpose
    This act promotes investment in clean energy infrastructure.

    Section 2. Tax Incentives
    Businesses investing in renewable energy receive a 50% tax credit.
    Small businesses receive additional 10% bonus.

    Section 3. Reporting Requirements
    Quarterly reporting on energy usage and carbon reduction.
  `
);

console.log(`Forked from: ${forkedBill.parentBillId}`);
console.log(`Diff:\n${forkedBill.diff}`);
```

---

### `mergeBill(bill): Bill`

Merge a bill into law (passes the bill).

**Parameters:**
- `bill: Bill` - The bill to merge

**Returns:** `Bill` - The merged bill with ACTIVE status

**Throws:**
- `Cannot merge bill: voting requirements not met` - If quorum/approval thresholds not met

**Example:**
```typescript
// After voting passes
bill.votes = {
  for: 300,
  against: 100,
  abstain: 50,
  total: 450,
  quorumMet: true,
  approvalThresholdMet: true,
};

const law = mergeBill(bill);

console.log(`Status: ${law.status}`); // 'ACTIVE'
console.log(`Ratified at: ${law.ratifiedAt}`);
console.log(`Commit hash: ${law.gitCommitHash}`);
```

---

### `generateDiff(oldContent, newContent): string`

Generate a diff between two versions of text.

**Parameters:**
- `oldContent: string` - Original text
- `newContent: string` - Modified text

**Returns:** `string` - Unified diff format

**Example:**
```typescript
const diff = generateDiff(
  'Tax rate is 25%',
  'Tax rate is 30%'
);

console.log(diff);
// - Tax rate is 25%
// + Tax rate is 30%
```

---

### `parseDiff(diff): BillDiff`

Parse a diff string into structured format.

**Parameters:**
- `diff: string` - Diff string to parse

**Returns:** `BillDiff`
```typescript
{
  additions: string[];
  deletions: string[];
  modifications: Array<{ before: string; after: string }>;
}
```

**Example:**
```typescript
const parsed = parseDiff(diff);

console.log('Added lines:', parsed.additions);
console.log('Removed lines:', parsed.deletions);
console.log('Modified lines:', parsed.modifications);
```

---

### `proposeAmendment(bill, proposer, description, changes): Amendment`

Propose an amendment to an existing bill.

**Parameters:**
- `bill: Bill` - The bill to amend
- `proposer: string` - ID of person proposing
- `description: string` - Description of the amendment
- `changes: string` - Proposed modified content

**Returns:** `Amendment`

**Example:**
```typescript
const amendment = proposeAmendment(
  cleanEnergyBill,
  'senator-moderate',
  'Increase tax credit for small businesses',
  modifiedContent
);

console.log(`Amendment ID: ${amendment.id}`);
console.log(`Status: ${amendment.status}`); // 'proposed'
```

---

### `addCoSponsor(bill, coSponsorId): Bill`

Add a co-sponsor to a bill.

**Parameters:**
- `bill: Bill` - The bill
- `coSponsorId: string` - ID of co-sponsor to add

**Returns:** `Bill` - Bill with added co-sponsor

**Example:**
```typescript
const updatedBill = addCoSponsor(bill, 'senator-bipartisan');
console.log(`Co-sponsors: ${updatedBill.coSponsors.join(', ')}`);
```

---

### `detectConflicts(bill1, bill2): boolean`

Detect if two bills have potential conflicts.

**Parameters:**
- `bill1: Bill` - First bill
- `bill2: Bill` - Second bill

**Returns:** `boolean` - Whether conflicts exist

**Example:**
```typescript
const hasConflict = detectConflicts(energyBill, industrySupportBill);

if (hasConflict) {
  console.log('Bills may conflict - manual review needed');
}
```

---

## Cryptographic Functions

### `generateKeyPair(): KeyPair`

Generate a new public/private key pair.

**Returns:** `KeyPair`
```typescript
{
  publicKey: string;
  privateKey: string;
}
```

**Example:**
```typescript
const keys = generateKeyPair();
console.log(`Public key: ${keys.publicKey}`);
// Store privateKey securely!
```

---

### `generateProof(data): string`

Generate a cryptographic proof for an action.

**Parameters:**
- `data: object` - Data to generate proof for
  - `action: string`
  - `timestamp: Date`
  - `actorId: string`
  - `metadata?: object`

**Returns:** `string` - Cryptographic proof

**Example:**
```typescript
const proof = generateProof({
  action: 'vote',
  timestamp: new Date(),
  actorId: 'citizen-001',
  metadata: { billId: 'bill-123' },
});
```

---

### `verifyIdentity(citizenId, signature): boolean`

Verify a citizen's identity using their signature.

**Parameters:**
- `citizenId: string` - ID of citizen
- `signature: any` - Signature to verify

**Returns:** `boolean` - Whether identity is verified

**Example:**
```typescript
const isValid = verifyIdentity('citizen-001', signature);

if (!isValid) {
  throw new Error('Identity verification failed');
}
```

---

## Types

### `Bill`

```typescript
interface Bill extends Law {
  sponsor: string;
  coSponsors: string[];
  parentBillId?: string;    // For forked bills
  amendments: Amendment[];
  votes: VoteSummary;
  diff?: string;            // Git diff from parent
}
```

### `Amendment`

```typescript
interface Amendment {
  id: string;
  billId: string;
  proposedBy: string;
  description: string;
  diff: string;
  status: 'proposed' | 'accepted' | 'rejected';
  createdAt: Date;
}
```

### `BillDiff`

```typescript
interface BillDiff {
  additions: string[];
  deletions: string[];
  modifications: Array<{
    before: string;
    after: string;
  }>;
}
```

### `VoteSummary`

```typescript
interface VoteSummary {
  for: number;
  against: number;
  abstain: number;
  total: number;
  quorumMet: boolean;
  approvalThresholdMet: boolean;
}
```

---

## Usage Examples

### Complete Bill Lifecycle

```typescript
import {
  createBill,
  forkBill,
  proposeAmendment,
  addCoSponsor,
  mergeBill,
} from '@constitutional-shrinkage/governance-utils';
import { GovernanceLevel } from '@constitutional-shrinkage/constitutional-framework';

// 1. Create original bill
const bill = createBill({
  title: 'Infrastructure Investment Act',
  content: 'Section 1: Allocate $100B for roads and bridges.',
  sponsor: 'senator-main',
  level: GovernanceLevel.FEDERAL,
  sunsetYears: 10,
});

// 2. Another senator forks with changes
const forkedBill = forkBill(
  bill,
  'senator-alternative',
  'Section 1: Allocate $150B for roads, bridges, and rail.'
);

// 3. Original sponsor proposes amendment to incorporate feedback
const amendment = proposeAmendment(
  bill,
  'senator-main',
  'Increase funding and add rail',
  'Section 1: Allocate $150B for roads, bridges, and rail.'
);

// 4. Build coalition with co-sponsors
let finalBill = addCoSponsor(bill, 'senator-bipartisan-1');
finalBill = addCoSponsor(finalBill, 'senator-bipartisan-2');

// 5. After voting passes, merge into law
finalBill.votes = {
  for: 280,
  against: 150,
  abstain: 20,
  total: 450,
  quorumMet: true,
  approvalThresholdMet: true,
};

const law = mergeBill(finalBill);
console.log(`Law enacted! Commit: ${law.gitCommitHash}`);
```

---

## Best Practices

1. **Always include meaningful commit messages** - Use the `reason` field
2. **Fork rather than amend for major changes** - Keeps history clean
3. **Use structured content** - Section-based formatting for easy diffing
4. **Verify identity before any action** - Security first
5. **Keep sunset dates reasonable** - 5-10 years is typical
