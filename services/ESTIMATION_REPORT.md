# Agent_5 Estimation Report - API Services Layer

## Summary

| Metric | Value |
|--------|-------|
| Total Files | 24 |
| Estimated LOC | 3,200 |
| Complexity | High |
| Dependencies | All 6 packages, PostgreSQL, Redis |
| Services | 4 (API Gateway, Auth, Notification, Search) |

---

## Detailed Breakdown

### Component 1: API Gateway (`services/api-gateway/`)

| Metric | Value |
|--------|-------|
| Files | 12 |
| LOC | ~1,400 |
| Complexity | High |
| Notes | Core routing, middleware, request handling |

**Endpoints Required:**

#### Bills API (~25 endpoints)
- `GET /api/bills` - List with filters, pagination
- `GET /api/bills/trending` - Trending bills
- `GET /api/bills/my-region/:region` - Region-specific
- `GET /api/bills/categories` - List categories
- `GET /api/bills/:id` - Bill details
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete draft bill
- `GET /api/bills/:id/history` - Version history
- `GET /api/bills/:id/amendments` - Get amendments
- `POST /api/bills/:id/amendments` - Propose amendment
- `GET /api/bills/:id/comments` - Get comments
- `POST /api/bills/:id/comments` - Add comment
- `GET /api/bills/:id/impact` - Impact prediction
- `GET /api/bills/:id/constitutional` - Compliance check
- `GET /api/bills/:id/diff/:v1/:v2` - Get diff
- `GET /api/bills/:id/blame` - Get blame info
- `POST /api/bills/:id/vote` - Cast vote
- `GET /api/bills/:id/my-vote` - User's vote
- `GET /api/bills/:id/results` - Current results
- `GET /api/bills/:id/session` - Session info
- `POST /api/bills/:id/cosponsors` - Invite co-sponsor
- `POST /api/bills/:id/validate` - Validate bill
- `GET /api/bills/:id/impact-preview` - Preview impact
- `POST /api/amendments/:aid/vote` - Vote on amendment
- `POST /api/amendments/:aid/merge` - Merge amendment

#### Users API (~10 endpoints)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile
- `GET /api/users/:id/votes` - User's voting history
- `GET /api/users/:id/delegations` - User's delegations
- `GET /api/users/:id/sponsored-bills` - Sponsored bills
- `GET /api/users/:id/activity` - Activity feed
- `GET /api/users/search` - Search users
- `POST /api/users/:id/verify` - Submit verification
- `GET /api/users/:id/involvement` - Involvement report
- `GET /api/users/:id/network` - Network connections

#### Delegations API (~6 endpoints)
- `GET /api/delegations` - List delegations
- `POST /api/delegations` - Create delegation
- `DELETE /api/delegations/:id` - Revoke delegation
- `GET /api/delegations/:id/chain` - Get delegation chain
- `PUT /api/delegations/:id` - Update delegation
- `GET /api/delegations/incoming` - Incoming delegations

#### Votes API (~5 endpoints)
- `POST /api/votes` - Cast vote
- `GET /api/votes/:id` - Get vote receipt
- `GET /api/votes/verify/:proof` - Verify cryptographic proof
- `GET /api/votes/history` - Voting history
- `GET /api/votes/stats` - Voting statistics

#### Regions API (~6 endpoints)
- `GET /api/regions` - List regions
- `GET /api/regions/:id` - Region details
- `GET /api/regions/:id/bills` - Region bills
- `GET /api/regions/:id/representatives` - Representatives
- `GET /api/regions/:id/metrics` - Regional TBL metrics
- `GET /api/regions/:id/pods` - Regional pods

---

### Component 2: Auth Service (`services/auth-service/`)

| Metric | Value |
|--------|-------|
| Files | 6 |
| LOC | ~700 |
| Complexity | High |
| Notes | Critical security component |

**Features:**
- User registration with email verification
- Login/logout with JWT tokens
- Password reset flow
- Session management
- OAuth2 providers (Google, GitHub)
- Multi-factor authentication support
- Verification level progression
- Public key management for vote signing

**Endpoints:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Request reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email
- `POST /auth/verify-phone` - Verify phone
- `GET /auth/me` - Get current user
- `GET /auth/oauth/:provider` - OAuth redirect
- `GET /auth/oauth/:provider/callback` - OAuth callback

---

### Component 3: Notification Service (`services/notification-service/`)

| Metric | Value |
|--------|-------|
| Files | 6 |
| LOC | ~600 |
| Complexity | Medium |
| Notes | Real-time and async notifications |

