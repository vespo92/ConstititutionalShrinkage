# Agent_13: Testing Expansion

## Mission
Expand the testing infrastructure with comprehensive E2E tests (Playwright), enhanced security tests, performance/load testing, and API integration tests to achieve 85%+ coverage across the platform.

## Branch
```
claude/agent-13-testing-expansion-{session-id}
```

## Priority: HIGH

## Context
Current testing state:
- Unit tests exist in packages (partial coverage)
- 2 integration test files created
- 1 security test file created
- E2E tests not implemented
- Performance tests not implemented

Target state:
- 85%+ coverage on all packages
- E2E tests for critical user journeys
- Comprehensive security test suite
- Performance baselines established

## Target Directories
```
tests/
packages/*/tests/
```

## Your Deliverables

### 1. E2E Testing with Playwright

#### Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Citizen Journey Tests
```
tests/e2e/citizen/
├── registration.spec.ts        # User registration flow
├── login.spec.ts               # Login/logout flows
├── dashboard.spec.ts           # Dashboard navigation
├── voting.spec.ts              # Vote casting journey
├── delegation.spec.ts          # Delegate vote power
├── delegation-revoke.spec.ts   # Revoke delegation
├── profile.spec.ts             # Profile management
└── notifications.spec.ts       # Notification interactions
```

#### Legislative Journey Tests
```
tests/e2e/legislative/
├── bill-creation.spec.ts       # Create new bill
├── bill-editing.spec.ts        # Edit existing bill
├── bill-forking.spec.ts        # Fork a bill (git-style)
├── bill-diff.spec.ts           # View bill differences
├── amendment.spec.ts           # Propose amendments
├── voting-session.spec.ts      # Voting session flow
├── compliance-check.spec.ts    # Constitutional check
└── bill-passage.spec.ts        # Full bill lifecycle
```

#### Admin Journey Tests
```
tests/e2e/admin/
├── pod-management.spec.ts      # Regional pod CRUD
├── user-management.spec.ts     # User administration
├── metrics-dashboard.spec.ts   # TBL metrics
└── audit-trail.spec.ts         # Audit viewing
```

### 2. API Integration Tests

#### File Structure
```
tests/integration/
├── api/
│   ├── setup.ts                # Test setup, DB seeding
│   ├── teardown.ts             # Cleanup
│   ├── helpers.ts              # Test utilities
│   ├── bills.integration.test.ts
│   ├── votes.integration.test.ts
│   ├── delegations.integration.test.ts
│   ├── auth.integration.test.ts
│   ├── users.integration.test.ts
│   ├── metrics.integration.test.ts
│   └── search.integration.test.ts
└── database/
    ├── schema.integration.test.ts
    ├── triggers.integration.test.ts
    └── indexes.integration.test.ts
```

#### Example Integration Tests
```typescript
// bills.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestClient, seedTestData, cleanupTestData } from './helpers';

describe('Bills API', () => {
  let client: TestClient;
  let authToken: string;

  beforeAll(async () => {
    await seedTestData();
    client = createTestClient();
    authToken = await client.login('test@example.com', 'password');
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/bills', () => {
    it('should create a new bill', async () => {
      const bill = {
        title: 'Test Bill',
        content: 'This is a test bill content',
        category: 'infrastructure',
        region: 'test-region'
      };

      const response = await client.post('/api/v1/bills', bill, authToken);

      expect(response.status).toBe(201);
      expect(response.data.title).toBe(bill.title);
      expect(response.data.id).toBeDefined();
      expect(response.data.version).toBe(1);
    });

    it('should reject bill without authentication', async () => {
      const response = await client.post('/api/v1/bills', {});
      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await client.post('/api/v1/bills', {}, authToken);
      expect(response.status).toBe(400);
      expect(response.data.errors).toContain('title is required');
    });
  });

  describe('GET /api/v1/bills/:id/diff', () => {
    it('should return diff between versions', async () => {
      // Create bill and update it
      const bill = await client.createBill({ title: 'Original' }, authToken);
      await client.updateBill(bill.id, { title: 'Updated' }, authToken);

      const response = await client.get(`/api/v1/bills/${bill.id}/diff?from=1&to=2`, authToken);

      expect(response.status).toBe(200);
      expect(response.data.changes).toBeDefined();
    });
  });

  // ... more tests
});
```

### 3. Security Tests

#### Expanded Security Test Suite
```
tests/security/
├── authentication/
│   ├── brute-force.test.ts     # Rate limiting on login
│   ├── session-hijacking.test.ts
│   ├── token-tampering.test.ts
│   ├── password-policy.test.ts
│   └── oauth-csrf.test.ts
├── authorization/
│   ├── rbac.test.ts            # Role-based access
│   ├── privilege-escalation.test.ts
│   ├── resource-access.test.ts
│   └── cross-user-access.test.ts
├── voting/
│   ├── vote-tampering.test.ts  # EXPANDED
│   ├── sybil-attack.test.ts    # EXPANDED
│   ├── delegation-abuse.test.ts
│   ├── double-voting.test.ts
│   └── vote-verification.test.ts
├── input-validation/
│   ├── sql-injection.test.ts
│   ├── xss-prevention.test.ts
│   ├── command-injection.test.ts
│   ├── path-traversal.test.ts
│   └── file-upload.test.ts
├── api/
│   ├── rate-limiting.test.ts
│   ├── cors.test.ts
│   ├── headers.test.ts
│   └── error-disclosure.test.ts
└── data/
    ├── encryption.test.ts
    ├── pii-protection.test.ts
    └── audit-logging.test.ts
```

