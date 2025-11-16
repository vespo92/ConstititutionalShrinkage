# Quick Start Guide

Get up and running with Constitutional Shrinkage in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 10+ installed
- Basic TypeScript knowledge

## Installation

```bash
# Clone the repository
git clone https://github.com/vespo92/ConstititutionalShrinkage.git
cd ConstititutionalShrinkage

# Install dependencies
npm install

# Build all packages
npm run build
```

## Running the Demo

See the entire system in action:

```bash
# Run the complete workflow demo
npx tsx examples/demo-full-workflow.ts
```

This demo shows:
- 👥 Citizen registration
- 🗳️ Liquid democracy (delegation)
- 📝 Bill proposal
- ⚖️ Constitutional validation
- 🔀 Git-style forking
- 📊 Impact prediction
- ✅ Voting and results
- 📜 Merging into law

## Basic Usage

### 1. Create a Bill

```typescript
import { createBill, GovernanceLevel } from '@constitutional-shrinkage/governance-utils';
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';

// Propose a new bill
const bill = createBill({
  title: 'Local Park Improvement Act',
  content: 'Allocate $500k for park renovations...',
  sponsor: 'citizen-123',
  level: GovernanceLevel.LOCAL,
  regionId: 'my-city',
  sunsetYears: 2,
});

// Validate against constitution
const validation = constitutionalFramework.validateLaw(bill);

if (validation.valid) {
  console.log('✅ Bill is constitutional!');
} else {
  console.log('❌ Constitutional violations:', validation.errors);
}
```

### 2. Vote on a Bill

```typescript
import { votingSystem, VoteChoice } from '@constitutional-shrinkage/voting-system';
import { generateKeyPair, signData } from '@constitutional-shrinkage/governance-utils';

// Register as a citizen
const myKeys = generateKeyPair();

votingSystem.registerCitizen({
  id: 'citizen-123',
  publicKey: myKeys.publicKey,
  regions: ['my-city'],
  votingPower: 1.0,
  delegations: [],
  reputation: 100,
  verificationLevel: 'full',
});

// Cast your vote
const signature = signData(`vote-${bill.id}-for`, myKeys.privateKey);

votingSystem.castVote({
  citizenId: 'citizen-123',
  billId: bill.id,
  choice: VoteChoice.FOR,
  signature,
  isPublic: true,
});

console.log('✅ Vote cast!');
```

### 3. Use Liquid Democracy

```typescript
import { DelegationScope } from '@constitutional-shrinkage/voting-system';

// Delegate your vote on environmental issues to an expert
votingSystem.delegateVote({
  delegatorId: 'citizen-123',
  delegateId: 'environmental-expert-456',
  scope: DelegationScope.CATEGORY,
  category: 'environment',
  duration: 365, // 1 year
});

console.log('✅ Delegated environmental votes for 1 year');

// Revoke delegation anytime
votingSystem.revokeDelegation('citizen-123', 'environmental-expert-456');
```

### 4. Track Metrics

```typescript
import { metricsSystem, MetricCategory } from '@constitutional-shrinkage/metrics';

// Predict impact of a policy
const impact = metricsSystem.predictImpact(
  bill.content,
  'my-city',
  ['Improved green space access', 'Community engagement']
);

console.log('Impact Predictions:');
console.log(`  People:  ${impact.shortTerm.people}`);
console.log(`  Planet:  ${impact.shortTerm.planet}`);
console.log(`  Profit:  ${impact.shortTerm.profit}`);

// Check if it meets minimum standards
const currentScore = metricsSystem.calculateScore('my-city');
const meetsStandards = metricsSystem.meetsMinimumStandards(currentScore);

if (meetsStandards) {
  console.log('✅ Meets triple bottom line requirements');
}
```

### 5. Fork and Amend

```typescript
import { forkBill, generateDiff } from '@constitutional-shrinkage/governance-utils';

// Fork an existing bill to propose changes
const myVersion = forkBill(
  bill,
  'citizen-123',
  bill.content.replace('$500k', '$750k') // Propose higher funding
);

// See what changed
const diff = generateDiff(bill.content, myVersion.content);
console.log('Changes:', diff);
```

