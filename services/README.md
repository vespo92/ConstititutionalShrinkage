# API Services Layer

Backend services for the Constitutional Shrinkage platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATIONS                                 │
│          (legislative, citizen-portal, executive, etc.)             │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                                   │
│                    (services/api-gateway)                           │
│  Routes: /api/bills, /api/votes, /api/users, /api/delegations       │
└─────────────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  AUTH SERVICE   │   │ NOTIFICATION    │   │ SEARCH SERVICE  │
│                 │   │    SERVICE      │   │                 │
│  JWT, OAuth     │   │  WebSocket      │   │  Elasticsearch  │
│  Verification   │   │  Email, Push    │   │  Full-text      │
└─────────────────┘   └─────────────────┘   └─────────────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SHARED PACKAGES                                  │
│  constitutional-framework | voting-system | governance-utils        │
│  metrics | entity-registry | business-transparency                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│        PostgreSQL (primary) | Redis (cache) | Elasticsearch         │
└─────────────────────────────────────────────────────────────────────┘
```

## Services

### API Gateway (`services/api-gateway`)

Main entry point for all API requests. Built with Fastify.

- **Port:** 3001
- **Features:**
  - RESTful API routes
  - JWT authentication
  - Rate limiting
  - Request validation (Zod)
  - Swagger/OpenAPI documentation

**Routes:**
- `/api/bills` - Legislation management
- `/api/votes` - Voting operations
- `/api/users` - User profiles
- `/api/delegations` - Liquid democracy
- `/api/regions` - Regional governance

### Auth Service (`services/auth-service`)

Authentication and authorization service.

- **Port:** 3002
- **Features:**
  - User registration
  - Login with JWT
  - Refresh token rotation
  - OAuth2 (Google, GitHub)
  - Email/phone verification
  - Password reset

### Notification Service (`services/notification-service`)

Multi-channel notification delivery.

- **Port:** 3003
- **Features:**
  - Real-time WebSocket notifications
  - Email notifications (SMTP)
  - Web Push notifications
  - Notification preferences
  - Email templates

### Search Service (`services/search-service`)

Full-text search powered by Elasticsearch.

- **Port:** 3004
- **Features:**
  - Global search across all entities
  - Faceted search with filters
  - Auto-complete suggestions
  - Bill/people-specific search
  - Trending topics

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Elasticsearch 8+ (for search)

### Environment Variables

Create a `.env` file in the root:

```env
# API Gateway
PORT=3001
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000

# Auth Service
AUTH_PORT=3002
REFRESH_SECRET=your-refresh-secret
COOKIE_SECRET=your-cookie-secret

# Notification Service
NOTIFICATION_PORT=3003
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASSWORD=password
VAPID_PUBLIC_KEY=your-vapid-public
VAPID_PRIVATE_KEY=your-vapid-private

# Search Service
SEARCH_PORT=3004
ELASTICSEARCH_URL=http://localhost:9200

# Shared
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://user:pass@localhost:5432/constitutional_shrinkage
```

### Installation

```bash
# Install dependencies for all services
cd services/api-gateway && npm install
cd ../auth-service && npm install
cd ../notification-service && npm install
cd ../search-service && npm install
```

### Development

```bash
# Run individual services
cd services/api-gateway && npm run dev
cd services/auth-service && npm run dev
cd services/notification-service && npm run dev
cd services/search-service && npm run dev
```

### Production

```bash
# Build all services
npm run build

# Start all services
npm run start
```

## API Documentation

Interactive API documentation is available at:
- **Swagger UI:** http://localhost:3001/docs
- **OpenAPI Spec:** `services/openapi.yaml`

## Security

- JWT with short-lived access tokens (15 min)
- Refresh token rotation
- Rate limiting per user and IP
- Input validation with Zod schemas
- Helmet security headers
- CORS whitelist

## Integration with Packages

All services integrate with the shared packages:

```typescript
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
import { votingSystem } from '@constitutional-shrinkage/voting-system';
import { createBill } from '@constitutional-shrinkage/governance-utils';
import { metricsSystem } from '@constitutional-shrinkage/metrics';
import { entityRegistry } from '@constitutional-shrinkage/entity-registry';
```

## Testing

```bash
# Run tests for all services
cd services/api-gateway && npm test
cd services/auth-service && npm test
cd services/notification-service && npm test
cd services/search-service && npm test
```

## Monitoring

- **Health checks:** `/health` endpoint on each service
- **Logging:** Structured JSON logging with Pino
- **Metrics:** Prometheus-compatible metrics (coming soon)

## Deployment

Services are designed to run as microservices:

- Docker containers
- Kubernetes deployment
- Load balanced
- Auto-scaling

See `infrastructure/` for deployment configurations.

---

*Implemented by Agent_5 - API Services Layer*
