/**
 * Auth Routes
 *
 * Core authentication endpoints: login, logout, refresh, register.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '../schemas/auth.schema.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password.js';
import { generateTokens, revokeAllUserTokens } from '../lib/tokens.js';
import {
  storeEmailVerificationToken,
  deleteAllUserSessions,
} from '../lib/redis.js';
import { sendVerificationEmail } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';
import {
  loginRateLimit,
  registerRateLimit,
  refreshRateLimit,
} from '../middleware/rate-limit.js';
import { authGuard } from '../middleware/auth-guard.js';
import { Role, Permission, ROLE_PERMISSIONS, VerificationLevel } from '../types/index.js';
import { generateEmailVerificationToken } from '../lib/tokens.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /auth/register - Register new user
   */
  fastify.post<{ Body: RegisterInput }>(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'legalName', 'dateOfBirth', 'primaryRegionId'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 12 },
            legalName: { type: 'string', minLength: 2 },
            preferredName: { type: 'string' },
            dateOfBirth: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            primaryRegionId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      preHandler: [registerRateLimit],
    },
    async (request, reply) => {
      const body = registerSchema.parse(request.body);

      // Validate password strength
      const passwordValidation = validatePasswordStrength(body.password, body.email);
      if (!passwordValidation.valid) {
        reply.status(400).send({
          error: 'Invalid password',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        });
        return;
      }

      // Check if email already exists
      const existingPerson = await prisma.person.findUnique({
        where: { contactEmail: body.email.toLowerCase() },
      });

      if (existingPerson) {
        reply.status(409).send({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS',
        });
        return;
      }

      // Verify region exists
      const region = await prisma.region.findUnique({
        where: { id: body.primaryRegionId },
      });

      if (!region) {
        reply.status(400).send({
          error: 'Invalid region ID',
          code: 'INVALID_REGION',
        });
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(body.password);

      // Generate public key (placeholder - in production use proper key generation)
      const publicKey = `pk_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Create person record
      const person = await prisma.person.create({
        data: {
          publicKey,
          legalName: body.legalName,
          preferredName: body.preferredName,
          dateOfBirth: new Date(body.dateOfBirth),
          contactEmail: body.email.toLowerCase(),
          primaryRegionId: body.primaryRegionId,
          verificationLevel: 'UNVERIFIED',
          votingPower: 1.0,
          reputation: 50.0,
          status: 'ACTIVE',
          metadata: {
            passwordHash,
            roles: [Role.CITIZEN],
            emailVerified: false,
            createdAt: new Date().toISOString(),
          },
        },
      });

      // Generate email verification token
      const verificationToken = generateEmailVerificationToken();
      await storeEmailVerificationToken(
        verificationToken,
        person.id,
        body.email.toLowerCase()
      );

      // Send verification email
      await sendVerificationEmail(
        body.email,
        verificationToken,
        body.preferredName || body.legalName
      );

      reply.status(201).send({
        id: person.id,
        email: body.email,
        message: 'Registration successful. Please check your email to verify your account.',
      });
    }
  );

  /**
   * POST /auth/login - Login user
   */
  fastify.post<{ Body: LoginInput }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login user',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            deviceInfo: { type: 'string' },
            rememberMe: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              expiresIn: { type: 'number' },
              user: { type: 'object' },
            },
          },
        },
      },
      preHandler: [loginRateLimit],
    },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);

      // Find user by email
      const person = await prisma.person.findUnique({
        where: { contactEmail: body.email.toLowerCase() },
        include: {
          primaryRegion: true,
          regions: {
            include: { region: true },
          },
        },
      });

      if (!person) {
        reply.status(401).send({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // Check account status
      if (person.status !== 'ACTIVE') {
        reply.status(403).send({
          error: 'Account is not active',
          code: 'ACCOUNT_INACTIVE',
          status: person.status,
        });
        return;
      }

      // Verify password
      const metadata = person.metadata as {
        passwordHash?: string;
        roles?: Role[];
        emailVerified?: boolean;
      };

      if (!metadata.passwordHash) {
        reply.status(401).send({
          error: 'Invalid credentials',
          code: 'NO_PASSWORD',
          message: 'This account uses OAuth login',
        });
        return;
      }

      const validPassword = await verifyPassword(body.password, metadata.passwordHash);
      if (!validPassword) {
        reply.status(401).send({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
        return;
      }

      // Get user roles and permissions
      const roles = (metadata.roles || [Role.CITIZEN]) as Role[];
      const permissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);

      // Get all region IDs
      const regionIds = [
        person.primaryRegionId,
        ...person.regions.map((r) => r.regionId),
      ];

      // Generate tokens
      const { accessToken, refreshToken, expiresIn } = await generateTokens(
        fastify,
        {
          userId: person.id,
          personId: person.id,
          email: person.contactEmail,
          roles,
          permissions,
          verificationLevel: person.verificationLevel as VerificationLevel,
          votingPower: Number(person.votingPower),
          regions: regionIds,
        },
        {
          deviceInfo: body.deviceInfo,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        }
      );

      // Set refresh token in httpOnly cookie
      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        accessToken,
        expiresIn,
        user: {
          id: person.id,
          email: person.contactEmail,
          legalName: person.legalName,
          preferredName: person.preferredName,
          verificationLevel: person.verificationLevel,
          votingPower: Number(person.votingPower),
          reputation: Number(person.reputation),
          emailVerified: metadata.emailVerified || false,
        },
      };
    }
  );

  /**
   * POST /auth/logout - Logout user
   */
  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout user',
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

      // Revoke all tokens for the user
      await revokeAllUserTokens(user.userId);

      // Clear refresh token cookie
      reply.clearCookie('refreshToken', {
        path: '/auth',
      });

      return {
        message: 'Logged out successfully',
        success: true,
      };
    }
  );

  /**
   * POST /auth/logout-all - Logout from all devices
   */
  fastify.post(
    '/logout-all',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout from all devices',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              success: { type: 'boolean' },
              sessionsRevoked: { type: 'number' },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const user = request.user!;

      // Revoke all tokens and sessions
      await revokeAllUserTokens(user.userId);
      const sessionsRevoked = await deleteAllUserSessions(user.userId);

      // Clear refresh token cookie
      reply.clearCookie('refreshToken', {
        path: '/auth',
      });

      return {
        message: 'Logged out from all devices',
        success: true,
        sessionsRevoked,
      };
    }
  );

  /**
   * POST /auth/refresh - Refresh access token
   */
  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              expiresIn: { type: 'number' },
            },
          },
        },
      },
      preHandler: [refreshRateLimit],
    },
    async (request, reply) => {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        reply.status(401).send({
          error: 'No refresh token provided',
          code: 'NO_REFRESH_TOKEN',
        });
        return;
      }

      try {
        // Import refreshTokens function
        const { refreshTokens } = await import('../lib/tokens.js');

        const {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        } = await refreshTokens(fastify, refreshToken, {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });

        // Set new refresh token cookie
        reply.setCookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth',
          maxAge: 7 * 24 * 60 * 60,
        });

        return {
          accessToken,
          expiresIn,
        };
      } catch (error) {
        // Clear invalid refresh token
        reply.clearCookie('refreshToken', {
          path: '/auth',
        });

        reply.status(401).send({
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        });
      }
    }
  );

  /**
   * GET /auth/me - Get current user info
   */
  fastify.get(
    '/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              legalName: { type: 'string' },
              preferredName: { type: 'string' },
              verificationLevel: { type: 'string' },
              votingPower: { type: 'number' },
              reputation: { type: 'number' },
              roles: { type: 'array', items: { type: 'string' } },
              regions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user!;

      // Fetch fresh user data
      const person = await prisma.person.findUnique({
        where: { id: user.personId },
        include: {
          primaryRegion: true,
          regions: {
            include: { region: true },
          },
        },
      });

      if (!person) {
        throw new Error('User not found');
      }

      const metadata = person.metadata as { roles?: Role[]; emailVerified?: boolean };

      return {
        id: person.id,
        email: person.contactEmail,
        legalName: person.legalName,
        preferredName: person.preferredName,
        verificationLevel: person.verificationLevel,
        votingPower: Number(person.votingPower),
        reputation: Number(person.reputation),
        roles: metadata.roles || [Role.CITIZEN],
        regions: [
          {
            id: person.primaryRegion.id,
            name: person.primaryRegion.name,
            isPrimary: true,
          },
          ...person.regions
            .filter((r) => r.regionId !== person.primaryRegionId)
            .map((r) => ({
              id: r.region.id,
              name: r.region.name,
              isPrimary: false,
            })),
        ],
        emailVerified: metadata.emailVerified || false,
      };
    }
  );
}
