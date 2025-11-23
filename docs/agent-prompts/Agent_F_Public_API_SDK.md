# Agent_F: Public API & Developer SDK

## Mission
Create a public API layer with developer portal, SDKs for multiple languages, webhooks for real-time integrations, and comprehensive developer documentation to enable third-party innovation on the governance platform.

## Branch
```
claude/agent-F-public-api-sdk-{session-id}
```

## Priority: MEDIUM

## Context
Enable the developer ecosystem:
- Civic tech organizations building on the platform
- News organizations accessing voting data
- Researchers analyzing governance patterns
- Third-party apps and integrations
- Municipal systems integrating with regional pods
- Transparency tools and watchdog applications

## Target Directories
```
services/public-api/
packages/sdk-js/
packages/sdk-python/
apps/developer-portal/
```

## Your Deliverables

### 1. Public API Gateway

```
services/public-api/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── bills.ts            # Public bill endpoints
│   │   │   ├── votes.ts            # Public voting data
│   │   │   ├── regions.ts          # Regional data
│   │   │   ├── metrics.ts          # Public metrics
│   │   │   ├── search.ts           # Public search
│   │   │   └── webhooks.ts         # Webhook management
│   │   └── index.ts
│   ├── middleware/
│   │   ├── api-key.ts              # API key validation
│   │   ├── rate-limit.ts           # Rate limiting
│   │   ├── quota.ts                # Usage quota tracking
│   │   ├── cors.ts                 # CORS configuration
│   │   └── request-id.ts           # Request tracking
│   ├── services/
│   │   ├── api-keys.ts             # Key management
│   │   ├── webhooks.ts             # Webhook delivery
│   │   ├── usage.ts                # Usage tracking
│   │   └── rate-limiter.ts         # Rate limit logic
│   ├── lib/
│   │   ├── sanitize.ts             # Data sanitization
│   │   └── pagination.ts           # Cursor pagination
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. JavaScript/TypeScript SDK

```
packages/sdk-js/
├── src/
│   ├── client.ts                   # Main client
│   ├── resources/
│   │   ├── bills.ts
│   │   ├── votes.ts
│   │   ├── regions.ts
│   │   ├── metrics.ts
│   │   ├── search.ts
│   │   └── webhooks.ts
│   ├── types/
│   │   ├── bills.types.ts
│   │   ├── votes.types.ts
│   │   ├── regions.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── request.ts              # HTTP client
│   │   ├── pagination.ts           # Iterator helpers
│   │   └── errors.ts               # Error handling
│   └── index.ts
├── examples/
│   ├── basic-usage.ts
│   ├── pagination.ts
│   ├── webhooks.ts
│   └── real-time.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### SDK Usage Example
```typescript
// @constitutional/sdk

import { Constitutional } from '@constitutional/sdk';

// Initialize client
const client = new Constitutional({
  apiKey: process.env.CONSTITUTIONAL_API_KEY,
  region: 'us-west',  // Optional regional endpoint
});

// List bills with pagination
const bills = await client.bills.list({
  status: 'voting',
  category: 'infrastructure',
  limit: 20,
});

// Iterate through all bills
for await (const bill of client.bills.listAll({ status: 'voting' })) {
  console.log(bill.title);
}

// Get specific bill
const bill = await client.bills.get('bill_abc123');

// Get bill diff between versions
const diff = await client.bills.diff('bill_abc123', {
  fromVersion: 1,
  toVersion: 3,
});

// Get voting session results
const session = await client.votes.getSession('session_xyz');
console.log(`Yes: ${session.tally.yes}, No: ${session.tally.no}`);

// Search bills
const results = await client.search.bills({
  query: 'renewable energy infrastructure',
  filters: {
    region: 'CA',
    status: ['voting', 'passed'],
  },
});

// Get regional metrics
const metrics = await client.metrics.getRegion('CA-SF', {
  metrics: ['participation_rate', 'tbl_score'],
  period: 'last_30_days',
});

// Webhooks
const webhook = await client.webhooks.create({
  url: 'https://myapp.com/webhooks/constitutional',
  events: ['bill.status_changed', 'vote.session_ended'],
  secret: 'whsec_...',
});
```

### 3. Python SDK

```
packages/sdk-python/
├── constitutional/
│   ├── __init__.py
│   ├── client.py                   # Main client
│   ├── resources/
│   │   ├── __init__.py
│   │   ├── bills.py
│   │   ├── votes.py
│   │   ├── regions.py
│   │   ├── metrics.py
│   │   └── webhooks.py
│   ├── types/
│   │   ├── __init__.py
│   │   ├── bills.py
│   │   └── common.py
│   └── utils/
│       ├── __init__.py
│       ├── request.py
│       └── pagination.py
├── tests/
│   ├── test_bills.py
│   ├── test_votes.py
│   └── test_client.py
├── examples/
│   ├── basic_usage.py
│   ├── data_analysis.py
│   └── webhook_server.py
├── setup.py
├── pyproject.toml
└── README.md
```

#### Python SDK Usage
```python
# constitutional-python

from constitutional import Constitutional

# Initialize
client = Constitutional(api_key=os.environ["CONSTITUTIONAL_API_KEY"])

# List bills
bills = client.bills.list(status="voting", limit=20)
for bill in bills:
    print(f"{bill.title}: {bill.status}")

# Paginate through all bills
for bill in client.bills.list_all(status="passed"):
    print(bill.id)

# Get voting statistics
session = client.votes.get_session("session_xyz")
print(f"Participation: {session.participation_rate}%")

# Data analysis with pandas
import pandas as pd

all_bills = list(client.bills.list_all(status="enacted"))
df = pd.DataFrame([b.to_dict() for b in all_bills])
print(df.groupby("category")["id"].count())
```

