# Agent_8: Notification & Search Services

## Mission
Implement real-time notifications and full-text search services in `services/notification-service/` and `services/search-service/`.

## Branch
```
claude/agent-8-notification-search-{session-id}
```

## Priority: HIGH

## Context
You are building on a foundation that already has:
- Redis for pub/sub and caching
- Elasticsearch for full-text search
- PostgreSQL with complete data schema
- Docker Compose with all infrastructure

## Target Directories
```
services/notification-service/
services/search-service/
```

## Your Deliverables

### Part 1: Notification Service

#### Endpoints & WebSocket
```
# REST Endpoints
GET    /notifications              # List user notifications (paginated)
GET    /notifications/unread       # Unread count
PUT    /notifications/:id/read     # Mark as read
PUT    /notifications/read-all     # Mark all as read
DELETE /notifications/:id          # Delete notification
GET    /notifications/preferences  # Get notification preferences
PUT    /notifications/preferences  # Update preferences

# WebSocket
WS     /ws/notifications           # Real-time notification stream
```

#### Notification Types
```typescript
enum NotificationType {
  // Voting
  VOTE_REMINDER = 'vote_reminder',
  VOTE_RESULT = 'vote_result',
  DELEGATION_RECEIVED = 'delegation_received',
  DELEGATION_USED = 'delegation_used',

  // Bills
  BILL_STATUS_CHANGE = 'bill_status_change',
  BILL_APPROACHING_VOTE = 'bill_approaching_vote',
  BILL_PASSED = 'bill_passed',
  BILL_FAILED = 'bill_failed',
  BILL_SUNSET_WARNING = 'bill_sunset_warning',

  // Constitutional
  COMPLIANCE_ISSUE = 'compliance_issue',
  AMENDMENT_PROPOSED = 'amendment_proposed',

  // System
  ACCOUNT_SECURITY = 'account_security',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}
```

#### File Structure
```
services/notification-service/
├── src/
│   ├── index.ts                   # Entry point
│   ├── app.ts                     # Fastify + WebSocket setup
│   ├── routes/
│   │   ├── notifications.ts       # REST endpoints
│   │   └── preferences.ts         # User preferences
│   ├── websocket/
│   │   ├── server.ts              # WebSocket server
│   │   ├── handlers.ts            # Message handlers
│   │   ├── rooms.ts               # Room management (user channels)
│   │   └── auth.ts                # WebSocket authentication
│   ├── channels/
│   │   ├── in-app.ts              # In-app notification delivery
│   │   ├── email.ts               # Email notifications
│   │   └── push.ts                # Push notifications (future)
│   ├── templates/
│   │   ├── base.ts                # Base template
│   │   ├── vote-reminder.ts       # Vote reminder template
│   │   ├── bill-status.ts         # Bill status change
│   │   ├── delegation.ts          # Delegation notifications
│   │   └── welcome.ts             # Welcome email
│   ├── lib/
│   │   ├── redis-pubsub.ts        # Redis pub/sub for scaling
│   │   ├── queue.ts               # Notification queue (Bull)
│   │   └── prisma.ts              # Database client
│   ├── workers/
│   │   └── notification-worker.ts # Background job processor
│   ├── schemas/
│   │   └── notification.schema.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── notifications.test.ts
│   ├── websocket.test.ts
│   └── channels.test.ts
├── package.json
└── tsconfig.json
```

#### WebSocket Protocol
```typescript
// Client -> Server Messages
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ack';
  channel?: string;        // e.g., 'bills', 'votes', 'region:123'
  notificationId?: string; // For acknowledgment
}

// Server -> Client Messages
interface ServerMessage {
  type: 'notification' | 'connected' | 'error';
  notification?: Notification;
  error?: string;
}

// Notification payload
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
}
```

### Part 2: Search Service

#### Endpoints
```
GET    /search                     # Global search
GET    /search/bills               # Search bills only
GET    /search/persons             # Search persons only
GET    /search/organizations       # Search organizations only
GET    /search/suggest             # Autocomplete suggestions
POST   /search/reindex             # Trigger reindex (admin only)
```