## Package Documentation

### Core Packages

- **[constitutional-framework](./packages/constitutional-framework)** - Immutable rights and validation
- **[governance-utils](./packages/governance-utils)** - Bill management and crypto utilities
- **[voting-system](./packages/voting-system)** - Voting and liquid democracy
- **[metrics](./packages/metrics)** - Triple bottom line tracking

### Key Concepts

#### 1. Immutable Rights
Six core rights that cannot be violated by any legislation:
- Individual sovereignty
- Privacy and data ownership
- Due process
- Freedom from victimless crime prosecution
- Property rights
- Freedom of expression

#### 2. Git-Style Lawmaking
- Bills are branches
- Voting is merge approval
- Fork to propose amendments
- Full version history
- Conflict detection

#### 3. Liquid Democracy
- Vote directly on everything
- Or delegate to experts by topic
- Revoke delegation anytime
- Transparent delegation chains

#### 4. Triple Bottom Line
Every policy measured on:
- **People**: Social wellbeing
- **Planet**: Environmental health
- **Profit**: Economic prosperity

All three must meet minimum thresholds.

#### 5. Automatic Sunsets
- All laws expire after set period (1-10 years)
- Must meet performance targets to be renewed
- No more eternal bad laws

## Development

```bash
# Run development mode (all apps)
npm run dev

# Build everything
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Repository Structure

```
constitutional-shrinkage/
├── apps/                    # Applications (UI, services)
│   ├── citizen-portal/      # Citizen interface
│   ├── legislative/         # Legislative system
│   ├── executive/           # Executive functions
│   └── ...
├── packages/                # Shared packages
│   ├── constitutional-framework/
│   ├── governance-utils/
│   ├── voting-system/
│   └── metrics/
├── examples/                # Example code
│   └── demo-full-workflow.ts
└── docs/                    # Documentation
```

## Next Steps

1. **Explore the Demo**: Run the full workflow example
2. **Read the Docs**: Check out `/docs` for detailed information
3. **Build an App**: Use the packages to build governance apps
4. **Contribute**: See [CONTRIBUTING.md](./CONTRIBUTING.md)
5. **Join the Movement**: Help us reimagine governance!

## Common Workflows

### Propose a New Law
1. Create bill with `createBill()`
2. Validate with `constitutionalFramework.validateLaw()`
3. Create voting session with `votingSystem.createSession()`
4. Citizens vote
5. Merge with `mergeBill()` if passed

### Delegate Your Vote
1. Find an expert you trust
2. Delegate with `votingSystem.delegateVote()`
3. Specify scope (all, category, or single bill)
4. Revoke anytime with `revokeDelegation()`

### Track Performance
1. Register metrics with `metricsSystem.registerMetric()`
2. Update values with `updateMetric()`
3. Calculate scores with `calculateScore()`
4. Predict impact with `predictImpact()`
5. Compare regions with `compareRegions()`

## Troubleshooting

### Build Errors
```bash
# Clean everything and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build
```

### TypeScript Errors
Make sure you're using Node 18+ and have built the packages:
```bash
npm run build
```

### Import Errors
Ensure packages are built before importing:
```bash
cd packages/constitutional-framework && npm run build
```

## Get Help

- 📚 [Full Documentation](./docs)
- 🐛 [Report Issues](https://github.com/vespo92/ConstititutionalShrinkage/issues)
- 💬 [Discussions](https://github.com/vespo92/ConstititutionalShrinkage/discussions)
- 📖 [Contributing Guide](./CONTRIBUTING.md)

## Philosophy

This isn't just code - it's a blueprint for the future of governance:

- **Direct Democracy**: Your vote actually matters
- **Transparency**: All data public, all votes visible
- **Accountability**: Metrics-driven, automatic sunsets
- **Regional Autonomy**: Local control for local issues
- **Constitutional Protection**: Immutable rights enforced
- **Performance-Based**: Laws that don't work disappear

**Power to the people! Let's build the government we deserve!** 🚀
