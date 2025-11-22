# Agent Deployment Guide

## Constitutional Shrinkage - Parallel Agent Coordination

**Version:** 1.0
**Date:** 2025-11-22
**Status:** Active Deployment
**Sync Target:** `main` branch

---

## Overview

This document coordinates **5 parallel AI agents** working simultaneously on different branches to accelerate development of the Constitutional Shrinkage platform. Each agent operates independently on their designated branch and syncs back to `main` upon completion.

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                         main                                │
                    └─────────────────────────────────────────────────────────────┘
                                              │
          ┌───────────────┬──────────────────┼──────────────────┬────────────────┐
          │               │                  │                  │                │
          ▼               ▼                  ▼                  ▼                ▼
    ┌──────────┐   ┌──────────┐       ┌──────────┐       ┌──────────┐     ┌──────────┐
    │ Agent_1  │   │ Agent_2  │       │ Agent_3  │       │ Agent_4  │     │ Agent_5  │
    │Legislative│   │ Citizen  │       │ Database │       │ Testing  │     │  API     │
    │   App    │   │  Portal  │       │ & Schema │       │ Suite    │     │ Services │
    └──────────┘   └──────────┘       └──────────┘       └──────────┘     └──────────┘
```

---

## Branch Naming Convention

All agent branches follow this pattern:
```
claude/agent-{N}-{domain}-{session-id}
```

---

## Agent Assignments

### Agent_1: Legislative Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-1-legislative-app` |
| **Priority** | HIGH |
| **Target Directory** | `apps/legislative/` |
| **Dependencies** | All 6 packages in `packages/` |

#### Scope of Work

**Estimation Tasks:**
- [ ] Audit existing `apps/legislative/package.json` stub
- [ ] Estimate LOC for bill creation UI with markdown support
- [ ] Estimate LOC for git-style forking/branching interface
- [ ] Estimate LOC for visual diff viewer component
- [ ] Estimate LOC for constitutional compliance checker integration
- [ ] Estimate LOC for voting interface with liquid democracy

**Implementation Tasks:**
- [ ] Set up Next.js 14 project structure
- [ ] Create bill creation/editing components
- [ ] Implement bill listing and search
- [ ] Build visual diff viewer (like GitHub PR diffs)
- [ ] Create amendment proposal workflow
- [ ] Integrate with `packages/constitutional-framework`
- [ ] Integrate with `packages/voting-system`
- [ ] Integrate with `packages/metrics-system`

**Files to Create/Modify:**
```
apps/legislative/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── bills/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── vote/
│   │   │   └── [billId]/page.tsx
│   │   └── amendments/
│   │       └── [billId]/page.tsx
│   ├── components/
│   │   ├── BillEditor.tsx
│   │   ├── DiffViewer.tsx
│   │   ├── VotingPanel.tsx
│   │   ├── ConstitutionalCheck.tsx
│   │   └── ImpactPredictor.tsx
│   └── lib/
│       └── api.ts
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

### Agent_2: Citizen Portal Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-2-citizen-portal` |
| **Priority** | HIGH |
| **Target Directory** | `apps/citizen-portal/` |
| **Dependencies** | All 6 packages in `packages/` |

#### Scope of Work

**Estimation Tasks:**
- [ ] Audit existing `apps/citizen-portal/package.json` stub
- [ ] Estimate LOC for user dashboard
- [ ] Estimate LOC for delegation management UI
- [ ] Estimate LOC for voting history/transparency view
- [ ] Estimate LOC for notification system
- [ ] Estimate LOC for regional pod discovery

**Implementation Tasks:**
- [ ] Set up Next.js 14 project structure
- [ ] Create user registration flow
- [ ] Build main dashboard with relevant bills
- [ ] Implement delegation management (liquid democracy)
- [ ] Create voting history viewer
- [ ] Build notification center
- [ ] Implement regional pod discovery
- [ ] Integrate with `packages/voting-system`
- [ ] Integrate with `packages/entity-registry`

**Files to Create/Modify:**
```
apps/citizen-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── delegations/
│   │   │   ├── page.tsx
│   │   │   └── manage/page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── regions/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── DelegationManager.tsx
│   │   ├── VotingHistory.tsx
│   │   ├── NotificationCenter.tsx
│   │   └── RegionalPodCard.tsx
│   └── lib/
│       └── api.ts
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

### Agent_3: Database & Schema Infrastructure

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-3-database-schema` |
| **Priority** | HIGH |
| **Target Directory** | `infrastructure/database/` |
| **Dependencies** | `docs/data-models/` |

#### Scope of Work

