/**
 * Audit Analyzer
 *
 * Analyzes audit logs for security insights and anomalies.
 */

import type { AuditLog, AuditAction, Anomaly } from '../../types/index.js';
import * as logger from './logger.js';
import { redis } from '../../lib/redis.js';

interface UserBehaviorProfile {
  userId: string;
  typicalLoginHours: number[];
  typicalLocations: string[];
  typicalActions: string[];
  avgActionsPerDay: number;
  lastAnalyzed: Date;
}

interface AccessPattern {
  userId: string;
  resourceType: string;
  frequency: number;
  lastAccess: Date;
  isUnusual: boolean;
}

/**
 * Analyze user behavior from audit logs
 */
export async function analyzeUserBehavior(
  userId: string
): Promise<UserBehaviorProfile> {
  const logs = await logger.query({ userId, limit: 1000 });

  // Analyze login hours
  const loginHours = logs
    .filter((l) => l.action === ('login' as AuditAction))
    .map((l) => l.timestamp.getHours());

  const hourCounts = new Map<number, number>();
  for (const hour of loginHours) {
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }

  const typicalLoginHours = Array.from(hourCounts.entries())
    .filter(([, count]) => count >= loginHours.length * 0.1)
    .map(([hour]) => hour)
    .sort((a, b) => a - b);

  // Analyze locations
  const locations = logs
    .filter((l) => l.geoLocation?.country)
    .map((l) => l.geoLocation!.country!);

  const locationCounts = new Map<string, number>();
  for (const loc of locations) {
    locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
  }

  const typicalLocations = Array.from(locationCounts.entries())
    .filter(([, count]) => count >= locations.length * 0.05)
    .map(([loc]) => loc);

  // Analyze actions
  const actionCounts = new Map<string, number>();
  for (const log of logs) {
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
  }

  const typicalActions = Array.from(actionCounts.entries())
    .filter(([, count]) => count >= 5)
    .map(([action]) => action);

  // Calculate average actions per day
  if (logs.length === 0) {
    return {
      userId,
      typicalLoginHours: [],
      typicalLocations: [],
      typicalActions: [],
      avgActionsPerDay: 0,
      lastAnalyzed: new Date(),
    };
  }

  const firstLog = logs[logs.length - 1];
  const lastLog = logs[0];
  const daySpan =
    firstLog && lastLog
      ? Math.ceil(
          (lastLog.timestamp.getTime() - firstLog.timestamp.getTime()) /
            (1000 * 60 * 60 * 24)
        ) || 1
      : 1;
  const avgActionsPerDay = logs.length / daySpan;

  const profile: UserBehaviorProfile = {
    userId,
    typicalLoginHours,
    typicalLocations,
    typicalActions,
    avgActionsPerDay,
    lastAnalyzed: new Date(),
  };

  // Cache profile
  await redis.setex(
    `behavior_profile:${userId}`,
    3600,
    JSON.stringify(profile)
  );

  return profile;
}

/**
 * Get cached behavior profile
 */
export async function getBehaviorProfile(
  userId: string
): Promise<UserBehaviorProfile | null> {
  const cached = await redis.get(`behavior_profile:${userId}`);
  if (cached) {
    const profile = JSON.parse(cached);
    profile.lastAnalyzed = new Date(profile.lastAnalyzed);
    return profile;
  }
  return null;
}

/**
 * Detect behavior anomalies
 */