#### Example Security Tests
```typescript
// vote-tampering.test.ts
import { describe, it, expect } from 'vitest';
import { createTestVotingSession, castVote, tamperWithVote } from './helpers';

describe('Vote Tampering Prevention', () => {
  it('should detect modified vote after casting', async () => {
    const session = await createTestVotingSession();
    const vote = await castVote(session.id, 'user-1', 'yes');

    // Attempt to tamper with the vote
    const tamperedVote = { ...vote, choice: 'no' };

    const verification = await verifyVote(tamperedVote);

    expect(verification.valid).toBe(false);
    expect(verification.error).toBe('SIGNATURE_MISMATCH');
  });

  it('should reject votes with invalid signatures', async () => {
    const session = await createTestVotingSession();

    const forgedVote = {
      sessionId: session.id,
      choice: 'yes',
      signature: 'forged-signature'
    };

    await expect(submitVote(forgedVote)).rejects.toThrow('INVALID_SIGNATURE');
  });

  it('should maintain vote integrity under concurrent modifications', async () => {
    const session = await createTestVotingSession();

    // Cast 100 votes concurrently
    const votes = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        castVote(session.id, `user-${i}`, i % 2 === 0 ? 'yes' : 'no')
      )
    );

    // Verify all votes
    const verifications = await Promise.all(
      votes.map(vote => verifyVote(vote))
    );

    expect(verifications.every(v => v.valid)).toBe(true);
  });
});

// sybil-attack.test.ts
describe('Sybil Attack Resistance', () => {
  it('should detect multiple votes from same IP', async () => {
    const session = await createTestVotingSession();

    // Create multiple "users" from same IP
    const sybilUsers = Array.from({ length: 10 }, (_, i) => ({
      id: `sybil-${i}`,
      ip: '192.168.1.100'
    }));

    // Attempt votes
    for (const user of sybilUsers) {
      await castVote(session.id, user.id, 'yes', { ip: user.ip });
    }

    const analysis = await analyzeSybilPatterns(session.id);

    expect(analysis.suspiciousPatterns).toContain('MULTIPLE_VOTES_SAME_IP');
    expect(analysis.flaggedVotes.length).toBeGreaterThan(0);
  });

  it('should enforce one vote per verified citizen', async () => {
    const session = await createTestVotingSession();
    const user = await createVerifiedUser();

    await castVote(session.id, user.id, 'yes');

    await expect(
      castVote(session.id, user.id, 'no')
    ).rejects.toThrow('ALREADY_VOTED');
  });
});
```

### 4. Performance/Load Testing

#### K6 Load Tests
```
tests/performance/
├── k6/
│   ├── voting-load.js          # Load test voting system
│   ├── search-load.js          # Load test search
│   ├── api-stress.js           # API stress test
│   ├── delegation-chain.js     # Delegation resolution
│   └── concurrent-users.js     # Concurrent user simulation
├── benchmarks/
│   ├── delegation-chain.bench.ts   # Delegation chain resolution
│   ├── compliance-check.bench.ts   # Constitutional compliance
│   ├── vote-tally.bench.ts         # Vote counting
│   └── search-index.bench.ts       # Search performance
└── baselines/
    └── expected-performance.json   # Performance expectations
```

#### Example K6 Test
```javascript
// voting-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 500 },   // Spike to 500 users
    { duration: '2m', target: 500 },   // Stay at 500 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    errors: ['rate<0.01'],              // Error rate under 1%
  },
};

export default function () {
  const loginRes = http.post(`${__ENV.API_URL}/auth/login`, {
    email: `user${__VU}@test.com`,
    password: 'testpassword'
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('accessToken');

  // Cast a vote
  const voteRes = http.post(
    `${__ENV.API_URL}/api/v1/votes`,
    JSON.stringify({
      sessionId: 'test-session',
      choice: 'yes'
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  errorRate.add(voteRes.status !== 200);

  check(voteRes, {
    'vote cast successfully': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### 5. Test Utilities and Factories

```typescript
// tests/utils/factories.ts
import { faker } from '@faker-js/faker';

export const factories = {
  user: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    region: faker.location.state(),
    ...overrides
  }),

  bill: (overrides = {}) => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    category: faker.helpers.arrayElement(['infrastructure', 'education', 'healthcare']),
    status: 'draft',
    ...overrides
  }),

  vote: (overrides = {}) => ({
    id: faker.string.uuid(),
    choice: faker.helpers.arrayElement(['yes', 'no', 'abstain']),
    timestamp: faker.date.recent(),
    ...overrides
  }),

  delegation: (overrides = {}) => ({
    id: faker.string.uuid(),
    fromUserId: faker.string.uuid(),
    toUserId: faker.string.uuid(),
    scope: faker.helpers.arrayElement(['all', 'category', 'region']),
    ...overrides
  })
};

// tests/utils/test-helpers.ts
export async function seedTestData() {
  // Seed database with test fixtures
}

export async function cleanupTestData() {
  // Clean up test data
}

export function createTestClient() {
  // Create API test client
}

export async function authenticateAs(role: string) {
  // Get auth token for role
}
```

### 6. Coverage Configuration

```typescript
// vitest.config.ts (update)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 40-50 |
| Lines of Code | 4,000-5,000 |
| E2E Test Cases | 50+ |
| Integration Tests | 100+ |
| Security Tests | 50+ |
| Coverage | 85%+ |

## Success Criteria

1. [ ] Playwright E2E tests running
2. [ ] All critical user journeys covered
3. [ ] API integration tests passing
4. [ ] Security test suite expanded
5. [ ] K6 performance tests running
6. [ ] Coverage reports generating
7. [ ] CI integration working
8. [ ] Performance baselines established

---

*Agent_13 Assignment - Testing Expansion*
