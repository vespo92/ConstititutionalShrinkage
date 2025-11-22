/**
 * Authentication Middleware
 *
 * JWT-based authentication for protected routes.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email: string;
  verificationLevel: string;
  votingPower: number;
  regions: string[];
  roles: string[];
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export function authMiddleware(fastify: FastifyInstance) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const decoded = await request.jwtVerify<AuthenticatedUser>();
      request.user = decoded;
    } catch (err) {
      reply.status(401).send({
        code: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token, but populates user if present
 */
export function optionalAuthMiddleware(fastify: FastifyInstance) {
  return async function optionalAuth(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    try {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const decoded = await request.jwtVerify<AuthenticatedUser>();
        request.user = decoded;
      }
    } catch {
      // Silently ignore auth errors for optional auth
      request.user = undefined;
    }
  };
}

/**
 * Require specific verification level
 */
export function requireVerificationLevel(minLevel: string) {
  const levels = ['NONE', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'DOCUMENT_VERIFIED', 'FULL_KYC', 'GOVERNMENT_VERIFIED'];

  return async function checkVerification(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        code: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userLevelIndex = levels.indexOf(request.user.verificationLevel);
    const requiredLevelIndex = levels.indexOf(minLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return reply.status(403).send({
        code: 403,
        error: 'Forbidden',
        message: `This action requires ${minLevel} verification level`,
        currentLevel: request.user.verificationLevel,
        requiredLevel: minLevel,
      });
    }
  };
}

/**
 * Require user to be in a specific region
 */
export function requireRegion(regionParam: string = 'regionId') {
  return async function checkRegion(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      return reply.status(401).send({
        code: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const regionId = (request.params as Record<string, string>)[regionParam];
    if (regionId && !request.user.regions.includes(regionId)) {
      return reply.status(403).send({
        code: 403,
        error: 'Forbidden',
        message: 'You do not have access to this region',
        userRegions: request.user.regions,
        requestedRegion: regionId,
      });
    }
  };
}
