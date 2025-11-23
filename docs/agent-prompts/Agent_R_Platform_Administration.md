# Agent_R: Platform Administration & Operations

## Mission
Build comprehensive platform administration infrastructure including admin dashboards, system configuration, user management, content moderation tools, feature flags, system monitoring, operational tooling, and maintenance utilities to enable efficient platform operation and governance.

## Branch
```
claude/agent-R-platform-administration-{session-id}
```

## Priority: HIGH

## Context
Platform operations require robust admin tools:
- Centralized system administration
- User and role management
- Content moderation at scale
- Feature flag management
- System health monitoring
- Configuration management
- Operational runbooks

## Target Directories
```
services/admin-service/
apps/admin-dashboard/
packages/admin-tools/
infrastructure/operations/
```

## Dependencies
- Agent_7: Auth Service (admin authentication)
- Agent_L: Audit (admin action logging)
- Agent_K: Performance (monitoring integration)

## Your Deliverables

### 1. Admin Service

```
services/admin-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── users.ts               # User management
│   │   ├── roles.ts               # Role management
│   │   ├── config.ts              # System configuration
│   │   ├── features.ts            # Feature flags
│   │   ├── moderation.ts          # Content moderation
│   │   ├── system.ts              # System operations
│   │   └── reports.ts             # Admin reports
│   ├── services/
│   │   ├── users/
│   │   │   ├── user-manager.ts
│   │   │   ├── bulk-operations.ts
│   │   │   ├── impersonation.ts
│   │   │   └── access-control.ts
│   │   ├── roles/
│   │   │   ├── role-manager.ts
│   │   │   ├── permission-engine.ts
│   │   │   └── hierarchy.ts
│   │   ├── config/
│   │   │   ├── config-manager.ts
│   │   │   ├── secrets-manager.ts
│   │   │   └── environment.ts
│   │   ├── features/
│   │   │   ├── feature-flag.ts
│   │   │   ├── rollout.ts
│   │   │   └── experiments.ts
│   │   ├── moderation/
│   │   │   ├── content-queue.ts
│   │   │   ├── auto-mod.ts
│   │   │   ├── appeals.ts
│   │   │   └── sanctions.ts
│   │   └── system/
│   │       ├── health-checker.ts
│   │       ├── maintenance.ts
│   │       └── jobs.ts
│   ├── lib/
│   │   ├── rbac.ts
│   │   └── audit.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Admin Dashboard

```
apps/admin-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Admin home
│   │   ├── users/
│   │   │   ├── page.tsx                # User list
│   │   │   ├── [id]/page.tsx           # User detail
│   │   │   ├── new/page.tsx            # Create user
│   │   │   ├── bulk/page.tsx           # Bulk operations
│   │   │   └── search/page.tsx         # Advanced search
│   │   ├── roles/
│   │   │   ├── page.tsx                # Role list
│   │   │   ├── [id]/page.tsx           # Role detail
│   │   │   ├── new/page.tsx            # Create role
│   │   │   └── permissions/page.tsx    # Permission matrix
│   │   ├── moderation/
│   │   │   ├── page.tsx                # Moderation queue
│   │   │   ├── content/page.tsx        # Content review
│   │   │   ├── appeals/page.tsx        # User appeals
│   │   │   ├── reports/page.tsx        # User reports
│   │   │   └── actions/page.tsx        # Mod actions
│   │   ├── config/
│   │   │   ├── page.tsx                # Configuration
│   │   │   ├── system/page.tsx         # System config
│   │   │   ├── features/page.tsx       # Feature flags
│   │   │   └── secrets/page.tsx        # Secret management
│   │   ├── system/
│   │   │   ├── page.tsx                # System status
│   │   │   ├── health/page.tsx         # Health checks
│   │   │   ├── jobs/page.tsx           # Background jobs
│   │   │   ├── maintenance/page.tsx    # Maintenance mode
│   │   │   └── logs/page.tsx           # System logs
│   │   ├── reports/
│   │   │   ├── page.tsx                # Reports dashboard
│   │   │   ├── usage/page.tsx          # Usage reports
│   │   │   ├── audit/page.tsx          # Audit reports
│   │   │   └── export/page.tsx         # Data exports
│   │   └── settings/
│   │       ├── page.tsx                # Admin settings
│   │       └── team/page.tsx           # Admin team
│   ├── components/
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── BulkActions.tsx
│   │   │   └── ImpersonateButton.tsx
│   │   ├── roles/
│   │   │   ├── RoleList.tsx
│   │   │   ├── RoleForm.tsx
│   │   │   ├── PermissionTree.tsx
│   │   │   └── AssignmentModal.tsx
│   │   ├── moderation/
│   │   │   ├── ModerationQueue.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   ├── ActionPanel.tsx
│   │   │   ├── AppealReview.tsx
│   │   │   └── ReportDetails.tsx
│   │   ├── config/
│   │   │   ├── ConfigEditor.tsx
│   │   │   ├── FeatureFlagList.tsx
│   │   │   ├── FeatureFlagForm.tsx
│   │   │   └── SecretManager.tsx
│   │   ├── system/
│   │   │   ├── HealthDashboard.tsx
│   │   │   ├── ServiceStatus.tsx
│   │   │   ├── JobList.tsx
│   │   │   ├── LogViewer.tsx
│   │   │   └── MaintenanceToggle.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── Filters.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── AuditBadge.tsx
│   ├── hooks/
│   │   ├── useUsers.ts
│   │   ├── useRoles.ts
│   │   ├── useModeration.ts
│   │   ├── useConfig.ts
│   │   └── useSystem.ts
│   └── lib/
│       └── api.ts
├── package.json
└── tsconfig.json
```

### 3. Admin Tools Package

```
packages/admin-tools/
├── src/
│   ├── rbac/
│   │   ├── permission-checker.ts
│   │   ├── role-hierarchy.ts
│   │   ├── policy-engine.ts
│   │   └── context.ts
│   ├── features/
│   │   ├── feature-client.ts
│   │   ├── evaluation.ts
│   │   └── targeting.ts
│   ├── moderation/
│   │   ├── content-classifier.ts
│   │   ├── toxicity-scorer.ts
│   │   └── auto-actions.ts
│   ├── audit/
│   │   ├── admin-logger.ts
│   │   ├── change-tracker.ts
│   │   └── export.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Operations Infrastructure

