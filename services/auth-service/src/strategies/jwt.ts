/**
 * JWT Strategy
 *
 * JWT token configuration and helpers.
 */

import type { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-change-in-production';

// Token expiration
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Register JWT plugin with Fastify
 */
export async function registerJwtStrategy(fastify: FastifyInstance): Promise<void> {
  // Warn if using default secrets
  if (
    process.env.NODE_ENV === 'production' &&
    (JWT_SECRET.includes('development') || REFRESH_SECRET.includes('development'))
  ) {
    console.error('⚠️  WARNING: Using development JWT secrets in production!');
    console.error('⚠️  Set JWT_SECRET and REFRESH_SECRET environment variables.');
  }

  // Register access token JWT
  await fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
    verify: {
      algorithms: ['HS256'],
    },
    decode: {
      complete: false,
    },
    // Add to request.user
    decoratorName: 'user',
  });

  // Register refresh token JWT with namespace
  await fastify.register(fastifyJwt, {
    secret: REFRESH_SECRET,
    sign: {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
    verify: {
      algorithms: ['HS256'],
    },
    namespace: 'refresh',
  });

  // Add helper to extract bearer token
  fastify.decorate('extractBearerToken', (authorization?: string): string | null => {
    if (!authorization) return null;
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }
    return parts[1];
  });
}

/**
 * Get JWT configuration
 */
export function getJwtConfig() {
  return {
    accessToken: {
      secret: JWT_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
    refreshToken: {
      secret: REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
  };
}

// Type augmentation
declare module 'fastify' {
  interface FastifyInstance {
    extractBearerToken: (authorization?: string) => string | null;
  }
}
