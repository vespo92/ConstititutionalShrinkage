# Agent_7: Authentication & User Service

## Mission
Implement the authentication and user management services in `services/auth-service/` and `services/user-service/`. This provides the security layer for the entire platform.

## Branch
```
claude/agent-7-auth-service-{session-id}
```

## Priority: CRITICAL

## Context
You are building on a foundation that already has:
- Complete PostgreSQL database schema with Person, User tables
- Prisma ORM configuration
- Redis available for session storage
- Docker Compose setup

## Target Directories
```
services/auth-service/
services/user-service/
```

## Your Deliverables

### 1. Auth Service - JWT & OAuth2

#### Endpoints
```
# Standard Authentication
POST   /auth/register              # New user registration
POST   /auth/login                 # Email/password login
POST   /auth/logout                # Invalidate session
POST   /auth/refresh               # Refresh access token
POST   /auth/forgot-password       # Request password reset
POST   /auth/reset-password        # Complete password reset
POST   /auth/verify-email          # Email verification

# OAuth2 Providers
GET    /auth/google                # Initiate Google OAuth
GET    /auth/google/callback       # Google callback
GET    /auth/github                # Initiate GitHub OAuth
GET    /auth/github/callback       # GitHub callback

# Token Management
POST   /auth/tokens/revoke         # Revoke specific token
GET    /auth/tokens/active         # List active sessions
```

### 2. User Service - Profile & Preferences

#### Endpoints
```
# Profile Management
GET    /users/me                   # Current user profile
PUT    /users/me                   # Update profile
DELETE /users/me                   # Delete account
GET    /users/:id                  # Get user (public info only)
GET    /users/:id/public           # Public profile view

# Preferences
GET    /users/me/preferences       # Get preferences
PUT    /users/me/preferences       # Update preferences

# Verification (future-proofed for citizen verification)
GET    /users/me/verification      # Verification status
POST   /users/me/verification      # Start verification process
```

### 3. File Structure

```
services/auth-service/
├── src/
│   ├── index.ts                   # Entry point
│   ├── app.ts                     # Fastify configuration
│   ├── routes/
│   │   ├── auth.ts                # Login, logout, refresh
│   │   ├── register.ts            # Registration flow
│   │   ├── oauth.ts               # OAuth callbacks
│   │   ├── password.ts            # Reset, change
│   │   └── tokens.ts              # Token management
│   ├── strategies/
│   │   ├── jwt.ts                 # JWT generation/validation
│   │   ├── google.ts              # Google OAuth2
│   │   └── github.ts              # GitHub OAuth2
│   ├── middleware/
│   │   ├── auth-guard.ts          # Route protection
│   │   ├── rbac.ts                # Role-based access control
│   │   └── rate-limit.ts          # Auth-specific rate limits
│   ├── lib/
│   │   ├── tokens.ts              # Token utilities
│   │   ├── redis.ts               # Session store
│   │   ├── password.ts            # Argon2 hashing
│   │   └── email.ts               # Email sending (templates)
│   ├── schemas/
│   │   ├── auth.schema.ts         # Zod validation
│   │   └── user.schema.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── auth.test.ts
│   ├── oauth.test.ts
│   └── tokens.test.ts
├── package.json
└── tsconfig.json

services/user-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── profile.ts             # Profile CRUD
│   │   ├── preferences.ts         # User preferences
│   │   └── verification.ts        # Citizen verification
│   ├── lib/
│   │   └── prisma.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   └── types/
│       └── index.ts
├── tests/
│   └── profile.test.ts
├── package.json
└── tsconfig.json
```

### 4. Technical Requirements

#### JWT Configuration
```typescript
// Access token: short-lived (15 minutes)
// Refresh token: long-lived (7 days), stored in Redis
// Token rotation: refresh tokens are single-use

interface TokenPayload {
  userId: string;
  personId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}
```

#### Password Security
```typescript
// Use Argon2id for password hashing
// Minimum requirements:
// - 12 characters minimum
// - 1 uppercase, 1 lowercase, 1 number
// - Check against common passwords list
```

#### Rate Limiting
```typescript
// Aggressive rate limiting on auth endpoints:
// - Login: 5 attempts per 15 minutes per IP
// - Register: 3 per hour per IP
// - Password reset: 3 per hour per email
// - OAuth: 10 per minute per IP
```

### 5. Role-Based Access Control (RBAC)

```typescript
// Roles
enum Role {
  CITIZEN = 'citizen',           // Basic voter
  DELEGATE = 'delegate',         // Can receive delegations
  LEGISLATOR = 'legislator',     // Can create bills
  JUDGE = 'judge',               // Judicial review
  ADMINISTRATOR = 'administrator', // Regional admin
  SUPER_ADMIN = 'super_admin'    // System admin
}

// Permissions (examples)
enum Permission {
  VOTE_CAST = 'vote:cast',
  VOTE_DELEGATE = 'vote:delegate',
  BILL_CREATE = 'bill:create',
  BILL_REVIEW = 'bill:review',
  USER_MANAGE = 'user:manage',
  // ... more
}
```

### 6. Redis Session Storage

```typescript
// Session structure in Redis
interface Session {
  userId: string;
  refreshToken: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: Date;
  expiresAt: Date;
}

// Key pattern: session:{userId}:{tokenId}
// TTL: 7 days (matches refresh token)
```

### 7. OAuth2 Configuration

```typescript
// Google OAuth2
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.BASE_URL}/auth/google/callback`,
  scopes: ['openid', 'email', 'profile']
};

// GitHub OAuth2
const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: `${process.env.BASE_URL}/auth/github/callback`,
  scopes: ['read:user', 'user:email']
};
```

### 8. Middleware Export for Other Services

Create exportable middleware that Agent_6 (API Gateway) will import:

```typescript
// Export these for use by API Gateway
export { authGuard } from './middleware/auth-guard';
export { rbac } from './middleware/rbac';
export { verifyToken } from './lib/tokens';
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 20-25 |
| Lines of Code | 2,000-2,500 |
| Endpoints | 15-20 |
| Test Coverage | 90% |

## Success Criteria

1. [ ] JWT access/refresh token flow working
2. [ ] Google OAuth2 flow complete
3. [ ] GitHub OAuth2 flow complete
4. [ ] Password hashing with Argon2
5. [ ] Redis session storage working
6. [ ] RBAC middleware functional
7. [ ] Rate limiting on all auth endpoints
8. [ ] Password reset flow with email
9. [ ] Unit tests passing (90%+ coverage)
10. [ ] TypeScript compiles without errors

## Security Considerations

- Never log passwords or tokens
- Use constant-time comparison for tokens
- Invalidate all sessions on password change
- Implement account lockout after failed attempts
- Use secure, httpOnly cookies for refresh tokens
- Add CSRF protection for cookie-based auth

## Integration Notes

Agent_6 (API Gateway) will import your auth middleware:
```typescript
import { authGuard, rbac } from '@services/auth-service';

// Protected route
app.get('/api/v1/bills', { preHandler: authGuard }, handler);

// Role-protected route
app.post('/api/v1/bills', { preHandler: [authGuard, rbac('bill:create')] }, handler);
```

---

*Agent_7 Assignment - Auth & User Services*
