# Constitutional Shrinkage - Infrastructure

> Database and infrastructure components for the Constitutional Shrinkage platform.

**Agent:** Agent 3 - Database & Schema Infrastructure
**Generated:** 2025-11-22

---

## Overview

This directory contains all database infrastructure for the Constitutional Shrinkage platform:

- **PostgreSQL Schema** - Complete relational database schema
- **Prisma ORM** - Type-safe database client configuration
- **Docker Compose** - Local development environment
- **Seed Data** - Development test data

## Quick Start

### 1. Start the Database

```bash
# Start core services (PostgreSQL, Redis, Elasticsearch)
docker-compose up -d

# Start with admin tools (pgAdmin, Redis Commander)
docker-compose --profile tools up -d
```

### 2. Apply Schema

```bash
# Option A: Using Prisma (recommended)
cd database/prisma
npx prisma db push

# Option B: Using raw SQL
cat database/postgres/schema/*.sql | docker exec -i constitutional_postgres psql -U constitutional -d constitutional_shrinkage
```

### 3. Load Seed Data

```bash
# Load development seed data
cat database/postgres/seeds/development.sql | docker exec -i constitutional_postgres psql -U constitutional -d constitutional_shrinkage
```

### 4. Generate Prisma Client

```bash
cd database/prisma
npx prisma generate
```

---

## Directory Structure

```
infrastructure/
├── database/
│   ├── postgres/
│   │   ├── schema/
│   │   │   ├── 001_core_entities.sql      # Persons, Organizations, Regions
│   │   │   ├── 002_associations.sql       # Associations and involvement tracking
│   │   │   ├── 003_voting.sql             # Voting system and delegations
│   │   │   ├── 004_legislation.sql        # Bills, amendments, committees
│   │   │   ├── 005_metrics.sql            # Metrics and change tracking
│   │   │   └── 006_indexes.sql            # Performance indexes
│   │   ├── migrations/
│   │   │   └── .gitkeep
│   │   └── seeds/
│   │       └── development.sql            # Development test data
│   └── prisma/
│       ├── schema.prisma                  # Prisma schema definition
│       └── migrations/
├── docker-compose.yml                     # Docker services configuration
└── README.md                              # This file
```

---

## Database Schema

### Entity Relationship Overview

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   Person    │       │   Association   │       │Organization │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id          │       │ id              │       │ id          │
│ legalName   │◄──────┤ subjectId       │       │ legalName   │
│ email       │       │ subjectType     │──────►│ type        │
│ regionId    │───┐   │ objectId        │       │ jurisdiction│
│ verification│   │   │ objectType      │   ┌──►│ status      │
│ votingPower │   │   │ involvementType │   │   └─────────────┘
│ reputation  │   │   │ startDate       │   │
└─────────────┘   │   │ isActive        │   │   ┌─────────────┐
      │           │   └─────────────────┘   │   │    Bill     │
      │           │                         │   ├─────────────┤
      ▼           │   ┌─────────────────┐   │   │ id          │
┌─────────────┐   │   │     Region      │   │   │ title       │
│ Delegation  │   │   ├─────────────────┤   │   │ content     │
├─────────────┤   └──►│ id              │◄──┘   │ status      │
│ delegatorId │       │ name            │       │ sponsorId   │
│ delegateId  │       │ level           │       │ sunsetDate  │
│ scope       │       │ parentRegionId  │       └─────────────┘
└─────────────┘       └─────────────────┘
```

### Core Tables

| Table | Description | Key Features |
|-------|-------------|--------------|
| `persons` | Individual citizens | Verification levels, voting power, reputation |
| `organizations` | Government, business, nonprofit entities | Ownership chains, compliance tracking |
| `regions` | Geographic/jurisdictional hierarchy | Federal → Regional → Local |
| `bills` | Legislative proposals | Git-style versioning, sunset provisions |
| `votes` | Individual vote records | Cryptographic proofs, delegation chains |
| `delegations` | Liquid democracy delegations | Scoped by category or bill |
| `associations` | Entity relationships | Full involvement tracking |
| `change_records` | Git-style audit trail | Immutable history |

### Enums

The schema defines numerous enums for type safety:

- **Person**: `verification_level`, `person_status`, `expertise_level`
- **Organization**: `organization_type`, `organization_status`
- **Governance**: `governance_level`, `bill_status`, `amendment_status`
- **Voting**: `vote_choice`, `voting_status`, `delegation_scope`
- **Associations**: `involvement_type`, `significance_level`, `conflict_type`
- **Metrics**: `metric_category`, `change_type`

---

## Services

### PostgreSQL

- **Image:** `postgres:16-alpine`
- **Port:** 5432 (configurable via `POSTGRES_PORT`)
- **Default credentials:**
  - User: `constitutional`
  - Password: `constitutional_dev_2025`
  - Database: `constitutional_shrinkage`

### Redis

- **Image:** `redis:7-alpine`
- **Port:** 6379 (configurable via `REDIS_PORT`)
- **Config:** AOF persistence, 256MB max memory

### Elasticsearch

- **Image:** `elasticsearch:8.11.0`
- **Port:** 9200 (configurable via `ELASTICSEARCH_PORT`)
- **Config:** Single-node, security disabled for development

### Admin Tools (Optional)

Enable with `--profile tools`:

- **pgAdmin:** http://localhost:5050
- **Redis Commander:** http://localhost:8081

---

## Environment Variables

Create a `.env` file in the `infrastructure/` directory:

```env
# PostgreSQL
POSTGRES_USER=constitutional
POSTGRES_PASSWORD=constitutional_dev_2025
POSTGRES_DB=constitutional_shrinkage
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Elasticsearch
ELASTICSEARCH_PORT=9200

