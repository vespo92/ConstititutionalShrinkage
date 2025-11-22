# 10-Agent Parallel Deployment Guide

## Constitutional Shrinkage - Expanded Parallel Agent Coordination

**Version:** 2.0
**Date:** 2025-11-22
**Status:** Ready for Deployment
**Base Branch:** `main`

---

## Executive Summary

This document coordinates **10 parallel AI agents** for accelerated development of the Constitutional Shrinkage platform. Building on the completed foundation (Agents 1-5), this expansion tackles the remaining 70% of implementation work.

### Current State
| Component | Status | Completion |
|-----------|--------|------------|
| Core Packages (6) | COMPLETE | 95% |
| Database Schema | COMPLETE | 100% |
| Documentation | COMPLETE | 85% |
| Frontend Apps | PARTIAL | 25% |
| API Services | NOT STARTED | 0% |
| Testing Suite | PARTIAL | 50% |
| Security Hardening | NOT STARTED | 0% |

### Target State (After 10-Agent Deployment)
| Component | Target |
|-----------|--------|
| API Services | 100% |
| Frontend Apps (all 6) | 80% |
| Testing Suite | 90% |
| Security | 75% |
| DevOps/CI | 100% |

---

## Architecture Diagram

```
                                      ┌─────────────────────────────────────────────────────────────┐
                                      │                           main                              │
                                      └─────────────────────────────────────────────────────────────┘
                                                                    │
    ┌──────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┐
    │                                                               │                                                              │
    │  ┌────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┐ │
    │  │                                    API LAYER (Agents 6-8)                                                                │ │
    │  │                                                                                                                          │ │
    │  │      ┌──────────────┐              ┌──────────────┐              ┌──────────────┐                                       │ │
    │  │      │   Agent_6    │              │   Agent_7    │              │   Agent_8    │                                       │ │
    │  │      │  API Gateway │              │ Auth + User  │              │ Notifications│                                       │ │
    │  │      │ Core Routes  │              │   Services   │              │  + Search    │                                       │ │
    │  │      └──────────────┘              └──────────────┘              └──────────────┘                                       │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                               │                                                              │
    │  ┌────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┐ │
    │  │                               FRONTEND APPS (Agents 9-12)                                                                │ │
    │  │                                                                                                                          │ │
    │  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                                             │ │
    │  │   │   Agent_9    │   │  Agent_10    │   │  Agent_11    │   │  Agent_12    │                                             │ │
    │  │   │  Executive   │   │   Judicial   │   │   Regional   │   │ Supply Chain │                                             │ │
    │  │   │     App      │   │     App      │   │  Governance  │   │     App      │                                             │ │
    │  │   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘                                             │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                               │                                                              │
    │  ┌────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┐ │
    │  │                              CROSS-CUTTING (Agents 13-15)                                                                │ │
    │  │                                                                                                                          │ │
    │  │          ┌──────────────┐              ┌──────────────┐              ┌──────────────┐                                   │ │
    │  │          │  Agent_13    │              │  Agent_14    │              │  Agent_15    │                                   │ │
    │  │          │   Testing    │              │    DevOps    │              │ Integration  │                                   │ │
    │  │          │  Expansion   │              │   + CI/CD    │              │   + Docs     │                                   │ │
    │  │          └──────────────┘              └──────────────┘              └──────────────┘                                   │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                                                                                              │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Assignments

---

### Agent_6: API Gateway & Core Routes

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-6-api-gateway-{session-id}` |
| **Priority** | CRITICAL |
| **Target Directory** | `services/api-gateway/` |
| **Dependencies** | Database schema (Agent_3 - COMPLETE) |
| **Blocks** | All frontend apps |

#### Scope of Work

**Primary Deliverables:**
- Fastify-based API gateway with modular route structure
- Bill management endpoints (CRUD, versioning, forking)
- Vote management endpoints (cast, tally, verify)
- Delegation management endpoints
- Metrics endpoints (TBL scores, sunset tracking)

**Implementation Tasks:**
- [ ] Initialize Fastify project with TypeScript
- [ ] Set up Prisma client integration
- [ ] Create route modules for each domain
- [ ] Implement request validation with Zod
- [ ] Add error handling middleware
- [ ] Create OpenAPI/Swagger documentation
- [ ] Implement health check and readiness endpoints
- [ ] Add request logging and metrics

