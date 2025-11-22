/**
 * Auth Routes
 *
 * Authentication endpoints for login, register, verification, etc.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as argon2 from 'argon2';
import { generateTokens, verifyRefreshToken, revokeRefreshToken } from './utils/tokens.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  legalName: z.string().min(2).max(200),
  preferredName: z.string().max(100).optional(),
  primaryRegionId: z.string().uuid(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(100),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

// Type definitions
interface UserPayload {
  id: string;
  email: string;
  verificationLevel: string;
  votingPower: number;
  regions: string[];
  roles: string[];
}

export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/register - Register new user
   */
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: {
        type: 'object',
        required: ['email', 'password', 'legalName', 'primaryRegionId'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          legalName: { type: 'string', minLength: 2 },
          preferredName: { type: 'string' },
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
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);

    // TODO: Check if email already exists
    // const existingUser = await db.users.findUnique({ where: { email: body.email } });
    // if (existingUser) throw new ConflictError('Email already registered');

    // Hash password
    const passwordHash = await argon2.hash(body.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const userId = `user-${Date.now()}`;

    // TODO: Save to database
    // const user = await db.users.create({
    //   data: {
    //     email: body.email,
    //     passwordHash,
    //     legalName: body.legalName,
    //     preferredName: body.preferredName,
    //     primaryRegionId: body.primaryRegionId,
    //     verificationLevel: 'NONE',
    //   },
    // });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    reply.status(201);
    return {
      id: userId,
      email: body.email,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  });

  /**
   * POST /auth/login - Login user
   */
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            user: { type: 'object' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    // TODO: Fetch user from database
    // const user = await db.users.findUnique({ where: { email: body.email } });
    // if (!user) throw new UnauthorizedError('Invalid credentials');

    // Mock user for development
    const mockUser = {
      id: 'user-123',
      email: body.email,
      passwordHash: await argon2.hash('password123'),
      verificationLevel: 'EMAIL_VERIFIED',
      votingPower: 1,
      regions: ['region-1'],
      roles: ['CITIZEN'],
    };

    // Verify password
    // const validPassword = await argon2.verify(user.passwordHash, body.password);
    // if (!validPassword) throw new UnauthorizedError('Invalid credentials');

    // Generate tokens
    const userPayload: UserPayload = {
      id: mockUser.id,
      email: mockUser.email,
      verificationLevel: mockUser.verificationLevel,
      votingPower: mockUser.votingPower,
      regions: mockUser.regions,
      roles: mockUser.roles,
    };

    const { accessToken, refreshToken } = await generateTokens(fastify, userPayload);

    // Set refresh token in httpOnly cookie
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      accessToken,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        verificationLevel: mockUser.verificationLevel,
        votingPower: mockUser.votingPower,
      },
    };
  });

  /**
   * POST /auth/logout - Logout user
   */
  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout user',
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken;

    if (refreshToken) {
      // Revoke refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Clear refresh token cookie
    reply.clearCookie('refreshToken', {
      path: '/auth/refresh',
    });

    return { message: 'Logged out successfully' };
  });

  /**
   * POST /auth/refresh - Refresh access token
   */
  fastify.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Refresh access token',
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      reply.status(401);
      return { error: 'No refresh token provided' };
    }

    try {
      const payload = await verifyRefreshToken(fastify, refreshToken);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await generateTokens(fastify, payload);

      // Rotate refresh token
      await revokeRefreshToken(refreshToken);

      reply.setCookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60,
      });

      return { accessToken };
    } catch {
      reply.status(401);
      return { error: 'Invalid refresh token' };
    }
  });

  /**
   * POST /auth/forgot-password - Request password reset
   */
  fastify.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    const { email } = request.body as { email: string };

    // TODO: Generate reset token and send email
    // Always return success to prevent email enumeration

    return {
      message: 'If an account exists with this email, a password reset link will be sent.',
    };
  });

  /**
   * POST /auth/reset-password - Reset password with token
   */
  fastify.post('/reset-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Reset password with token',
      body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    const body = resetPasswordSchema.parse(request.body);

    // TODO: Verify token and update password

    return { message: 'Password reset successfully' };
  });

  /**
   * POST /auth/verify-email - Verify email with token
   */
  fastify.post('/verify-email', {
    schema: {
      tags: ['Auth'],
      summary: 'Verify email address',
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    const body = verifyEmailSchema.parse(request.body);

    // TODO: Verify token and update user verification level

    return {
      message: 'Email verified successfully',
      verificationLevel: 'EMAIL_VERIFIED',
    };
  });

  /**
   * POST /auth/verify-phone - Verify phone number
   */
  fastify.post('/verify-phone', {
    schema: {
      tags: ['Auth'],
      summary: 'Verify phone number with code',
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    const { code } = request.body as { code: string };

    // TODO: Verify SMS code and update user verification level

    return {
      message: 'Phone verified successfully',
      verificationLevel: 'PHONE_VERIFIED',
    };
  });

  /**
   * GET /auth/me - Get current user info
   */
  fastify.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: 'Get current authenticated user',
      security: [{ bearerAuth: [] }],
    },
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    },
  }, async (request: FastifyRequest) => {
    const user = request.user as UserPayload;

    return {
      id: user.id,
      email: user.email,
      verificationLevel: user.verificationLevel,
      votingPower: user.votingPower,
      regions: user.regions,
      roles: user.roles,
    };
  });

  /**
   * GET /auth/oauth/:provider - OAuth redirect
   */
  fastify.get<{ Params: { provider: string } }>('/oauth/:provider', {
    schema: {
      tags: ['Auth'],
      summary: 'OAuth authentication redirect',
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['google', 'github'] },
        },
        required: ['provider'],
      },
    },
  }, async (request, reply) => {
    const { provider } = request.params;

    // TODO: Implement OAuth redirect based on provider
    // const authUrl = await getOAuthAuthorizationUrl(provider);
    // return reply.redirect(authUrl);

    return { message: `OAuth with ${provider} - not yet implemented` };
  });

  /**
   * GET /auth/oauth/:provider/callback - OAuth callback
   */
  fastify.get<{ Params: { provider: string }; Querystring: { code: string; state: string } }>(
    '/oauth/:provider/callback',
    {
      schema: {
        tags: ['Auth'],
        summary: 'OAuth callback handler',
      },
    },
    async (request, reply) => {
      const { provider } = request.params;
      const { code, state } = request.query;

      // TODO: Exchange code for tokens, create/update user

      return { message: `OAuth callback for ${provider}` };
    }
  );
}