```
infrastructure/operations/
├── runbooks/
│   ├── incident-response.md
│   ├── deployment.md
│   ├── rollback.md
│   ├── database-maintenance.md
│   ├── scaling.md
│   └── security-incident.md
├── scripts/
│   ├── maintenance/
│   │   ├── enable-maintenance.sh
│   │   ├── disable-maintenance.sh
│   │   ├── db-vacuum.sh
│   │   └── cache-clear.sh
│   ├── users/
│   │   ├── bulk-import.sh
│   │   ├── export-users.sh
│   │   └── cleanup-inactive.sh
│   └── data/
│       ├── backup-manual.sh
│       ├── restore.sh
│       └── export-audit.sh
├── dashboards/
│   ├── grafana/
│   │   ├── admin-operations.json
│   │   ├── user-metrics.json
│   │   └── moderation-stats.json
│   └── datadog/
│       └── admin-dashboard.json
└── alerts/
    ├── admin-alerts.yaml
    ├── moderation-alerts.yaml
    └── security-alerts.yaml
```

### 5. User Management System

```typescript
// Comprehensive user administration
interface UserManagement {
  // CRUD operations
  createUser(params: CreateUserParams): Promise<User>;
  getUser(userId: string): Promise<User>;
  updateUser(userId: string, params: UpdateUserParams): Promise<User>;
  deleteUser(userId: string, params: DeletionParams): Promise<void>;

  // Search and list
  searchUsers(params: UserSearchParams): Promise<PaginatedUsers>;
  listUsers(params: ListParams): Promise<PaginatedUsers>;

  // Bulk operations
  bulkCreate(users: CreateUserParams[]): Promise<BulkResult>;
  bulkUpdate(updates: BulkUpdateParams[]): Promise<BulkResult>;
  bulkDelete(userIds: string[], params: DeletionParams): Promise<BulkResult>;

  // Status management
  suspendUser(userId: string, params: SuspensionParams): Promise<void>;
  reactivateUser(userId: string): Promise<void>;
  lockUser(userId: string, reason: string): Promise<void>;
  unlockUser(userId: string): Promise<void>;

  // Impersonation
  impersonate(adminId: string, userId: string): Promise<ImpersonationSession>;
  endImpersonation(sessionId: string): Promise<void>;

  // Activity
  getUserActivity(userId: string, params: ActivityParams): Promise<Activity[]>;
  getUserSessions(userId: string): Promise<Session[]>;
  terminateSessions(userId: string): Promise<void>;
}

interface CreateUserParams {
  email: string;
  username?: string;
  password?: string;
  roles: string[];
  profile: UserProfile;
  sendInvite?: boolean;
  verifyEmail?: boolean;
}

interface UserSearchParams {
  query?: string;
  email?: string;
  username?: string;
  roles?: string[];
  status?: UserStatus[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastActiveAfter?: Date;
  region?: string;
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface SuspensionParams {
  reason: string;
  duration?: number;             // Hours, null = indefinite
  notifyUser: boolean;
  allowAppeal: boolean;
}

// Impersonation for support
interface ImpersonationSession {
  id: string;
  adminId: string;
  adminName: string;
  userId: string;
  userName: string;
  startedAt: Date;
  expiresAt: Date;
  reason: string;
  actions: ImpersonationAction[];
}
```

