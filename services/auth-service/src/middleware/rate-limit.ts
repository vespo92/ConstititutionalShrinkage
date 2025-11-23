/**
 * Rate Limit Middleware
 *
 * Auth-specific rate limiting for security-sensitive endpoints.
 */

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { getRedis } from '../lib/redis.js';

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Key generator function */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Skip function - return true to skip rate limiting */
  skip?: (request: FastifyRequest) => boolean | Promise<boolean>;
  /** Custom error message */
  message?: string;
  /** Block duration in seconds (after exceeding limit) */
  blockDuration?: number;
}

/**
 * Default key generators
 */
export const keyGenerators = {
  /** Rate limit by IP address */
  byIp: (request: FastifyRequest) => {
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0] ||
      request.ip ||
      'unknown';
    return `ip:${ip}`;
  },

  /** Rate limit by user ID (if authenticated) */
  byUser: (request: FastifyRequest) => {
    const user = request.user;
    return user ? `user:${user.userId}` : keyGenerators.byIp(request);
  },

  /** Rate limit by email (from request body) */
  byEmail: (request: FastifyRequest) => {
    const body = request.body as { email?: string };
    return body?.email ? `email:${body.email.toLowerCase()}` : keyGenerators.byIp(request);
  },

  /** Combined IP + endpoint */
  byIpAndEndpoint: (request: FastifyRequest) => {
    const ip = keyGenerators.byIp(request);
    const endpoint = `${request.method}:${request.url.split('?')[0]}`;
    return `${ip}:${endpoint}`;
  },
};

/**
 * Create rate limit middleware
 */
export function createRateLimit(
  prefix: string,
  config: RateLimitConfig
) {
  const {
    max,
    windowSeconds,
    keyGenerator = keyGenerators.byIp,
    skip,
    message = 'Too many requests, please try again later',
    blockDuration,
  } = config;

  return async function rateLimitMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    // Check if should skip
    if (skip) {
      const shouldSkip = await skip(request);
      if (shouldSkip) return;
    }

    const redis = getRedis();
    const key = `ratelimit:${prefix}:${keyGenerator(request)}`;
    const blockKey = `ratelimit:block:${prefix}:${keyGenerator(request)}`;

    // Check if blocked
    if (blockDuration) {
      const blocked = await redis.get(blockKey);
      if (blocked) {
        const ttl = await redis.ttl(blockKey);
        reply
          .status(429)
          .header('Retry-After', ttl.toString())
          .send({
            error: 'Too Many Requests',
            message: 'You have been temporarily blocked due to too many requests',
            code: 'RATE_LIMITED_BLOCKED',
            retryAfter: ttl,
          });
        return;
      }
    }

    // Increment counter
    const current = await redis.incr(key);

    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Get TTL for headers
    const ttl = await redis.ttl(key);

    // Set rate limit headers
    reply.header('X-RateLimit-Limit', max.toString());
    reply.header('X-RateLimit-Remaining', Math.max(0, max - current).toString());
    reply.header('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());

    // Check if exceeded
    if (current > max) {
      // Block if configured
      if (blockDuration && current > max * 2) {
        await redis.setex(blockKey, blockDuration, '1');
      }

      reply
        .status(429)
        .header('Retry-After', ttl.toString())
        .send({
          error: 'Too Many Requests',
          message,
          code: 'RATE_LIMITED',
          retryAfter: ttl,
        });
      return;
    }
  };
}

// ============================================================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================================================

/**
 * Login rate limit: 5 attempts per 15 minutes per IP
 */
export const loginRateLimit = createRateLimit('login', {
  max: 5,
  windowSeconds: 15 * 60,
  keyGenerator: keyGenerators.byIp,
  message: 'Too many login attempts, please try again in 15 minutes',
  blockDuration: 30 * 60, // Block for 30 minutes after excessive attempts
});

/**
 * Registration rate limit: 3 per hour per IP
 */
export const registerRateLimit = createRateLimit('register', {
  max: 3,
  windowSeconds: 60 * 60,
  keyGenerator: keyGenerators.byIp,
  message: 'Too many registration attempts, please try again later',
});

/**
 * Password reset rate limit: 3 per hour per email
 */
export const passwordResetRateLimit = createRateLimit('password-reset', {
  max: 3,
  windowSeconds: 60 * 60,
  keyGenerator: keyGenerators.byEmail,
  message: 'Too many password reset requests, please try again later',
});

/**
 * OAuth rate limit: 10 per minute per IP
 */
export const oauthRateLimit = createRateLimit('oauth', {
  max: 10,
  windowSeconds: 60,
  keyGenerator: keyGenerators.byIp,
  message: 'Too many OAuth requests, please try again later',
});

/**
 * Token refresh rate limit: 30 per minute per user
 */
export const refreshRateLimit = createRateLimit('refresh', {
  max: 30,
  windowSeconds: 60,
  keyGenerator: keyGenerators.byIp,
  message: 'Too many refresh requests, please try again later',
});

/**
 * Email verification rate limit: 5 per hour per email
 */
export const emailVerificationRateLimit = createRateLimit('email-verify', {
  max: 5,
  windowSeconds: 60 * 60,
  keyGenerator: keyGenerators.byEmail,
  message: 'Too many verification requests, please try again later',
});

/**
 * General API rate limit: 100 per minute per IP
 */
export const generalApiRateLimit = createRateLimit('api', {
  max: 100,
  windowSeconds: 60,
  keyGenerator: keyGenerators.byIp,
  message: 'Rate limit exceeded, please slow down',
});

/**
 * Register rate limiters as Fastify decorators
 */
export function registerRateLimiters(fastify: FastifyInstance): void {
  fastify.decorate('loginRateLimit', loginRateLimit);
  fastify.decorate('registerRateLimit', registerRateLimit);
  fastify.decorate('passwordResetRateLimit', passwordResetRateLimit);
  fastify.decorate('oauthRateLimit', oauthRateLimit);
  fastify.decorate('refreshRateLimit', refreshRateLimit);
}

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    loginRateLimit: ReturnType<typeof createRateLimit>;
    registerRateLimit: ReturnType<typeof createRateLimit>;
    passwordResetRateLimit: ReturnType<typeof createRateLimit>;
    oauthRateLimit: ReturnType<typeof createRateLimit>;
    refreshRateLimit: ReturnType<typeof createRateLimit>;
  }
}
