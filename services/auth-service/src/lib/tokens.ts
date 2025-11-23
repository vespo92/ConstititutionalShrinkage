/**
 * Token Utilities
 *
 * JWT token generation, verification, and management.
 */

import type { FastifyInstance } from 'fastify';
import { randomBytes } from 'crypto';
import type {
  TokenPayload,
  RefreshTokenPayload,
  TokenPair,
  Session,
} from '../types/index.js';
import {
  storeSession,
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken as redisRevokeRefreshToken,
  revokeAllUserRefreshTokens,
  deleteSession,
  deleteAllUserSessions,
} from './redis.js';

// Token configuration
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Generate a unique token ID
 */
export function generateTokenId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate access and refresh token pair
 */
export async function generateTokens(
  fastify: FastifyInstance,
  payload: TokenPayload,
  options?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<TokenPair> {
  const tokenId = generateTokenId();

  // Generate access token
  const accessToken = fastify.jwt.sign(
    {
      userId: payload.userId,
      personId: payload.personId,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
      verificationLevel: payload.verificationLevel,
      votingPower: payload.votingPower,
      regions: payload.regions,
    },
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Generate refresh token with additional metadata
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenId,
    type: 'refresh',
    deviceInfo: options?.deviceInfo,
    ipAddress: options?.ipAddress,
  };

  // Use the refresh namespace for refresh tokens
  const refreshToken = (fastify as any).jwt.refresh.sign(refreshPayload, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Store refresh token in Redis
  await storeRefreshToken(tokenId, payload.userId, payload.personId);

  // Create session record
  const session: Session = {
    userId: payload.userId,
    personId: payload.personId,
    tokenId,
    deviceInfo: options?.deviceInfo || 'Unknown',
    ipAddress: options?.ipAddress || 'Unknown',
    userAgent: options?.userAgent,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_SECONDS * 1000),
    lastActivity: new Date(),
  };

  await storeSession(session);

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  };
}

/**
 * Verify access token
 */
export async function verifyAccessToken(
  fastify: FastifyInstance,
  token: string
): Promise<TokenPayload> {
  try {
    const decoded = fastify.jwt.verify<TokenPayload>(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  fastify: FastifyInstance,
  token: string
): Promise<RefreshTokenPayload> {
  try {
    // Verify JWT signature
    const decoded = (fastify as any).jwt.refresh.verify(token) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if token is still valid in Redis (not revoked)
    const isValid = await isRefreshTokenValid(decoded.tokenId);
    if (!isValid) {
      throw new Error('Token has been revoked');
    }

    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Refresh tokens (rotate refresh token)
 */
export async function refreshTokens(
  fastify: FastifyInstance,
  refreshToken: string,
  options?: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<TokenPair> {
  // Verify the current refresh token
  const decoded = await verifyRefreshToken(fastify, refreshToken);

  // Revoke the old refresh token (single-use)
  await redisRevokeRefreshToken(decoded.tokenId);
  await deleteSession(decoded.userId, decoded.tokenId);

  // Generate new token pair
  const payload: TokenPayload = {
    userId: decoded.userId,
    personId: decoded.personId,
    email: decoded.email,
    roles: decoded.roles,
    permissions: decoded.permissions,
    verificationLevel: decoded.verificationLevel,
    votingPower: decoded.votingPower,
    regions: decoded.regions,
  };

  return generateTokens(fastify, payload, options);
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(
  userId: string,
  tokenId: string
): Promise<void> {
  await redisRevokeRefreshToken(tokenId);
  await deleteSession(userId, tokenId);
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await revokeAllUserRefreshTokens(userId);
  await deleteAllUserSessions(userId);
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate OAuth state token
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generate nonce for OAuth PKCE
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64url');
}

/**
 * Decode token without verification (for logging, etc.)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = Buffer.from(parts[1], 'base64').toString();
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}
