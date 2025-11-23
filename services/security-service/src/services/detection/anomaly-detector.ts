/**
 * Anomaly Detection Service
 *
 * ML-based anomaly detection for security events.
 */

import type { SecurityEvent, Anomaly, Baseline } from '../../types/index.js';
import { redis } from '../../lib/redis.js';

// Baseline storage
const baselines = new Map<string, Baseline>();

/**
 * Update baseline statistics for a metric
 */
export function updateBaseline(metric: string, value: number): void {
  const existing = baselines.get(metric);

  if (!existing) {
    baselines.set(metric, {
      metric,
      mean: value,
      stdDev: 0,
      min: value,
      max: value,
      samples: 1,
      lastUpdated: new Date(),
    });
    return;
  }

  // Welford's online algorithm for mean and variance
  const n = existing.samples + 1;
  const delta = value - existing.mean;
  const newMean = existing.mean + delta / n;
  const delta2 = value - newMean;
  const newVariance =
    (existing.stdDev ** 2 * (n - 1) + delta * delta2) / n;

  baselines.set(metric, {
    metric,
    mean: newMean,
    stdDev: Math.sqrt(newVariance),
    min: Math.min(existing.min, value),
    max: Math.max(existing.max, value),
    samples: n,
    lastUpdated: new Date(),
  });
}

/**
 * Get baseline for a metric
 */
export function getBaseline(metric: string): Baseline | undefined {
  return baselines.get(metric);
}

/**
 * Calculate Z-score for anomaly detection
 */
function calculateZScore(value: number, baseline: Baseline): number {
  if (baseline.stdDev === 0) return 0;
  return Math.abs(value - baseline.mean) / baseline.stdDev;
}

/**
 * Detect anomalies in a set of events
 */
export async function detectAnomalies(
  events: SecurityEvent[],
  thresholdZScore = 3
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Group events by user and type
  const userEventCounts = new Map<string, number>();
  const typeEventCounts = new Map<string, number>();
  const ipEventCounts = new Map<string, number>();

  for (const event of events) {
    if (event.userId) {
      userEventCounts.set(event.userId, (userEventCounts.get(event.userId) || 0) + 1);
    }
    typeEventCounts.set(event.type, (typeEventCounts.get(event.type) || 0) + 1);
    ipEventCounts.set(event.ipAddress, (ipEventCounts.get(event.ipAddress) || 0) + 1);
  }

  // Check user activity anomalies
  for (const [userId, count] of userEventCounts) {
    const metric = `user_activity:${userId}`;
    const baseline = getBaseline(metric);

    if (baseline && baseline.samples > 10) {
      const zScore = calculateZScore(count, baseline);

      if (zScore > thresholdZScore) {
        anomalies.push({
          id: `anomaly_${Date.now()}_${userId}`,
          type: 'user_activity_spike',
          score: zScore,
          baseline: baseline.mean,
          current: count,
          deviation: zScore,
          detectedAt: new Date(),
          context: { userId, eventCount: count },
        });
      }
    }

    updateBaseline(metric, count);
  }

  // Check IP activity anomalies
  for (const [ip, count] of ipEventCounts) {
    const metric = `ip_activity:${ip}`;
    const baseline = getBaseline(metric);

    if (baseline && baseline.samples > 5) {
      const zScore = calculateZScore(count, baseline);

      if (zScore > thresholdZScore) {
        anomalies.push({
          id: `anomaly_${Date.now()}_${ip}`,
          type: 'ip_activity_spike',
          score: zScore,
          baseline: baseline.mean,
          current: count,
          deviation: zScore,
          detectedAt: new Date(),
          context: { ipAddress: ip, eventCount: count },
        });
      }
    }

    updateBaseline(metric, count);
  }

  // Check event type distribution anomalies
  for (const [type, count] of typeEventCounts) {
    const metric = `event_type:${type}`;
    const baseline = getBaseline(metric);

    if (baseline && baseline.samples > 20) {
      const zScore = calculateZScore(count, baseline);

      if (zScore > thresholdZScore) {
        anomalies.push({
          id: `anomaly_${Date.now()}_${type}`,
          type: 'event_type_spike',
          score: zScore,
          baseline: baseline.mean,
          current: count,
          deviation: zScore,
          detectedAt: new Date(),
          context: { eventType: type, eventCount: count },
        });
      }
    }

    updateBaseline(metric, count);
  }

  return anomalies;
}

