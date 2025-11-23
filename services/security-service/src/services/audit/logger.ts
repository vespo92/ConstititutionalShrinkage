/**
 * Audit Logger
 *
 * Centralized audit logging with tamper-proof verification.
 */

import type { AuditLog, AuditAction, AuditQuery, GeoLocation } from '../../types/index.js';
import { redis } from '../../lib/redis.js';
import { createAuditHash } from '../../lib/hashing.js';

// In-memory log buffer for batch processing
const logBuffer: AuditLog[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

// Last hash for chain integrity
let lastHash: string | undefined;

/**
 * Create an audit log entry
 */
export async function log(params: {
  userId?: string;
  sessionId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  geoLocation?: GeoLocation;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  outcome: 'success' | 'failure';
  errorMessage?: string;
}): Promise<AuditLog> {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date();

  // Create hash for tamper detection
  const hashData = {
    userId: params.userId,
    sessionId: params.sessionId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ipAddress: params.ipAddress,
    outcome: params.outcome,
  };

  const hash = createAuditHash(hashData, timestamp, lastHash);

  const entry: AuditLog = {
    id,
    timestamp,
    userId: params.userId,
    sessionId: params.sessionId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    geoLocation: params.geoLocation,
    before: params.before,
    after: params.after,
    outcome: params.outcome,
    errorMessage: params.errorMessage,
    hash,
    previousHash: lastHash,
  };

  // Update chain
  lastHash = hash;

  // Add to buffer
  logBuffer.push(entry);

  // Store immediately in Redis for real-time access
  await storeLog(entry);

  // Flush buffer if full
  if (logBuffer.length >= BUFFER_SIZE) {
    await flushBuffer();
  }

  return entry;
}

/**
 * Store log entry in Redis
 */
async function storeLog(entry: AuditLog): Promise<void> {
  const key = `audit:${entry.id}`;

  await redis.hset(key, {
    data: JSON.stringify(entry),
    userId: entry.userId || '',
    action: entry.action,
    resourceType: entry.resourceType,
    timestamp: entry.timestamp.toISOString(),
    hash: entry.hash,
  });

  // Set expiry (30 days default, configurable)
  const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '30', 10);
  await redis.expire(key, retentionDays * 86400);

  // Add to indices
  await redis.zadd('audit:timeline', entry.timestamp.getTime().toString(), entry.id);

  if (entry.userId) {
    await redis.zadd(`audit:user:${entry.userId}`, entry.timestamp.getTime().toString(), entry.id);
  }

  await redis.zadd(
    `audit:action:${entry.action}`,
    entry.timestamp.getTime().toString(),
    entry.id
  );

  await redis.zadd(
    `audit:resource:${entry.resourceType}`,
    entry.timestamp.getTime().toString(),
    entry.id
  );

  if (entry.resourceId) {
    await redis.zadd(
      `audit:resource:${entry.resourceType}:${entry.resourceId}`,
      entry.timestamp.getTime().toString(),
      entry.id
    );
  }

  // Track by IP for security analysis
  await redis.zadd(`audit:ip:${entry.ipAddress}`, entry.timestamp.getTime().toString(), entry.id);
}

/**
 * Flush log buffer to persistent storage
 */
async function flushBuffer(): Promise<void> {
  if (logBuffer.length === 0) return;

  // In production, this would write to a database or log aggregation service
  // For now, logs are already in Redis

  logBuffer.length = 0;
}

// Periodic flush
setInterval(flushBuffer, FLUSH_INTERVAL);

/**
 * Query audit logs
 */
export async function query(params: AuditQuery): Promise<AuditLog[]> {
  let ids: string[] = [];

  // Determine which index to use
  if (params.userId) {
    ids = await redis.zrevrange(`audit:user:${params.userId}`, 0, -1);
  } else if (params.action) {
    ids = await redis.zrevrange(`audit:action:${params.action}`, 0, -1);
  } else if (params.resourceType && params.resourceId) {
    ids = await redis.zrevrange(
      `audit:resource:${params.resourceType}:${params.resourceId}`,
      0,
      -1
    );
  } else if (params.resourceType) {
    ids = await redis.zrevrange(`audit:resource:${params.resourceType}`, 0, -1);
  } else if (params.ipAddress) {
    ids = await redis.zrevrange(`audit:ip:${params.ipAddress}`, 0, -1);
  } else {
    // Default to timeline
    ids = await redis.zrevrange('audit:timeline', 0, -1);
  }

  // Apply date filters
  if (params.startDate || params.endDate) {
    const startTime = params.startDate?.getTime() || 0;
    const endTime = params.endDate?.getTime() || Date.now();

    ids = ids.filter((id) => {
      const timestamp = parseInt(id.split('_')[1] || '0', 10);
      return timestamp >= startTime && timestamp <= endTime;
    });
  }

  // Apply pagination
  const offset = params.offset || 0;
  const limit = params.limit || 100;
  ids = ids.slice(offset, offset + limit);

  // Fetch logs
  const logs: AuditLog[] = [];
  for (const id of ids) {
    const data = await redis.hget(`audit:${id}`, 'data');
    if (data) {
      const log = JSON.parse(data);
      log.timestamp = new Date(log.timestamp);
      logs.push(log);
    }
  }

  return logs;
}