### 6. Role-Based Access Control

```typescript
// Comprehensive RBAC system
interface RBACSystem {
  // Role management
  createRole(params: CreateRoleParams): Promise<Role>;
  updateRole(roleId: string, params: UpdateRoleParams): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;
  listRoles(): Promise<Role[]>;

  // Permission management
  createPermission(params: CreatePermissionParams): Promise<Permission>;
  assignPermissions(roleId: string, permissionIds: string[]): Promise<void>;
  revokePermissions(roleId: string, permissionIds: string[]): Promise<void>;

  // User-role assignment
  assignRole(userId: string, roleId: string): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;

  // Authorization checks
  hasPermission(userId: string, permission: string, resource?: Resource): Promise<boolean>;
  getEffectivePermissions(userId: string): Promise<Permission[]>;

  // Role hierarchy
  setParentRole(roleId: string, parentRoleId: string): Promise<void>;
  getRoleHierarchy(): Promise<RoleHierarchy>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  parentId?: string;
  isSystem: boolean;              // Cannot be modified
  isDefault: boolean;             // Assigned to new users
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;                   // e.g., 'users:read'
  description: string;
  resource: string;               // e.g., 'users'
  action: string;                 // e.g., 'read'
  conditions?: Condition[];       // Contextual permissions
}

// Predefined admin roles
const adminRoles = {
  superAdmin: {
    name: 'Super Administrator',
    permissions: ['*'],           // All permissions
  },
  userAdmin: {
    name: 'User Administrator',
    permissions: [
      'users:read', 'users:create', 'users:update',
      'users:suspend', 'users:delete',
      'roles:read', 'roles:assign',
    ],
  },
  moderator: {
    name: 'Content Moderator',
    permissions: [
      'content:read', 'content:moderate',
      'reports:read', 'reports:resolve',
      'users:warn', 'users:mute',
    ],
  },
  auditor: {
    name: 'Auditor',
    permissions: [
      'audit:read', 'reports:read', 'users:read',
      'config:read', 'system:read',
    ],
  },
  support: {
    name: 'Support Staff',
    permissions: [
      'users:read', 'users:impersonate',
      'tickets:read', 'tickets:respond',
    ],
  },
};
```

### 7. Feature Flag System

```typescript
// Feature flag management
interface FeatureFlagSystem {
  // Flag management
  createFlag(params: CreateFlagParams): Promise<FeatureFlag>;
  updateFlag(flagId: string, params: UpdateFlagParams): Promise<FeatureFlag>;
  deleteFlag(flagId: string): Promise<void>;
  listFlags(params?: ListFlagsParams): Promise<FeatureFlag[]>;

  // Evaluation
  evaluate(flagKey: string, context: EvaluationContext): Promise<FlagValue>;
  evaluateAll(context: EvaluationContext): Promise<Record<string, FlagValue>>;

  // Targeting
  setTargeting(flagId: string, targeting: Targeting): Promise<void>;
  addUserToSegment(segmentId: string, userId: string): Promise<void>;

  // Rollout
  setRolloutPercentage(flagId: string, percentage: number): Promise<void>;
  scheduleRollout(flagId: string, schedule: RolloutSchedule): Promise<void>;

  // Experiments
  createExperiment(params: ExperimentParams): Promise<Experiment>;
  getExperimentResults(experimentId: string): Promise<ExperimentResults>;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  defaultValue: FlagValue;
  enabled: boolean;
  targeting: Targeting;
  rollout: RolloutConfig;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

type FlagType = 'boolean' | 'string' | 'number' | 'json';
type FlagValue = boolean | string | number | object;

interface Targeting {
  rules: TargetingRule[];
  segments: string[];
  users: string[];
  defaultVariation: string;
}

interface TargetingRule {
  id: string;
  conditions: Condition[];
  variation: string;
  priority: number;
}

interface Condition {
  attribute: string;
  operator: ConditionOperator;
  value: unknown;
}

type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'in'
  | 'notIn'
  | 'matches';                    // Regex

interface RolloutConfig {
  percentage: number;
  schedule?: RolloutSchedule;
  stickiness: 'userId' | 'sessionId' | 'random';
}

interface RolloutSchedule {
  stages: {
    percentage: number;
    startTime: Date;
  }[];
}
```

