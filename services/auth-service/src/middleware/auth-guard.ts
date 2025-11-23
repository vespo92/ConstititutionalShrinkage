/**
 * Auth Guard Middleware
 *
 * Protects routes by verifying JWT access tokens.
 */

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { TokenPayload, VerificationLevel } from '../types/index.js';
import { extractBearerToken } from '../lib/tokens.js';
import { updateSessionActivity } from '../lib/redis.js';

export interface AuthGuardOptions {
  /** Require a specific verification level */
  requireVerification?: VerificationLevel;
  /** Allow unverified users */
  allowUnverified?: boolean;
  /** Optional - skip auth (for public routes with optional auth) */
  optional?: boolean;
}

/**
 * Create the auth guard preHandler
 */
export function createAuthGuard(options: AuthGuardOptions = {}) {
  return async function authGuard(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract token from header
      const token = extractBearerToken(request.headers.authorization);

      if (!token) {
        if (options.optional) {
          return; // Continue without user
        }
        reply.status(401).send({
          error: 'Unauthorized',
          message: 'No authorization token provided',
          code: 'NO_TOKEN',
        });
        return;
      }

      // Verify the token
      const payload = await request.jwtVerify<TokenPayload>();
      request.user = payload;

      // Check verification level if required
      if (options.requireVerification && !options.allowUnverified) {
        const levelOrder: VerificationLevel[] = [
          'UNVERIFIED',
          'EMAIL_VERIFIED',
          'ID_VERIFIED',
          'BIOMETRIC',
          'FULL_KYC',
        ];

        const requiredIndex = levelOrder.indexOf(options.requireVerification);
        const currentIndex = levelOrder.indexOf(
          payload.verificationLevel as VerificationLevel
        );

        if (currentIndex < requiredIndex) {
          reply.status(403).send({
            error: 'Forbidden',
            message: `This action requires ${options.requireVerification} verification level`,
            code: 'INSUFFICIENT_VERIFICATION',
            required: options.requireVerification,
            current: payload.verificationLevel,
          });
          return;
        }
      }

      // Update session activity (non-blocking)
      updateSessionActivity(payload.userId, 'activity').catch(() => {
        // Silently fail - not critical
      });
    } catch (error) {
      if (options.optional) {
        return; // Continue without user on optional routes
      }

      const message =
        error instanceof Error ? error.message : 'Invalid token';

      reply.status(401).send({
        error: 'Unauthorized',
        message,
        code: 'INVALID_TOKEN',
      });
    }
  };
}

/**
 * Standard auth guard - requires valid token
 */
export const authGuard = createAuthGuard();

/**
 * Optional auth guard - sets user if token present, continues if not
 */
export const optionalAuthGuard = createAuthGuard({ optional: true });

/**
 * Auth guard requiring email verification
 */
export const emailVerifiedGuard = createAuthGuard({
  requireVerification: 'EMAIL_VERIFIED' as VerificationLevel,
});

/**
 * Auth guard requiring ID verification
 */
export const idVerifiedGuard = createAuthGuard({
  requireVerification: 'ID_VERIFIED' as VerificationLevel,
});

/**
 * Auth guard requiring full KYC
 */
export const fullKycGuard = createAuthGuard({
  requireVerification: 'FULL_KYC' as VerificationLevel,
});

/**
 * Register auth guard as a Fastify decorator
 */
export function registerAuthGuard(fastify: FastifyInstance): void {
  fastify.decorate('authGuard', authGuard);
  fastify.decorate('optionalAuthGuard', optionalAuthGuard);
  fastify.decorate('emailVerifiedGuard', emailVerifiedGuard);
  fastify.decorate('idVerifiedGuard', idVerifiedGuard);
  fastify.decorate('fullKycGuard', fullKycGuard);
}

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authGuard: ReturnType<typeof createAuthGuard>;
    optionalAuthGuard: ReturnType<typeof createAuthGuard>;
    emailVerifiedGuard: ReturnType<typeof createAuthGuard>;
    idVerifiedGuard: ReturnType<typeof createAuthGuard>;
    fullKycGuard: ReturnType<typeof createAuthGuard>;
  }
}