**Files to Create:**
```
services/api-gateway/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Fastify app configuration
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── bills.ts                # Bill CRUD + versioning
│   │   ├── votes.ts                # Voting operations
│   │   ├── delegations.ts          # Liquid democracy
│   │   ├── metrics.ts              # TBL scores
│   │   ├── regions.ts              # Regional pods
│   │   ├── persons.ts              # Citizen data
│   │   └── organizations.ts        # Org management
│   ├── schemas/
│   │   ├── bill.schema.ts          # Zod validation
│   │   ├── vote.schema.ts
│   │   └── delegation.schema.ts
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   ├── request-logger.ts
│   │   └── rate-limiter.ts
│   ├── lib/
│   │   ├── prisma.ts               # Database client
│   │   └── response.ts             # Standard responses
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
└── openapi.yaml
```

**API Endpoints to Implement:**
```yaml
Bills:
  POST   /api/v1/bills              # Create bill
  GET    /api/v1/bills              # List bills (paginated)
  GET    /api/v1/bills/:id          # Get bill details
  PUT    /api/v1/bills/:id          # Update bill
  POST   /api/v1/bills/:id/fork     # Fork bill
  GET    /api/v1/bills/:id/diff     # Get diff between versions
  GET    /api/v1/bills/:id/history  # Git-style history

Votes:
  POST   /api/v1/votes              # Cast vote
  GET    /api/v1/votes/session/:id  # Get voting session
  GET    /api/v1/votes/tally/:id    # Get vote tally
  POST   /api/v1/votes/verify       # Verify vote integrity

Delegations:
  POST   /api/v1/delegations        # Create delegation
  GET    /api/v1/delegations/chain  # Get delegation chain
  DELETE /api/v1/delegations/:id    # Revoke delegation

Metrics:
  GET    /api/v1/metrics/tbl/:entityId  # Triple bottom line
  GET    /api/v1/metrics/sunset         # Expiring legislation
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 25-30 |
| LOC | 2,500-3,000 |
| Endpoints | 35-40 |
| Test Coverage Target | 80% |

---

### Agent_7: Authentication & User Service

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-7-auth-service-{session-id}` |
| **Priority** | CRITICAL |
| **Target Directory** | `services/auth-service/`, `services/user-service/` |
| **Dependencies** | Database schema (Agent_3 - COMPLETE) |
| **Blocks** | All frontend apps |

#### Scope of Work

**Primary Deliverables:**
- JWT-based authentication system
- OAuth2 integration (Google, GitHub for dev)
- User registration and profile management
- Role-based access control (RBAC)
- Session management with Redis
- Citizen verification workflow (future-proofed)

**Implementation Tasks:**
- [ ] Set up auth service with Fastify
- [ ] Implement JWT token generation/validation
- [ ] Create OAuth2 provider integrations
- [ ] Build user registration flow
- [ ] Implement password reset functionality
- [ ] Create RBAC middleware
- [ ] Set up Redis session store
- [ ] Design citizen verification hooks (for future)
- [ ] Add rate limiting for auth endpoints
- [ ] Create refresh token rotation

**Files to Create:**
```
services/auth-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── auth.ts                 # Login, logout, refresh
│   │   ├── register.ts             # Registration flow
│   │   ├── oauth.ts                # OAuth callbacks
│   │   └── password.ts             # Reset, change
│   ├── strategies/
│   │   ├── jwt.ts                  # JWT handling
│   │   ├── google.ts               # Google OAuth
│   │   └── github.ts               # GitHub OAuth
│   ├── middleware/
│   │   ├── auth-guard.ts           # Route protection
│   │   └── rbac.ts                 # Role checking
│   ├── lib/
│   │   ├── tokens.ts               # Token utilities
│   │   ├── redis.ts                # Session store
│   │   └── password.ts             # Hashing utilities
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json

services/user-service/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── profile.ts              # Profile CRUD
│   │   ├── preferences.ts          # User preferences
│   │   └── verification.ts         # Citizen verification
│   ├── lib/
│   │   └── prisma.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

**Auth Endpoints:**
```yaml
Authentication:
  POST   /auth/register             # New user registration
  POST   /auth/login                # Email/password login
  POST   /auth/logout               # Invalidate session
  POST   /auth/refresh              # Refresh access token
  POST   /auth/forgot-password      # Request reset
  POST   /auth/reset-password       # Complete reset

OAuth:
  GET    /auth/google               # Google OAuth init
  GET    /auth/google/callback      # Google callback
  GET    /auth/github               # GitHub OAuth init
  GET    /auth/github/callback      # GitHub callback

User:
  GET    /users/me                  # Current user profile
  PUT    /users/me                  # Update profile
  GET    /users/:id                 # Get user (public info)
  GET    /users/me/preferences      # User preferences
  PUT    /users/me/preferences      # Update preferences
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 20-25 |
| LOC | 2,000-2,500 |
| Endpoints | 15-20 |
| Test Coverage Target | 90% |