### 8. Content Moderation System

```typescript
// Scalable content moderation
interface ModerationSystem {
  // Queue management
  getQueue(params: QueueParams): Promise<ModerationQueue>;
  assignItem(itemId: string, moderatorId: string): Promise<void>;
  claimItem(itemId: string): Promise<ModerationItem>;

  // Actions
  approve(itemId: string): Promise<void>;
  reject(itemId: string, params: RejectionParams): Promise<void>;
  escalate(itemId: string, reason: string): Promise<void>;

  // User sanctions
  warnUser(userId: string, params: WarnParams): Promise<Warning>;
  muteUser(userId: string, params: MuteParams): Promise<Mute>;
  banUser(userId: string, params: BanParams): Promise<Ban>;

  // Appeals
  submitAppeal(sanctionId: string, params: AppealParams): Promise<Appeal>;
  reviewAppeal(appealId: string, decision: AppealDecision): Promise<void>;

  // Automation
  configureAutoMod(config: AutoModConfig): Promise<void>;
  trainClassifier(samples: TrainingSample[]): Promise<void>;
}

interface ModerationItem {
  id: string;
  type: ContentType;
  content: Content;
  author: UserSummary;
  reportCount: number;
  reports: Report[];
  autoModScore: number;
  autoModFlags: string[];
  status: ModerationStatus;
  assignedTo?: string;
  createdAt: Date;
  priority: number;
}

type ModerationStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'escalated';

interface Report {
  id: string;
  reporter: UserSummary;
  reason: ReportReason;
  details: string;
  createdAt: Date;
}

type ReportReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'hate_speech'
  | 'violence'
  | 'illegal'
  | 'inappropriate'
  | 'other';

interface AutoModConfig {
  enabled: boolean;
  rules: AutoModRule[];
  thresholds: {
    toxicity: number;
    spam: number;
    autoReject: number;
    autoApprove: number;
  };
  keywords: {
    blocked: string[];
    flagged: string[];
  };
}

interface AutoModRule {
  name: string;
  enabled: boolean;
  conditions: AutoModCondition[];
  action: 'flag' | 'reject' | 'approve' | 'shadow';
}
```

### 9. System Configuration

```typescript
// Dynamic system configuration
interface ConfigurationSystem {
  // Get/set configuration
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T, params?: SetParams): Promise<void>;
  delete(key: string): Promise<void>;

  // Bulk operations
  getAll(prefix?: string): Promise<Record<string, unknown>>;
  setMany(configs: Record<string, unknown>): Promise<void>;

  // History
  getHistory(key: string): Promise<ConfigHistory[]>;
  rollback(key: string, version: number): Promise<void>;

  // Validation
  validate(key: string, value: unknown): Promise<ValidationResult>;

  // Environment
  getEnvironmentConfig(): Promise<EnvironmentConfig>;
  setEnvironmentOverride(key: string, value: unknown, env: string): Promise<void>;
}

interface ConfigHistory {
  version: number;
  value: unknown;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

// Configuration categories
interface SystemConfig {
  // General
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };

  // Authentication
  auth: {
    sessionDuration: number;
    maxSessions: number;
    mfaRequired: boolean;
    passwordPolicy: PasswordPolicy;
  };

  // Rate limiting
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    bypassRoles: string[];
  };

  // Content
  content: {
    maxUploadSize: number;
    allowedFileTypes: string[];
    moderationEnabled: boolean;
  };

  // Notifications
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
}

// Secrets management
interface SecretsManager {
  // Get secrets (never returns raw value in logs)
  getSecret(key: string): Promise<string>;

  // Set secrets (encrypted at rest)
  setSecret(key: string, value: string, params?: SecretParams): Promise<void>;

  // Rotate secrets
  rotateSecret(key: string): Promise<void>;

  // Audit
  getSecretAccessLog(key: string): Promise<SecretAccessLog[]>;
}
```

### 10. System Operations

