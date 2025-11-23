/**
 * Verification Routes
 *
 * User verification status and progression endpoints.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import type { TokenPayload, VerificationStatus } from '../types/index.js';

const VERIFICATION_LEVELS = [
  'UNVERIFIED',
  'EMAIL_VERIFIED',
  'ID_VERIFIED',
  'BIOMETRIC',
  'FULL_KYC',
] as const;

export async function verificationRoutes(fastify: FastifyInstance): Promise<void> {
  // Auth guard middleware
  const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
  };

  /**
   * GET /users/me/verification - Get verification status
   */
  fastify.get(
    '/me/verification',
    {
      schema: {
        tags: ['Users', 'Verification'],
        summary: 'Get current verification status',
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user as TokenPayload;

      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        throw new Error('User not found');
      }

      const metadata = person.metadata as {
        emailVerified?: boolean;
        phoneVerified?: boolean;
        idVerified?: boolean;
        biometricVerified?: boolean;
      };

      const currentLevelIndex = VERIFICATION_LEVELS.indexOf(
        person.verificationLevel as typeof VERIFICATION_LEVELS[number]
      );
      const nextLevel = VERIFICATION_LEVELS[currentLevelIndex + 1];

      const requirements: string[] = [];
      if (!metadata.emailVerified) requirements.push('Verify email address');
      if (!metadata.phoneVerified) requirements.push('Verify phone number (optional)');
      if (!metadata.idVerified) requirements.push('Complete ID verification');
      if (!metadata.biometricVerified) requirements.push('Complete biometric verification');

      const status: VerificationStatus = {
        currentLevel: person.verificationLevel,
        emailVerified: metadata.emailVerified || false,
        phoneVerified: metadata.phoneVerified || false,
        idVerified: metadata.idVerified || false,
        biometricVerified: metadata.biometricVerified || false,
        nextLevel,
        requirements: requirements.slice(0, 3),
      };

      return status;
    }
  );

  /**
   * POST /users/me/verification - Start verification process
   */
  fastify.post<{
    Body: { type: 'email' | 'phone' | 'id' | 'biometric' };
  }>(
    '/me/verification',
    {
      schema: {
        tags: ['Users', 'Verification'],
        summary: 'Start verification process',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              type: 'string',
              enum: ['email', 'phone', 'id', 'biometric'],
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const user = request.user as TokenPayload;
      const { type } = request.body;

      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        throw new Error('User not found');
      }

      switch (type) {
        case 'email':
          // Email verification is handled by auth service
          return {
            message: 'Please use /auth/resend-verification to send verification email',
            type: 'email',
            redirect: '/auth/resend-verification',
          };

        case 'phone':
          // Phone verification - placeholder for SMS service integration
          return {
            message: 'Phone verification is coming soon',
            type: 'phone',
            status: 'pending_implementation',
          };

        case 'id':
          // ID verification - placeholder for identity verification service
          return {
            message: 'ID verification requires uploading government-issued ID',
            type: 'id',
            status: 'pending_implementation',
            requirements: [
              'Government-issued photo ID',
              'Clear, unobstructed photo',
              'ID must not be expired',
            ],
          };

        case 'biometric':
          // Biometric verification - placeholder
          const metadata = person.metadata as { idVerified?: boolean };
          if (!metadata.idVerified) {
            reply.status(400).send({
              error: 'ID verification required first',
              code: 'PREREQUISITE_NOT_MET',
            });
            return;
          }

          return {
            message: 'Biometric verification requires completing a liveness check',
            type: 'biometric',
            status: 'pending_implementation',
            requirements: [
              'Complete ID verification first',
              'Video selfie for liveness check',
              'Face match with ID photo',
            ],
          };

        default:
          reply.status(400).send({
            error: 'Invalid verification type',
            code: 'INVALID_TYPE',
          });
      }
    }
  );

  /**
   * GET /users/me/verification/history - Get verification history
   */
  fastify.get(
    '/me/verification/history',
    {
      schema: {
        tags: ['Users', 'Verification'],
        summary: 'Get verification history',
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user as TokenPayload;

      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        throw new Error('User not found');
      }

      const metadata = person.metadata as {
        emailVerifiedAt?: string;
        phoneVerifiedAt?: string;
        idVerifiedAt?: string;
        biometricVerifiedAt?: string;
      };

      const history = [];

      if (metadata.emailVerifiedAt) {
        history.push({
          type: 'email',
          verifiedAt: metadata.emailVerifiedAt,
          level: 'EMAIL_VERIFIED',
        });
      }

      if (metadata.phoneVerifiedAt) {
        history.push({
          type: 'phone',
          verifiedAt: metadata.phoneVerifiedAt,
        });
      }

      if (metadata.idVerifiedAt) {
        history.push({
          type: 'id',
          verifiedAt: metadata.idVerifiedAt,
          level: 'ID_VERIFIED',
        });
      }

      if (metadata.biometricVerifiedAt) {
        history.push({
          type: 'biometric',
          verifiedAt: metadata.biometricVerifiedAt,
          level: 'BIOMETRIC',
        });
      }

      return {
        currentLevel: person.verificationLevel,
        verificationDate: person.verificationDate,
        history: history.sort(
          (a, b) =>
            new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()
        ),
      };
    }
  );
}