**Estimation Tasks:**
- [ ] Audit existing data models in `docs/data-models/`
- [ ] Estimate tables needed for PostgreSQL schema
- [ ] Estimate indexes for performance optimization
- [ ] Estimate migration complexity from entity-registry types
- [ ] Estimate MongoDB collections for document storage

**Implementation Tasks:**
- [ ] Create PostgreSQL schema DDL files
- [ ] Define all entity tables (Person, Organization, Bill, Vote, etc.)
- [ ] Create association/relationship tables
- [ ] Define indexes per recommendations in docs
- [ ] Create migration scripts (up/down)
- [ ] Set up Prisma ORM configuration
- [ ] Create seed data for development
- [ ] Document schema in ERD format

**Files to Create/Modify:**
```
infrastructure/
├── database/
│   ├── postgres/
│   │   ├── schema/
│   │   │   ├── 001_core_entities.sql
│   │   │   ├── 002_associations.sql
│   │   │   ├── 003_voting.sql
│   │   │   ├── 004_legislation.sql
│   │   │   ├── 005_metrics.sql
│   │   │   └── 006_indexes.sql
│   │   ├── migrations/
│   │   │   └── .gitkeep
│   │   └── seeds/
│   │       └── development.sql
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── docker-compose.yml
└── README.md
```

---

