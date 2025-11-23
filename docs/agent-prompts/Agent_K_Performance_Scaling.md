# Agent_K: Performance & Scaling Infrastructure

## Mission
Build comprehensive performance optimization and scaling infrastructure including distributed caching, CDN integration, database optimization, load balancing, auto-scaling policies, and performance monitoring to ensure the platform can handle millions of concurrent users during high-traffic events like elections.

## Branch
```
claude/agent-K-performance-scaling-{session-id}
```

## Priority: CRITICAL

## Context
Government platforms must handle extreme traffic spikes:
- Election day voting surges (100x normal traffic)
- Major legislative votes drawing public attention
- Emergency announcements requiring instant delivery
- Millions of citizens accessing services simultaneously
- Zero tolerance for downtime during critical events
- Sub-second response times for all operations
- Global CDN for distributed access

## Target Directories
```
services/performance-service/
packages/caching/
infrastructure/scaling/
infrastructure/cdn/
```

## Dependencies
- Agent_6: API Gateway (for integration)
- Agent_14: DevOps (Kubernetes base)
- Agent_H: Security (for secure caching)

## Your Deliverables

### 1. Performance Service

```
services/performance-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── health.ts              # Health checks
│   │   ├── metrics.ts             # Performance metrics
│   │   ├── cache.ts               # Cache management
│   │   └── scaling.ts             # Scaling controls
│   ├── services/
│   │   ├── caching/
│   │   │   ├── redis-cluster.ts
│   │   │   ├── cache-strategy.ts
│   │   │   ├── invalidation.ts
│   │   │   └── warm-cache.ts
│   │   ├── database/
│   │   │   ├── query-optimizer.ts
│   │   │   ├── connection-pool.ts
│   │   │   ├── read-replica.ts
│   │   │   └── sharding.ts
│   │   ├── cdn/
│   │   │   ├── cloudflare.ts
│   │   │   ├── edge-caching.ts
│   │   │   └── purge-manager.ts
│   │   └── monitoring/
│   │       ├── apm.ts
│   │       ├── profiler.ts
│   │       └── alerts.ts
│   ├── lib/
│   │   ├── metrics.ts
│   │   └── benchmarks.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Caching Package

```
packages/caching/
├── src/
│   ├── strategies/
│   │   ├── write-through.ts       # Write to cache + DB
│   │   ├── write-behind.ts        # Async DB writes
│   │   ├── read-through.ts        # Cache miss fills
│   │   └── cache-aside.ts         # Manual cache management
│   ├── layers/
│   │   ├── l1-memory.ts           # In-process cache
│   │   ├── l2-redis.ts            # Distributed Redis
│   │   └── l3-cdn.ts              # Edge caching
│   ├── invalidation/
│   │   ├── ttl.ts                 # Time-based expiry
│   │   ├── event-driven.ts        # Event-based invalidation
│   │   ├── tag-based.ts           # Tag-based purging
│   │   └── cascade.ts             # Cascading invalidation
│   ├── patterns/
│   │   ├── cache-stampede.ts      # Stampede prevention
│   │   ├── dog-pile.ts            # Dog-pile prevention
│   │   └── thundering-herd.ts     # Herd prevention
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Scaling Infrastructure

```
infrastructure/scaling/
├── kubernetes/
│   ├── hpa/
│   │   ├── api-gateway-hpa.yaml
│   │   ├── auth-service-hpa.yaml
│   │   └── custom-metrics-hpa.yaml
│   ├── vpa/
│   │   ├── vertical-pod-autoscaler.yaml
│   │   └── resource-recommendations.yaml
│   ├── cluster-autoscaler/
│   │   ├── cluster-autoscaler.yaml
│   │   └── node-pools.yaml
│   └── keda/
│       ├── keda-install.yaml
│       └── scaled-objects.yaml
├── load-balancing/
│   ├── nginx-ingress.yaml
│   ├── istio-gateway.yaml
│   ├── traffic-splitting.yaml
│   └── circuit-breaker.yaml
├── database/
│   ├── pgpool.yaml
│   ├── read-replicas.yaml
│   ├── connection-pooling.yaml
│   └── sharding-config.yaml
└── redis/
    ├── redis-cluster.yaml
    ├── sentinel.yaml
    └── redis-operator.yaml
```

### 4. CDN Configuration

