/**
 * Brute Force Attack Detection
 *
 * Detects and prevents brute force authentication attempts.
 */

import { redis, securityCache } from '../../lib/redis.js';
import type { Threat, ThreatLevel, ThreatType } from '../../types/index.js';

interface BruteForceConfig {
  maxAttempts: number;
  windowSeconds: number;
  lockoutDuration: number;
  escalationThresholds: {
    warning: number;
    elevated: number;
    critical: number;
  };
}

const defaultConfig: BruteForceConfig = {
  maxAttempts: 5,
  windowSeconds: 300, // 5 minutes
  lockoutDuration: 900, // 15 minutes
  escalationThresholds: {
    warning: 3,
    elevated: 5,
    critical: 10,
  },
};

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(
  identifier: string,
  type: 'ip' | 'user' | 'email',
  config: BruteForceConfig = defaultConfig
): Promise<{ blocked: boolean; attempts: number; threat?: Threat }> {
  const key = `brute_force:${type}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  // Add attempt
  await redis.zadd(key, now.toString(), `${now}`);

  // Remove old attempts
  await redis.zremrangebyscore(key, '-inf', windowStart.toString());

  // Count attempts
  const attempts = await redis.zcard(key);

  // Set expiry
  await redis.expire(key, config.windowSeconds * 2);

  // Check if blocked
  if (attempts >= config.maxAttempts) {
    // Block the identifier
    await securityCache.blockIP(
      identifier,
      config.lockoutDuration,
      'brute_force_lockout'
    );

    // Determine threat level
    let level: ThreatLevel;
    if (attempts >= config.escalationThresholds.critical) {
      level = 'critical' as ThreatLevel;
    } else if (attempts >= config.escalationThresholds.elevated) {
      level = 'high' as ThreatLevel;
    } else {
      level = 'medium' as ThreatLevel;
    }

    const threat: Threat = {
      id: `bf_${Date.now()}_${identifier}`,
      type: 'brute_force' as ThreatType,
      level,
      source: identifier,
      target: type === 'user' ? identifier : 'authentication_system',
      detectedAt: new Date(),
      description: `Brute force attack detected: ${attempts} failed attempts in ${config.windowSeconds}s`,
      indicators: [
        {
          type: 'pattern',
          value: `${attempts} failed attempts`,
          confidence: 0.95,
          context: `Window: ${config.windowSeconds}s`,
        },
      ],
      status: 'active',
      mitigationActions: [`Blocked ${type} for ${config.lockoutDuration}s`],
    };

    return { blocked: true, attempts, threat };
  }

  return { blocked: false, attempts };
}

/**
 * Record a successful login (reset counter)
 */
export async function recordSuccessfulLogin(
  identifier: string,
  type: 'ip' | 'user' | 'email'
): Promise<void> {
  const key = `brute_force:${type}:${identifier}`;
  await redis.del(key);
}

/**
 * Check if an identifier is currently blocked
 */
export async function isBlocked(identifier: string): Promise<boolean> {
  return securityCache.isIPBlocked(identifier);
}

/**
 * Get remaining lockout time
 */
export async function getLockoutTimeRemaining(identifier: string): Promise<number> {
  const ttl = await redis.ttl(`blocked:ip:${identifier}`);
  return ttl > 0 ? ttl : 0;
}

/**
 * Manually unblock an identifier
 */
export async function unblock(identifier: string): Promise<void> {
  await securityCache.unblockIP(identifier);
}

/**
 * Get attempt history for an identifier
 */
export async function getAttemptHistory(
  identifier: string,
  type: 'ip' | 'user' | 'email'
): Promise<{ timestamp: number }[]> {
  const key = `brute_force:${type}:${identifier}`;
  const attempts = await redis.zrange(key, 0, -1, 'WITHSCORES');

  const history: { timestamp: number }[] = [];
  for (let i = 0; i < attempts.length; i += 2) {
    const score = attempts[i + 1];
    if (score) {
      history.push({ timestamp: parseInt(score, 10) });
    }
  }

  return history;
}

/**
 * Detect distributed brute force attack
 * (Many IPs targeting same user)
 */
export async function detectDistributedAttack(
  targetUser: string,
  windowSeconds = 3600
): Promise<Threat | null> {
  const key = `distributed_bf:${targetUser}`;
  const ips = await redis.smembers(key);

  if (ips.length >= 10) {
    return {
      id: `dbf_${Date.now()}_${targetUser}`,
      type: 'brute_force' as ThreatType,
      level: 'critical' as ThreatLevel,
      source: 'multiple_ips',
      target: targetUser,
      detectedAt: new Date(),
      description: `Distributed brute force attack: ${ips.length} unique IPs targeting user`,
      indicators: ips.map((ip) => ({
        type: 'ip' as const,
        value: ip,
        confidence: 0.85,
      })),
      status: 'active',
    };
  }

  return null;
}

/**
 * Track IP in distributed attack detection
 */
export async function trackDistributedAttempt(
  targetUser: string,
  ipAddress: string,
  windowSeconds = 3600
): Promise<void> {
  const key = `distributed_bf:${targetUser}`;
  await redis.sadd(key, ipAddress);
  await redis.expire(key, windowSeconds);
}

/**
 * Detect credential stuffing (known breached credentials)
 */
export async function detectCredentialStuffing(
  ipAddress: string,
  windowSeconds = 300,
  threshold = 20
): Promise<Threat | null> {
  const key = `cred_stuff:${ipAddress}`;
  const uniqueUsers = await redis.scard(key);

  if (uniqueUsers >= threshold) {
    return {
      id: `cs_${Date.now()}_${ipAddress}`,
      type: 'credential_stuffing' as ThreatType,
      level: 'critical' as ThreatLevel,
      source: ipAddress,
      target: 'authentication_system',
      detectedAt: new Date(),
      description: `Credential stuffing detected: ${uniqueUsers} unique usernames from single IP`,
      indicators: [
        {
          type: 'ip' as const,
          value: ipAddress,
          confidence: 0.9,
          context: `${uniqueUsers} unique users attempted`,
        },
      ],
      status: 'active',
    };
  }

  return null;
}

/**
 * Track username for credential stuffing detection
 */
export async function trackCredentialStuffingAttempt(
  ipAddress: string,
  username: string,
  windowSeconds = 300
): Promise<void> {
  const key = `cred_stuff:${ipAddress}`;
  await redis.sadd(key, username);
  await redis.expire(key, windowSeconds);
}
