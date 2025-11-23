/**
 * Advanced Rate Limiting
 *
 * Token bucket and sliding window rate limiting algorithms.
 */

import { redis } from '../../lib/redis.js';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix?: string; // Redis key prefix
  skipFailedRequests?: boolean; // Don't count failed requests
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  handler?: (identifier: string) => Promise<void>; // Custom handler when limit exceeded
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp
  retryAfter?: number; // Seconds until next request allowed
}

interface TokenBucketConfig {
  bucketSize: number; // Maximum tokens
  refillRate: number; // Tokens per second
  keyPrefix?: string;
}

interface SlidingWindowConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

// Default configurations for different endpoints
export const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints (strict)
  login: { windowMs: 60000, maxRequests: 5, keyPrefix: 'rl:login' },
  register: { windowMs: 3600000, maxRequests: 3, keyPrefix: 'rl:register' },
  passwordReset: { windowMs: 3600000, maxRequests: 5, keyPrefix: 'rl:pwreset' },

  // API endpoints (moderate)
  api: { windowMs: 60000, maxRequests: 100, keyPrefix: 'rl:api' },
  search: { windowMs: 60000, maxRequests: 30, keyPrefix: 'rl:search' },

  // Voting endpoints (strict with longer windows)
  vote: { windowMs: 60000, maxRequests: 20, keyPrefix: 'rl:vote' },
  delegate: { windowMs: 60000, maxRequests: 10, keyPrefix: 'rl:delegate' },

  // Admin endpoints (relaxed but monitored)
  admin: { windowMs: 60000, maxRequests: 60, keyPrefix: 'rl:admin' },

  // Public endpoints (generous)
  public: { windowMs: 60000, maxRequests: 200, keyPrefix: 'rl:public' },
};

/**
 * Fixed Window Rate Limiter
 * Simple counter-based rate limiting
 */
export async function fixedWindowLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rl'}:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
  const windowKey = `${key}:${windowStart}`;

  const multi = redis.multi();
  multi.incr(windowKey);
  multi.pexpire(windowKey, config.windowMs);
  const results = await multi.exec();

  const count = (results?.[0]?.[1] as number) || 0;
  const remaining = Math.max(0, config.maxRequests - count);
  const resetTime = windowStart + config.windowMs;

  if (count > config.maxRequests) {
    if (config.handler) {
      await config.handler(identifier);
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    };
  }

  return { allowed: true, remaining, resetTime };
}

/**
 * Sliding Window Rate Limiter
 * More accurate than fixed window
 */
