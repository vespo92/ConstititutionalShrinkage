# Agent_O: Offline-First Progressive Web App

## Mission
Build comprehensive offline-first capabilities as a Progressive Web App including service workers, local data synchronization, offline form submission, background sync, push notifications, and installable app experiences to ensure citizens can access government services regardless of connectivity.

## Branch
```
claude/agent-O-offline-pwa-{session-id}
```

## Priority: HIGH

## Context
Not all citizens have reliable internet access:
- Rural areas with limited connectivity
- Emergency situations when networks are down
- Mobile users with intermittent connections
- Reducing data costs for low-income users
- Ensuring equal access to government services
- Native app-like experience without app stores
- Background updates and notifications

## Target Directories
```
packages/pwa/
packages/offline-sync/
apps/citizen-portal/src/pwa/
infrastructure/cdn/pwa/
```

## Dependencies
- Agent_A: Mobile Apps (shared components)
- Agent_K: Performance (caching strategies)
- Agent_8: Notifications (push integration)

## Your Deliverables

### 1. PWA Package

```
packages/pwa/
├── src/
│   ├── service-worker/
│   │   ├── sw.ts                  # Main service worker
│   │   ├── cache-strategies.ts    # Caching strategies
│   │   ├── routes.ts              # Route handlers
│   │   ├── push-handler.ts        # Push notifications
│   │   └── sync-handler.ts        # Background sync
│   ├── workbox/
│   │   ├── config.ts              # Workbox configuration
│   │   ├── precache.ts            # Precaching setup
│   │   └── runtime-caching.ts     # Runtime caching rules
│   ├── install/
│   │   ├── install-prompt.tsx     # Install UI
│   │   ├── update-prompt.tsx      # Update notification
│   │   └── hooks.ts               # PWA hooks
│   ├── manifest/
│   │   ├── generator.ts           # Dynamic manifest
│   │   └── icons.ts               # Icon generation
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Offline Sync Package

```
packages/offline-sync/
├── src/
│   ├── storage/
│   │   ├── indexed-db.ts          # IndexedDB wrapper
│   │   ├── cache-api.ts           # Cache API wrapper
│   │   ├── storage-manager.ts     # Storage orchestration
│   │   └── quota-manager.ts       # Storage quota
│   ├── sync/
│   │   ├── sync-manager.ts        # Sync coordination
│   │   ├── conflict-resolver.ts   # Conflict handling
│   │   ├── queue-manager.ts       # Operation queue
│   │   └── delta-sync.ts          # Delta synchronization
│   ├── forms/
│   │   ├── offline-form.ts        # Offline form handling
│   │   ├── form-storage.ts        # Form data persistence
│   │   └── submission-queue.ts    # Queued submissions
│   ├── data/
│   │   ├── local-first.ts         # Local-first data
│   │   ├── replica.ts             # Local replica
│   │   └── merge.ts               # CRDT merge
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Citizen Portal PWA Integration

```
apps/citizen-portal/src/pwa/
├── service-worker/
│   ├── sw.ts                      # App-specific SW
│   ├── app-cache.ts               # App shell caching
│   ├── data-cache.ts              # Data caching
│   └── offline-pages.ts           # Offline page handlers
├── components/
│   ├── InstallBanner.tsx          # Install prompt banner
│   ├── OfflineIndicator.tsx       # Connection status
│   ├── SyncStatus.tsx             # Sync progress
│   ├── UpdateAvailable.tsx        # Update notification
│   └── OfflineMessage.tsx         # Offline fallback
├── hooks/
│   ├── useOffline.ts              # Offline detection
│   ├── usePWAInstall.ts           # Install prompt
│   ├── useBackgroundSync.ts       # Background sync
│   └── usePushNotifications.ts    # Push notifications
├── contexts/
│   ├── OfflineContext.tsx         # Offline state
│   └── SyncContext.tsx            # Sync state
├── utils/
│   ├── register-sw.ts             # SW registration
│   └── storage-utils.ts           # Storage helpers
└── offline-pages/
    ├── offline.tsx                # Main offline page
    ├── offline-bills.tsx          # Cached bills
    ├── offline-profile.tsx        # Cached profile
    └── offline-forms.tsx          # Saved forms
```

### 4. PWA Infrastructure

```
infrastructure/cdn/pwa/
├── cloudflare/
│   ├── pwa-headers.json           # Cache headers
│   ├── service-worker-scope.json  # SW scope rules
│   └── manifest-caching.json      # Manifest caching
├── scripts/
│   ├── generate-sw.sh             # SW build script
│   ├── precache-manifest.sh       # Precache generation
│   └── lighthouse-audit.sh        # PWA audit
└── monitoring/
    ├── pwa-metrics.yaml           # PWA-specific metrics
    └── offline-analytics.yaml     # Offline usage tracking
```

### 5. Service Worker Implementation