---

### Agent_8: Notification & Search Services

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-8-notification-search-{session-id}` |
| **Priority** | HIGH |
| **Target Directory** | `services/notification-service/`, `services/search-service/` |
| **Dependencies** | Database schema, Redis, Elasticsearch |
| **Blocks** | None (enhancement layer) |

#### Scope of Work

**Primary Deliverables:**
- Real-time notification system (WebSocket/SSE)
- Email notification integration (templates)
- Full-text search with Elasticsearch
- Bill content indexing
- Person/Organization search
- Activity feed generation

**Implementation Tasks:**
- [ ] Set up notification service with WebSocket support
- [ ] Create notification types and templates
- [ ] Implement notification preferences
- [ ] Build email sending integration (SendGrid/SES)
- [ ] Set up Elasticsearch client
- [ ] Create indexers for bills, persons, organizations
- [ ] Implement search API with filters
- [ ] Add autocomplete/suggest functionality
- [ ] Create activity feed aggregation

**Files to Create:**
```
services/notification-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── websocket/
│   │   ├── server.ts               # WebSocket server
│   │   ├── handlers.ts             # Message handlers
│   │   └── rooms.ts                # Room management
│   ├── channels/
│   │   ├── in-app.ts               # In-app notifications
│   │   ├── email.ts                # Email sending
│   │   └── push.ts                 # Push notifications (future)
│   ├── templates/
│   │   ├── bill-status.ts          # Bill status changes
│   │   ├── vote-reminder.ts        # Vote reminders
│   │   ├── delegation.ts           # Delegation updates
│   │   └── welcome.ts              # Welcome email
│   ├── lib/
│   │   ├── redis-pubsub.ts         # Pub/sub for scaling
│   │   └── queue.ts                # Notification queue
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json

services/search-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── search.ts               # Search endpoints
│   │   └── suggest.ts              # Autocomplete
│   ├── indexers/
│   │   ├── bill-indexer.ts         # Index bills
│   │   ├── person-indexer.ts       # Index persons
│   │   └── org-indexer.ts          # Index organizations
│   ├── lib/
│   │   ├── elasticsearch.ts        # ES client
│   │   └── analyzers.ts            # Custom analyzers
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

**Endpoints:**
```yaml
Notifications:
  WS     /ws/notifications          # WebSocket connection
  GET    /notifications             # Get user notifications
  PUT    /notifications/:id/read    # Mark as read
  PUT    /notifications/read-all    # Mark all as read
  GET    /notifications/preferences # Get preferences
  PUT    /notifications/preferences # Update preferences

Search:
  GET    /search                    # Global search
  GET    /search/bills              # Search bills
  GET    /search/persons            # Search persons
  GET    /search/organizations      # Search organizations
  GET    /search/suggest            # Autocomplete
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 25-30 |
| LOC | 2,500-3,000 |
| Endpoints | 12-15 |
| Test Coverage Target | 75% |

---

### Agent_9: Executive Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-9-executive-app-{session-id}` |
| **Priority** | HIGH |
| **Target Directory** | `apps/executive/` |
| **Dependencies** | API Gateway (Agent_6), Auth (Agent_7) |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Executive dashboard for regional pod administrators
- Policy implementation tracking
- Resource allocation interface
- Performance metrics visualization
- Emergency response coordination panel

**Implementation Tasks:**
- [ ] Set up Next.js 14 project with App Router
- [ ] Create executive dashboard layout
- [ ] Build policy implementation tracker
- [ ] Implement resource allocation interface
- [ ] Create performance metrics visualizations
- [ ] Build emergency coordination panel
- [ ] Integrate with packages/metrics-system
- [ ] Add TBL (Triple Bottom Line) dashboards
- [ ] Create reporting and export functionality