#### File Structure
```
services/search-service/
├── src/
│   ├── index.ts                   # Entry point
│   ├── app.ts                     # Fastify configuration
│   ├── routes/
│   │   ├── search.ts              # Main search endpoints
│   │   └── suggest.ts             # Autocomplete
│   ├── indexers/
│   │   ├── base-indexer.ts        # Base indexer class
│   │   ├── bill-indexer.ts        # Bill document indexing
│   │   ├── person-indexer.ts      # Person indexing
│   │   ├── org-indexer.ts         # Organization indexing
│   │   └── sync.ts                # Database sync logic
│   ├── lib/
│   │   ├── elasticsearch.ts       # ES client configuration
│   │   ├── analyzers.ts           # Custom text analyzers
│   │   ├── mappings.ts            # Index mappings
│   │   └── prisma.ts              # Database client
│   ├── schemas/
│   │   └── search.schema.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── search.test.ts
│   └── indexers.test.ts
├── package.json
└── tsconfig.json
```

#### Elasticsearch Indices

```typescript
// Bill Index
const billMapping = {
  properties: {
    id: { type: 'keyword' },
    title: {
      type: 'text',
      analyzer: 'legislation_analyzer',
      fields: {
        keyword: { type: 'keyword' },
        suggest: { type: 'completion' }
      }
    },
    content: { type: 'text', analyzer: 'legislation_analyzer' },
    summary: { type: 'text' },
    status: { type: 'keyword' },
    category: { type: 'keyword' },
    tags: { type: 'keyword' },
    sponsor: {
      type: 'object',
      properties: {
        id: { type: 'keyword' },
        name: { type: 'text' }
      }
    },
    region: { type: 'keyword' },
    createdAt: { type: 'date' },
    votingEndsAt: { type: 'date' },
    sunsetDate: { type: 'date' },
    tblScore: {
      type: 'object',
      properties: {
        people: { type: 'float' },
        planet: { type: 'float' },
        profit: { type: 'float' }
      }
    }
  }
};

// Person Index
const personMapping = {
  properties: {
    id: { type: 'keyword' },
    name: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
        suggest: { type: 'completion' }
      }
    },
    region: { type: 'keyword' },
    roles: { type: 'keyword' },
    affiliations: { type: 'keyword' }
  }
};

// Organization Index
const orgMapping = {
  properties: {
    id: { type: 'keyword' },
    name: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
        suggest: { type: 'completion' }
      }
    },
    type: { type: 'keyword' },
    industry: { type: 'keyword' },
    region: { type: 'keyword' },
    transparencyScore: { type: 'float' }
  }
};
```

#### Custom Analyzer for Legal Text
```typescript
const legislationAnalyzer = {
  analyzer: {
    legislation_analyzer: {
      type: 'custom',
      tokenizer: 'standard',
      filter: [
        'lowercase',
        'legal_synonyms',
        'english_stemmer',
        'trim'
      ]
    }
  },
  filter: {
    legal_synonyms: {
      type: 'synonym',
      synonyms: [
        'law, legislation, statute, act',
        'vote, ballot, poll',
        'citizen, person, individual',
        'region, district, area, zone'
      ]
    }
  }
};
```

### Technical Requirements

#### Redis Pub/Sub for Scaling
```typescript
// Publish notification to all service instances
async function publishNotification(userId: string, notification: Notification) {
  await redis.publish(`notifications:${userId}`, JSON.stringify(notification));
}

// Subscribe to notifications for connected users
async function subscribeToUserNotifications(userId: string, callback: Function) {
  const subscriber = redis.duplicate();
  await subscriber.subscribe(`notifications:${userId}`, callback);
}
```

#### Bull Queue for Background Processing
```typescript
// Queue email notifications for async processing
const emailQueue = new Bull('email-notifications', {
  redis: process.env.REDIS_URL
});

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Files | 25-30 |
| Lines of Code | 2,500-3,000 |
| Endpoints | 12-15 |
| Test Coverage | 75% |

## Success Criteria

### Notification Service
1. [ ] WebSocket server accepting connections
2. [ ] Real-time notification delivery
3. [ ] Redis pub/sub for horizontal scaling
4. [ ] Email sending integration (SendGrid/SES stub)
5. [ ] Notification preferences respected
6. [ ] Background queue processing

### Search Service
1. [ ] Elasticsearch client connected
2. [ ] Bill search with full-text and filters
3. [ ] Person/Organization search
4. [ ] Autocomplete/suggest working
5. [ ] Initial index population from database
6. [ ] Incremental sync logic

## Integration Notes

- Frontend apps will connect via WebSocket for real-time updates
- API Gateway may call notification service to trigger notifications
- Search service reads from Elasticsearch, synced from PostgreSQL
- Both services should handle graceful shutdown

---

*Agent_8 Assignment - Notification & Search Services*