export async function detectBehaviorAnomalies(
  userId: string,
  currentLog: AuditLog
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  let profile = await getBehaviorProfile(userId);
  if (!profile) {
    profile = await analyzeUserBehavior(userId);
  }

  const currentHour = currentLog.timestamp.getHours();

  // Check login time anomaly
  if (
    currentLog.action === ('login' as AuditAction) &&
    profile.typicalLoginHours.length > 0 &&
    !profile.typicalLoginHours.includes(currentHour)
  ) {
    anomalies.push({
      id: `anomaly_time_${Date.now()}`,
      type: 'unusual_login_time',
      score: 0.7,
      baseline: profile.typicalLoginHours.length,
      current: currentHour,
      deviation: 1,
      detectedAt: new Date(),
      context: {
        userId,
        currentHour,
        typicalHours: profile.typicalLoginHours,
      },
    });
  }

  // Check location anomaly
  if (
    currentLog.geoLocation?.country &&
    profile.typicalLocations.length > 0 &&
    !profile.typicalLocations.includes(currentLog.geoLocation.country)
  ) {
    anomalies.push({
      id: `anomaly_location_${Date.now()}`,
      type: 'unusual_location',
      score: 0.8,
      baseline: profile.typicalLocations.length,
      current: 1,
      deviation: 1,
      detectedAt: new Date(),
      context: {
        userId,
        currentLocation: currentLog.geoLocation.country,
        typicalLocations: profile.typicalLocations,
      },
    });
  }

  // Check action frequency anomaly
  const todayKey = `action_count:${userId}:${new Date().toISOString().split('T')[0]}`;
  const todayCount = await redis.incr(todayKey);
  await redis.expire(todayKey, 86400);

  if (
    profile.avgActionsPerDay > 0 &&
    todayCount > profile.avgActionsPerDay * 3
  ) {
    anomalies.push({
      id: `anomaly_frequency_${Date.now()}`,
      type: 'high_activity_frequency',
      score: Math.min(todayCount / (profile.avgActionsPerDay * 3), 1),
      baseline: profile.avgActionsPerDay,
      current: todayCount,
      deviation: (todayCount - profile.avgActionsPerDay) / profile.avgActionsPerDay,
      detectedAt: new Date(),
      context: {
        userId,
        todayCount,
        avgActionsPerDay: profile.avgActionsPerDay,
      },
    });
  }

  return anomalies;
}

/**
 * Analyze access patterns
 */
export async function analyzeAccessPatterns(
  userId: string
): Promise<AccessPattern[]> {
  const logs = await logger.query({ userId, limit: 500 });

  // Group by resource type
  const resourceAccess = new Map<string, { count: number; lastAccess: Date }>();

  for (const log of logs) {
    const key = log.resourceType;
    const existing = resourceAccess.get(key);

    if (!existing || log.timestamp > existing.lastAccess) {
      resourceAccess.set(key, {
        count: (existing?.count || 0) + 1,
        lastAccess: log.timestamp,
      });
    } else {
      existing.count++;
    }
  }

  // Calculate patterns
  const totalLogs = logs.length;
  const patterns: AccessPattern[] = [];

  for (const [resourceType, data] of resourceAccess) {
    const frequency = data.count / totalLogs;

    // Unusual if very low frequency resource is suddenly accessed a lot
    const recentLogs = logs.filter(
      (l) =>
        l.resourceType === resourceType &&
        Date.now() - l.timestamp.getTime() < 3600000
    );
    const recentFrequency = recentLogs.length / Math.min(logs.length, 100);

    patterns.push({
      userId,
      resourceType,
      frequency,
      lastAccess: data.lastAccess,
      isUnusual: frequency < 0.05 && recentFrequency > 0.2,
    });
  }

  return patterns;
}

/**
 * Find suspicious activity correlations
 */
export async function findCorrelations(
  timeWindowMinutes = 60
): Promise<
  Array<{
    users: string[];
    action: string;
    resource: string;
    count: number;
    timeSpan: number;
  }>
> {
  const windowMs = timeWindowMinutes * 60 * 1000;
  const now = Date.now();
  const logs = await logger.query({
    startDate: new Date(now - windowMs),
    limit: 5000,
  });

  // Group by action + resource
  const groups = new Map<
    string,
    { users: Set<string>; timestamps: number[] }
  >();

  for (const log of logs) {
    if (!log.userId) continue;

    const key = `${log.action}:${log.resourceType}:${log.resourceId || 'all'}`;
    const group = groups.get(key) || {
      users: new Set<string>(),
      timestamps: [],
    };

    group.users.add(log.userId);
    group.timestamps.push(log.timestamp.getTime());

    groups.set(key, group);
  }

  // Find correlated activity (multiple users, same action, close in time)
  const correlations: Array<{
    users: string[];
    action: string;
    resource: string;
    count: number;
    timeSpan: number;
  }> = [];

  for (const [key, group] of groups) {
    if (group.users.size >= 3 && group.timestamps.length >= 5) {
      const [action, resourceType, resourceId] = key.split(':');
      const timeSpan =
        Math.max(...group.timestamps) - Math.min(...group.timestamps);

      // Suspicious if many users doing same thing in short time
      if (timeSpan < 300000 && group.users.size >= 5) {
        correlations.push({
          users: Array.from(group.users),
          action: action || '',
          resource: `${resourceType}:${resourceId}`,
          count: group.timestamps.length,
          timeSpan,
        });
      }
    }
  }

  return correlations.sort((a, b) => b.count - a.count);
}

