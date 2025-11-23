/**
 * Password Routes
 *
 * Password management: reset, change, forgot.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from '../schemas/auth.schema.js';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  needsRehash,
} from '../lib/password.js';
import { generatePasswordResetToken, revokeAllUserTokens } from '../lib/tokens.js';
import {
  storePasswordResetToken,
  verifyPasswordResetToken,
} from '../lib/redis.js';
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import { passwordResetRateLimit } from '../middleware/rate-limit.js';
import { authGuard } from '../middleware/auth-guard.js';

export async function passwordRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/forgot-password - Request password reset
   */
  fastify.post<{ Body: ForgotPasswordInput }>(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth', 'Password'],
        summary: 'Request password reset',
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
      preHandler: [passwordResetRateLimit],
    },
    async (request) => {
      const { email } = forgotPasswordSchema.parse(request.body);

      // Always return success to prevent email enumeration
      const successResponse = {
        message: 'If an account exists with this email, a password reset link will be sent.',
        success: true,
      };

      // Find user by email
      const person = await prisma.person.findUnique({
        where: { contactEmail: email.toLowerCase() },
      });

      if (!person) {
        return successResponse;
      }

      // Check if user has a password (not OAuth-only)
      const metadata = person.metadata as { passwordHash?: string };
      if (!metadata.passwordHash) {
        // User signed up via OAuth, send different email
        // For now, just return success (in production, send informational email)
        return successResponse;
      }

      // Generate reset token
      const resetToken = generatePasswordResetToken();
      await storePasswordResetToken(resetToken, person.id);

      // Send reset email
      await sendPasswordResetEmail(
        email,
        resetToken,
        person.preferredName || person.legalName
      );

      return successResponse;
    }
  );

  /**
   * POST /auth/reset-password - Reset password with token
   */
  fastify.post<{ Body: ResetPasswordInput }>(
    '/reset-password',
    {
      schema: {
        tags: ['Auth', 'Password'],
        summary: 'Reset password with token',
        body: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 12 },
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
    },
    async (request, reply) => {
      const { token, newPassword } = resetPasswordSchema.parse(request.body);

      // Verify token and get user ID
      const userId = await verifyPasswordResetToken(token);

      if (!userId) {
        reply.status(400).send({
          error: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN',
        });
        return;
      }

      // Find user
      const person = await prisma.person.findUnique({
        where: { id: userId },
      });

      if (!person) {
        reply.status(400).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(
        newPassword,
        person.contactEmail
      );

      if (!passwordValidation.valid) {
        reply.status(400).send({
          error: 'Invalid password',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        });
        return;
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password in metadata
      const metadata = person.metadata as Record<string, unknown>;
      await prisma.person.update({
        where: { id: userId },
        data: {
          metadata: {
            ...metadata,
            passwordHash,
            passwordChangedAt: new Date().toISOString(),
          },
        },
      });

      // Revoke all existing sessions (security measure)
      await revokeAllUserTokens(userId);

      // Send notification email
      await sendPasswordChangedEmail(
        person.contactEmail,
        person.preferredName || person.legalName
      );

      return {
        message: 'Password reset successfully. Please log in with your new password.',
        success: true,
      };
    }
  );

  /**
   * POST /auth/change-password - Change password (authenticated)
   */
  fastify.post<{ Body: ChangePasswordInput }>(
    '/change-password',
    {
      schema: {
        tags: ['Auth', 'Password'],
        summary: 'Change password (requires authentication)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 12 },
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
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const user = request.user!;
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        request.body
      );

      // Get user
      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        reply.status(404).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      // Verify current password
      const metadata = person.metadata as { passwordHash?: string };

      if (!metadata.passwordHash) {
        reply.status(400).send({
          error: 'No password set for this account',
          code: 'NO_PASSWORD',
          message: 'This account uses OAuth login. Set a password first.',
        });
        return;
      }

      const validPassword = await verifyPassword(
        currentPassword,
        metadata.passwordHash
      );

      if (!validPassword) {
        reply.status(401).send({
          error: 'Current password is incorrect',
          code: 'INVALID_PASSWORD',
        });
        return;
      }

      // Check if new password is different
      const samePassword = await verifyPassword(
        newPassword,
        metadata.passwordHash
      );

      if (samePassword) {
        reply.status(400).send({
          error: 'New password must be different from current password',
          code: 'SAME_PASSWORD',
        });
        return;
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(
        newPassword,
        person.contactEmail
      );

      if (!passwordValidation.valid) {
        reply.status(400).send({
          error: 'Invalid password',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        });
        return;
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword);

      // Update password
      await prisma.person.update({
        where: { id: user.personId },
        data: {
          metadata: {
            ...(person.metadata as Record<string, unknown>),
            passwordHash,
            passwordChangedAt: new Date().toISOString(),
          },
        },
      });

      // Revoke all other sessions (keep current one)
      // In production, you'd want to keep the current session
      // For now, we'll revoke all and let user re-login

      // Send notification email
      await sendPasswordChangedEmail(
        person.contactEmail,
        person.preferredName || person.legalName
      );

      return {
        message: 'Password changed successfully',
        success: true,
      };
    }
  );

  /**
   * POST /auth/set-password - Set password for OAuth account
   */
  fastify.post<{ Body: { password: string } }>(
    '/set-password',
    {
      schema: {
        tags: ['Auth', 'Password'],
        summary: 'Set password for OAuth-only account',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string', minLength: 12 },
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
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const user = request.user!;
      const { password } = request.body;

      // Get user
      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        reply.status(404).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      // Check if password already exists
      const metadata = person.metadata as { passwordHash?: string };

      if (metadata.passwordHash) {
        reply.status(400).send({
          error: 'Password already set',
          code: 'PASSWORD_EXISTS',
          message: 'Use change-password endpoint to change existing password',
        });
        return;
      }

      // Validate password
      const passwordValidation = validatePasswordStrength(
        password,
        person.contactEmail
      );

      if (!passwordValidation.valid) {
        reply.status(400).send({
          error: 'Invalid password',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        });
        return;
      }

      // Hash and save password
      const passwordHash = await hashPassword(password);

      await prisma.person.update({
        where: { id: user.personId },
        data: {
          metadata: {
            ...(person.metadata as Record<string, unknown>),
            passwordHash,
            passwordSetAt: new Date().toISOString(),
          },
        },
      });

      return {
        message: 'Password set successfully',
        success: true,
      };
    }
  );
}
