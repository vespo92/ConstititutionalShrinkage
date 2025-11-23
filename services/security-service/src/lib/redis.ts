/**
 * Redis Client for Security Service
 *
 * Used for caching, rate limiting, and real-time threat data.
 */

import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}

// Security-specific Redis operations
export const securityCache = {
  // IP reputation cache
  async getIPReputation(ip: string): Promise<string | null> {
    return redis.get(`ip:reputation:${ip}`);
  },

  async setIPReputation(ip: string, data: string, ttl = 3600): Promise<void> {
    await redis.setex(`ip:reputation:${ip}`, ttl, data);
  },

  // Threat indicators
  async addThreatIndicator(type: string, value: string): Promise<void> {
    await redis.sadd(`threat:indicators:${type}`, value);
  },

  async isThreatIndicator(type: string, value: string): Promise<boolean> {
    return (await redis.sismember(`threat:indicators:${type}`, value)) === 1;
  },

  // Rate limiting counters
  async incrementCounter(key: string, window: number): Promise<number> {
    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, window);
    const results = await multi.exec();
    return results?.[0]?.[1] as number ?? 0;
  },

  async getCounter(key: string): Promise<number> {
    const value = await redis.get(key);
    return value ? parseInt(value, 10) : 0;
  },

  // Blocked IPs
  async blockIP(ip: string, duration: number, reason: string): Promise<void> {
    await redis.setex(`blocked:ip:${ip}`, duration, reason);
  },

  async isIPBlocked(ip: string): Promise<boolean> {
    return (await redis.exists(`blocked:ip:${ip}`)) === 1;
  },

  async unblockIP(ip: string): Promise<void> {
    await redis.del(`blocked:ip:${ip}`);
  },

  // Session tracking
  async trackSession(sessionId: string, userId: string, ttl: number): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttl, userId);
    await redis.sadd(`user:sessions:${userId}`, sessionId);
  },

  async invalidateSession(sessionId: string): Promise<void> {
    const userId = await redis.get(`session:${sessionId}`);
    if (userId) {
      await redis.srem(`user:sessions:${userId}`, sessionId);
    }
    await redis.del(`session:${sessionId}`);
  },

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessions = await redis.smembers(`user:sessions:${userId}`);
    if (sessions.length > 0) {
      await redis.del(...sessions.map((s) => `session:${s}`));
    }
    await redis.del(`user:sessions:${userId}`);
  },
};
