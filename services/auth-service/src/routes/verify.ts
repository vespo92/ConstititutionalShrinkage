/**
 * Verification Routes
 *
 * Email and phone verification endpoints.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  verifyEmailSchema,
  resendVerificationSchema,
  type VerifyEmailInput,
  type ResendVerificationInput,
} from '../schemas/auth.schema.js';
import {
  storeEmailVerificationToken,
  verifyEmailToken,
} from '../lib/redis.js';
import { sendVerificationEmail } from '../lib/email.js';
import { generateEmailVerificationToken } from '../lib/tokens.js';
import { prisma } from '../lib/prisma.js';
import { emailVerificationRateLimit } from '../middleware/rate-limit.js';
import { authGuard } from '../middleware/auth-guard.js';

export async function verifyRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/verify-email - Verify email with token
   */
  fastify.post<{ Body: VerifyEmailInput }>(
    '/verify-email',
    {
      schema: {
        tags: ['Auth', 'Verification'],
        summary: 'Verify email address with token',
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              success: { type: 'boolean' },
              verificationLevel: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { token } = verifyEmailSchema.parse(request.body);

      // Verify token
      const tokenData = await verifyEmailToken(token);

      if (!tokenData) {
        reply.status(400).send({
          error: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN',
        });
        return;
      }

      // Find user
      const person = await prisma.person.findUnique({
        where: { id: tokenData.userId },
      });

      if (!person) {
        reply.status(404).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      // Check if email matches
      if (person.contactEmail.toLowerCase() !== tokenData.email.toLowerCase()) {
        reply.status(400).send({
          error: 'Email mismatch',
          code: 'EMAIL_MISMATCH',
        });
        return;
      }

      // Check if already verified
      const metadata = person.metadata as { emailVerified?: boolean };
      if (metadata.emailVerified) {
        return {
          message: 'Email already verified',
          success: true,
          verificationLevel: person.verificationLevel,
        };
      }

      // Update verification status
      await prisma.person.update({
        where: { id: person.id },
        data: {
          verificationLevel:
            person.verificationLevel === 'UNVERIFIED'
              ? 'EMAIL_VERIFIED'
              : person.verificationLevel,
          verificationDate: new Date(),
          metadata: {
            ...(person.metadata as Record<string, unknown>),
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
          },
        },
      });

      return {
        message: 'Email verified successfully',
        success: true,
        verificationLevel: 'EMAIL_VERIFIED',
      };
    }
  );

  /**
   * POST /auth/resend-verification - Resend verification email
   */
  fastify.post<{ Body: ResendVerificationInput }>(
    '/resend-verification',
    {
      schema: {
        tags: ['Auth', 'Verification'],
        summary: 'Resend email verification',
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              success: { type: 'boolean' },
            },
          },
        },
      },
      preHandler: [emailVerificationRateLimit],
    },
    async (request) => {
      const { email } = resendVerificationSchema.parse(request.body);

      // Always return success to prevent email enumeration
      const successResponse = {
        message: 'If an unverified account exists, a verification email will be sent.',
        success: true,
      };

      // Find user
      const person = await prisma.person.findUnique({
        where: { contactEmail: email.toLowerCase() },
      });

      if (!person) {
        return successResponse;
      }

      // Check if already verified
      const metadata = person.metadata as { emailVerified?: boolean };
      if (metadata.emailVerified) {
        return successResponse;
      }

      // Generate new verification token
      const verificationToken = generateEmailVerificationToken();
      await storeEmailVerificationToken(
        verificationToken,
        person.id,
        email.toLowerCase()
      );

      // Send verification email
      await sendVerificationEmail(
        email,
        verificationToken,
        person.preferredName || person.legalName
      );

      return successResponse;
    }
  );

  /**
   * GET /auth/verification-status - Get current verification status
   */
  fastify.get(
    '/verification-status',
    {
      schema: {
        tags: ['Auth', 'Verification'],
        summary: 'Get current verification status',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              currentLevel: { type: 'string' },
              emailVerified: { type: 'boolean' },
              phoneVerified: { type: 'boolean' },
              idVerified: { type: 'boolean' },
              biometricVerified: { type: 'boolean' },
              nextLevel: { type: 'string' },
              requirements: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user!;

      // Get fresh user data
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

      // Determine next level and requirements
      const verificationPath = [
        { level: 'UNVERIFIED', check: () => true },
        { level: 'EMAIL_VERIFIED', check: () => metadata.emailVerified },
        { level: 'ID_VERIFIED', check: () => metadata.idVerified },
        { level: 'BIOMETRIC', check: () => metadata.biometricVerified },
        { level: 'FULL_KYC', check: () => metadata.emailVerified && metadata.idVerified && metadata.biometricVerified },
      ];

      const currentLevelIndex = verificationPath.findIndex(
        (v) => v.level === person.verificationLevel
      );
      const nextLevel = verificationPath[currentLevelIndex + 1]?.level;

      const requirements: string[] = [];
      if (!metadata.emailVerified) requirements.push('Verify email address');
      if (!metadata.phoneVerified) requirements.push('Verify phone number');
      if (!metadata.idVerified) requirements.push('Complete ID verification');
      if (!metadata.biometricVerified) requirements.push('Complete biometric verification');

      return {
        currentLevel: person.verificationLevel,
        emailVerified: metadata.emailVerified || false,
        phoneVerified: metadata.phoneVerified || false,
        idVerified: metadata.idVerified || false,
        biometricVerified: metadata.biometricVerified || false,
        nextLevel,
        requirements: requirements.slice(0, 3), // Show next 3 requirements
      };
    }
  );
}