```
infrastructure/cdn/
├── cloudflare/
│   ├── workers/
│   │   ├── cache-worker.js
│   │   ├── geo-routing.js
│   │   ├── rate-limiting.js
│   │   └── edge-compute.js
│   ├── page-rules.json
│   ├── cache-rules.json
│   └── firewall-rules.json
├── terraform/
│   ├── cloudflare.tf
│   ├── dns.tf
│   └── ssl.tf
└── scripts/
    ├── purge-cache.sh
    ├── warm-cache.sh
    └── failover.sh
```

### 5. Caching System

```typescript
// Multi-layer caching with intelligent invalidation
interface CachingSystem {
  // Get with fallback
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;

  // Set with strategy
  set<T>(key: string, value: T, options: CacheOptions): Promise<void>;

  // Cache-aside pattern
  getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T>;

  // Invalidation
  invalidate(pattern: string): Promise<number>;
  invalidateByTags(tags: string[]): Promise<number>;

  // Warm cache
  warmCache(keys: WarmCacheConfig[]): Promise<void>;
}

interface CacheOptions {
  ttl: number;                     // Seconds
  layer: 'l1' | 'l2' | 'l3' | 'all';
  tags?: string[];                 // For tag-based invalidation
  staleWhileRevalidate?: number;   // SWR pattern
  lockTimeout?: number;            // Stampede prevention
}

// Cache layers configuration
interface CacheConfig {
  l1: {
    type: 'lru';
    maxSize: 10000;                // Items
    maxMemory: '256MB';
  };
  l2: {
    type: 'redis-cluster';
    nodes: string[];
    maxMemory: '8GB';
    evictionPolicy: 'allkeys-lru';
  };
  l3: {
    type: 'cloudflare';
    ttl: 86400;                    // 24 hours
    bypassCookie: 'auth_token';
  };
}
```

### 6. Database Optimization

```typescript
// Database performance optimization
interface DatabaseOptimizer {
  // Query optimization
  analyzeQuery(sql: string): Promise<QueryAnalysis>;
  suggestIndexes(table: string): Promise<IndexSuggestion[]>;

  // Connection management
  configurePool(config: PoolConfig): void;
  getPoolStats(): PoolStatistics;

  // Read scaling
  configureReplicas(replicas: ReplicaConfig[]): void;
  routeQuery(query: string, type: 'read' | 'write'): Connection;

  // Sharding
  configureSharding(config: ShardConfig): void;
  getShardForKey(key: string): ShardInfo;
}

interface PoolConfig {
  min: number;
  max: number;
  acquireTimeout: number;
  idleTimeout: number;
  reapInterval: number;
  createRetryInterval: number;
  propagateCreateError: boolean;
}

interface ReplicaConfig {
  host: string;
  port: number;
  weight: number;                  // Load distribution
  maxLag: number;                  // Max replication lag (ms)
}

// Query analysis result
interface QueryAnalysis {
  estimatedCost: number;
  estimatedRows: number;
  usedIndexes: string[];
  recommendations: string[];
  executionPlan: ExecutionNode[];
}
```

### 7. Auto-Scaling Policies

```typescript
// Intelligent auto-scaling
interface AutoScaler {
  // Horizontal scaling
  configureHPA(config: HPAConfig): Promise<void>;

  // Vertical scaling
  configureVPA(config: VPAConfig): Promise<void>;

  // Predictive scaling
  enablePredictiveScaling(params: {
    lookAheadMinutes: number;
    minInstances: number;
    maxInstances: number;
    targetCPU: number;
  }): Promise<void>;

  // Event-based scaling
  scaleForEvent(event: ScalingEvent): Promise<void>;

  // Emergency scaling
  emergencyScale(params: EmergencyScaleParams): Promise<void>;
}

interface HPAConfig {
  minReplicas: number;
  maxReplicas: number;
  metrics: ScalingMetric[];
  behavior: {
    scaleUp: ScaleBehavior;
    scaleDown: ScaleBehavior;
  };
}

interface ScalingMetric {
  type: 'cpu' | 'memory' | 'custom';
  target: number;                  // Percentage or absolute
  metricName?: string;             // For custom metrics
}

// Pre-scheduled scaling for known events
interface ScalingEvent {
  name: string;                    // e.g., "Election Day"
  startTime: Date;
  endTime: Date;
  targetReplicas: {
    'api-gateway': number;
    'auth-service': number;
    'voting-service': number;
  };
  warmCache: boolean;
}
```

