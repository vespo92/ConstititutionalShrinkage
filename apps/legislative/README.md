# Legislative System

## Overview
A decentralized, git-style legislative system that replaces the traditional Congress model with a distributed, version-controlled approach to lawmaking.

## Key Features

### Git-Style Legislation
- **Bill Branching**: Propose bills as branches from the constitutional main branch
- **Pull Requests for Laws**: Bills are submitted as PRs with full diff visibility
- **Peer Review**: Regional representatives and citizens review and comment
- **Merge Conflicts**: Automatically detect conflicts with existing laws
- **Version Control**: Complete history of all legislative changes

### Decentralized Regional Pods
- Regional legislative pods with local autonomy
- Hierarchical merge structure: Local → Regional → National
- Opt-in/opt-out mechanisms for regional variations

### Direct Democracy Integration
- Citizens can propose bills directly
- Transparent voting with cryptographic verification
- Real-time bill status and amendments
- Fork and improve existing legislation

### Metrics & Accountability
- Triple bottom line impact assessment (People, Planet, Profit)
- Automatic sunset clauses for all legislation
- Performance metrics for each law
- A/B testing for policy variations across regions

## Architecture
```
legislative/
├── src/
│   ├── bill-proposals/    # Bill creation and management
│   ├── voting/            # Voting mechanisms
│   ├── merging/           # Law merge and conflict resolution
│   ├── regional-pods/     # Regional governance structures
│   └── metrics/           # Legislative impact tracking
```

## Roadmap to 2030
See `/docs/roadmap/legislative-transition.md` for the complete transition plan from the current Congress model.