**Files to Create:**
```
apps/executive/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard home
│   │   ├── policies/
│   │   │   ├── page.tsx            # Policy list
│   │   │   ├── [id]/page.tsx       # Policy details
│   │   │   └── implement/page.tsx  # Implementation tracker
│   │   ├── resources/
│   │   │   ├── page.tsx            # Resource overview
│   │   │   └── allocate/page.tsx   # Allocation tool
│   │   ├── metrics/
│   │   │   ├── page.tsx            # TBL dashboard
│   │   │   └── reports/page.tsx    # Generate reports
│   │   ├── emergency/
│   │   │   └── page.tsx            # Emergency panel
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── PolicyTracker.tsx
│   │   ├── ResourceAllocator.tsx
│   │   ├── TBLDashboard.tsx
│   │   ├── MetricsChart.tsx
│   │   ├── EmergencyPanel.tsx
│   │   └── RegionalMap.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── metrics.ts
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 30-35 |
| LOC | 3,000-3,500 |
| Pages | 10-12 |
| Components | 15-20 |

---

### Agent_10: Judicial Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-10-judicial-app-{session-id}` |
| **Priority** | HIGH |
| **Target Directory** | `apps/judicial/` |
| **Dependencies** | API Gateway (Agent_6), Auth (Agent_7) |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Constitutional review interface
- Bill compliance checking dashboard
- Conflict resolution system
- Case management for disputes
- Transparency audit trail viewer

**Implementation Tasks:**
- [ ] Set up Next.js 14 project
- [ ] Create judicial review dashboard
- [ ] Build constitutional compliance viewer
- [ ] Implement bill review workflow
- [ ] Create conflict resolution interface
- [ ] Build case management system
- [ ] Implement audit trail viewer
- [ ] Integrate with constitutional-framework package
- [ ] Add precedent search functionality

**Files to Create:**
```
apps/judicial/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Judicial dashboard
│   │   ├── review/
│   │   │   ├── page.tsx            # Bills pending review
│   │   │   └── [billId]/page.tsx   # Review interface
│   │   ├── compliance/
│   │   │   ├── page.tsx            # Compliance overview
│   │   │   └── check/page.tsx      # Run compliance check
│   │   ├── cases/
│   │   │   ├── page.tsx            # Case list
│   │   │   ├── [id]/page.tsx       # Case details
│   │   │   └── new/page.tsx        # File new case
│   │   ├── conflicts/
│   │   │   ├── page.tsx            # Active conflicts
│   │   │   └── resolve/page.tsx    # Resolution interface
│   │   ├── audit/
│   │   │   └── page.tsx            # Audit trail viewer
│   │   └── precedents/
│   │       └── page.tsx            # Precedent search
│   ├── components/
│   │   ├── ComplianceChecker.tsx
│   │   ├── ReviewPanel.tsx
│   │   ├── CaseViewer.tsx
│   │   ├── ConflictResolver.tsx
│   │   ├── AuditTrail.tsx
│   │   └── PrecedentSearch.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── constitutional.ts
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 30-35 |
| LOC | 3,000-3,500 |
| Pages | 12-15 |
| Components | 15-20 |

---

### Agent_11: Regional Governance Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-11-regional-app-{session-id}` |
| **Priority** | MEDIUM |
| **Target Directory** | `apps/regional-governance/` |
| **Dependencies** | API Gateway (Agent_6), Auth (Agent_7) |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Regional pod management interface
- Local legislation management
- Inter-pod coordination tools
- Regional metrics dashboard
- Community engagement tools

**Implementation Tasks:**
- [ ] Set up Next.js 14 project
- [ ] Create regional dashboard
- [ ] Build pod management interface
- [ ] Implement local legislation tools
- [ ] Create inter-pod coordination system
- [ ] Build regional metrics visualizations
- [ ] Implement community engagement features
- [ ] Add geographic visualization (maps)
- [ ] Create pod comparison tools

**Files to Create:**
```
apps/regional-governance/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Regional dashboard
│   │   ├── pods/
│   │   │   ├── page.tsx            # Pod list
│   │   │   ├── [id]/page.tsx       # Pod details
│   │   │   ├── create/page.tsx     # Create new pod
│   │   │   └── compare/page.tsx    # Compare pods
│   │   ├── legislation/
│   │   │   ├── page.tsx            # Local legislation
│   │   │   └── [id]/page.tsx       # Legislation details
│   │   ├── coordination/
│   │   │   ├── page.tsx            # Inter-pod coordination
│   │   │   └── requests/page.tsx   # Coordination requests
│   │   ├── metrics/
│   │   │   └── page.tsx            # Regional metrics
│   │   ├── community/
│   │   │   ├── page.tsx            # Community engagement
│   │   │   └── forums/page.tsx     # Discussion forums
│   │   └── map/
│   │       └── page.tsx            # Geographic view
│   ├── components/
│   │   ├── PodCard.tsx
│   │   ├── PodManager.tsx
│   │   ├── RegionalMap.tsx
│   │   ├── CoordinationPanel.tsx
│   │   ├── MetricsDashboard.tsx
│   │   └── CommunityFeed.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── geo.ts
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 30-35 |
| LOC | 3,000-3,500 |
| Pages | 12-15 |
| Components | 15-20 |

---

### Agent_12: Supply Chain Transparency Application

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-12-supply-chain-app-{session-id}` |
| **Priority** | MEDIUM |
| **Target Directory** | `apps/supply-chain/` |
| **Dependencies** | API Gateway (Agent_6), Auth (Agent_7) |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Supply chain visualization dashboard
- Economic distance calculator
- Producer-to-consumer tracking
- Locality tax calculation interface
- Business transparency reports

