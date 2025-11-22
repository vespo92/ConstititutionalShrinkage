# Agent_6: API Gateway & Core Routes

## Mission
Implement the core API Gateway using Fastify in `services/api-gateway/`. This is the central API layer that all frontend applications will consume.

## Branch
```
claude/agent-6-api-gateway-{session-id}
```

## Priority: CRITICAL

## Context
You are building on a foundation that already has:
- Complete PostgreSQL database schema in `infrastructure/database/`
- Prisma ORM configuration ready to use
- 6 core packages in `packages/` with business logic
- Docker Compose setup with PostgreSQL, Redis, Elasticsearch

## Target Directory
```
services/api-gateway/
```

## Dependencies (Already Complete)
- Database schema: `infrastructure/database/prisma/schema.prisma`
- Packages to import: `constitutional-framework`, `voting-system`, `governance-utils`, `metrics`, `business-transparency`, `entity-registry`

## Your Deliverables

### 1. Project Setup
- Initialize Fastify project with TypeScript
- Configure Prisma client integration
- Set up modular route structure
- Add request validation with Zod
- Configure CORS and security headers

### 2. Core Routes to Implement

#### Bills API
```
POST   /api/v1/bills              # Create new bill
GET    /api/v1/bills              # List bills (paginated, filtered)
GET    /api/v1/bills/:id          # Get bill by ID
PUT    /api/v1/bills/:id          # Update bill
DELETE /api/v1/bills/:id          # Delete bill (soft delete)
POST   /api/v1/bills/:id/fork     # Fork a bill (git-style)
GET    /api/v1/bills/:id/diff     # Get diff between versions
GET    /api/v1/bills/:id/history  # Full version history
GET    /api/v1/bills/:id/compliance # Constitutional compliance check
POST   /api/v1/bills/:id/submit   # Submit for voting
```

#### Votes API
```
POST   /api/v1/votes                    # Cast a vote
GET    /api/v1/votes/session/:sessionId # Get voting session
GET    /api/v1/votes/tally/:sessionId   # Get vote tally
POST   /api/v1/votes/verify             # Verify vote integrity
GET    /api/v1/votes/user/:userId       # Get user's voting history
```

#### Delegations API
```
POST   /api/v1/delegations              # Create delegation
GET    /api/v1/delegations              # List user's delegations
GET    /api/v1/delegations/chain/:userId # Get delegation chain
DELETE /api/v1/delegations/:id          # Revoke delegation
GET    /api/v1/delegations/effective/:userId # Effective voting power
```

#### Metrics API
```
GET    /api/v1/metrics/tbl/:entityId    # Triple bottom line score
GET    /api/v1/metrics/sunset           # Bills nearing sunset
GET    /api/v1/metrics/impact/:billId   # Projected impact
GET    /api/v1/metrics/dashboard        # Overall metrics dashboard
```

#### Regions API
```
GET    /api/v1/regions                  # List regions
GET    /api/v1/regions/:id              # Get region details
GET    /api/v1/regions/:id/pods         # Get pods in region
GET    /api/v1/regions/:id/legislation  # Region-specific legislation
```

#### Persons/Organizations API
```
GET    /api/v1/persons/:id              # Get person (public info)
GET    /api/v1/organizations            # List organizations
GET    /api/v1/organizations/:id        # Get organization details
GET    /api/v1/organizations/:id/transparency # Transparency report
```

### 3. File Structure to Create

```
services/api-gateway/
├── src/
│   ├── index.ts                    # Entry point, server start
│   ├── app.ts                      # Fastify app configuration
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── bills.ts                # Bill endpoints
│   │   ├── votes.ts                # Voting endpoints
│   │   ├── delegations.ts          # Delegation endpoints
│   │   ├── metrics.ts              # Metrics endpoints
│   │   ├── regions.ts              # Region endpoints
│   │   ├── persons.ts              # Person endpoints
│   │   └── organizations.ts        # Organization endpoints
│   ├── schemas/
│   │   ├── bill.schema.ts          # Zod schemas for bills
│   │   ├── vote.schema.ts          # Zod schemas for votes
│   │   ├── delegation.schema.ts    # Zod schemas for delegations
│   │   └── common.schema.ts        # Shared schemas (pagination, etc.)
│   ├── middleware/
│   │   ├── error-handler.ts        # Global error handling
│   │   ├── request-logger.ts       # Request logging
│   │   ├── rate-limiter.ts         # Rate limiting
│   │   └── auth.ts                 # Auth middleware (placeholder for Agent_7)
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── response.ts             # Standard response helpers
│   │   └── pagination.ts           # Pagination helpers
│   ├── services/
│   │   ├── bill.service.ts         # Bill business logic
│   │   ├── vote.service.ts         # Vote business logic
│   │   ├── delegation.service.ts   # Delegation business logic
│   │   └── metrics.service.ts      # Metrics business logic
│   └── types/
│       └── index.ts                # TypeScript types
├── tests/
│   ├── routes/
│   │   ├── bills.test.ts
│   │   ├── votes.test.ts
│   │   └── delegations.test.ts
│   └── setup.ts
├── package.json
├── tsconfig.json
└── openapi.yaml                    # OpenAPI 3.0 specification
```

### 4. Technical Requirements

- **Framework:** Fastify 4.x with @fastify/cors, @fastify/helmet
- **Validation:** Zod for request/response validation
- **Database:** Prisma Client (import from infrastructure)
- **Logging:** Pino (built into Fastify)
- **API Docs:** OpenAPI 3.0 / Swagger
- **Error Handling:** Consistent JSON error responses

### 5. Integration with Existing Packages

```typescript
// Example: Using voting-system package
import { VotingSystem, DelegationManager } from '@constitutional/voting-system';

// Example: Using constitutional-framework
import { ConstitutionalValidator } from '@constitutional/constitutional-framework';

// Example: Using metrics
import { MetricsCalculator, SunsetTracker } from '@constitutional/metrics';
```

### 6. Database Connection

```typescript
// prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
```

Connection string (from .env):
```
DATABASE_URL="postgresql://constitutional:constitutional_dev_2025@localhost:5432/constitutional_shrinkage"
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 25-30 |
| Lines of Code | 2,500-3,000 |
| API Endpoints | 35-40 |
| Test Coverage | 80% |

## Success Criteria

1. [ ] All routes implemented and responding correctly
2. [ ] Zod validation on all inputs
3. [ ] Prisma integration working with database
4. [ ] OpenAPI spec generated
5. [ ] Error handling consistent
6. [ ] Rate limiting in place
7. [ ] Unit tests passing
8. [ ] TypeScript compiles without errors
9. [ ] ESLint passing

## Handoff Notes

When complete, other agents (9-12: Frontend Apps) will consume this API. Ensure:
- Clear API documentation in openapi.yaml
- Consistent response formats
- Meaningful error messages
- All endpoints tested with curl/httpie examples

## Do NOT Include

- Authentication logic (Agent_7 handles this)
- WebSocket/real-time (Agent_8 handles this)
- Search functionality (Agent_8 handles this)
- Deployment configs (Agent_14 handles this)

---

*Agent_6 Assignment - API Gateway*