/**
 * Get audit log by ID
 */
export async function getById(id: string): Promise<AuditLog | null> {
  const data = await redis.hget(`audit:${id}`, 'data');
  if (!data) return null;

  const log = JSON.parse(data);
  log.timestamp = new Date(log.timestamp);
  return log;
}

/**
 * Get user activity
 */
export async function getUserActivity(
  userId: string,
  limit = 100
): Promise<AuditLog[]> {
  return query({ userId, limit });
}

/**
 * Get resource access log
 */
export async function getResourceAccess(
  resourceType: string,
  resourceId: string,
  limit = 100
): Promise<AuditLog[]> {
  return query({ resourceType, resourceId, limit });
}

/**
 * Get recent failed actions
 */
export async function getFailedActions(limit = 100): Promise<AuditLog[]> {
  const allLogs = await query({ limit: limit * 2 });
  return allLogs.filter((log) => log.outcome === 'failure').slice(0, limit);
}

/**
 * Verify audit chain integrity
 */
export async function verifyChainIntegrity(
  startId: string,
  endId?: string
): Promise<{ valid: boolean; brokenAt?: string }> {
  const logs = await query({ limit: 10000 });

  // Find start position
  const startIndex = logs.findIndex((l) => l.id === startId);
  if (startIndex === -1) {
    return { valid: false, brokenAt: startId };
  }

  // Find end position
  const endIndex = endId
    ? logs.findIndex((l) => l.id === endId)
    : logs.length - 1;

  // Verify chain
  for (let i = startIndex; i < endIndex; i++) {
    const current = logs[i];
    const next = logs[i + 1];

    if (current && next && next.previousHash !== current.hash) {
      return { valid: false, brokenAt: next.id };
    }
  }

  return { valid: true };
}

/**
 * Get audit statistics
 */
export async function getStats(): Promise<{
  totalLogs: number;
  logsToday: number;
  byAction: Record<string, number>;
  byOutcome: { success: number; failure: number };
  topUsers: Array<{ userId: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  const totalLogs = await redis.zcard('audit:timeline');
  const logsToday = await redis.zcount('audit:timeline', todayStart.toString(), '+inf');

  // Get recent logs for analysis
  const recentLogs = await query({ limit: 1000 });

  const byAction: Record<string, number> = {};
  const byOutcome = { success: 0, failure: 0 };
  const userCounts = new Map<string, number>();
  const resourceCounts = new Map<string, number>();

  for (const log of recentLogs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byOutcome[log.outcome]++;

    if (log.userId) {
      userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
    }

    const resource = `${log.resourceType}:${log.resourceId || 'all'}`;
    resourceCounts.set(resource, (resourceCounts.get(resource) || 0) + 1);
  }

  const topUsers = Array.from(userCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => ({ userId, count }));

  const topResources = Array.from(resourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([resource, count]) => ({ resource, count }));

  return {
    totalLogs,
    logsToday,
    byAction,
    byOutcome,
    topUsers,
    topResources,
  };
}

/**
 * Export audit logs for compliance
 */
export async function exportLogs(params: {
  startDate: Date;
  endDate: Date;
  format: 'json' | 'csv';
}): Promise<string> {
  const logs = await query({
    startDate: params.startDate,
    endDate: params.endDate,
    limit: 100000,
  });

  if (params.format === 'json') {
    return JSON.stringify(logs, null, 2);
  }

  // CSV format
  const headers = [
    'id',
    'timestamp',
    'userId',
    'action',
    'resourceType',
    'resourceId',
    'ipAddress',
    'outcome',
    'hash',
  ];

  const rows = logs.map((log) =>
    [
      log.id,
      log.timestamp.toISOString(),
      log.userId || '',
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.ipAddress,
      log.outcome,
      log.hash,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Convenience logging functions
 */
export const auditLog = {
  login: (params: { userId: string; ipAddress: string; userAgent?: string; success: boolean }) =>
    log({
      userId: params.userId,
      action: 'login' as AuditAction,
      resourceType: 'auth',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      outcome: params.success ? 'success' : 'failure',
    }),

  logout: (params: { userId: string; ipAddress: string }) =>
    log({
      userId: params.userId,
      action: 'logout' as AuditAction,
      resourceType: 'auth',
      ipAddress: params.ipAddress,
      outcome: 'success',
    }),

  vote: (params: {
    userId: string;
    billId: string;
    vote: string;
    ipAddress: string;
    success: boolean;
  }) =>
    log({
      userId: params.userId,
      action: 'vote' as AuditAction,
      resourceType: 'bill',
      resourceId: params.billId,
      ipAddress: params.ipAddress,
      after: { vote: params.vote },
      outcome: params.success ? 'success' : 'failure',
    }),

  adminAction: (params: {
    userId: string;
    action: string;
    target: string;
    ipAddress: string;
  }) =>
    log({
      userId: params.userId,
      action: 'admin_action' as AuditAction,
      resourceType: 'admin',
      resourceId: params.target,
      ipAddress: params.ipAddress,
      after: { adminAction: params.action },
      outcome: 'success',
    }),
};