### 4. Developer Portal

```
apps/developer-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── docs/
│   │   │   ├── page.tsx                # Documentation home
│   │   │   ├── getting-started/page.tsx
│   │   │   ├── authentication/page.tsx
│   │   │   ├── rate-limits/page.tsx
│   │   │   ├── webhooks/page.tsx
│   │   │   └── [slug]/page.tsx         # MDX docs
│   │   ├── api-reference/
│   │   │   ├── page.tsx                # OpenAPI explorer
│   │   │   └── [endpoint]/page.tsx     # Endpoint details
│   │   ├── console/
│   │   │   ├── page.tsx                # API console
│   │   │   ├── keys/page.tsx           # API key management
│   │   │   ├── usage/page.tsx          # Usage dashboard
│   │   │   └── webhooks/page.tsx       # Webhook management
│   │   ├── sdks/page.tsx               # SDK downloads
│   │   └── examples/page.tsx           # Code examples
│   ├── components/
│   │   ├── CodeBlock.tsx
│   │   ├── ApiExplorer.tsx
│   │   ├── EndpointTester.tsx
│   │   ├── LanguageTabs.tsx
│   │   └── ResponseViewer.tsx
│   └── lib/
│       └── mdx.ts
├── content/
│   └── docs/                           # MDX documentation
├── package.json
└── tsconfig.json
```

### 5. Webhook System

```typescript
// Webhook event types
type WebhookEvent =
  // Bill events
  | 'bill.created'
  | 'bill.updated'
  | 'bill.status_changed'
  | 'bill.submitted'
  | 'bill.passed'
  | 'bill.rejected'
  | 'bill.sunset'

  // Voting events
  | 'vote.session_created'
  | 'vote.session_started'
  | 'vote.session_ended'
  | 'vote.threshold_reached'

  // Regional events
  | 'region.pod_created'
  | 'region.metrics_updated'

  // System events
  | 'system.maintenance'
  | 'system.rate_limit_warning';

// Webhook payload
interface WebhookPayload<T> {
  id: string;
  type: WebhookEvent;
  created: string;
  data: T;
  api_version: string;
}

// Webhook delivery with retry
interface WebhookDelivery {
  // Exponential backoff: 1min, 5min, 30min, 2hr, 12hr
  retrySchedule: number[];

  // Signature verification
  signPayload(payload: string, secret: string): string;

  // Delivery status tracking
  trackDelivery(webhookId: string, attempt: DeliveryAttempt): void;
}
```

### 6. Rate Limiting & Quotas

```typescript
// Rate limit tiers
interface RateLimitTier {
  free: {
    requestsPerMinute: 60;
    requestsPerDay: 1000;
    webhooks: 5;
  };
  developer: {
    requestsPerMinute: 300;
    requestsPerDay: 10000;
    webhooks: 20;
  };
  organization: {
    requestsPerMinute: 1000;
    requestsPerDay: 100000;
    webhooks: 100;
  };
  government: {
    requestsPerMinute: 'unlimited';
    requestsPerDay: 'unlimited';
    webhooks: 'unlimited';
  };
}

// Rate limit headers
interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;      // Unix timestamp
  'X-RateLimit-RetryAfter'?: number; // Seconds (when limited)
}
```

## API Endpoints (Public)

```yaml
Bills:
  GET    /v1/bills                  # List bills
  GET    /v1/bills/:id              # Get bill
  GET    /v1/bills/:id/versions     # Get versions
  GET    /v1/bills/:id/diff         # Get diff
  GET    /v1/bills/:id/amendments   # Get amendments

Votes:
  GET    /v1/votes/sessions         # List sessions
  GET    /v1/votes/sessions/:id     # Get session
  GET    /v1/votes/sessions/:id/tally  # Get tally

Regions:
  GET    /v1/regions                # List regions
  GET    /v1/regions/:id            # Get region
  GET    /v1/regions/:id/metrics    # Get metrics

Search:
  GET    /v1/search/bills           # Search bills
  GET    /v1/search/regions         # Search regions

Metrics:
  GET    /v1/metrics/overview       # Platform metrics
  GET    /v1/metrics/tbl            # TBL scores

Webhooks:
  POST   /v1/webhooks               # Create webhook
  GET    /v1/webhooks               # List webhooks
  GET    /v1/webhooks/:id           # Get webhook
  PUT    /v1/webhooks/:id           # Update webhook
  DELETE /v1/webhooks/:id           # Delete webhook
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| API Endpoints | 25-30 |
| JS SDK Methods | 40-50 |
| Python SDK Methods | 40-50 |
| Documentation Pages | 30+ |
| Code Examples | 20+ |

## Success Criteria

1. [ ] Public API gateway deployed
2. [ ] API key management working
3. [ ] Rate limiting operational
4. [ ] JavaScript SDK published to npm
5. [ ] Python SDK published to PyPI
6. [ ] Developer portal live
7. [ ] Interactive API explorer working
8. [ ] Webhook delivery reliable (99.9%)
9. [ ] SDKs have >80% test coverage
10. [ ] OpenAPI spec complete

---

*Agent_F Assignment - Public API & Developer SDK*