/**
 * Detect time-based anomalies (unusual activity times)
 */
export async function detectTimeAnomalies(
  userId: string,
  currentHour: number
): Promise<Anomaly | null> {
  const key = `user_hours:${userId}`;
  const hourCounts = await redis.hgetall(key);

  // Need at least 50 samples to establish a pattern
  const totalSamples = Object.values(hourCounts).reduce(
    (sum, count) => sum + parseInt(count, 10),
    0
  );

  if (totalSamples < 50) {
    await redis.hincrby(key, currentHour.toString(), 1);
    return null;
  }

  // Calculate expected probability for this hour
  const hourCount = parseInt(hourCounts[currentHour.toString()] || '0', 10);
  const expectedProbability = hourCount / totalSamples;

  // If this hour is very unusual (< 1% of activity), flag it
  if (expectedProbability < 0.01 && totalSamples > 100) {
    return {
      id: `time_anomaly_${Date.now()}_${userId}`,
      type: 'unusual_activity_time',
      score: 1 - expectedProbability,
      baseline: expectedProbability,
      current: 1,
      deviation: 1 - expectedProbability,
      detectedAt: new Date(),
      context: {
        userId,
        hour: currentHour,
        historicalProbability: expectedProbability,
        totalSamples,
      },
    };
  }

  await redis.hincrby(key, currentHour.toString(), 1);
  return null;
}

/**
 * Detect velocity anomalies (too many actions too fast)
 */
export async function detectVelocityAnomaly(
  userId: string,
  action: string,
  windowSeconds = 60,
  maxCount = 100
): Promise<Anomaly | null> {
  const key = `velocity:${userId}:${action}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Add current action
  await redis.zadd(key, now.toString(), `${now}`);

  // Remove old entries
  await redis.zremrangebyscore(key, '-inf', windowStart.toString());

  // Count actions in window
  const count = await redis.zcard(key);

  // Set expiry
  await redis.expire(key, windowSeconds * 2);

  if (count > maxCount) {
    return {
      id: `velocity_anomaly_${Date.now()}_${userId}`,
      type: 'velocity_exceeded',
      score: count / maxCount,
      baseline: maxCount,
      current: count,
      deviation: (count - maxCount) / maxCount,
      detectedAt: new Date(),
      context: {
        userId,
        action,
        count,
        windowSeconds,
        maxCount,
      },
    };
  }

  return null;
}

/**
 * Detect geographic anomalies (impossible travel)
 */
export async function detectGeoAnomaly(
  userId: string,
  country: string,
  city?: string
): Promise<Anomaly | null> {
  const key = `user_geo:${userId}`;
  const lastLocation = await redis.hgetall(key);

  if (!lastLocation.country) {
    await redis.hset(key, {
      country,
      city: city || '',
      timestamp: Date.now().toString(),
    });
    await redis.expire(key, 86400); // 24 hours
    return null;
  }

  const lastTimestamp = parseInt(lastLocation.timestamp || '0', 10);
  const timeDiffHours = (Date.now() - lastTimestamp) / (1000 * 60 * 60);

  // If different country and less than 3 hours (impossible travel)
  if (lastLocation.country !== country && timeDiffHours < 3) {
    return {
      id: `geo_anomaly_${Date.now()}_${userId}`,
      type: 'impossible_travel',
      score: 1 - timeDiffHours / 3,
      baseline: 3, // Minimum hours expected between countries
      current: timeDiffHours,
      deviation: (3 - timeDiffHours) / 3,
      detectedAt: new Date(),
      context: {
        userId,
        previousCountry: lastLocation.country,
        currentCountry: country,
        timeDiffHours,
      },
    };
  }

  // Update location
  await redis.hset(key, {
    country,
    city: city || '',
    timestamp: Date.now().toString(),
  });
  await redis.expire(key, 86400);

  return null;
}