**Implementation Tasks:**
- [ ] Set up Next.js 14 project
- [ ] Create supply chain dashboard
- [ ] Build network visualization (D3.js/Vis.js)
- [ ] Implement economic distance calculator
- [ ] Create tracking interface
- [ ] Build locality tax calculator
- [ ] Implement transparency reports
- [ ] Integrate with business-transparency package
- [ ] Add export/reporting features

**Files to Create:**
```
apps/supply-chain/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Supply chain dashboard
│   │   ├── network/
│   │   │   ├── page.tsx            # Network visualization
│   │   │   └── [entityId]/page.tsx # Entity chain view
│   │   ├── distance/
│   │   │   ├── page.tsx            # Distance calculator
│   │   │   └── results/page.tsx    # Calculation results
│   │   ├── tracking/
│   │   │   ├── page.tsx            # Product tracking
│   │   │   └── [productId]/page.tsx
│   │   ├── taxes/
│   │   │   ├── page.tsx            # Locality tax overview
│   │   │   └── calculate/page.tsx  # Tax calculator
│   │   ├── transparency/
│   │   │   ├── page.tsx            # Business reports
│   │   │   └── [orgId]/page.tsx    # Org report
│   │   └── reports/
│   │       └── page.tsx            # Generate reports
│   ├── components/
│   │   ├── NetworkGraph.tsx        # D3/Vis.js visualization
│   │   ├── DistanceCalculator.tsx
│   │   ├── ChainTracker.tsx
│   │   ├── TaxCalculator.tsx
│   │   ├── TransparencyReport.tsx
│   │   └── ProductJourney.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── visualization.ts
│   │   └── calculations.ts
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 30-35 |
| LOC | 3,500-4,000 |
| Pages | 12-15 |
| Components | 15-20 |

---

### Agent_13: Testing Expansion

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-13-testing-expansion-{session-id}` |
| **Priority** | HIGH |
| **Target Directory** | `tests/`, `packages/*/tests/` |
| **Dependencies** | All packages, services |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Comprehensive E2E test suite (Playwright)
- Security test expansion
- Performance/load testing setup
- API integration tests
- Test coverage reporting infrastructure

**Implementation Tasks:**
- [ ] Set up Playwright for E2E testing
- [ ] Create E2E tests for citizen journey
- [ ] Create E2E tests for legislative workflow
- [ ] Expand security test suite
- [ ] Add vote tampering prevention tests
- [ ] Add Sybil attack resistance tests
- [ ] Set up load testing (k6 or Artillery)
- [ ] Create API integration test suite
- [ ] Set up coverage reporting (Istanbul/nyc)
- [ ] Add mutation testing (Stryker)

**Files to Create:**
```
tests/
├── e2e/
│   ├── playwright.config.ts
│   ├── citizen/
│   │   ├── registration.spec.ts
│   │   ├── voting.spec.ts
│   │   ├── delegation.spec.ts
│   │   └── dashboard.spec.ts
│   ├── legislative/
│   │   ├── bill-creation.spec.ts
│   │   ├── bill-workflow.spec.ts
│   │   ├── amendment.spec.ts
│   │   └── voting-session.spec.ts
│   └── fixtures/
│       └── test-data.ts
├── integration/
│   ├── api/
│   │   ├── bills.integration.test.ts
│   │   ├── votes.integration.test.ts
│   │   ├── delegations.integration.test.ts
│   │   └── auth.integration.test.ts
│   └── database/
│       └── schema.integration.test.ts
├── security/
│   ├── vote-tampering.test.ts      # Expanded
│   ├── sybil-attack.test.ts        # Expanded
│   ├── sql-injection.test.ts
│   ├── xss-prevention.test.ts
│   ├── auth-bypass.test.ts
│   └── rate-limiting.test.ts
├── performance/
│   ├── k6/
│   │   ├── voting-load.js
│   │   ├── search-load.js
│   │   └── api-stress.js
│   └── benchmarks/
│       └── delegation-chain.bench.ts
└── utils/
    ├── test-helpers.ts
    ├── factories.ts                 # Test data factories
    └── mocks/
        └── prisma.ts
```

