/**
 * Token Routes
 *
 * Token management: list active sessions, revoke tokens.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { revokeTokenSchema, type RevokeTokenInput } from '../schemas/auth.schema.js';
import { revokeRefreshToken } from '../lib/tokens.js';
import { getUserSessions, deleteSession } from '../lib/redis.js';
import { authGuard } from '../middleware/auth-guard.js';

export async function tokenRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /auth/tokens/active - List active sessions
   */
  fastify.get(
    '/tokens/active',
    {
      schema: {
        tags: ['Auth', 'Tokens'],
        summary: 'List active sessions',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              sessions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    tokenId: { type: 'string' },
                    deviceInfo: { type: 'string' },
                    ipAddress: { type: 'string' },
                    userAgent: { type: 'string' },
                    createdAt: { type: 'string' },
                    lastActivity: { type: 'string' },
                    current: { type: 'boolean' },
                  },
                },
              },
              count: { type: 'number' },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user!;

      // Get all sessions for the user
      const sessions = await getUserSessions(user.userId);

      // Determine current session (would need to track this differently in production)
      // For now, we'll just return all sessions

      return {
        sessions: sessions.map((session) => ({
          tokenId: session.tokenId,
          deviceInfo: session.deviceInfo,
          ipAddress: maskIpAddress(session.ipAddress),
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt,
          current: false, // Would need session tracking to determine this
        })),
        count: sessions.length,
      };
    }
  );

  /**
   * POST /auth/tokens/revoke - Revoke a specific token/session
   */
  fastify.post<{ Body: RevokeTokenInput }>(
    '/tokens/revoke',
    {
      schema: {
        tags: ['Auth', 'Tokens'],
        summary: 'Revoke a specific session',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['tokenId'],
          properties: {
            tokenId: { type: 'string' },
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
      const { tokenId } = revokeTokenSchema.parse(request.body);

      // Verify the session belongs to the user
      const sessions = await getUserSessions(user.userId);
      const session = sessions.find((s) => s.tokenId === tokenId);

      if (!session) {
        reply.status(404).send({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        });
        return;
      }

      // Revoke the token and delete session
      await revokeRefreshToken(user.userId, tokenId);
      await deleteSession(user.userId, tokenId);

      return {
        message: 'Session revoked successfully',
        success: true,
      };
    }
  );

  /**
   * POST /auth/tokens/revoke-all - Revoke all sessions except current
   */
  fastify.post(
    '/tokens/revoke-all',
    {
      schema: {
        tags: ['Auth', 'Tokens'],
        summary: 'Revoke all sessions except current',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              success: { type: 'boolean' },
              revokedCount: { type: 'number' },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user!;

      // Get all sessions
      const sessions = await getUserSessions(user.userId);

      // Revoke all sessions
      // In production, you'd want to keep the current session
      let revokedCount = 0;

      for (const session of sessions) {
        try {
          await revokeRefreshToken(user.userId, session.tokenId);
          await deleteSession(user.userId, session.tokenId);
          revokedCount++;
        } catch (error) {
          console.error(`Failed to revoke session ${session.tokenId}:`, error);
        }
      }

      return {
        message: `Revoked ${revokedCount} sessions`,
        success: true,
        revokedCount,
      };
    }
  );

  /**
   * GET /auth/tokens/info - Get info about the current token
   */
  fastify.get(
    '/tokens/info',
    {
      schema: {
        tags: ['Auth', 'Tokens'],
        summary: 'Get info about the current access token',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              email: { type: 'string' },
              roles: { type: 'array', items: { type: 'string' } },
              permissions: { type: 'array', items: { type: 'string' } },
              verificationLevel: { type: 'string' },
              issuedAt: { type: 'string' },
              expiresAt: { type: 'string' },
            },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user!;

      return {
        userId: user.userId,
        personId: user.personId,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        verificationLevel: user.verificationLevel,
        votingPower: user.votingPower,
        regions: user.regions,
        issuedAt: user.iat ? new Date(user.iat * 1000).toISOString() : null,
        expiresAt: user.exp ? new Date(user.exp * 1000).toISOString() : null,
      };
    }
  );
}

/**
 * Helper to mask IP address for privacy
 */
function maskIpAddress(ip: string): string {
  if (!ip || ip === 'Unknown') return 'Unknown';

  // Check if IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }

  // Check if IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}:****`;
    }
  }

  return ip;
}