```typescript
// Main service worker with Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate
} from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Service Worker strategies
interface CacheConfig {
  strategies: {
    // Static assets - Cache First
    staticAssets: {
      strategy: 'CacheFirst';
      maxEntries: 100;
      maxAge: 30 * 24 * 60 * 60;    // 30 days
      match: /\.(js|css|woff2?|png|jpg|svg)$/;
    };

    // API data - Network First with offline fallback
    apiData: {
      strategy: 'NetworkFirst';
      timeout: 3000;
      maxEntries: 50;
      maxAge: 24 * 60 * 60;         // 24 hours
      match: /\/api\//;
    };

    // HTML pages - Stale While Revalidate
    pages: {
      strategy: 'StaleWhileRevalidate';
      maxEntries: 50;
      maxAge: 7 * 24 * 60 * 60;     // 7 days
      match: /\.html$/;
    };

    // User-specific data - Network Only with queue
    userData: {
      strategy: 'NetworkOnly';
      backgroundSync: true;
      match: /\/api\/user\//;
    };
  };
}

// Background sync for offline actions
interface BackgroundSyncConfig {
  queues: {
    forms: {
      name: 'form-submissions';
      maxRetentionTime: 24 * 60;    // 24 hours
      onSync: (queue: Queue) => Promise<void>;
    };
    votes: {
      name: 'vote-submissions';
      maxRetentionTime: 7 * 24 * 60; // 7 days
      onSync: (queue: Queue) => Promise<void>;
    };
    feedback: {
      name: 'feedback-submissions';
      maxRetentionTime: 24 * 60;
      onSync: (queue: Queue) => Promise<void>;
    };
  };
}

// Register routes with strategies
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// API with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  })
);
```

### 6. IndexedDB Data Storage

```typescript
// Local-first data storage
interface OfflineStorage {
  // Database management
  initDatabase(): Promise<IDBDatabase>;

  // CRUD operations
  put<T>(store: string, data: T): Promise<void>;
  get<T>(store: string, key: string): Promise<T | undefined>;
  getAll<T>(store: string, query?: IDBKeyRange): Promise<T[]>;
  delete(store: string, key: string): Promise<void>;

  // Sync tracking
  markForSync(store: string, key: string): Promise<void>;
  getPendingSync(store: string): Promise<SyncItem[]>;
  clearSyncFlag(store: string, key: string): Promise<void>;

  // Storage management
  getStorageEstimate(): Promise<StorageEstimate>;
  clearOldData(maxAge: number): Promise<number>;
}

// Database schema
interface OfflineDBSchema {
  stores: {
    bills: {
      keyPath: 'id';
      indexes: ['status', 'updatedAt', 'syncStatus'];
    };
    votes: {
      keyPath: 'id';
      indexes: ['billId', 'timestamp', 'syncStatus'];
    };
    profile: {
      keyPath: 'id';
      indexes: ['syncStatus'];
    };
    formDrafts: {
      keyPath: 'id';
      indexes: ['type', 'savedAt', 'syncStatus'];
    };
    notifications: {
      keyPath: 'id';
      indexes: ['read', 'timestamp'];
    };
    syncQueue: {
      keyPath: 'id';
      indexes: ['type', 'priority', 'createdAt'];
    };
  };
}

// Sync status tracking
type SyncStatus =
  | 'synced'           // Up to date with server
  | 'pending'          // Changes waiting to sync
  | 'syncing'          // Currently syncing
  | 'conflict'         // Conflict needs resolution
  | 'error';           // Sync failed

interface SyncItem {
  id: string;
  store: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  status: SyncStatus;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}
```

### 7. Offline Form Handling

```typescript
// Offline form submission system
interface OfflineFormHandler {
  // Form state management
  saveFormDraft(params: {
    formId: string;
    formType: string;
    data: Record<string, unknown>;
  }): Promise<FormDraft>;

  getFormDraft(formId: string): Promise<FormDraft | null>;
  deleteFormDraft(formId: string): Promise<void>;

  // Submission handling
  submitForm(params: {
    formId: string;
    endpoint: string;
    data: Record<string, unknown>;
  }): Promise<SubmissionResult>;

  // Queue management
  getSubmissionQueue(): Promise<QueuedSubmission[]>;
  retrySubmission(submissionId: string): Promise<SubmissionResult>;
  cancelSubmission(submissionId: string): Promise<void>;
}

interface FormDraft {
  id: string;
  formType: string;
  data: Record<string, unknown>;
  savedAt: Date;
  expiresAt: Date;
  version: number;
}

interface QueuedSubmission {
  id: string;
  formId: string;
  endpoint: string;
  data: Record<string, unknown>;
  status: 'queued' | 'processing' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

interface SubmissionResult {
  success: boolean;
  queued: boolean;
  submissionId: string;
  message: string;
  syncedAt?: Date;
}

// Form types that support offline
const offlineEnabledForms = [
  'petition-signature',
  'public-comment',
  'feedback',
  'contact-representative',
  'profile-update',
  'notification-preferences',
];
```

### 8. Background Sync

