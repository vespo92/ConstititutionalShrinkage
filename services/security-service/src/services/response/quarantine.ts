/**
 * Quarantine Service
 *
 * Isolates suspicious users, IPs, and resources.
 */

import { redis } from '../../lib/redis.js';

interface QuarantineEntry {
  id: string;
  type: 'user' | 'ip' | 'session' | 'resource';
  target: string;
  reason: string;
  incidentId?: string;
  quarantinedAt: Date;
  expiresAt?: Date;
  restrictions: QuarantineRestriction[];
  metadata?: Record<string, unknown>;
}

interface QuarantineRestriction {
  action: string;
  blocked: boolean;
  message?: string;
}

// Default restrictions by severity
const RESTRICTION_LEVELS = {
  low: [
    { action: 'admin_access', blocked: true, message: 'Admin access temporarily restricted' },
  ],
  medium: [
    { action: 'admin_access', blocked: true, message: 'Admin access restricted' },
    { action: 'sensitive_data', blocked: true, message: 'Sensitive data access restricted' },
    { action: 'bulk_operations', blocked: true, message: 'Bulk operations restricted' },
  ],
  high: [
    { action: 'admin_access', blocked: true, message: 'Admin access blocked' },
    { action: 'sensitive_data', blocked: true, message: 'Sensitive data access blocked' },
    { action: 'bulk_operations', blocked: true, message: 'Bulk operations blocked' },
    { action: 'voting', blocked: true, message: 'Voting privileges suspended' },
    { action: 'delegation', blocked: true, message: 'Delegation privileges suspended' },
  ],
  critical: [
    { action: '*', blocked: true, message: 'Account suspended pending investigation' },
  ],
};

/**
 * Quarantine a user
 */
export async function quarantineUser(
  userId: string,
  reason: string,
  options: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    duration?: number;
    incidentId?: string;
    restrictions?: QuarantineRestriction[];
  } = {}
): Promise<QuarantineEntry> {
  const severity = options.severity || 'medium';
  const restrictions = options.restrictions || RESTRICTION_LEVELS[severity];
  const expiresAt = options.duration
    ? new Date(Date.now() + options.duration * 1000)
    : undefined;

  const entry: QuarantineEntry = {
    id: `q_user_${userId}_${Date.now()}`,
    type: 'user',
    target: userId,
    reason,
    incidentId: options.incidentId,
    quarantinedAt: new Date(),
    expiresAt,
    restrictions,
  };

  await redis.hset(`quarantine:user:${userId}`, {
    data: JSON.stringify(entry),
    severity,
    expiresAt: expiresAt?.toISOString() || '',
  });

  if (options.duration) {
    await redis.expire(`quarantine:user:${userId}`, options.duration);
  }

  // Add to quarantine index
  await redis.sadd('quarantine:users', userId);

  // Log quarantine action
  await redis.lpush(
    'quarantine:log',
    JSON.stringify({
      action: 'quarantine',
      type: 'user',
      target: userId,
      reason,
      severity,
      timestamp: new Date().toISOString(),
    })
  );

  return entry;
}

/**
 * Quarantine an IP address
 */
export async function quarantineIP(
  ipAddress: string,
  reason: string,
  options: {
    duration?: number;
    incidentId?: string;
  } = {}
): Promise<QuarantineEntry> {
  const duration = options.duration || 3600; // Default 1 hour

  const entry: QuarantineEntry = {
    id: `q_ip_${ipAddress}_${Date.now()}`,
    type: 'ip',
    target: ipAddress,
    reason,
    incidentId: options.incidentId,
    quarantinedAt: new Date(),
    expiresAt: new Date(Date.now() + duration * 1000),
    restrictions: [
      { action: '*', blocked: true, message: 'IP address quarantined' },
    ],
  };

  await redis.setex(
    `quarantine:ip:${ipAddress}`,
    duration,
    JSON.stringify(entry)
  );

  await redis.sadd('quarantine:ips', ipAddress);

  await redis.lpush(
    'quarantine:log',
    JSON.stringify({
      action: 'quarantine',
      type: 'ip',
      target: ipAddress,
      reason,
      duration,
      timestamp: new Date().toISOString(),
    })
  );

  return entry;
}

/**
 * Quarantine a session
 */