/**
 * Generate security insights
 */
export async function generateInsights(): Promise<{
  riskUsers: Array<{ userId: string; riskScore: number; reasons: string[] }>;
  unusualPatterns: Array<{ pattern: string; severity: string; count: number }>;
  recommendations: string[];
}> {
  const stats = await logger.getStats();
  const riskUsers: Array<{
    userId: string;
    riskScore: number;
    reasons: string[];
  }> = [];
  const unusualPatterns: Array<{
    pattern: string;
    severity: string;
    count: number;
  }> = [];
  const recommendations: string[] = [];

  // Analyze top users for risk
  for (const { userId } of stats.topUsers.slice(0, 20)) {
    const profile = await analyzeUserBehavior(userId);
    const patterns = await analyzeAccessPatterns(userId);

    const unusualAccess = patterns.filter((p) => p.isUnusual);
    const reasons: string[] = [];
    let riskScore = 0;

    if (unusualAccess.length > 0) {
      reasons.push(
        `Unusual access to: ${unusualAccess.map((p) => p.resourceType).join(', ')}`
      );
      riskScore += 0.3;
    }

    if (profile.avgActionsPerDay > 500) {
      reasons.push('High activity volume');
      riskScore += 0.2;
    }

    if (reasons.length > 0) {
      riskUsers.push({ userId, riskScore, reasons });
    }
  }

  // Check for unusual patterns
  const failureRate =
    stats.byOutcome.failure /
    (stats.byOutcome.success + stats.byOutcome.failure);
  if (failureRate > 0.1) {
    unusualPatterns.push({
      pattern: 'High failure rate',
      severity: failureRate > 0.2 ? 'high' : 'medium',
      count: stats.byOutcome.failure,
    });
    recommendations.push('Investigate high failure rate in recent actions');
  }

  // Check login patterns
  const loginCount = stats.byAction['login' as AuditAction] || 0;
  const logoutCount = stats.byAction['logout' as AuditAction] || 0;
  if (loginCount > 0 && logoutCount / loginCount < 0.3) {
    unusualPatterns.push({
      pattern: 'Low logout rate',
      severity: 'low',
      count: loginCount - logoutCount,
    });
    recommendations.push(
      'Consider implementing automatic session timeouts'
    );
  }

  // Check correlations
  const correlations = await findCorrelations(30);
  if (correlations.length > 0) {
    for (const corr of correlations.slice(0, 3)) {
      unusualPatterns.push({
        pattern: `Coordinated ${corr.action} on ${corr.resource}`,
        severity: 'high',
        count: corr.count,
      });
    }
    recommendations.push('Investigate coordinated activity patterns');
  }

  return { riskUsers, unusualPatterns, recommendations };
}

/**
 * Get audit summary for time period
 */
export async function getSummary(period: 'day' | 'week' | 'month'): Promise<{
  period: string;
  totalEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  failureRate: number;
  peakHour: number;
  avgEventsPerHour: number;
}> {
  const periodDays = { day: 1, week: 7, month: 30 };
  const days = periodDays[period];
  const startDate = new Date(Date.now() - days * 86400000);

  const logs = await logger.query({ startDate, limit: 50000 });

  const uniqueUsers = new Set(logs.filter((l) => l.userId).map((l) => l.userId));

  const actionCounts = new Map<string, number>();
  const resourceCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  let failures = 0;

  for (const log of logs) {
    actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    resourceCounts.set(
      log.resourceType,
      (resourceCounts.get(log.resourceType) || 0) + 1
    );
    const hour = log.timestamp.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    if (log.outcome === 'failure') failures++;
  }

  const topActions = Array.from(actionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([action, count]) => ({ action, count }));

  const topResources = Array.from(resourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([resource, count]) => ({ resource, count }));

  const peakHour = Array.from(hourCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 0;

  return {
    period,
    totalEvents: logs.length,
    uniqueUsers: uniqueUsers.size,
    topActions,
    topResources,
    failureRate: logs.length > 0 ? failures / logs.length : 0,
    peakHour,
    avgEventsPerHour: logs.length / (days * 24),
  };
}