```typescript
// Background sync for deferred operations
interface BackgroundSyncManager {
  // Register sync
  register(tag: string, options?: SyncOptions): Promise<void>;

  // Check registration
  isRegistered(tag: string): Promise<boolean>;

  // Handle sync event
  onSync(tag: string, callback: SyncCallback): void;

  // Periodic sync
  registerPeriodicSync(tag: string, params: {
    minInterval: number;           // milliseconds
  }): Promise<void>;
}

interface SyncOptions {
  priority?: 'high' | 'normal' | 'low';
  minDelay?: number;
  maxDelay?: number;
}

type SyncCallback = (event: SyncEvent) => Promise<void>;

// Sync event handlers
const syncHandlers: Record<string, SyncCallback> = {
  'form-sync': async (event) => {
    const queue = await getSubmissionQueue();
    for (const item of queue) {
      try {
        await submitToServer(item);
        await removeFromQueue(item.id);
      } catch (error) {
        await incrementAttempts(item.id);
      }
    }
  },

  'vote-sync': async (event) => {
    const pendingVotes = await getPendingVotes();
    for (const vote of pendingVotes) {
      try {
        await submitVote(vote);
        await clearVoteFromQueue(vote.id);
      } catch (error) {
        // Critical - keep retrying
        console.error('Vote sync failed:', error);
      }
    }
  },

  'data-refresh': async (event) => {
    // Refresh cached data
    const staleData = await getStaleData();
    for (const item of staleData) {
      try {
        const fresh = await fetchFromServer(item.url);
        await updateCache(item.key, fresh);
      } catch (error) {
        // Non-critical, will retry
      }
    }
  },
};

// Periodic sync for content updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(refreshContent());
  }
});
```

### 9. Push Notifications

```typescript
// Push notification handling
interface PushNotificationManager {
  // Permission
  requestPermission(): Promise<NotificationPermission>;
  getPermissionStatus(): NotificationPermission;

  // Subscription
  subscribe(options: PushSubscriptionOptions): Promise<PushSubscription>;
  unsubscribe(): Promise<void>;
  getSubscription(): Promise<PushSubscription | null>;

  // Server registration
  registerWithServer(subscription: PushSubscription): Promise<void>;

  // Local notifications
  showNotification(title: string, options: NotificationOptions): Promise<void>;
}

interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string;
}

// Notification types
type NotificationType =
  | 'bill_update'
  | 'vote_reminder'
  | 'petition_milestone'
  | 'comment_reply'
  | 'emergency_alert'
  | 'session_reminder';

interface PushPayload {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data: {
    url: string;
    id: string;
    [key: string]: unknown;
  };
  actions?: NotificationAction[];
}

// Push event handler
self.addEventListener('push', (event) => {
  const payload: PushPayload = event.data?.json();

  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icons/notification-icon.png',
    badge: payload.badge || '/icons/badge.png',
    data: payload.data,
    actions: payload.actions,
    tag: payload.data.id,
    renotify: true,
    requireInteraction: payload.type === 'emergency_alert',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window or open new
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
```

### 10. Install Experience

```typescript
// PWA installation management
interface PWAInstallManager {
  // Check installability
  isInstallable(): boolean;
  isInstalled(): boolean;
  getInstallState(): InstallState;

  // Prompt management
  deferPrompt(): void;
  showInstallPrompt(): Promise<InstallResult>;

  // Events
  onInstallPrompt(callback: (event: BeforeInstallPromptEvent) => void): void;
  onInstalled(callback: () => void): void;
}

type InstallState =
  | 'not-installable'
  | 'installable'
  | 'installed'
  | 'standalone';

interface InstallResult {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

// React hook for install
function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return { outcome: 'dismissed' };

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }

    return result;
  };

  return {
    isInstallable: !!installPrompt,
    isInstalled,
    install,
  };
}
```

## Web App Manifest

```json
{
  "name": "Constitutional Governance Platform",
  "short_name": "GovPlatform",
  "description": "Participate in democratic governance",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a365d",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Vote Now",
      "url": "/vote",
      "icons": [{ "src": "/icons/vote.png", "sizes": "96x96" }]
    },
    {
      "name": "My Bills",
      "url": "/bills/following",
      "icons": [{ "src": "/icons/bills.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["government", "social"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Lighthouse PWA Score | 100 |
| Offline Page Load | <1s |
| Install Rate | >10% |
| Background Sync Success | >99% |
| Push Notification Delivery | >95% |
| Cache Hit Ratio | >80% |

## Success Criteria

1. [ ] Service worker registered and active
2. [ ] App shell cached for offline
3. [ ] API data cached with fallback
4. [ ] IndexedDB storage operational
5. [ ] Form drafts persisting offline
6. [ ] Background sync working
7. [ ] Push notifications functional
8. [ ] Install prompt showing
9. [ ] Standalone mode working
10. [ ] Offline indicator showing
11. [ ] Sync status displaying
12. [ ] Lighthouse PWA audit passing

## Handoff Notes

For downstream agents:
- PWA package exported for all apps
- Offline sync available for Agent_A (Mobile)
- Push notification hooks for Agent_8 (Notifications)
- Caching strategies documented for Agent_K (Performance)

---

*Agent_O Assignment - Offline-First Progressive Web App*
