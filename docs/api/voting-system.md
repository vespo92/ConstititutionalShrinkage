# Voting System API

> Secure, transparent voting with liquid democracy support.

## Installation

```typescript
import {
  VotingSystem,
  votingSystem,
  Vote,
  VoteChoice,
  Delegation,
  VotingSession,
} from '@constitutional-shrinkage/voting-system';
```

## Overview

The Voting System package provides:
- Direct democracy voting on bills
- Liquid democracy delegation
- Cryptographic vote verification
- Weighted voting based on delegations
- Sybil resistance and vote buying prevention

---

## Class: VotingSystem

### Constructor

```typescript
const system = new VotingSystem();
```

---

### Methods

#### `castVote(params): Vote`

Cast a vote on a bill.

**Parameters:**
```typescript
{
  citizenId: string;      // Voter's citizen ID
  billId: string;         // Bill being voted on
  choice: VoteChoice;     // FOR, AGAINST, or ABSTAIN
  signature: any;         // Cryptographic signature
  isPublic?: boolean;     // Whether vote is public (default: true)
}
```

**Returns:** `Vote` - The recorded vote

**Throws:**
- `Identity verification failed` - Invalid signature
- `Citizen not found` - Unregistered voter
- `Voting session is not active` - Session closed/pending
- `Already voted on this bill` - Duplicate vote

**Example:**
```typescript
import { votingSystem, VoteChoice } from '@constitutional-shrinkage/voting-system';
import { generateSignature } from '@constitutional-shrinkage/governance-utils';

const vote = votingSystem.castVote({
  citizenId: 'citizen-001',
  billId: 'bill-climate-2025',
  choice: VoteChoice.FOR,
  signature: generateSignature('citizen-001', privateKey),
  isPublic: true,
});

console.log(`Vote ID: ${vote.voteId}`);
console.log(`Weight: ${vote.weight}`);
console.log(`Delegation chain: ${vote.delegationChain.join(' -> ')}`);
```

---

#### `delegateVote(params): Delegation`

Delegate voting power to another citizen (liquid democracy).

**Parameters:**
```typescript
{
  delegatorId: string;    // Person delegating
  delegateId: string;     // Person receiving delegation
  scope: DelegationScope; // ALL, CATEGORY, or SINGLE_BILL
  category?: string;      // Topic category (if scope is CATEGORY)
  duration?: number;      // Days until expiration
}
```

**Returns:** `Delegation` - The created delegation

**Throws:**
- `Delegator not found` - Invalid delegator
- `Delegate not found` - Invalid delegate
- `Circular delegation detected` - Would create a loop

**Example:**
```typescript
import { votingSystem, DelegationScope } from '@constitutional-shrinkage/voting-system';

// Delegate all environmental votes to an expert
const delegation = votingSystem.delegateVote({
  delegatorId: 'citizen-001',
  delegateId: 'expert-environmental',
  scope: DelegationScope.CATEGORY,
  category: 'ENVIRONMENT',
  duration: 365, // 1 year
});

console.log(`Delegation active until: ${delegation.expiresAt}`);
```

---

#### `revokeDelegation(delegatorId, delegateId): boolean`

Revoke a previously created delegation.

**Parameters:**
- `delegatorId: string` - Person who created the delegation
- `delegateId: string` - Person who received the delegation

**Returns:** `boolean` - Whether revocation succeeded

**Example:**
```typescript
const revoked = votingSystem.revokeDelegation('citizen-001', 'expert-environmental');
if (revoked) {
  console.log('Delegation successfully revoked');
}
```

---

#### `getResults(billId): VoteResults`

Get current voting results for a bill.

**Parameters:**
- `billId: string` - The bill to get results for

**Returns:** `VoteResults`

**Example:**
```typescript
const results = votingSystem.getResults('bill-climate-2025');

console.log(`For: ${results.for} (weighted: ${results.weightedFor})`);
console.log(`Against: ${results.against} (weighted: ${results.weightedAgainst})`);
console.log(`Abstain: ${results.abstain} (weighted: ${results.weightedAbstain})`);
console.log(`Total: ${results.total}`);
console.log(`Quorum met: ${results.quorumMet}`);
console.log(`Passed: ${results.passed}`);
```

---

#### `createSession(params): VotingSession`

Create a new voting session for a bill.

**Parameters:**
```typescript
{
  billId: string;       // Bill ID
  startDate: Date;      // When voting opens
  endDate: Date;        // When voting closes
  quorum: QuorumRules;  // Minimum participation and approval thresholds
}
```

**Returns:** `VotingSession`

**Example:**
```typescript
const session = votingSystem.createSession({
  billId: 'bill-climate-2025',
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-01-30'),
  quorum: {
    minimumParticipation: 0.5,  // 50% must vote
    approvalThreshold: 0.6,     // 60% approval to pass
  },
});

console.log(`Session status: ${session.status}`);
```

---

#### `registerCitizen(citizen): void`

