# Application Design Documentation

> Design specifications for the Constitutional Shrinkage applications.

## Application Priority Order

Build applications in this order based on dependencies and user value:

| Priority | Application | Status | Description |
|----------|-------------|--------|-------------|
| 1 | [Legislative](./legislative.md) | Not Started | Git-style bill management and voting |
| 2 | [Citizen Portal](./citizen-portal.md) | Not Started | User interface for citizens |
| 3 | [Executive](./executive.md) | Not Started | Distributed executive functions |
| 4 | [Judicial](./judicial.md) | Not Started | Court system and dispute resolution |
| 5 | [Regional Governance](./regional-governance.md) | Not Started | Self-organizing regional pods |
| 6 | [Supply Chain](./supply-chain.md) | Not Started | Economic transparency tools |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                          │
│              (Next.js + React + TailwindCSS)                 │
├─────────────────────────────────────────────────────────────┤
│  Legislative  │ Citizen Portal │ Executive │ Judicial │ ... │
└───────┬───────┴───────┬────────┴─────┬─────┴────┬─────┴─────┘
        │               │              │          │
        ▼               ▼              ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
│                   (REST + GraphQL)                           │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Bills  │  Votes  │  Users  │  Metrics  │  Search  │
└────────┴─────────┴─────────┴─────────┴───────────┴──────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                     SHARED PACKAGES                          │
│  constitutional-framework │ voting-system │ entity-registry  │
│  governance-utils │ metrics │ business-transparency          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│         PostgreSQL │ Redis │ Elasticsearch │ S3              │
└─────────────────────────────────────────────────────────────┘
```

## Shared Infrastructure

### Authentication
- NextAuth.js for session management
- Multiple providers: Email, OAuth, Government ID
- Identity verification levels

### Database
- PostgreSQL for primary data
- Redis for caching and sessions
- Elasticsearch for full-text search

### Real-time Updates
- Server-Sent Events for notifications
- WebSockets for live voting

### File Storage
- S3-compatible storage for documents
- CDN for static assets

## Design Principles

1. **Mobile-First** - All apps must work on mobile devices
2. **Accessibility** - WCAG 2.1 AA compliance required
3. **Transparency** - All actions logged and auditable
4. **Offline Capable** - Core functions work without network
5. **Progressive Enhancement** - Basic HTML works without JS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand + React Query |
| Forms | React Hook Form + Zod |
| API | tRPC or REST |
| Database | Prisma + PostgreSQL |
| Auth | NextAuth.js |
| Testing | Vitest + Playwright |
| Deployment | Vercel / Railway |

## Common Components

All applications share these components:

```
packages/ui/
├── Button/
├── Card/
├── Modal/
├── Form/
│   ├── Input/
│   ├── Select/
│   ├── Checkbox/
│   └── Validation/
├── Navigation/
│   ├── Header/
│   ├── Sidebar/
│   └── Breadcrumb/
├── Data/
│   ├── Table/
│   ├── List/
│   └── Pagination/
├── Feedback/
│   ├── Toast/
│   ├── Alert/
│   └── Loading/
└── Visualization/
    ├── Chart/
    ├── Graph/
    └── Timeline/
```

## API Design

### REST Endpoints Pattern

```
GET    /api/v1/{resource}           # List
GET    /api/v1/{resource}/:id       # Get one
POST   /api/v1/{resource}           # Create
PATCH  /api/v1/{resource}/:id       # Update
DELETE /api/v1/{resource}/:id       # Delete

# Relationships
GET    /api/v1/{resource}/:id/{related}

# Actions
POST   /api/v1/{resource}/:id/{action}
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

## Getting Started

1. Read the [NEXT-STEPS.md](/docs/NEXT-STEPS.md) for implementation priorities
2. Review the specific application design doc
3. Set up your development environment
4. Start with the Legislative app (highest priority)
