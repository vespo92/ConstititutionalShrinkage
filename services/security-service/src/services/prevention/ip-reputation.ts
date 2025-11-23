/**
 * IP Reputation Service
 *
 * Tracks and evaluates IP address reputation for security decisions.
 */

import type { IPReputation } from '../../types/index.js';
import { redis } from '../../lib/redis.js';

// Local reputation scores (before external lookup)
const LOCAL_REPUTATION_TTL = 3600; // 1 hour cache
const REPUTATION_DECAY_RATE = 0.1; // Score decay per hour

// Known bad IP ranges (example - in production would use threat feeds)
const KNOWN_BAD_RANGES = [
  // Example ranges - not real malicious IPs
  // These would come from threat intelligence feeds
];

// Datacenter/hosting provider ranges (legitimate but suspicious for some activities)
const DATACENTER_INDICATORS = [
  'amazon', 'google', 'microsoft', 'digitalocean', 'linode', 'vultr',
  'ovh', 'hetzner', 'hostwinds', 'contabo',
];

interface ReputationUpdate {
  type: 'positive' | 'negative';
  reason: string;
  weight: number;
}

/**
 * Get IP reputation
 */
export async function getReputation(ipAddress: string): Promise<IPReputation> {
  const cacheKey = `ip:rep:${ipAddress}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // Create base reputation
  const reputation = await buildReputation(ipAddress);

  // Cache it
  await redis.setex(cacheKey, LOCAL_REPUTATION_TTL, JSON.stringify(reputation));

  return reputation;
}

/**
 * Build reputation from multiple sources
 */
async function buildReputation(ipAddress: string): Promise<IPReputation> {
  const reputation: IPReputation = {
    ipAddress,
    score: 0,
    categories: [],
    lastSeen: new Date(),
    reportCount: 0,
    abuseConfidence: 0,
    isProxy: false,
    isVPN: false,
    isTor: false,
    isDatacenter: false,
  };

  // Check local history
  const localHistory = await getLocalHistory(ipAddress);
  reputation.score += localHistory.score;
  reputation.reportCount = localHistory.reports;

  if (localHistory.categories.length > 0) {
    reputation.categories.push(...localHistory.categories);
  }

  // Check against known bad ranges
  for (const range of KNOWN_BAD_RANGES) {
    if (isInRange(ipAddress, range)) {
      reputation.score += 50;
      reputation.categories.push('known_malicious');
    }
  }

  // Check for datacenter IPs (simplified - real implementation would use IP database)
  const reverseDns = await getReverseDns(ipAddress);
  if (reverseDns) {
    const lowerDns = reverseDns.toLowerCase();
    for (const indicator of DATACENTER_INDICATORS) {
      if (lowerDns.includes(indicator)) {
        reputation.isDatacenter = true;
        reputation.categories.push('datacenter');
        reputation.score += 10;
        break;
      }
    }
  }

  // Check recent activity patterns
  const activityScore = await checkActivityPatterns(ipAddress);
  reputation.score += activityScore;

  // Normalize score to 0-100
  reputation.score = Math.min(100, Math.max(0, reputation.score));

  // Calculate abuse confidence based on score and reports
  reputation.abuseConfidence = Math.min(100,
    (reputation.score * 0.7) + (reputation.reportCount * 5)
  );

  return reputation;
}

/**
 * Get local reputation history
 */
async function getLocalHistory(ipAddress: string): Promise<{
  score: number;
  reports: number;
  categories: string[];
}> {
  const key = `ip:history:${ipAddress}`;
  const history = await redis.hgetall(key);

  return {
    score: history.score ? parseFloat(history.score) : 0,
    reports: history.reports ? parseInt(history.reports, 10) : 0,
    categories: history.categories ? JSON.parse(history.categories) : [],
  };
}

/**
 * Update IP reputation based on behavior
 */
export async function updateReputation(
  ipAddress: string,
  update: ReputationUpdate
): Promise<void> {
  const key = `ip:history:${ipAddress}`;
  const scoreChange = update.type === 'negative' ? update.weight : -update.weight;

  await redis.hincrbyfloat(key, 'score', scoreChange);

  if (update.type === 'negative') {
    await redis.hincrby(key, 'reports', 1);
  }

  // Add category if new
  const categories = await redis.hget(key, 'categories');
  const categoryList = categories ? JSON.parse(categories) : [];
  if (!categoryList.includes(update.reason)) {
    categoryList.push(update.reason);
    await redis.hset(key, 'categories', JSON.stringify(categoryList));
  }

  // Update last seen
  await redis.hset(key, 'lastSeen', Date.now().toString());

  // Set expiry (keep for 30 days)
  await redis.expire(key, 86400 * 30);

  // Invalidate cache
  await redis.del(`ip:rep:${ipAddress}`);
}

/**
 * Report an IP for malicious activity
 */
export async function reportIP(
  ipAddress: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<void> {
  const weights = { low: 5, medium: 15, high: 30, critical: 50 };

  await updateReputation(ipAddress, {
    type: 'negative',
    reason,
    weight: weights[severity],
  });

  // Log the report
  await redis.lpush(
    `ip:reports:${ipAddress}`,
    JSON.stringify({
      reason,
      severity,
      timestamp: new Date().toISOString(),
    })
  );
  await redis.ltrim(`ip:reports:${ipAddress}`, 0, 99);
  await redis.expire(`ip:reports:${ipAddress}`, 86400 * 30);
}

/**
 * Get IP reports
 */
export async function getReports(
  ipAddress: string
): Promise<Array<{ reason: string; severity: string; timestamp: string }>> {
  const reports = await redis.lrange(`ip:reports:${ipAddress}`, 0, -1);
  return reports.map((r) => JSON.parse(r));
}

/**
 * Check if IP should be blocked based on reputation
 */
export async function shouldBlock(
  ipAddress: string,
  threshold = 70
): Promise<boolean> {
  const reputation = await getReputation(ipAddress);
  return reputation.score >= threshold;
}

/**
 * Check if IP is in a CIDR range
 */
function isInRange(ip: string, range: string): boolean {
  // Simplified check - real implementation would use proper CIDR matching
  const [rangeIp, bits] = range.split('/');
  if (!rangeIp || !bits) return false;

  const ipParts = ip.split('.').map(Number);
  const rangeParts = rangeIp.split('.').map(Number);
  const maskBits = parseInt(bits, 10);

  // Convert to 32-bit integers
  const ipNum =
    ((ipParts[0] ?? 0) << 24) |
    ((ipParts[1] ?? 0) << 16) |
    ((ipParts[2] ?? 0) << 8) |
    (ipParts[3] ?? 0);
  const rangeNum =
    ((rangeParts[0] ?? 0) << 24) |
    ((rangeParts[1] ?? 0) << 16) |
    ((rangeParts[2] ?? 0) << 8) |
    (rangeParts[3] ?? 0);
  const mask = (-1 << (32 - maskBits)) >>> 0;

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Simplified reverse DNS lookup
 */
async function getReverseDns(_ip: string): Promise<string | null> {
  // In production, would do actual DNS lookup
  // For now, return null (no reverse DNS)
  return null;
}

/**
 * Check activity patterns for anomalies
 */
async function checkActivityPatterns(ipAddress: string): Promise<number> {
  let score = 0;

  // Check recent request count
  const requestCount = await redis.get(`ip:requests:${ipAddress}`);
  if (requestCount && parseInt(requestCount, 10) > 1000) {
    score += 20;
  }

  // Check failed auth attempts
  const failedAuth = await redis.get(`brute_force:ip:${ipAddress}`);
  if (failedAuth) {
    score += Math.min(30, parseInt(failedAuth, 10) * 5);
  }

  // Check WAF blocks
  const wafBlocks = await redis.get(`waf:blocked:${ipAddress}`);
  if (wafBlocks) {
    score += Math.min(40, parseInt(wafBlocks, 10) * 10);
  }

  return score;
}

/**
 * Get top malicious IPs
 */
export async function getTopMaliciousIPs(limit = 20): Promise<IPReputation[]> {
  // Scan for all IP history keys
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [newCursor, foundKeys] = await redis.scan(
      cursor,
      'MATCH',
      'ip:history:*',
      'COUNT',
      100
    );
    cursor = newCursor;
    keys.push(...foundKeys);
  } while (cursor !== '0' && keys.length < 1000);

  // Get scores for each
  const ipsWithScores: Array<{ ip: string; score: number }> = [];

  for (const key of keys) {
    const score = await redis.hget(key, 'score');
    if (score) {
      const ip = key.replace('ip:history:', '');
      ipsWithScores.push({ ip, score: parseFloat(score) });
    }
  }

  // Sort by score and get top N
  ipsWithScores.sort((a, b) => b.score - a.score);
  const topIPs = ipsWithScores.slice(0, limit);

  // Fetch full reputation for each
  return Promise.all(topIPs.map((item) => getReputation(item.ip)));
}

/**
 * Whitelist an IP
 */
export async function whitelistIP(
  ipAddress: string,
  reason: string,
  duration?: number
): Promise<void> {
  const key = `ip:whitelist:${ipAddress}`;
  const data = JSON.stringify({ reason, addedAt: new Date().toISOString() });

  if (duration) {
    await redis.setex(key, duration, data);
  } else {
    await redis.set(key, data);
  }

  // Clear negative reputation
  await redis.del(`ip:history:${ipAddress}`);
  await redis.del(`ip:rep:${ipAddress}`);
}

/**
 * Check if IP is whitelisted
 */
export async function isWhitelisted(ipAddress: string): Promise<boolean> {
  return (await redis.exists(`ip:whitelist:${ipAddress}`)) === 1;
}

/**
 * Decay old reputation scores
 */
export async function decayReputations(): Promise<number> {
  let processed = 0;
  let cursor = '0';

  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'ip:history:*',
      'COUNT',
      100
    );
    cursor = newCursor;

    for (const key of keys) {
      const score = await redis.hget(key, 'score');
      if (score) {
        const currentScore = parseFloat(score);
        if (currentScore > 0) {
          const newScore = Math.max(0, currentScore - REPUTATION_DECAY_RATE);
          await redis.hset(key, 'score', newScore.toString());
          processed++;
        }
      }
    }
  } while (cursor !== '0');

  return processed;
}