**Coverage Targets:**
| Area | Current | Target |
|------|---------|--------|
| Packages | ~50% | 85%+ |
| API Services | 0% | 80%+ |
| E2E Critical Paths | 0% | 95%+ |
| Security Tests | ~30% | 100% |

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 40-50 |
| LOC | 4,000-5,000 |
| Test Cases | 200+ |

---

### Agent_14: DevOps & CI/CD Enhancement

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-14-devops-{session-id}` |
| **Priority** | HIGH |
| **Target Directory** | `.github/`, `infrastructure/`, root configs |
| **Dependencies** | None |
| **Blocks** | Deployment of all services |

#### Scope of Work

**Primary Deliverables:**
- Enhanced GitHub Actions workflows
- Docker containerization for all services
- Kubernetes deployment manifests
- Environment configuration management
- Monitoring and alerting setup

**Implementation Tasks:**
- [ ] Create multi-stage Docker builds for all services
- [ ] Set up Docker Compose for full local development
- [ ] Create Kubernetes manifests for production
- [ ] Enhance CI pipeline with parallel jobs
- [ ] Add staging deployment workflow
- [ ] Set up secrets management
- [ ] Create monitoring dashboards (Grafana)
- [ ] Add alerting rules (Prometheus)
- [ ] Create backup/restore procedures
- [ ] Add security scanning (Snyk, Trivy)

**Files to Create:**
```
.github/
├── workflows/
│   ├── ci.yml                      # Enhanced CI
│   ├── cd-staging.yml              # Staging deploy
│   ├── cd-production.yml           # Production deploy
│   ├── security-scan.yml           # Security scanning
│   └── dependency-review.yml       # Dependency audit
└── CODEOWNERS

infrastructure/
├── docker/
│   ├── api-gateway.Dockerfile
│   ├── auth-service.Dockerfile
│   ├── notification-service.Dockerfile
│   ├── search-service.Dockerfile
│   └── frontend.Dockerfile
├── docker-compose.yml              # Enhanced
├── docker-compose.prod.yml
├── kubernetes/
│   ├── namespaces/
│   │   └── constitutional.yaml
│   ├── deployments/
│   │   ├── api-gateway.yaml
│   │   ├── auth-service.yaml
│   │   └── frontend.yaml
│   ├── services/
│   │   └── *.yaml
│   ├── ingress/
│   │   └── main.yaml
│   ├── configmaps/
│   │   └── app-config.yaml
│   └── secrets/
│       └── README.md               # Secret management guide
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   ├── grafana/
│   │   └── dashboards/
│   │       ├── api-overview.json
│   │       └── voting-metrics.json
│   └── alertmanager/
│       └── config.yml
└── scripts/
    ├── setup-dev.sh
    ├── run-migrations.sh
    └── backup-db.sh
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 35-40 |
| LOC | 2,000-2,500 |
| Workflows | 5-6 |
| Dockerfiles | 5-6 |

---

### Agent_15: Integration & Documentation

| Field | Value |
|-------|-------|
| **Branch** | `claude/agent-15-integration-docs-{session-id}` |
| **Priority** | MEDIUM |
| **Target Directory** | `docs/`, root files |
| **Dependencies** | All other agents |
| **Blocks** | None |

#### Scope of Work

**Primary Deliverables:**
- Shared component library
- Cross-service integration guides
- API documentation (Swagger UI)
- User guides and tutorials
- Developer onboarding documentation

**Implementation Tasks:**
- [ ] Create shared UI component library
- [ ] Build shared TypeScript types package
- [ ] Create API integration documentation
- [ ] Write deployment guides
- [ ] Create user tutorials
- [ ] Build interactive API documentation
- [ ] Create architecture decision records (ADRs)
- [ ] Write troubleshooting guides
- [ ] Create video tutorial scripts

**Files to Create:**
```
packages/
├── ui/                             # NEW: Shared UI components
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Form.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useNotification.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── shared-types/                   # NEW: Shared TypeScript types
    ├── src/
    │   ├── api.types.ts
    │   ├── entities.types.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json

docs/
├── api/
│   ├── openapi.yaml                # Consolidated OpenAPI spec
│   ├── authentication.md
│   ├── bills-api.md
│   ├── votes-api.md
│   └── delegations-api.md
├── guides/
│   ├── user/
│   │   ├── getting-started.md
│   │   ├── voting-guide.md
│   │   └── delegation-guide.md
│   └── developer/
│       ├── local-setup.md
│       ├── contributing.md
│       ├── testing.md
│       └── deployment.md
├── architecture/
│   ├── adr/                        # Architecture Decision Records
│   │   ├── 001-monorepo.md
│   │   ├── 002-liquid-democracy.md
│   │   └── 003-database-choice.md
│   └── diagrams/
│       ├── system-context.mmd
│       ├── container.mmd
│       └── data-flow.mmd
├── troubleshooting/
│   ├── common-issues.md
│   ├── debugging.md
│   └── faq.md
└── tutorials/
    ├── video-scripts/
    │   ├── 01-intro.md
    │   └── 02-first-vote.md
    └── code-examples/
        └── *.ts
```