export async function quarantineSession(
  sessionId: string,
  reason: string,
  incidentId?: string
): Promise<QuarantineEntry> {
  const entry: QuarantineEntry = {
    id: `q_session_${sessionId}_${Date.now()}`,
    type: 'session',
    target: sessionId,
    reason,
    incidentId,
    quarantinedAt: new Date(),
    restrictions: [
      { action: '*', blocked: true, message: 'Session invalidated' },
    ],
  };

  await redis.set(`quarantine:session:${sessionId}`, JSON.stringify(entry));
  await redis.sadd('quarantine:sessions', sessionId);

  return entry;
}

/**
 * Quarantine a resource
 */
export async function quarantineResource(
  resourceType: string,
  resourceId: string,
  reason: string,
  options: {
    duration?: number;
    incidentId?: string;
  } = {}
): Promise<QuarantineEntry> {
  const key = `${resourceType}:${resourceId}`;

  const entry: QuarantineEntry = {
    id: `q_resource_${key}_${Date.now()}`,
    type: 'resource',
    target: key,
    reason,
    incidentId: options.incidentId,
    quarantinedAt: new Date(),
    expiresAt: options.duration
      ? new Date(Date.now() + options.duration * 1000)
      : undefined,
    restrictions: [
      { action: 'read', blocked: false, message: 'Read-only access' },
      { action: 'write', blocked: true, message: 'Write access blocked' },
      { action: 'delete', blocked: true, message: 'Delete access blocked' },
    ],
    metadata: { resourceType, resourceId },
  };

  if (options.duration) {
    await redis.setex(
      `quarantine:resource:${key}`,
      options.duration,
      JSON.stringify(entry)
    );
  } else {
    await redis.set(`quarantine:resource:${key}`, JSON.stringify(entry));
  }

  await redis.sadd('quarantine:resources', key);

  return entry;
}

/**
 * Check if user is quarantined
 */
export async function isUserQuarantined(userId: string): Promise<QuarantineEntry | null> {
  const data = await redis.hget(`quarantine:user:${userId}`, 'data');
  if (!data) return null;

  const entry = JSON.parse(data);
  entry.quarantinedAt = new Date(entry.quarantinedAt);
  if (entry.expiresAt) {
    entry.expiresAt = new Date(entry.expiresAt);
  }

  return entry;
}

/**
 * Check if IP is quarantined
 */
export async function isIPQuarantined(ipAddress: string): Promise<QuarantineEntry | null> {
  const data = await redis.get(`quarantine:ip:${ipAddress}`);
  if (!data) return null;

  const entry = JSON.parse(data);
  entry.quarantinedAt = new Date(entry.quarantinedAt);
  if (entry.expiresAt) {
    entry.expiresAt = new Date(entry.expiresAt);
  }

  return entry;
}

/**
 * Check if session is quarantined
 */
export async function isSessionQuarantined(sessionId: string): Promise<boolean> {
  return (await redis.exists(`quarantine:session:${sessionId}`)) === 1;
}

/**
 * Check if resource is quarantined
 */
export async function isResourceQuarantined(
  resourceType: string,
  resourceId: string
): Promise<QuarantineEntry | null> {
  const key = `${resourceType}:${resourceId}`;
  const data = await redis.get(`quarantine:resource:${key}`);
  if (!data) return null;

  const entry = JSON.parse(data);
  entry.quarantinedAt = new Date(entry.quarantinedAt);
  if (entry.expiresAt) {
    entry.expiresAt = new Date(entry.expiresAt);
  }

  return entry;
}

/**
 * Check if action is allowed for quarantined entity
 */
export async function isActionAllowed(
  type: 'user' | 'ip' | 'resource',
  target: string,
  action: string
): Promise<{ allowed: boolean; message?: string }> {
  let entry: QuarantineEntry | null = null;

  switch (type) {
    case 'user':
      entry = await isUserQuarantined(target);
      break;
    case 'ip':
      entry = await isIPQuarantined(target);
      break;
    case 'resource':
      const [resourceType, resourceId] = target.split(':');
      if (resourceType && resourceId) {
        entry = await isResourceQuarantined(resourceType, resourceId);
      }
      break;
  }

  if (!entry) {
    return { allowed: true };
  }

  // Check restrictions
  for (const restriction of entry.restrictions) {
    if (restriction.action === '*' || restriction.action === action) {
      if (restriction.blocked) {
        return { allowed: false, message: restriction.message };
      }
    }
  }

  return { allowed: true };
}

