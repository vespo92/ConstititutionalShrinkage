/**
 * OAuth Routes
 *
 * OAuth2 authentication endpoints for Google and GitHub.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  isGoogleConfigured,
} from '../strategies/google.js';
import {
  getGitHubAuthUrl,
  exchangeGitHubCode,
  getGitHubUserInfo,
  isGitHubConfigured,
} from '../strategies/github.js';
import {
  storeOAuthState,
  verifyOAuthState,
} from '../lib/redis.js';
import { generateTokens, generateOAuthState, generateNonce } from '../lib/tokens.js';
import { prisma } from '../lib/prisma.js';
import { oauthRateLimit } from '../middleware/rate-limit.js';
import { Role, Permission, ROLE_PERMISSIONS, VerificationLevel, OAuthProvider } from '../types/index.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function oauthRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /auth/google - Initiate Google OAuth
   */
  fastify.get<{ Querystring: { returnUrl?: string } }>(
    '/google',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Initiate Google OAuth flow',
        querystring: {
          type: 'object',
          properties: {
            returnUrl: { type: 'string' },
          },
        },
      },
      preHandler: [oauthRateLimit],
    },
    async (request, reply) => {
      if (!isGoogleConfigured()) {
        reply.status(503).send({
          error: 'Google OAuth not configured',
          code: 'OAUTH_NOT_CONFIGURED',
        });
        return;
      }

      const state = generateOAuthState();
      const nonce = generateNonce();

      // Store state for verification
      await storeOAuthState(state, {
        provider: 'google',
        returnUrl: request.query.returnUrl,
        nonce,
      });

      const authUrl = getGoogleAuthUrl(state, nonce);
      reply.redirect(302, authUrl);
    }
  );

  /**
   * GET /auth/google/callback - Google OAuth callback
   */
  fastify.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
    '/google/callback',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Google OAuth callback handler',
      },
    },
    async (request, reply) => {
      const { code, state, error } = request.query;

      if (error) {
        return redirectWithError(reply, 'OAuth authentication cancelled');
      }

      if (!code || !state) {
        return redirectWithError(reply, 'Invalid OAuth callback');
      }

      // Verify state
      const stateData = await verifyOAuthState(state);
      if (!stateData || stateData.provider !== 'google') {
        return redirectWithError(reply, 'Invalid OAuth state');
      }

      try {
        // Exchange code for tokens
        const tokens = await exchangeGoogleCode(code);

        // Get user info
        const userInfo = await getGoogleUserInfo(tokens.accessToken);

        // Find or create user
        const { person, isNew } = await findOrCreateOAuthUser(userInfo);

        // Generate app tokens
        const metadata = person.metadata as { roles?: Role[] };
        const roles = metadata.roles || [Role.CITIZEN];
        const permissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);

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
            regions: [person.primaryRegionId],
          },
          {
            deviceInfo: 'Google OAuth',
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          }
        );

        // Set refresh token cookie
        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth',
          maxAge: 7 * 24 * 60 * 60,
        });

        // Redirect to frontend with token
        const returnUrl = stateData.returnUrl || `${BASE_URL}/auth/callback`;
        const redirectUrl = new URL(returnUrl);
        redirectUrl.searchParams.set('token', accessToken);
        redirectUrl.searchParams.set('isNew', isNew.toString());

        reply.redirect(302, redirectUrl.toString());
      } catch (error) {
        console.error('Google OAuth error:', error);
        return redirectWithError(reply, 'OAuth authentication failed');
      }
    }
  );

  /**
   * GET /auth/github - Initiate GitHub OAuth
   */
  fastify.get<{ Querystring: { returnUrl?: string } }>(
    '/github',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'Initiate GitHub OAuth flow',
        querystring: {
          type: 'object',
          properties: {
            returnUrl: { type: 'string' },
          },
        },
      },
      preHandler: [oauthRateLimit],
    },
    async (request, reply) => {
      if (!isGitHubConfigured()) {
        reply.status(503).send({
          error: 'GitHub OAuth not configured',
          code: 'OAUTH_NOT_CONFIGURED',
        });
        return;
      }

      const state = generateOAuthState();

      // Store state for verification
      await storeOAuthState(state, {
        provider: 'github',
        returnUrl: request.query.returnUrl,
        nonce: generateNonce(),
      });

      const authUrl = getGitHubAuthUrl(state);
      reply.redirect(302, authUrl);
    }
  );

  /**
   * GET /auth/github/callback - GitHub OAuth callback
   */
  fastify.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
    '/github/callback',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'GitHub OAuth callback handler',
      },
    },
    async (request, reply) => {
      const { code, state, error } = request.query;

      if (error) {
        return redirectWithError(reply, 'OAuth authentication cancelled');
      }

      if (!code || !state) {
        return redirectWithError(reply, 'Invalid OAuth callback');
      }

      // Verify state
      const stateData = await verifyOAuthState(state);
      if (!stateData || stateData.provider !== 'github') {
        return redirectWithError(reply, 'Invalid OAuth state');
      }

      try {
        // Exchange code for tokens
        const tokens = await exchangeGitHubCode(code);

        // Get user info
        const userInfo = await getGitHubUserInfo(tokens.accessToken);

        // Find or create user
        const { person, isNew } = await findOrCreateOAuthUser(userInfo);

        // Generate app tokens
        const metadata = person.metadata as { roles?: Role[] };
        const roles = metadata.roles || [Role.CITIZEN];
        const permissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);

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
            regions: [person.primaryRegionId],
          },
          {
            deviceInfo: 'GitHub OAuth',
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          }
        );

        // Set refresh token cookie
        reply.setCookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth',
          maxAge: 7 * 24 * 60 * 60,
        });

        // Redirect to frontend with token
        const returnUrl = stateData.returnUrl || `${BASE_URL}/auth/callback`;
        const redirectUrl = new URL(returnUrl);
        redirectUrl.searchParams.set('token', accessToken);
        redirectUrl.searchParams.set('isNew', isNew.toString());

        reply.redirect(302, redirectUrl.toString());
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        return redirectWithError(reply, 'OAuth authentication failed');
      }
    }
  );

  /**
   * GET /auth/providers - List available OAuth providers
   */
  fastify.get(
    '/providers',
    {
      schema: {
        tags: ['OAuth'],
        summary: 'List available OAuth providers',
        response: {
          200: {
            type: 'object',
            properties: {
              providers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    enabled: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      return {
        providers: [
          {
            id: 'google',
            name: 'Google',
            enabled: isGoogleConfigured(),
          },
          {
            id: 'github',
            name: 'GitHub',
            enabled: isGitHubConfigured(),
          },
        ],
      };
    }
  );
}

/**
 * Helper to redirect with error
 */
function redirectWithError(reply: FastifyReply, message: string): void {
  const errorUrl = new URL(`${BASE_URL}/auth/error`);
  errorUrl.searchParams.set('message', message);
  reply.redirect(302, errorUrl.toString());
}

/**
 * Find or create user from OAuth info
 */
async function findOrCreateOAuthUser(
  userInfo: { provider: OAuthProvider; providerId: string; email: string; name?: string; picture?: string; emailVerified?: boolean }
): Promise<{ person: any; isNew: boolean }> {
  // First, try to find by email
  let person = await prisma.person.findUnique({
    where: { contactEmail: userInfo.email.toLowerCase() },
  });

  if (person) {
    // Update OAuth info in metadata
    const metadata = person.metadata as Record<string, unknown>;
    const oauthProviders = (metadata.oauthProviders || {}) as Record<string, string>;
    oauthProviders[userInfo.provider] = userInfo.providerId;

    await prisma.person.update({
      where: { id: person.id },
      data: {
        metadata: {
          ...metadata,
          oauthProviders,
          lastOAuthLogin: new Date().toISOString(),
        },
        // Update verification if email is verified via OAuth
        ...(userInfo.emailVerified && person.verificationLevel === 'UNVERIFIED'
          ? { verificationLevel: 'EMAIL_VERIFIED' }
          : {}),
      },
    });

    return { person, isNew: false };
  }

  // Get or create a default region
  let defaultRegion = await prisma.region.findFirst({
    where: { level: 'FEDERAL' },
  });

  if (!defaultRegion) {
    defaultRegion = await prisma.region.create({
      data: {
        name: 'United States',
        code: 'US',
        level: 'FEDERAL',
      },
    });
  }

  // Create new user
  const publicKey = `pk_oauth_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  person = await prisma.person.create({
    data: {
      publicKey,
      legalName: userInfo.name || userInfo.email.split('@')[0],
      contactEmail: userInfo.email.toLowerCase(),
      dateOfBirth: new Date('1990-01-01'), // Placeholder - should be collected later
      primaryRegionId: defaultRegion.id,
      verificationLevel: userInfo.emailVerified ? 'EMAIL_VERIFIED' : 'UNVERIFIED',
      votingPower: 1.0,
      reputation: 50.0,
      status: 'ACTIVE',
      metadata: {
        roles: [Role.CITIZEN],
        emailVerified: userInfo.emailVerified || false,
        oauthProviders: {
          [userInfo.provider]: userInfo.providerId,
        },
        picture: userInfo.picture,
        createdViaOAuth: userInfo.provider,
        createdAt: new Date().toISOString(),
      },
    },
  });

  return { person, isNew: true };
}