**Estimated Output:**
| Metric | Estimate |
|--------|----------|
| Files | 50-60 |
| LOC (code) | 1,500-2,000 |
| Documentation | 10,000+ words |

---

## Dependency Graph

```
                                    ┌─────────────────┐
                                    │   Agent_14      │
                                    │    DevOps       │ ─────────────────────────────────────────────────┐
                                    │   (No deps)     │                                                   │
                                    └────────┬────────┘                                                   │
                                             │                                                            │
     ┌───────────────────────────────────────┼───────────────────────────────────────┐                    │
     │                                       │                                       │                    │
     ▼                                       ▼                                       ▼                    │
┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐              │
│   Agent_6       │                 │   Agent_7       │                 │   Agent_8       │              │
│  API Gateway    │                 │  Auth + User    │                 │  Notifications  │              │
│   (DB only)     │                 │   (DB only)     │                 │   + Search      │              │
└────────┬────────┘                 └────────┬────────┘                 └─────────────────┘              │
         │                                   │                                                            │
         └───────────────┬───────────────────┘                                                            │
                         │                                                                                │
     ┌───────────────────┼───────────────────┬───────────────────┐                                       │
     │                   │                   │                   │                                       │
     ▼                   ▼                   ▼                   ▼                                       │
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                                   │
│  Agent_9    │   │  Agent_10   │   │  Agent_11   │   │  Agent_12   │                                   │
│  Executive  │   │  Judicial   │   │  Regional   │   │ Supply Chain│                                   │
│    App      │   │    App      │   │    App      │   │    App      │                                   │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘                                   │
                                                                                                         │
┌─────────────────┐                                                           ┌─────────────────┐       │
│   Agent_13      │ ◄────────────────── Depends on all ─────────────────────► │   Agent_15      │       │
│    Testing      │                                                           │  Integration    │ ◄─────┘
│   Expansion     │                                                           │   + Docs        │
└─────────────────┘                                                           └─────────────────┘
```

---

## Parallel Execution Strategy

### Wave 1 (Immediate - No Dependencies)
These agents can start immediately as they have no blocking dependencies:

| Agent | Focus | Can Start |
|-------|-------|-----------|
| Agent_6 | API Gateway | ✅ NOW |
| Agent_7 | Auth + User | ✅ NOW |
| Agent_8 | Notifications + Search | ✅ NOW |
| Agent_14 | DevOps + CI/CD | ✅ NOW |

### Wave 2 (After API Layer Initialized)
These agents can start once API contracts are defined (not fully implemented):

| Agent | Focus | Starts After |
|-------|-------|--------------|
| Agent_9 | Executive App | Agent_6 routes defined |
| Agent_10 | Judicial App | Agent_6 routes defined |
| Agent_11 | Regional App | Agent_6 routes defined |
| Agent_12 | Supply Chain App | Agent_6 routes defined |

### Wave 3 (Continuous/Parallel)
These agents work continuously alongside all others:

| Agent | Focus | Approach |
|-------|-------|----------|
| Agent_13 | Testing | Test as code is written |
| Agent_15 | Integration + Docs | Document as features complete |

---

## Deployment Commands

### Spawn All 10 Agents

