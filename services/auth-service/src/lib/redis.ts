/**
 * Redis Client
 *
 * Session storage, token blacklisting, and rate limiting.
 */

import Redis from 'ioredis';
import type { Session } from '../types/index.js';

// Redis client singleton
let redis: Redis | null = null;

/**
 * Get or create Redis client
 */
export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_AUTH_DB || '1'),
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    redis.on('connect', () => {
      console.log('✓ Redis connected');
    });
  }

  return redis;
}

/**
 * Disconnect Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('✓ Redis disconnected');
  }
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedis();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const SESSION_PREFIX = 'session:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Store a session
 */
export async function storeSession(session: Session): Promise<void> {
  const client = getRedis();
  const key = `${SESSION_PREFIX}${session.userId}:${session.tokenId}`;
  await client.setex(key, SESSION_TTL, JSON.stringify(session));
}

/**
 * Get a session
 */
export async function getSession(
  userId: string,
  tokenId: string
): Promise<Session | null> {
  const client = getRedis();
  const key = `${SESSION_PREFIX}${userId}:${tokenId}`;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Delete a session
 */
export async function deleteSession(
  userId: string,
  tokenId: string
): Promise<void> {
  const client = getRedis();
  const key = `${SESSION_PREFIX}${userId}:${tokenId}`;
  await client.del(key);
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const client = getRedis();
  const pattern = `${SESSION_PREFIX}${userId}:*`;
  const keys = await client.keys(pattern);

  if (keys.length === 0) return [];

  const values = await client.mget(keys);
  return values
    .filter((v): v is string => v !== null)
    .map((v) => JSON.parse(v) as Session);
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  const client = getRedis();
  const pattern = `${SESSION_PREFIX}${userId}:*`;
  const keys = await client.keys(pattern);

  if (keys.length === 0) return 0;

  return await client.del(...keys);
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(
  userId: string,
  tokenId: string
): Promise<void> {
  const session = await getSession(userId, tokenId);
  if (session) {
    session.lastActivity = new Date();
    await storeSession(session);
  }
}

// ============================================================================
// REFRESH TOKEN MANAGEMENT
// ============================================================================

const REFRESH_TOKEN_PREFIX = 'refresh:';

/**
 * Store refresh token
 */
export async function storeRefreshToken(
  tokenId: string,
  userId: string,
  personId: string
): Promise<void> {
  const client = getRedis();
  const key = `${REFRESH_TOKEN_PREFIX}${tokenId}`;
  await client.setex(
    key,
    SESSION_TTL,
    JSON.stringify({ userId, personId, createdAt: Date.now() })
  );
}

/**
 * Check if refresh token is valid
 */
export async function isRefreshTokenValid(tokenId: string): Promise<boolean> {
  const client = getRedis();
  const key = `${REFRESH_TOKEN_PREFIX}${tokenId}`;
  const exists = await client.exists(key);
  return exists === 1;
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(tokenId: string): Promise<void> {
  const client = getRedis();
  const key = `${REFRESH_TOKEN_PREFIX}${tokenId}`;
  await client.del(key);
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<number> {
  const client = getRedis();
  // We need to scan for tokens belonging to this user
  // This is less efficient but necessary for security
  const pattern = `${REFRESH_TOKEN_PREFIX}*`;
  const keys = await client.keys(pattern);

  let revokedCount = 0;
  for (const key of keys) {
    const data = await client.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.userId === userId) {
        await client.del(key);
        revokedCount++;
      }
    }
  }

  return revokedCount;
}

// ============================================================================
// VERIFICATION TOKENS
// ============================================================================

const EMAIL_VERIFY_PREFIX = 'email-verify:';
const PASSWORD_RESET_PREFIX = 'password-reset:';
const OAUTH_STATE_PREFIX = 'oauth-state:';

/**
 * Store email verification token
 */
export async function storeEmailVerificationToken(
  token: string,
  userId: string,
  email: string
): Promise<void> {
  const client = getRedis();
  const key = `${EMAIL_VERIFY_PREFIX}${token}`;
  await client.setex(
    key,
    24 * 60 * 60, // 24 hours
    JSON.stringify({ userId, email, createdAt: Date.now() })
  );
}

/**
 * Verify and consume email verification token
 */
export async function verifyEmailToken(
  token: string
): Promise<{ userId: string; email: string } | null> {
  const client = getRedis();
  const key = `${EMAIL_VERIFY_PREFIX}${token}`;
  const data = await client.get(key);

  if (!data) return null;

  // Delete after use (single-use)
  await client.del(key);
  return JSON.parse(data);
}

/**
 * Store password reset token
 */
export async function storePasswordResetToken(
  token: string,
  userId: string
): Promise<void> {
  const client = getRedis();
  const key = `${PASSWORD_RESET_PREFIX}${token}`;
  await client.setex(
    key,
    60 * 60, // 1 hour
    JSON.stringify({ userId, createdAt: Date.now() })
  );
}

/**
 * Verify and consume password reset token
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<string | null> {
  const client = getRedis();
  const key = `${PASSWORD_RESET_PREFIX}${token}`;
  const data = await client.get(key);

  if (!data) return null;

  // Delete after use (single-use)
  await client.del(key);
  return JSON.parse(data).userId;
}

/**
 * Store OAuth state
 */
export async function storeOAuthState(
  state: string,
  data: { provider: string; returnUrl?: string; nonce: string }
): Promise<void> {
  const client = getRedis();
  const key = `${OAUTH_STATE_PREFIX}${state}`;
  await client.setex(
    key,
    10 * 60, // 10 minutes
    JSON.stringify({ ...data, createdAt: Date.now() })
  );
}

/**
 * Verify and consume OAuth state
 */
export async function verifyOAuthState(
  state: string
): Promise<{ provider: string; returnUrl?: string; nonce: string } | null> {
  const client = getRedis();
  const key = `${OAUTH_STATE_PREFIX}${state}`;
  const data = await client.get(key);

  if (!data) return null;

  // Delete after use (single-use)
  await client.del(key);
  return JSON.parse(data);
}

export default getRedis;
