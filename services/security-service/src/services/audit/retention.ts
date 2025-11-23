/**
 * Audit Log Retention
 *
 * Manages audit log retention, archival, and cleanup.
 */

import { redis } from '../../lib/redis.js';
import * as logger from './logger.js';
import { sha256 } from '../../lib/hashing.js';

interface RetentionPolicy {
  id: string;
  name: string;
  resourceType?: string;
  action?: string;
  retentionDays: number;
  archiveEnabled: boolean;
  archiveAfterDays?: number;
  deleteAfterArchive: boolean;
}

// Default retention policies
const DEFAULT_POLICIES: RetentionPolicy[] = [
  {
    id: 'default',
    name: 'Default Policy',
    retentionDays: 90,
    archiveEnabled: true,
    archiveAfterDays: 30,
    deleteAfterArchive: true,
  },
  {
    id: 'auth',
    name: 'Authentication Logs',
    resourceType: 'auth',
    retentionDays: 365,
    archiveEnabled: true,
    archiveAfterDays: 90,
    deleteAfterArchive: false,
  },
  {
    id: 'votes',
    name: 'Voting Logs',
    resourceType: 'bill',
    action: 'vote',
    retentionDays: 2555, // 7 years for compliance
    archiveEnabled: true,
    archiveAfterDays: 365,
    deleteAfterArchive: false,
  },
  {
    id: 'admin',
    name: 'Admin Actions',
    resourceType: 'admin',
    retentionDays: 730, // 2 years
    archiveEnabled: true,
    archiveAfterDays: 180,
    deleteAfterArchive: false,
  },
];

// In-memory policy storage
const policies = new Map<string, RetentionPolicy>();

// Initialize default policies
for (const policy of DEFAULT_POLICIES) {
  policies.set(policy.id, policy);
}

/**
 * Get all retention policies
 */
export function getPolicies(): RetentionPolicy[] {
  return Array.from(policies.values());
}

/**
 * Get policy by ID
 */
export function getPolicy(id: string): RetentionPolicy | undefined {
  return policies.get(id);
}

/**
 * Add or update a policy
 */
export function upsertPolicy(policy: RetentionPolicy): void {
  policies.set(policy.id, policy);
}

/**
 * Delete a policy
 */
export function deletePolicy(id: string): boolean {
  if (id === 'default') return false; // Can't delete default
  return policies.delete(id);
}

/**
 * Find applicable policy for a log entry
 */
export function findApplicablePolicy(
  resourceType: string,
  action?: string
): RetentionPolicy {
  // Find most specific matching policy
  for (const policy of policies.values()) {
    if (policy.resourceType === resourceType && policy.action === action) {
      return policy;
    }
  }

  for (const policy of policies.values()) {
    if (policy.resourceType === resourceType && !policy.action) {
      return policy;
    }
  }

  return policies.get('default')!;
}

/**
 * Archive old logs
 */
export async function archiveLogs(): Promise<{
  archived: number;
  errors: number;
}> {
  let archived = 0;
  let errors = 0;

  for (const policy of policies.values()) {
    if (!policy.archiveEnabled || !policy.archiveAfterDays) continue;

    const archiveDate = new Date(
      Date.now() - policy.archiveAfterDays * 86400000
    );

    const logs = await logger.query({
      resourceType: policy.resourceType,
      endDate: archiveDate,
      limit: 10000,
    });

    for (const log of logs) {
      try {
        // Create archive entry
        const archiveKey = `archive:${log.timestamp.toISOString().split('T')[0]}`;
        await redis.lpush(archiveKey, JSON.stringify(log));

        // Set retention on archive
        const archiveRetention = (policy.retentionDays - policy.archiveAfterDays) * 86400;
        await redis.expire(archiveKey, archiveRetention);

        // Delete original if configured
        if (policy.deleteAfterArchive) {
          await redis.del(`audit:${log.id}`);
        }

        archived++;
      } catch {
        errors++;
      }
    }
  }

  // Log archival activity
  await redis.lpush(
    'retention:history',
    JSON.stringify({
      action: 'archive',
      archived,
      errors,
      timestamp: new Date().toISOString(),
    })
  );

  return { archived, errors };
}

/**
 * Delete expired logs
 */
export async function deleteExpiredLogs(): Promise<{
  deleted: number;
  errors: number;
}> {
  let deleted = 0;
  let errors = 0;

  for (const policy of policies.values()) {
    const expiryDate = new Date(Date.now() - policy.retentionDays * 86400000);

    // Find expired logs
    const expiredIds = await redis.zrangebyscore(
      'audit:timeline',
      '-inf',
      expiryDate.getTime().toString()
    );

    for (const id of expiredIds) {
      try {
        // Verify it matches this policy before deleting
        const logData = await redis.hget(`audit:${id}`, 'data');
        if (!logData) continue;

        const log = JSON.parse(logData);
        const applicablePolicy = findApplicablePolicy(
          log.resourceType,
          log.action
        );

        if (applicablePolicy.id !== policy.id) continue;

        // Delete from all indices
        await redis.del(`audit:${id}`);
        await redis.zrem('audit:timeline', id);
        if (log.userId) {
          await redis.zrem(`audit:user:${log.userId}`, id);
        }
        await redis.zrem(`audit:action:${log.action}`, id);
        await redis.zrem(`audit:resource:${log.resourceType}`, id);
        if (log.resourceId) {
          await redis.zrem(
            `audit:resource:${log.resourceType}:${log.resourceId}`,
            id
          );
        }
        await redis.zrem(`audit:ip:${log.ipAddress}`, id);

        deleted++;
      } catch {
        errors++;
      }
    }
  }

  // Log deletion activity
  await redis.lpush(
    'retention:history',
    JSON.stringify({
      action: 'delete',
      deleted,
      errors,
      timestamp: new Date().toISOString(),
    })
  );

  return { deleted, errors };
}