Register a new citizen in the voting system.

**Parameters:**
- `citizen: Citizen` - The citizen to register

**Example:**
```typescript
votingSystem.registerCitizen({
  id: 'citizen-001',
  name: 'Jane Doe',
  regionId: 'CA',
  votingPower: 1.0,
  delegations: [],
  expertiseAreas: ['ENVIRONMENT', 'TECHNOLOGY'],
});
```

---

## Types

### `VoteChoice`

```typescript
enum VoteChoice {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
}
```

### `DelegationScope`

```typescript
enum DelegationScope {
  ALL = 'ALL',              // All votes
  CATEGORY = 'CATEGORY',    // Specific topic area
  SINGLE_BILL = 'SINGLE_BILL', // One specific bill
}
```

### `VotingStatus`

```typescript
enum VotingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}
```

### `Vote`

```typescript
interface Vote {
  voteId: string;
  citizenId: string;
  billId: string;
  choice: VoteChoice;
  weight: number;              // Total voting power including delegations
  timestamp: Date;
  cryptographicProof: string;  // Proof of vote integrity
  delegationChain: string[];   // IDs of people who delegated
  isPublic: boolean;
}
```

### `Delegation`

```typescript
interface Delegation {
  delegatorId: string;
  delegateId: string;
  scope: DelegationScope;
  category?: string;
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}
```

### `VoteResults`

```typescript
interface VoteResults {
  for: number;
  against: number;
  abstain: number;
  total: number;
  weightedFor: number;
  weightedAgainst: number;
  weightedAbstain: number;
  quorumMet: boolean;
  passed: boolean;
}
```

### `Citizen`

```typescript
interface Citizen {
  id: string;
  name: string;
  regionId: string;
  votingPower: number;
  delegations: Delegation[];
  expertiseAreas: string[];
}
```

### `QuorumRules`

```typescript
interface QuorumRules {
  minimumParticipation: number; // 0-1, percentage of eligible voters
  approvalThreshold: number;    // 0-1, percentage needed to pass
}
```

---

## Usage Examples

### Complete Voting Workflow

```typescript
import { votingSystem, VoteChoice, DelegationScope, VotingStatus } from '@constitutional-shrinkage/voting-system';

// 1. Register citizens
votingSystem.registerCitizen({
  id: 'alice',
  name: 'Alice Johnson',
  regionId: 'CA',
  votingPower: 1.0,
  delegations: [],
  expertiseAreas: ['ENVIRONMENT'],
});

votingSystem.registerCitizen({
  id: 'bob',
  name: 'Bob Smith',
  regionId: 'CA',
  votingPower: 1.0,
  delegations: [],
  expertiseAreas: [],
});

// 2. Bob delegates to Alice for environmental issues
votingSystem.delegateVote({
  delegatorId: 'bob',
  delegateId: 'alice',
  scope: DelegationScope.CATEGORY,
  category: 'ENVIRONMENT',
});

// 3. Create voting session
const session = votingSystem.createSession({
  billId: 'bill-solar-incentives',
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  quorum: {
    minimumParticipation: 0.1,
    approvalThreshold: 0.5,
  },
});

// 4. Alice votes (her vote carries Bob's weight too)
const vote = votingSystem.castVote({
  citizenId: 'alice',
  billId: 'bill-solar-incentives',
  choice: VoteChoice.FOR,
  signature: { /* signature data */ },
});

console.log(`Alice's vote weight: ${vote.weight}`); // 2.0 (her + Bob's delegation)

// 5. Check results
const results = votingSystem.getResults('bill-solar-incentives');
console.log(`Bill ${results.passed ? 'PASSED' : 'FAILED'}`);
```

### Liquid Democracy Override

```typescript
// Bob delegated to Alice, but wants to vote differently on a specific bill
// Bob can override his delegation by voting directly

// Bob votes against (overrides his delegation to Alice)
votingSystem.castVote({
  citizenId: 'bob',
  billId: 'bill-nuclear-power',
  choice: VoteChoice.AGAINST,
  signature: bobSignature,
});

// This removes Bob's weight from Alice's delegated power for this bill only
```

---

## Security Features

### Sybil Resistance
- Citizens must be verified before voting
- Identity verification via `governance-utils` crypto

### Vote Buying Prevention
- All votes (if public) are transparent
- Delegation chains are visible
- No way to prove specific vote to a buyer

### Circular Delegation Prevention
- System checks for loops before accepting delegations
- Throws error if circular delegation would be created

### Cryptographic Proofs
- Each vote includes a cryptographic proof
- Enables verification without revealing ballot content

---

## Best Practices

1. **Set reasonable quorums** - Too high prevents passage, too low lacks legitimacy
2. **Use category delegations** - More flexible than all-or-nothing
3. **Monitor delegation chains** - Watch for concentration of power
4. **Allow override voting** - Citizens should always be able to vote directly
5. **Set session duration appropriately** - Enough time for participation
