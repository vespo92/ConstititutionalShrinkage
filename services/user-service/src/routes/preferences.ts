/**
 * Preferences Routes
 *
 * User preferences management endpoints.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import {
  updatePreferencesSchema,
  type UpdatePreferencesInput,
} from '../schemas/user.schema.js';
import type { TokenPayload, UserPreferences } from '../types/index.js';

// Default preferences
const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  theme: 'system',
  language: 'en-US',
  emailNotifications: true,
  pushNotifications: false,
  publicProfile: false,
  showVotingHistory: false,
};

export async function preferencesRoutes(fastify: FastifyInstance): Promise<void> {
  // Auth guard middleware
  const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
  };

  /**
   * GET /users/me/preferences - Get user preferences
   */
  fastify.get(
    '/me/preferences',
    {
      schema: {
        tags: ['Users', 'Preferences'],
        summary: 'Get user preferences',
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

      const metadata = person.metadata as { preferences?: Partial<UserPreferences> };
      const preferences = metadata.preferences || {};

      return {
        userId: person.id,
        ...DEFAULT_PREFERENCES,
        ...preferences,
      };
    }
  );

  /**
   * PUT /users/me/preferences - Update user preferences
   */
  fastify.put<{ Body: UpdatePreferencesInput }>(
    '/me/preferences',
    {
      schema: {
        tags: ['Users', 'Preferences'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            theme: { type: 'string', enum: ['light', 'dark', 'system'] },
            language: { type: 'string' },
            emailNotifications: { type: 'boolean' },
            pushNotifications: { type: 'boolean' },
            publicProfile: { type: 'boolean' },
            showVotingHistory: { type: 'boolean' },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user as TokenPayload;
      const updates = updatePreferencesSchema.parse(request.body);

      const person = await prisma.person.findUnique({
        where: { id: user.personId },
      });

      if (!person) {
        throw new Error('User not found');
      }

      const metadata = person.metadata as Record<string, unknown>;
      const currentPreferences = (metadata.preferences || {}) as Partial<UserPreferences>;

      // Merge preferences
      const newPreferences = {
        ...DEFAULT_PREFERENCES,
        ...currentPreferences,
        ...updates,
      };

      await prisma.person.update({
        where: { id: user.personId },
        data: {
          metadata: {
            ...metadata,
            preferences: newPreferences,
            preferencesUpdatedAt: new Date().toISOString(),
          },
        },
      });

      return {
        message: 'Preferences updated successfully',
        success: true,
        preferences: {
          userId: person.id,
          ...newPreferences,
        },
      };
    }
  );

  /**
   * POST /users/me/preferences/reset - Reset preferences to defaults
   */
  fastify.post(
    '/me/preferences/reset',
    {
      schema: {
        tags: ['Users', 'Preferences'],
        summary: 'Reset preferences to defaults',
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

      const metadata = person.metadata as Record<string, unknown>;

      await prisma.person.update({
        where: { id: user.personId },
        data: {
          metadata: {
            ...metadata,
            preferences: DEFAULT_PREFERENCES,
            preferencesResetAt: new Date().toISOString(),
          },
        },
      });

      return {
        message: 'Preferences reset to defaults',
        success: true,
        preferences: {
          userId: person.id,
          ...DEFAULT_PREFERENCES,
        },
      };
    }
  );
}
