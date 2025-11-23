# @constitutional/sdk

Official JavaScript/TypeScript SDK for the Constitutional Platform Public API.

## Installation

```bash
npm install @constitutional/sdk
# or
yarn add @constitutional/sdk
# or
pnpm add @constitutional/sdk
```

## Quick Start

```typescript
import { Constitutional } from '@constitutional/sdk';

// Initialize the client
const client = new Constitutional({
  apiKey: process.env.CONSTITUTIONAL_API_KEY,
});

// List bills currently in voting
const bills = await client.bills.list({ status: 'voting' });
console.log(bills.data);

// Get a specific bill
const bill = await client.bills.get('bill_abc123');
console.log(bill.title);
```

## Features

- Full TypeScript support with complete type definitions
- Automatic pagination with async iterators
- Built-in rate limiting and retry logic
- Comprehensive error handling
- Works in Node.js and browsers

## API Resources

### Bills

```typescript
// List bills with filters
const bills = await client.bills.list({
  status: 'voting',
  category: 'infrastructure',
  region: 'CA',
  limit: 20,
});

// Iterate through ALL bills (handles pagination automatically)
for await (const bill of client.bills.listAll({ status: 'voting' })) {
  console.log(bill.title);
}

// Get bill details
const bill = await client.bills.get('bill_abc123');

// Get version history
const versions = await client.bills.getVersions('bill_abc123');

// Get diff between versions
const diff = await client.bills.diff('bill_abc123', {
  fromVersion: 1,
  toVersion: 3,
});

// Get amendments
const amendments = await client.bills.getAmendments('bill_abc123');
```

### Votes

```typescript
// List voting sessions
const sessions = await client.votes.listSessions({ status: 'active' });

// Get session details
const session = await client.votes.getSession('session_xyz');

// Get detailed tally with regional breakdown
const tally = await client.votes.getTally('session_xyz');
console.log(`Yes: ${tally.overall.yes}, No: ${tally.overall.no}`);

// Get voting statistics
const stats = await client.votes.getStatistics({ period: 'last_30_days' });
```

### Regions

```typescript
// List regions
const regions = await client.regions.list({ type: 'city' });

// Get region with children
const region = await client.regions.get('CA');

// Get detailed metrics
const metrics = await client.regions.getMetrics('CA-SF', {
  period: 'last_30_days',
});

// Get leaderboard
const leaderboard = await client.regions.getLeaderboard('CA', {
  metric: 'tbl_score',
});
```

### Metrics

```typescript
// Platform overview
const overview = await client.metrics.getOverview();

// Triple Bottom Line scores
const tbl = await client.metrics.getTBL({ regionId: 'CA' });

// Governance health
const governance = await client.metrics.getGovernance();

// Compare regions
const comparison = await client.metrics.compare({
  regions: ['CA-SF', 'CA-LA', 'NY-NYC'],
  metrics: ['tbl_score', 'participation_rate'],
});
```

### Search

```typescript
// Search bills
const results = await client.search.bills({
  query: 'renewable energy infrastructure',
  status: 'voting',
  category: 'environment',
});

// Search regions
const regions = await client.search.regions({ query: 'San' });

// Get autocomplete suggestions
const suggestions = await client.search.suggestions({
  query: 'renew',
  type: 'bill',
});
```

### Webhooks

```typescript
// Create a webhook
const webhook = await client.webhooks.create({
  url: 'https://myapp.com/webhooks/constitutional',
  events: ['bill.passed', 'vote.session_ended'],
});
// Store webhook.secret securely!

// List webhooks
const webhooks = await client.webhooks.list();

// Update webhook
await client.webhooks.update('webhook_id', {
  events: ['bill.passed', 'bill.rejected'],
});

// Delete webhook
await client.webhooks.delete('webhook_id');

// Verify webhook signature (in your webhook handler)
import { WebhooksResource } from '@constitutional/sdk';

const isValid = WebhooksResource.verifySignature(
  rawBody,
  req.headers['x-webhook-signature'],
  webhookSecret
);
```

## Error Handling

```typescript
import {
  Constitutional,
  ConstitutionalError,
  RateLimitError,
  AuthenticationError,
  NotFoundError,
  isRateLimitError,
} from '@constitutional/sdk';

try {
  const bill = await client.bills.get('invalid_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Bill not found');
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${error.retryAfter} seconds`);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof ConstitutionalError) {
    console.log(`Error: ${error.message} (${error.code})`);
  }
}

// Or use type guards
if (isRateLimitError(error)) {
  await sleep(error.retryAfter * 1000);
  // retry...
}
```

## Configuration

```typescript
const client = new Constitutional({
  // Required
  apiKey: 'csk_...',

  // Optional
  baseUrl: 'https://api.constitutional.io', // Custom API URL
  region: 'us-west', // Use regional endpoint
  timeout: 30000, // Request timeout (ms)
  maxRetries: 3, // Max retry attempts
});
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  Bill,
  BillStatus,
  VoteSession,
  Region,
  PaginatedResponse,
} from '@constitutional/sdk';
```

## License

MIT