/**
 * Get retention statistics
 */
export async function getStats(): Promise<{
  totalLogs: number;
  oldestLog: Date | null;
  newestLog: Date | null;
  archivedCount: number;
  byPolicy: Array<{ policy: string; count: number; oldestDate: Date | null }>;
}> {
  const totalLogs = await redis.zcard('audit:timeline');

  const oldest = await redis.zrange('audit:timeline', 0, 0, 'WITHSCORES');
  const newest = await redis.zrevrange('audit:timeline', 0, 0, 'WITHSCORES');

  const oldestLog = oldest[1] ? new Date(parseInt(oldest[1], 10)) : null;
  const newestLog = newest[1] ? new Date(parseInt(newest[1], 10)) : null;

  // Count archived logs
  let archivedCount = 0;
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'archive:*',
      'COUNT',
      100
    );
    cursor = newCursor;
    for (const key of keys) {
      archivedCount += await redis.llen(key);
    }
  } while (cursor !== '0');

  // Stats by policy (simplified - would need more indexing in production)
  const byPolicy: Array<{
    policy: string;
    count: number;
    oldestDate: Date | null;
  }> = [];

  for (const policy of policies.values()) {
    if (policy.resourceType) {
      const count = await redis.zcard(`audit:resource:${policy.resourceType}`);
      const policyOldest = await redis.zrange(
        `audit:resource:${policy.resourceType}`,
        0,
        0,
        'WITHSCORES'
      );

      byPolicy.push({
        policy: policy.name,
        count,
        oldestDate: policyOldest[1]
          ? new Date(parseInt(policyOldest[1], 10))
          : null,
      });
    }
  }

  return {
    totalLogs,
    oldestLog,
    newestLog,
    archivedCount,
    byPolicy,
  };
}

/**
 * Get retention history
 */
export async function getHistory(
  limit = 100
): Promise<
  Array<{
    action: string;
    archived?: number;
    deleted?: number;
    errors: number;
    timestamp: string;
  }>
> {
  const history = await redis.lrange('retention:history', 0, limit - 1);
  return history.map((h) => JSON.parse(h));
}

/**
 * Verify archive integrity
 */
export async function verifyArchiveIntegrity(date: string): Promise<{
  valid: boolean;
  logCount: number;
  verifiedCount: number;
  invalidCount: number;
}> {
  const archiveKey = `archive:${date}`;
  const logs = await redis.lrange(archiveKey, 0, -1);

  let verifiedCount = 0;
  let invalidCount = 0;

  for (const logStr of logs) {
    try {
      const log = JSON.parse(logStr);

      // Verify hash
      const hashData = {
        userId: log.userId,
        sessionId: log.sessionId,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        outcome: log.outcome,
      };

      const expectedHash = sha256(
        JSON.stringify({
          data: hashData,
          timestamp: log.timestamp,
          previousHash: log.previousHash || 'genesis',
        })
      );

      if (log.hash === expectedHash) {
        verifiedCount++;
      } else {
        invalidCount++;
      }
    } catch {
      invalidCount++;
    }
  }

  return {
    valid: invalidCount === 0,
    logCount: logs.length,
    verifiedCount,
    invalidCount,
  };
}

/**
 * Run retention maintenance
 */
export async function runMaintenance(): Promise<{
  archived: number;
  deleted: number;
  errors: number;
  duration: number;
}> {
  const startTime = Date.now();

  const archiveResult = await archiveLogs();
  const deleteResult = await deleteExpiredLogs();

  return {
    archived: archiveResult.archived,
    deleted: deleteResult.deleted,
    errors: archiveResult.errors + deleteResult.errors,
    duration: Date.now() - startTime,
  };
}

/**
 * Restore logs from archive
 */
export async function restoreFromArchive(
  date: string
): Promise<{ restored: number; errors: number }> {
  const archiveKey = `archive:${date}`;
  const logs = await redis.lrange(archiveKey, 0, -1);

  let restored = 0;
  let errors = 0;

  for (const logStr of logs) {
    try {
      const log = JSON.parse(logStr);

      // Restore to main storage
      await redis.hset(`audit:${log.id}`, {
        data: logStr,
        userId: log.userId || '',
        action: log.action,
        resourceType: log.resourceType,
        timestamp: log.timestamp,
        hash: log.hash,
      });

      // Restore indices
      const timestamp = new Date(log.timestamp).getTime();
      await redis.zadd('audit:timeline', timestamp.toString(), log.id);
      if (log.userId) {
        await redis.zadd(`audit:user:${log.userId}`, timestamp.toString(), log.id);
      }
      await redis.zadd(`audit:action:${log.action}`, timestamp.toString(), log.id);
      await redis.zadd(
        `audit:resource:${log.resourceType}`,
        timestamp.toString(),
        log.id
      );

      restored++;
    } catch {
      errors++;
    }
  }

  return { restored, errors };
}