### Agent_4: Testing Infrastructure

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-4-testing-suite` |
| **Priority** | MEDIUM |
| **Target Directory** | `packages/*/tests/`, `tests/` |
| **Dependencies** | All 6 packages |

#### Scope of Work

**Estimation Tasks:**
- [ ] Audit each package for testable functions
- [ ] Estimate unit tests needed per package (target 80%+ coverage)
- [ ] Estimate integration test scenarios
- [ ] Estimate E2E test critical paths
- [ ] Estimate security test cases (vote tampering, Sybil attacks)

**Implementation Tasks:**
- [ ] Set up Vitest/Jest configuration
- [ ] Write unit tests for `packages/constitutional-framework`
- [ ] Write unit tests for `packages/voting-system`
- [ ] Write unit tests for `packages/business-transparency`
- [ ] Write unit tests for `packages/governance-utils`
- [ ] Write unit tests for `packages/metrics-system`
- [ ] Write unit tests for `packages/entity-registry`
- [ ] Create integration test suite
- [ ] Set up Playwright for E2E tests
- [ ] Create security test suite

**Target Coverage:**
| Package | Target |
|---------|--------|
| constitutional-framework | 90%+ |
| voting-system | 90%+ |
| business-transparency | 80%+ |
| governance-utils | 80%+ |
| metrics-system | 80%+ |
| entity-registry | 85%+ |

**Files to Create/Modify:**
```
packages/
├── constitutional-framework/
│   └── tests/
│       ├── rights.test.ts
│       ├── validation.test.ts
│       └── amendments.test.ts
├── voting-system/
│   └── tests/
│       ├── voting.test.ts
│       ├── delegation.test.ts
│       └── verification.test.ts
├── business-transparency/
│   └── tests/
│       ├── employment.test.ts
│       └── supply-chain.test.ts
├── governance-utils/
│   └── tests/
│       └── utils.test.ts
├── metrics-system/
│   └── tests/
│       ├── metrics.test.ts
│       └── sunset.test.ts
└── entity-registry/
    └── tests/
        ├── entities.test.ts
        ├── history.test.ts
        └── blame.test.ts

tests/
├── integration/
│   ├── bill-workflow.test.ts
│   └── vote-delegation.test.ts
├── e2e/
│   ├── citizen-journey.spec.ts
│   └── legislative-workflow.spec.ts
└── security/
    ├── vote-tampering.test.ts
    └── sybil-attack.test.ts
```

---

### Agent_5: API Services Layer

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-5-api-services` |
| **Priority** | MEDIUM |
| **Target Directory** | `services/` |
| **Dependencies** | All 6 packages, database schema |

#### Scope of Work

**Estimation Tasks:**
- [ ] Estimate API endpoints needed for legislative app
- [ ] Estimate API endpoints needed for citizen portal
- [ ] Estimate authentication service complexity
- [ ] Estimate notification service architecture
- [ ] Estimate search service (Elasticsearch integration)

**Implementation Tasks:**
- [ ] Set up API Gateway (Express/Fastify)
- [ ] Create authentication service (NextAuth.js integration)
- [ ] Create bill service (CRUD, versioning, diffs)
- [ ] Create vote service (casting, verification, tallying)
- [ ] Create user service (profiles, delegations)
- [ ] Create notification service (real-time updates)
- [ ] Create search service (full-text search)
- [ ] Define OpenAPI/Swagger specifications
- [ ] Implement rate limiting and security middleware

**Files to Create/Modify:**
```
services/
├── api-gateway/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── bills.ts
│   │   │   ├── votes.ts
│   │   │   ├── users.ts
│   │   │   └── delegations.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validation.ts
│   │   └── lib/
│   │       └── db.ts
│   ├── package.json
│   └── tsconfig.json
├── auth-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── strategies/
│   │   └── tokens.ts
│   └── package.json
├── notification-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── channels/
│   │   └── templates/
│   └── package.json
└── search-service/
    ├── src/
    │   ├── index.ts
    │   └── indexers/
    └── package.json
```

---

## Deployment Commands

### Spawn All Agents

```bash
# Agent_1: Legislative App
git checkout -b claude/agent-1-legislative-app main
# Assign: "Estimate and implement the Legislative application in apps/legislative/"

# Agent_2: Citizen Portal
git checkout -b claude/agent-2-citizen-portal main
# Assign: "Estimate and implement the Citizen Portal in apps/citizen-portal/"

# Agent_3: Database Schema
git checkout -b claude/agent-3-database-schema main
# Assign: "Design and create PostgreSQL schema and Prisma configuration"

# Agent_4: Testing Suite
git checkout -b claude/agent-4-testing-suite main
# Assign: "Create comprehensive test suite for all packages"

# Agent_5: API Services
git checkout -b claude/agent-5-api-services main
# Assign: "Design and implement backend API services"
```

### Sync Strategy

Each agent should:
1. Create their feature branch from `main`
2. Make incremental commits with clear messages
3. Push to their designated branch
4. Create a PR to `main` when complete
5. Request review from other agents if dependencies exist

### Merge Order (Recommended)

```
1. Agent_3 (Database) → main       # Foundation first
2. Agent_5 (API) → main            # Services depend on DB
3. Agent_4 (Testing) → main        # Tests can run against services
4. Agent_1 (Legislative) → main    # App uses API + DB
5. Agent_2 (Citizen Portal) → main # App uses API + DB
```

---

## Agent Communication Protocol

### Cross-Agent Dependencies

| Agent | Depends On | Blocks |
|-------|------------|--------|
| Agent_1 | Agent_3, Agent_5 | None |
| Agent_2 | Agent_3, Agent_5 | None |
| Agent_3 | None | Agent_1, Agent_2, Agent_5 |
| Agent_4 | All packages | None |
| Agent_5 | Agent_3 | Agent_1, Agent_2 |

### Handoff Format

When an agent completes work that another depends on:

```markdown
## Handoff: Agent_3 → Agent_5

**Branch:** claude/agent-3-database-schema
**Status:** Ready for consumption
**Key Files:**
- infrastructure/database/prisma/schema.prisma
- infrastructure/database/postgres/schema/*.sql

**Integration Notes:**
- Import Prisma client from `@constitutional/database`
- Connection string in `.env.local`
```

---

## Estimation Output Format

Each agent should produce an estimation report:

```markdown
## Agent_{N} Estimation Report

### Summary
| Metric | Value |
|--------|-------|
| Total Files | X |
| Estimated LOC | X,XXX |
| Complexity | Low/Medium/High |
| Dependencies | List |
| Estimated Duration | X days |

### Detailed Breakdown

#### Component 1: [Name]
- Files: X
- LOC: XXX
- Complexity: X
- Notes: ...

#### Component 2: [Name]
...
```

---

## Progress Tracking

### Status Legend
- `NOT_STARTED` - Agent not yet deployed
- `ESTIMATING` - Agent gathering requirements
- `IN_PROGRESS` - Implementation underway
- `BLOCKED` - Waiting on dependency
- `REVIEW` - PR created, awaiting review
- `COMPLETE` - Merged to main

### Current Status

| Agent | Branch | Status | Progress |
|-------|--------|--------|----------|
| Agent_1 | `claude/agent-1-legislative-app` | NOT_STARTED | 0% |
| Agent_2 | `claude/agent-2-deployment-docs-01Ya5XVQB6kwfpoMqegSKdNA` | COMPLETE | 100% |
| Agent_3 | `claude/agent-3-database-schema` | NOT_STARTED | 0% |
| Agent_4 | `claude/agent-4-testing-suite` | NOT_STARTED | 0% |
| Agent_5 | `claude/agent-5-api-services` | NOT_STARTED | 0% |

---

## Agent_2 Completion Report

### Summary
Agent_2 has completed implementation of the **Citizen Portal Application** with full Next.js 14 App Router architecture.

### Files Created (25+ files)

**Configuration:**
- `apps/citizen-portal/package.json` - Updated with proper dependencies
- `apps/citizen-portal/tsconfig.json` - TypeScript configuration
- `apps/citizen-portal/next.config.js` - Next.js configuration
- `apps/citizen-portal/tailwind.config.js` - Tailwind CSS configuration
- `apps/citizen-portal/postcss.config.js` - PostCSS configuration
- `apps/citizen-portal/ESTIMATION_REPORT.md` - Detailed estimation report

**App Router Pages:**
- `src/app/layout.tsx` - Root layout with Header and Navigation
- `src/app/page.tsx` - Landing page with quick actions
- `src/app/globals.css` - Global styles with Tailwind
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/app/delegations/page.tsx` - Delegation overview
- `src/app/delegations/manage/page.tsx` - Create new delegation
- `src/app/history/page.tsx` - Voting history
- `src/app/regions/page.tsx` - Regional governance
- `src/app/profile/page.tsx` - User profile settings

**Components:**
- `src/components/Header.tsx` - App header with notifications
- `src/components/Navigation.tsx` - Sidebar navigation
- `src/components/Dashboard.tsx` - Dashboard with active bills
- `src/components/DelegationManager.tsx` - Delegation list management
- `src/components/VotingHistory.tsx` - Vote record viewer
- `src/components/NotificationCenter.tsx` - Notification system
- `src/components/RegionalPodCard.tsx` - Region cards

**Library & Utilities:**
- `src/lib/api.ts` - Full API client layer
- `src/lib/types.ts` - TypeScript type definitions
- `src/lib/utils.ts` - Utility functions

**Custom Hooks:**
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useDelegations.ts` - Delegation management hook
- `src/hooks/useNotifications.ts` - Notification hook
- `src/hooks/index.ts` - Hook exports

### Features Implemented
- [x] User dashboard with active bills
- [x] Liquid democracy delegation management
- [x] Voting history with transparency
- [x] Regional pod discovery
- [x] User profile with verification levels
- [x] Notification center
- [x] Full API client integration layer
- [x] Custom React hooks for state management

### Integration Points
- Integrates with `@constitutional-shrinkage/voting-system`
- Integrates with `@constitutional-shrinkage/entity-registry`
- Integrates with `@constitutional-shrinkage/constitutional-framework`
- Integrates with `@constitutional-shrinkage/governance-utils`

### Next Steps for Other Agents
- Agent_3 (Database): Citizen Portal needs database schema for users, votes, delegations
- Agent_5 (API): Citizen Portal API layer ready to consume backend endpoints

---

## Quick Reference Cards

### Agent_1 Quick Card
```
AGENT: 1 - Legislative App
BRANCH: claude/agent-1-legislative-app
TARGET: apps/legislative/
PRIORITY: HIGH
PACKAGES: constitutional-framework, voting-system, metrics-system
KEY DELIVERABLES:
  - Bill creation UI
  - Diff viewer
  - Voting interface
  - Constitutional compliance checker
```

### Agent_2 Quick Card
```
AGENT: 2 - Citizen Portal
BRANCH: claude/agent-2-citizen-portal
TARGET: apps/citizen-portal/
PRIORITY: HIGH
PACKAGES: voting-system, entity-registry
KEY DELIVERABLES:
  - User dashboard
  - Delegation management
  - Voting history
  - Regional pods
```

### Agent_3 Quick Card
```
AGENT: 3 - Database Schema
BRANCH: claude/agent-3-database-schema
TARGET: infrastructure/database/
PRIORITY: HIGH
PACKAGES: entity-registry (types)
KEY DELIVERABLES:
  - PostgreSQL schema
  - Prisma configuration
  - Migration scripts
  - Seed data
```

### Agent_4 Quick Card
```
AGENT: 4 - Testing Suite
BRANCH: claude/agent-4-testing-suite
TARGET: packages/*/tests/, tests/
PRIORITY: MEDIUM
PACKAGES: All 6
KEY DELIVERABLES:
  - Unit tests (80%+ coverage)
  - Integration tests
  - E2E tests
  - Security tests
```

### Agent_5 Quick Card
```
AGENT: 5 - API Services
BRANCH: claude/agent-5-api-services
TARGET: services/
PRIORITY: MEDIUM
PACKAGES: All 6
KEY DELIVERABLES:
  - API Gateway
  - Auth service
  - Bill service
  - Vote service
  - Notification service
```

---

## Notes

- All agents should follow existing code style and TypeScript conventions
- Use packages from `packages/` - do not duplicate functionality
- Commit frequently with descriptive messages
- Update this document when status changes
- Flag blockers immediately in PR comments

---

*Last Updated: 2025-11-22*
