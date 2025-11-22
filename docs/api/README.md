# API Reference

> Complete API documentation for all Constitutional Shrinkage packages.

## Packages Overview

| Package | Purpose | Status |
|---------|---------|--------|
| [`constitutional-framework`](./constitutional-framework.md) | Core constitutional rights and law validation | Complete |
| [`voting-system`](./voting-system.md) | Secure voting with liquid democracy | Complete |
| [`governance-utils`](./governance-utils.md) | Bill management and cryptographic utilities | Complete |
| [`metrics`](./metrics.md) | Triple Bottom Line metrics tracking | Complete |
| [`entity-registry`](./entity-registry.md) | Git-style government entity tracking | Complete |
| [`business-transparency`](./business-transparency.md) | Employment and supply chain transparency | Complete |

## Quick Start

```typescript
// Import packages
import { constitutionalFramework, validateLaw } from '@constitutional-shrinkage/constitutional-framework';
import { votingSystem, VotingSystem } from '@constitutional-shrinkage/voting-system';
import { createBill, forkBill, mergeBill } from '@constitutional-shrinkage/governance-utils';
import { metricsSystem, predictImpact } from '@constitutional-shrinkage/metrics';
import { entityRegistry, EntityRegistry } from '@constitutional-shrinkage/entity-registry';
import { BusinessTransparencySystem, SupplyChainTransparencySystem } from '@constitutional-shrinkage/business-transparency';
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATIONS LAYER                        │
│  legislative | citizen-portal | executive | judicial | ...  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SHARED PACKAGES                           │
├─────────────────┬──────────────────┬───────────────────────┤
│ constitutional- │  voting-system   │   governance-utils    │
│ framework       │                  │                       │
├─────────────────┼──────────────────┼───────────────────────┤
│    metrics      │ entity-registry  │ business-transparency │
└─────────────────┴──────────────────┴───────────────────────┘
```

## Package Dependencies

```
entity-registry
    └── (standalone)

constitutional-framework
    └── (standalone)

governance-utils
    └── constitutional-framework (types)

voting-system
    └── governance-utils (crypto functions)

metrics
    └── (standalone)

business-transparency
    └── (standalone)
```

## Common Patterns

### Singleton Instances

Most packages export a singleton instance for convenience:

```typescript
// Use singleton
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
constitutionalFramework.validateLaw(myLaw);

// Or create your own instance
import { ConstitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
const myFramework = new ConstitutionalFramework();
```

### Error Handling

All packages throw descriptive errors:

```typescript
try {
  votingSystem.castVote({
    citizenId: 'citizen-1',
    billId: 'bill-1',
    choice: VoteChoice.FOR,
    signature: sig,
  });
} catch (error) {
  if (error.message === 'Already voted on this bill') {
    // Handle duplicate vote
  }
}
```

### TypeScript Types

All packages are fully typed. Import types directly:

```typescript
import type {
  Law,
  Right,
  ValidationResult,
  GovernanceLevel,
} from '@constitutional-shrinkage/constitutional-framework';
```

## Version Compatibility

All packages follow semantic versioning. Current versions:

- All packages: `1.0.0`

## Contributing

See [CONTRIBUTING.md](/CONTRIBUTING.md) for guidelines on improving these packages.