```typescript
// Platform operations management
interface SystemOperations {
  // Health checks
  getSystemHealth(): Promise<SystemHealth>;
  getServiceHealth(serviceName: string): Promise<ServiceHealth>;

  // Maintenance mode
  enableMaintenanceMode(params: MaintenanceParams): Promise<void>;
  disableMaintenanceMode(): Promise<void>;
  getMaintenanceStatus(): Promise<MaintenanceStatus>;

  // Background jobs
  listJobs(): Promise<Job[]>;
  getJob(jobId: string): Promise<JobDetail>;
  runJob(jobName: string, params?: JobParams): Promise<JobRun>;
  cancelJob(runId: string): Promise<void>;

  // Cache management
  clearCache(pattern?: string): Promise<ClearResult>;
  getCacheStats(): Promise<CacheStats>;

  // Database operations
  runMigration(migration: string): Promise<MigrationResult>;
  getDatabaseStats(): Promise<DatabaseStats>;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  uptime: number;
  version: string;
  lastDeployment: Date;
}

interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency: number;
  lastCheck: Date;
  details: Record<string, unknown>;
}

interface MaintenanceParams {
  message: string;
  estimatedDuration: number;      // minutes
  allowAdminAccess: boolean;
  scheduledStart?: Date;
}

interface Job {
  id: string;
  name: string;
  description: string;
  schedule?: string;              // Cron expression
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'failed';
  enabled: boolean;
}

// Scheduled jobs
const systemJobs = [
  {
    name: 'cleanup-sessions',
    schedule: '0 * * * *',        // Every hour
    description: 'Clean up expired sessions',
  },
  {
    name: 'send-notifications',
    schedule: '*/5 * * * *',      // Every 5 minutes
    description: 'Process notification queue',
  },
  {
    name: 'generate-reports',
    schedule: '0 0 * * *',        // Daily
    description: 'Generate daily reports',
  },
  {
    name: 'backup-database',
    schedule: '0 3 * * *',        // Daily at 3 AM
    description: 'Automated database backup',
  },
  {
    name: 'cleanup-old-data',
    schedule: '0 4 * * 0',        // Weekly on Sunday
    description: 'Archive and cleanup old data',
  },
];
```

## API Endpoints

```yaml
Users:
  GET    /admin/users                   # List users
  POST   /admin/users                   # Create user
  GET    /admin/users/:id               # Get user
  PUT    /admin/users/:id               # Update user
  DELETE /admin/users/:id               # Delete user
  POST   /admin/users/:id/suspend       # Suspend user
  POST   /admin/users/:id/impersonate   # Impersonate

Roles:
  GET    /admin/roles                   # List roles
  POST   /admin/roles                   # Create role
  GET    /admin/roles/:id               # Get role
  PUT    /admin/roles/:id               # Update role
  DELETE /admin/roles/:id               # Delete role
  POST   /admin/roles/:id/permissions   # Assign permissions

Feature Flags:
  GET    /admin/features                # List flags
  POST   /admin/features                # Create flag
  GET    /admin/features/:key           # Get flag
  PUT    /admin/features/:key           # Update flag
  DELETE /admin/features/:key           # Delete flag
  POST   /admin/features/:key/evaluate  # Evaluate flag

Moderation:
  GET    /admin/moderation/queue        # Get queue
  POST   /admin/moderation/:id/approve  # Approve
  POST   /admin/moderation/:id/reject   # Reject
  GET    /admin/moderation/appeals      # Get appeals
  POST   /admin/moderation/appeals/:id  # Review appeal

System:
  GET    /admin/system/health           # System health
  POST   /admin/system/maintenance      # Toggle maintenance
  GET    /admin/system/jobs             # List jobs
  POST   /admin/system/jobs/:name/run   # Run job
  GET    /admin/system/config           # Get config
  PUT    /admin/system/config/:key      # Set config
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Admin Actions/Day | 1000+ |
| Moderation Latency | <4 hours |
| Config Change Time | <1 minute |
| Feature Flag Evaluation | <10ms |
| User Search Time | <500ms |

## Success Criteria

1. [ ] User management CRUD complete
2. [ ] Bulk operations working
3. [ ] Impersonation functional
4. [ ] RBAC system operational
5. [ ] Permission checks working
6. [ ] Feature flags functional
7. [ ] Rollout system working
8. [ ] Moderation queue operational
9. [ ] Auto-mod configured
10. [ ] System health dashboard live
11. [ ] Maintenance mode working
12. [ ] All operations audited

## Handoff Notes

For downstream agents:
- Admin API used by all apps
- RBAC package exported for authorization
- Feature flags integrate with all services
- Moderation integrates with Agent_J (Community)

---

*Agent_R Assignment - Platform Administration & Operations*