**Features:**
- Real-time WebSocket notifications
- Email notifications (transactional)
- Push notifications (web push)
- Notification preferences
- Notification templates
- Batch processing

**Notification Types:**
- Vote available
- Vote ending soon
- Vote result
- Bill update
- Delegation request
- Delegation accepted/rejected
- Region announcement
- System alerts

**Channels:**
- WebSocket (real-time)
- Email (SMTP)
- Web Push
- In-app (stored)

---

### Component 4: Search Service (`services/search-service/`)

| Metric | Value |
|--------|-------|
| Files | 4 |
| LOC | ~500 |
| Complexity | Medium |
| Notes | Elasticsearch integration |

**Features:**
- Full-text search across all entities
- Faceted search with filters
- Auto-complete suggestions
- Recent searches
- Trending topics
- Relevance scoring

**Searchable Entities:**
- Bills (title, content, amendments)
- People (name, expertise, region)
- Organizations (name, type)
- Regions (name, jurisdiction)
- Categories (name, description)

**Endpoints:**
- `GET /search` - Global search
- `GET /search/bills` - Bill-specific search
- `GET /search/people` - People search
- `GET /search/organizations` - Organization search
- `GET /search/suggestions` - Auto-complete
- `GET /search/trending` - Trending topics

---

## Integration Points

### Package Dependencies

| Service | Packages Used |
|---------|---------------|
| API Gateway | All 6 packages |
| Auth Service | entity-registry, voting-system (for citizen types) |
| Notification Service | entity-registry (for user lookups) |
| Search Service | All 6 packages (for indexing) |

### External Dependencies

| Service | External Systems |
|---------|------------------|
| API Gateway | PostgreSQL, Redis (cache) |
| Auth Service | PostgreSQL, Redis (sessions), SMTP |
| Notification Service | Redis (pub/sub), SMTP, Web Push |
| Search Service | Elasticsearch |

---

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Fastify (high performance)
- **Database:** PostgreSQL (primary), Redis (cache/sessions)
- **Search:** Elasticsearch 8.x
- **Auth:** JWT, bcrypt, passport.js
- **Real-time:** Socket.IO
- **Validation:** Zod
- **Documentation:** OpenAPI 3.0 / Swagger

---

## File Structure

```
services/
├── api-gateway/
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── routes/
│   │   │   ├── bills.ts          # Bill routes
│   │   │   ├── votes.ts          # Vote routes
│   │   │   ├── users.ts          # User routes
│   │   │   ├── delegations.ts    # Delegation routes
│   │   │   └── regions.ts        # Region routes
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Auth middleware
│   │   │   ├── rateLimit.ts      # Rate limiting
│   │   │   └── validation.ts     # Request validation
│   │   └── lib/
│   │       ├── db.ts             # Database client
│   │       └── cache.ts          # Redis client
│   ├── package.json
│   └── tsconfig.json
├── auth-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── strategies/
│   │   │   ├── local.ts          # Local auth
│   │   │   └── oauth.ts          # OAuth providers
│   │   ├── utils/
│   │   │   └── tokens.ts         # JWT utilities
│   │   └── routes.ts
│   └── package.json
├── notification-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── channels/
│   │   │   ├── websocket.ts      # Real-time
│   │   │   ├── email.ts          # Email channel
│   │   │   └── push.ts           # Web push
│   │   └── templates/
│   │       └── index.ts          # Email templates
│   └── package.json
├── search-service/
│   ├── src/
│   │   ├── index.ts
│   │   └── indexers/
│   │       ├── bills.ts          # Bill indexer
│   │       └── people.ts         # People indexer
│   └── package.json
├── openapi.yaml                   # API specification
└── README.md
```

---

## Security Considerations

1. **Authentication:** JWT with short expiry + refresh tokens
2. **Authorization:** Role-based access control (RBAC)
3. **Rate Limiting:** Per-user and per-IP limits
4. **Input Validation:** Strict schema validation with Zod
5. **CORS:** Whitelist approved origins
6. **SQL Injection:** Parameterized queries via Prisma
7. **XSS:** Output encoding, CSP headers
8. **Vote Integrity:** Cryptographic proofs, audit logs

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 100ms |
| Search Response Time (p95) | < 200ms |
| Concurrent Users | 10,000+ |
| WebSocket Connections | 50,000+ |
| Database Queries | < 50ms |

---

*Generated by Agent_5 - 2025-11-22*