# pgAdmin
PGADMIN_EMAIL=admin@constitutional.local
PGADMIN_PASSWORD=admin_dev_2025
PGADMIN_PORT=5050

# Redis Commander
REDIS_COMMANDER_PORT=8081
```

---

## Prisma Integration

### Connection String

Add to your application's `.env`:

```env
DATABASE_URL="postgresql://constitutional:constitutional_dev_2025@localhost:5432/constitutional_shrinkage?schema=public"
```

### Generate Client

```bash
cd database/prisma
npx prisma generate
```

### Create Migrations

```bash
npx prisma migrate dev --name init
```

### Usage Example

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a person
const person = await prisma.person.create({
  data: {
    publicKey: 'pk_test_001',
    legalName: 'Test User',
    dateOfBirth: new Date('1990-01-01'),
    contactEmail: 'test@example.com',
    primaryRegionId: 'region-uuid-here',
  },
});

// Query bills with sponsors
const bills = await prisma.bill.findMany({
  where: { status: 'VOTING' },
  include: {
    sponsor: true,
    cosponsors: { include: { person: true } },
    votingSession: true,
  },
});
```

---

## Development Workflow

### 1. Initial Setup

```bash
# Clone and navigate
cd ConstititutionalShrinkage/infrastructure

# Start services
docker-compose up -d

# Wait for healthy status
docker-compose ps

# Apply schema
cat database/postgres/schema/*.sql | docker exec -i constitutional_postgres psql -U constitutional -d constitutional_shrinkage

# Load seed data
cat database/postgres/seeds/development.sql | docker exec -i constitutional_postgres psql -U constitutional -d constitutional_shrinkage
```

### 2. Schema Changes

1. Edit SQL files in `database/postgres/schema/`
2. Edit Prisma schema in `database/prisma/schema.prisma`
3. Apply changes:

```bash
# Reset and reapply (development only!)
docker-compose down -v
docker-compose up -d
# Wait for startup, then apply schema
```

### 3. Adding Seed Data

Edit `database/postgres/seeds/development.sql` and reload:

```bash
cat database/postgres/seeds/development.sql | docker exec -i constitutional_postgres psql -U constitutional -d constitutional_shrinkage
```

---

## Performance Indexes

The schema includes comprehensive indexes for common query patterns:

- **Person lookups:** email, region, verification level
- **Bill queries:** status, category, region, sponsor
- **Association searches:** subject/object pairs, involvement type
- **Vote queries:** session, citizen, timestamp
- **Change tracking:** entity, author, timestamp

See `006_indexes.sql` for the complete list.

---

## Security Considerations

### Development vs Production

This configuration is for **development only**. For production:

1. Use strong, unique passwords
2. Enable SSL/TLS
3. Enable Elasticsearch security
4. Use network isolation
5. Implement backup strategies
6. Use managed database services

### Sensitive Data

- Never commit `.env` files with real credentials
- Use secrets management in production
- Encrypt sensitive fields at rest

---

## Troubleshooting

### PostgreSQL Won't Start

```bash
# Check logs
docker logs constitutional_postgres

# Reset volume (destroys data!)
docker-compose down -v
docker-compose up -d
```

### Connection Refused

```bash
# Verify services are running
docker-compose ps

# Check port availability
lsof -i :5432
```

### Schema Errors

```bash
# Connect to database
docker exec -it constitutional_postgres psql -U constitutional -d constitutional_shrinkage

# List tables
\dt

# Check specific table
\d+ persons
```

---

## Related Documentation

- [Data Models](/docs/data-models/README.md) - Entity relationships and diagrams
- [API Documentation](/docs/api/README.md) - API endpoint specifications
- [Entity Registry](/packages/entity-registry) - TypeScript type definitions

---

## Agent 3 Handoff

This infrastructure is ready for consumption by other agents:

**For Agent_5 (API Services):**
```typescript
// Import Prisma client from shared package
import { PrismaClient } from '@constitutional/database';

const prisma = new PrismaClient();
```

**Connection Details:**
- Host: `localhost` (or `postgres` within Docker network)
- Port: `5432`
- Database: `constitutional_shrinkage`
- Schema: Files in `postgres/schema/`

**Key Files:**
- `infrastructure/database/prisma/schema.prisma`
- `infrastructure/database/postgres/schema/*.sql`

---

*Generated by Agent 3 - Database & Schema Infrastructure*
