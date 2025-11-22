/**
 * Token Utilities
 *
 * JWT token generation, verification, and management.
 */

import type { FastifyInstance } from 'fastify';
import Redis from 'ioredis';

// Redis client for token blacklist
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '1'), // Different DB for auth
    });
  }
  return redis;
}

export interface TokenPayload {
  id: string;
  email: string;
  verificationLevel: string;
  votingPower: number;
  regions: string[];
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh token pair
 */
export async function generateTokens(
  fastify: FastifyInstance,
  payload: TokenPayload
): Promise<TokenPair> {
  // Access token - short lived
  const accessToken = fastify.jwt.sign(payload, {
    expiresIn: '15m',
  });

  // Refresh token - longer lived, includes token ID for revocation
  const tokenId = `${payload.id}-${Date.now()}`;
  const refreshPayload = {
    ...payload,
    tokenId,
    type: 'refresh',
  };

  // Use the refresh namespace
  const refreshToken = (fastify as any).jwt.refresh.sign(refreshPayload, {
    expiresIn: '7d',
  });

  // Store valid refresh token ID in Redis
  const client = getRedis();
  await client.setex(
    `refresh:${tokenId}`,
    7 * 24 * 60 * 60, // 7 days in seconds
    JSON.stringify({ userId: payload.id, createdAt: Date.now() })
  );

  return { accessToken, refreshToken };
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  fastify: FastifyInstance,
  token: string
): Promise<TokenPayload> {
  // Verify JWT signature
  const decoded = (fastify as any).jwt.refresh.verify(token) as TokenPayload & {
    tokenId: string;
    type: string;
  };

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  // Check if token is in valid list (not revoked)
  const client = getRedis();
  const stored = await client.get(`refresh:${decoded.tokenId}`);

  if (!stored) {
    throw new Error('Token has been revoked');
  }

  return {
    id: decoded.id,
    email: decoded.email,
    verificationLevel: decoded.verificationLevel,
    votingPower: decoded.votingPower,
    regions: decoded.regions,
    roles: decoded.roles,
  };
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    // Decode without verifying (we're revoking anyway)
    const parts = token.split('.');
    if (parts.length !== 3) return;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    if (payload.tokenId) {
      const client = getRedis();
      await client.del(`refresh:${payload.tokenId}`);
    }
  } catch {
    // Ignore errors during revocation
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const client = getRedis();
  const keys = await client.keys(`refresh:${userId}-*`);

  if (keys.length > 0) {
    await client.del(...keys);
  }
}

/**
 * Generate email verification token
 */
export function generateVerificationToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'email_verification',
    timestamp: Date.now(),
  };

  // Simple base64 encoding with signature
  // In production, use a proper signed token
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * Verify email verification token
 */
export function verifyVerificationToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString());

    if (payload.type !== 'email_verification') {
      return null;
    }

    // Check expiration (24 hours)
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = `reset-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Store in Redis with 1 hour expiration
  const client = getRedis();
  await client.setex(`password-reset:${token}`, 3600, userId);

  return token;
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const client = getRedis();
  const userId = await client.get(`password-reset:${token}`);

  if (!userId) {
    return null;
  }

  // Invalidate token after use
  await client.del(`password-reset:${token}`);

  return userId;
}

/**
 * Generate phone verification code
 */
export async function generatePhoneVerificationCode(userId: string, phone: string): Promise<string> {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in Redis with 10 minute expiration
  const client = getRedis();
  await client.setex(
    `phone-verify:${userId}`,
    600, // 10 minutes
    JSON.stringify({ code, phone })
  );

  return code;
}

/**
 * Verify phone verification code
 */
export async function verifyPhoneCode(userId: string, code: string): Promise<boolean> {
  const client = getRedis();
  const stored = await client.get(`phone-verify:${userId}`);

  if (!stored) {
    return false;
  }

  const { code: storedCode } = JSON.parse(stored);

  if (code !== storedCode) {
    return false;
  }

  // Invalidate code after use
  await client.del(`phone-verify:${userId}`);

  return true;
}