/**
 * Release from quarantine
 */
export async function release(
  type: 'user' | 'ip' | 'session' | 'resource',
  target: string,
  reason: string,
  actor: string
): Promise<boolean> {
  let key: string;
  let setKey: string;

  switch (type) {
    case 'user':
      key = `quarantine:user:${target}`;
      setKey = 'quarantine:users';
      break;
    case 'ip':
      key = `quarantine:ip:${target}`;
      setKey = 'quarantine:ips';
      break;
    case 'session':
      key = `quarantine:session:${target}`;
      setKey = 'quarantine:sessions';
      break;
    case 'resource':
      key = `quarantine:resource:${target}`;
      setKey = 'quarantine:resources';
      break;
  }

  const existed = await redis.del(key);
  await redis.srem(setKey, target);

  if (existed) {
    await redis.lpush(
      'quarantine:log',
      JSON.stringify({
        action: 'release',
        type,
        target,
        reason,
        actor,
        timestamp: new Date().toISOString(),
      })
    );
  }

  return existed === 1;
}

/**
 * Get all quarantined entities
 */
export async function getQuarantinedEntities(): Promise<{
  users: string[];
  ips: string[];
  sessions: string[];
  resources: string[];
}> {
  const [users, ips, sessions, resources] = await Promise.all([
    redis.smembers('quarantine:users'),
    redis.smembers('quarantine:ips'),
    redis.smembers('quarantine:sessions'),
    redis.smembers('quarantine:resources'),
  ]);

  return { users, ips, sessions, resources };
}

/**
 * Get quarantine log
 */
export async function getQuarantineLog(limit = 100): Promise<
  Array<{
    action: string;
    type: string;
    target: string;
    reason?: string;
    actor?: string;
    timestamp: string;
  }>
> {
  const logs = await redis.lrange('quarantine:log', 0, limit - 1);
  return logs.map((l) => JSON.parse(l));
}

/**
 * Clean up expired quarantines
 */
export async function cleanupExpired(): Promise<number> {
  let cleaned = 0;

  // Check users
  const users = await redis.smembers('quarantine:users');
  for (const userId of users) {
    const exists = await redis.exists(`quarantine:user:${userId}`);
    if (!exists) {
      await redis.srem('quarantine:users', userId);
      cleaned++;
    }
  }

  // Check IPs
  const ips = await redis.smembers('quarantine:ips');
  for (const ip of ips) {
    const exists = await redis.exists(`quarantine:ip:${ip}`);
    if (!exists) {
      await redis.srem('quarantine:ips', ip);
      cleaned++;
    }
  }

  // Check resources
  const resources = await redis.smembers('quarantine:resources');
  for (const resource of resources) {
    const exists = await redis.exists(`quarantine:resource:${resource}`);
    if (!exists) {
      await redis.srem('quarantine:resources', resource);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get quarantine statistics
 */
export async function getStats(): Promise<{
  activeUsers: number;
  activeIPs: number;
  activeSessions: number;
  activeResources: number;
  totalQuarantined24h: number;
  totalReleased24h: number;
}> {
  const [users, ips, sessions, resources] = await Promise.all([
    redis.scard('quarantine:users'),
    redis.scard('quarantine:ips'),
    redis.scard('quarantine:sessions'),
    redis.scard('quarantine:resources'),
  ]);

  // Count recent actions
  const logs = await redis.lrange('quarantine:log', 0, 999);
  const oneDayAgo = Date.now() - 86400000;
  let quarantined24h = 0;
  let released24h = 0;

  for (const log of logs) {
    const entry = JSON.parse(log);
    const timestamp = new Date(entry.timestamp).getTime();
    if (timestamp > oneDayAgo) {
      if (entry.action === 'quarantine') {
        quarantined24h++;
      } else if (entry.action === 'release') {
        released24h++;
      }
    }
  }

  return {
    activeUsers: users,
    activeIPs: ips,
    activeSessions: sessions,
    activeResources: resources,
    totalQuarantined24h: quarantined24h,
    totalReleased24h: released24h,
  };
}