```bash
# Wave 1 - Start immediately (no dependencies)
# Agent_6: API Gateway
git checkout -b claude/agent-6-api-gateway-{session} main
# Prompt: "Implement the API Gateway with Fastify in services/api-gateway/.
#          Create all bill, vote, delegation, and metrics endpoints.
#          Use Prisma for database access. Include OpenAPI documentation."

# Agent_7: Auth + User Services
git checkout -b claude/agent-7-auth-service-{session} main
# Prompt: "Implement authentication and user services in services/auth-service/
#          and services/user-service/. Include JWT, OAuth2 (Google/GitHub),
#          RBAC, and session management with Redis."

# Agent_8: Notification + Search
git checkout -b claude/agent-8-notification-search-{session} main
# Prompt: "Implement notification service with WebSocket/SSE in services/notification-service/
#          and search service with Elasticsearch in services/search-service/."

# Agent_14: DevOps
git checkout -b claude/agent-14-devops-{session} main
# Prompt: "Enhance CI/CD in .github/workflows/, create Dockerfiles for all services,
#          add Kubernetes manifests, and set up monitoring infrastructure."

# Wave 2 - Start after API contracts defined
# Agent_9: Executive App
git checkout -b claude/agent-9-executive-app-{session} main
# Prompt: "Build the Executive application in apps/executive/ using Next.js 14.
#          Create policy tracking, resource allocation, and TBL metrics dashboards."

# Agent_10: Judicial App
git checkout -b claude/agent-10-judicial-app-{session} main
# Prompt: "Build the Judicial application in apps/judicial/ using Next.js 14.
#          Create constitutional review, compliance checking, and case management."

# Agent_11: Regional Governance App
git checkout -b claude/agent-11-regional-app-{session} main
# Prompt: "Build the Regional Governance app in apps/regional-governance/ using Next.js 14.
#          Create pod management, local legislation, and community engagement features."

# Agent_12: Supply Chain App
git checkout -b claude/agent-12-supply-chain-app-{session} main
# Prompt: "Build the Supply Chain app in apps/supply-chain/ using Next.js 14.
#          Create network visualization, economic distance calculator, and transparency reports."

# Wave 3 - Continuous
# Agent_13: Testing Expansion
git checkout -b claude/agent-13-testing-expansion-{session} main
# Prompt: "Expand testing infrastructure. Set up Playwright E2E tests, expand security tests,
#          add performance testing with k6, and create comprehensive API integration tests."

# Agent_15: Integration + Docs
git checkout -b claude/agent-15-integration-docs-{session} main
# Prompt: "Create shared UI component library in packages/ui/, shared types in packages/shared-types/,
#          write API documentation, user guides, and developer tutorials."
```

---

## Progress Tracking

### Current Status (Pre-Deployment)

| Agent | Branch | Status | Progress | Blocks |
|-------|--------|--------|----------|--------|
| Agent_6 | - | NOT_STARTED | 0% | Wave 2 apps |
| Agent_7 | - | NOT_STARTED | 0% | Wave 2 apps |
| Agent_8 | - | NOT_STARTED | 0% | None |
| Agent_9 | - | NOT_STARTED | 0% | - |
| Agent_10 | - | NOT_STARTED | 0% | - |
| Agent_11 | - | NOT_STARTED | 0% | - |
| Agent_12 | - | NOT_STARTED | 0% | - |
| Agent_13 | - | NOT_STARTED | 0% | None |
| Agent_14 | - | NOT_STARTED | 0% | Deployment |
| Agent_15 | - | NOT_STARTED | 0% | None |

---

## Merge Order (Recommended)

```
Phase 1: Foundation Services
  1. Agent_14 (DevOps) → main          # CI/CD ready first
  2. Agent_6 (API Gateway) → main      # Core API
  3. Agent_7 (Auth + User) → main      # Authentication

Phase 2: Enhancement Services
  4. Agent_8 (Notifications + Search) → main

Phase 3: Applications (can merge in parallel)
  5. Agent_9 (Executive) → main
  6. Agent_10 (Judicial) → main
  7. Agent_11 (Regional) → main
  8. Agent_12 (Supply Chain) → main

Phase 4: Quality & Documentation
  9. Agent_13 (Testing) → main
  10. Agent_15 (Integration + Docs) → main
```

---

## Estimated Total Output

| Category | Files | LOC |
|----------|-------|-----|
| API Services (6-8) | 70-85 | 7,000-8,500 |
| Frontend Apps (9-12) | 120-140 | 12,500-14,500 |
| Testing (13) | 40-50 | 4,000-5,000 |
| DevOps (14) | 35-40 | 2,000-2,500 |
| Integration (15) | 50-60 | 1,500-2,000 |
| **TOTAL** | **315-375** | **27,000-32,500** |

---

## Success Criteria

### Per Agent
- [ ] All planned files created
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Unit tests pass (where applicable)
- [ ] Documentation complete
- [ ] PR created and mergeable

### Overall
- [ ] All 10 agents complete
- [ ] Full platform running locally (docker-compose up)
- [ ] E2E tests pass for critical paths
- [ ] API documentation accessible
- [ ] No security vulnerabilities (Snyk/Trivy clean)

---

*Document Version: 2.0*
*Created: 2025-11-22*
*Author: Multi-Agent Coordinator*