export async function slidingWindowLimit(
  identifier: string,
  config: SlidingWindowConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rl:sw'}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Use sorted set with timestamps as scores
  const multi = redis.multi();
  multi.zremrangebyscore(key, '-inf', windowStart.toString());
  multi.zadd(key, now.toString(), `${now}:${Math.random()}`);
  multi.zcard(key);
  multi.pexpire(key, config.windowMs);
  const results = await multi.exec();

  const count = (results?.[2]?.[1] as number) || 0;
  const remaining = Math.max(0, config.maxRequests - count);
  const resetTime = now + config.windowMs;

  if (count > config.maxRequests) {
    // Get oldest request in window
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const oldestTime = oldest[1] ? parseInt(oldest[1], 10) : now;
    const retryAfter = Math.ceil((oldestTime + config.windowMs - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  return { allowed: true, remaining, resetTime };
}

/**
 * Token Bucket Rate Limiter
 * Allows bursts while enforcing average rate
 */
export async function tokenBucketLimit(
  identifier: string,
  config: TokenBucketConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rl:tb'}:${identifier}`;
  const now = Date.now();

  // Get current bucket state
  const state = await redis.hgetall(key);
  let tokens = state.tokens ? parseFloat(state.tokens) : config.bucketSize;
  const lastRefill = state.lastRefill ? parseInt(state.lastRefill, 10) : now;

  // Calculate token refill
  const timePassed = (now - lastRefill) / 1000; // seconds
  const refillAmount = timePassed * config.refillRate;
  tokens = Math.min(config.bucketSize, tokens + refillAmount);

  if (tokens >= 1) {
    // Consume a token
    tokens -= 1;

    await redis.hset(key, {
      tokens: tokens.toString(),
      lastRefill: now.toString(),
    });
    await redis.expire(key, Math.ceil(config.bucketSize / config.refillRate) * 2);

    return {
      allowed: true,
      remaining: Math.floor(tokens),
      resetTime: now + Math.ceil((config.bucketSize - tokens) / config.refillRate) * 1000,
    };
  }

  // Calculate when next token available
  const retryAfter = Math.ceil((1 - tokens) / config.refillRate);

  return {
    allowed: false,
    remaining: 0,
    resetTime: now + retryAfter * 1000,
    retryAfter,
  };
}

/**
 * Leaky Bucket Rate Limiter
 * Smooths out burst traffic
 */
export async function leakyBucketLimit(
  identifier: string,
  config: { bucketSize: number; leakRate: number; keyPrefix?: string }
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rl:lb'}:${identifier}`;
  const now = Date.now();

  const state = await redis.hgetall(key);
  let water = state.water ? parseFloat(state.water) : 0;
  const lastLeak = state.lastLeak ? parseInt(state.lastLeak, 10) : now;

  // Calculate water leaked since last request
  const timePassed = (now - lastLeak) / 1000;
  const leaked = timePassed * config.leakRate;
  water = Math.max(0, water - leaked);

  if (water < config.bucketSize) {
    // Add water (request)
    water += 1;

    await redis.hset(key, {
      water: water.toString(),
      lastLeak: now.toString(),
    });
    await redis.expire(key, Math.ceil(config.bucketSize / config.leakRate) * 2);

    return {
      allowed: true,
      remaining: Math.floor(config.bucketSize - water),
      resetTime: now + Math.ceil(water / config.leakRate) * 1000,
    };
  }

  // Bucket overflow
  const retryAfter = Math.ceil(1 / config.leakRate);

  return {
    allowed: false,
    remaining: 0,
    resetTime: now + retryAfter * 1000,
    retryAfter,
  };
}

/**
 * Adaptive Rate Limiter
 * Adjusts limits based on server load
 */
export async function adaptiveLimit(
  identifier: string,
  baseConfig: RateLimitConfig,
  loadFactor: number // 0.0 to 1.0 (1.0 = max load)
): Promise<RateLimitResult> {
  // Reduce limits as load increases
  const adjustedMax = Math.floor(baseConfig.maxRequests * (1 - loadFactor * 0.5));

  return fixedWindowLimit(identifier, {
    ...baseConfig,
    maxRequests: Math.max(1, adjustedMax),
  });
}

/**
 * Concurrent Request Limiter
 * Limits simultaneous requests
 */
export async function concurrentLimit(
  identifier: string,
  maxConcurrent: number
): Promise<{ allowed: boolean; acquire: () => Promise<void>; release: () => Promise<void> }> {
  const key = `concurrent:${identifier}`;

  const acquire = async (): Promise<void> => {
    await redis.incr(key);
    await redis.expire(key, 300); // 5 minute safety expiry
  };

  const release = async (): Promise<void> => {
    await redis.decr(key);
  };

  const current = await redis.get(key);
  const count = current ? parseInt(current, 10) : 0;

  return {
    allowed: count < maxConcurrent,
    acquire,
    release,
  };
}

/**
 * Get rate limit status for an identifier
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string
): Promise<{
  endpoint: string;
  current: number;
  limit: number;
  remaining: number;
  resetTime: number;
}> {
  const config = DEFAULT_LIMITS[endpoint] || DEFAULT_LIMITS.api!;
  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
  const windowKey = `${key}:${windowStart}`;

  const current = (await redis.get(windowKey)) || '0';
  const count = parseInt(current, 10);

  return {
    endpoint,
    current: count,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    resetTime: windowStart + config.windowMs,
  };
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(
  identifier: string,
  endpoint?: string
): Promise<void> {
  if (endpoint) {
    const config = DEFAULT_LIMITS[endpoint];
    if (config) {
      const pattern = `${config.keyPrefix}:${identifier}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } else {
    // Reset all rate limits for identifier
    const pattern = `rl:*:${identifier}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

/**
 * Create a rate limiter middleware configuration
 */
export function createRateLimiter(options: Partial<RateLimitConfig>): RateLimitConfig {
  return {
    windowMs: options.windowMs || 60000,
    maxRequests: options.maxRequests || 100,
    keyPrefix: options.keyPrefix || 'rl:custom',
    skipFailedRequests: options.skipFailedRequests || false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: options.handler,
  };
}