### 8. Performance Monitoring

```typescript
// APM and performance tracking
interface PerformanceMonitor {
  // Request tracing
  traceRequest(req: Request): Span;

  // Metrics collection
  recordMetric(metric: PerformanceMetric): void;

  // Profiling
  startCPUProfile(duration: number): Promise<CPUProfile>;
  takeHeapSnapshot(): Promise<HeapSnapshot>;

  // Alerts
  configureAlert(alert: AlertConfig): void;

  // Reports
  generateReport(params: ReportParams): Promise<PerformanceReport>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

// SLA tracking
interface SLATracker {
  availability: {
    target: 99.99;                 // Four nines
    current: number;
    incidents: Incident[];
  };
  latency: {
    p50Target: 100;               // ms
    p95Target: 500;
    p99Target: 1000;
    current: LatencyStats;
  };
  errorRate: {
    target: 0.1;                  // 0.1%
    current: number;
  };
}

interface AlertConfig {
  name: string;
  condition: string;              // PromQL or similar
  threshold: number;
  duration: string;               // e.g., "5m"
  severity: 'critical' | 'warning' | 'info';
  channels: ('slack' | 'pagerduty' | 'email')[];
}
```

### 9. Load Testing Suite

```typescript
// Load testing for capacity planning
interface LoadTester {
  // Define scenarios
  defineScenario(scenario: LoadScenario): void;

  // Run tests
  runTest(config: LoadTestConfig): Promise<LoadTestResult>;

  // Analyze results
  analyzeResults(results: LoadTestResult): CapacityAnalysis;

  // Regression testing
  compareWithBaseline(
    current: LoadTestResult,
    baseline: LoadTestResult
  ): RegressionReport;
}

interface LoadScenario {
  name: string;
  steps: LoadStep[];
  thinkTime: number;              // ms between actions
  rampUp: number;                 // seconds
  duration: number;               // seconds
  virtualUsers: number;
}

interface LoadTestConfig {
  scenarios: string[];
  targetRPS: number;
  maxUsers: number;
  duration: number;
  regions: string[];              // Distributed load
}

// Election day simulation
const electionDayScenario: LoadScenario = {
  name: 'Election Day Peak',
  steps: [
    { action: 'login', weight: 10 },
    { action: 'viewBallot', weight: 30 },
    { action: 'castVote', weight: 40 },
    { action: 'viewResults', weight: 20 },
  ],
  thinkTime: 5000,
  rampUp: 300,
  duration: 3600,
  virtualUsers: 100000,
};
```

## API Endpoints

```yaml
Health & Metrics:
  GET    /performance/health              # System health
  GET    /performance/metrics             # Prometheus metrics
  GET    /performance/stats               # Performance stats

Cache Management:
  GET    /performance/cache/stats         # Cache statistics
  POST   /performance/cache/invalidate    # Invalidate cache
  POST   /performance/cache/warm          # Warm cache
  DELETE /performance/cache/:pattern      # Purge by pattern

Scaling:
  GET    /performance/scaling/status      # Current scale
  POST   /performance/scaling/event       # Schedule scaling event
  POST   /performance/scaling/emergency   # Emergency scale

Monitoring:
  GET    /performance/apm/traces          # Request traces
  GET    /performance/apm/slow-queries    # Slow queries
  POST   /performance/apm/profile         # Start profiling
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Response Time P50 | <100ms |
| Response Time P99 | <1000ms |
| Availability | 99.99% |
| Cache Hit Ratio | >90% |
| Throughput | 100k RPS |
| Auto-scale Time | <60s |

## Success Criteria

1. [ ] Multi-layer caching operational
2. [ ] Redis cluster deployed and healthy
3. [ ] CDN edge caching configured
4. [ ] Database read replicas working
5. [ ] Connection pooling optimized
6. [ ] HPA policies active
7. [ ] Predictive scaling enabled
8. [ ] Load testing passing 100k RPS
9. [ ] P99 latency under 1 second
10. [ ] Cache invalidation working
11. [ ] Performance dashboards live
12. [ ] Alerting configured

## Handoff Notes

For downstream agents:
- Cache keys documented in packages/caching/README.md
- Scaling events API available for Agent_M (Emergency)
- Performance metrics exported for Agent_D (Analytics)
- Load test scenarios shareable

---

*Agent_K Assignment - Performance & Scaling Infrastructure*
