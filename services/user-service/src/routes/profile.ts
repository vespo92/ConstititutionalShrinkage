/**
 * Profile Routes
 *
 * User profile management endpoints.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import {
  updateProfileSchema,
  searchUsersSchema,
  type UpdateProfileInput,
  type SearchUsersInput,
} from '../schemas/user.schema.js';
import type { TokenPayload } from '../types/index.js';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  // Auth guard middleware
  const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
  };

  /**
   * GET /users/me - Get current user profile
   */
  fastify.get(
    '/me',
    {
      schema: {
        tags: ['Users', 'Profile'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const user = request.user as TokenPayload;

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

      const metadata = person.metadata as Record<string, unknown>;

      return {
        id: person.id,
        email: person.contactEmail,
        legalName: person.legalName,
        preferredName: person.preferredName,
        contactPhone: person.contactPhone,
        primaryRegion: {
          id: person.primaryRegion.id,
          name: person.primaryRegion.name,
          code: person.primaryRegion.code,
        },
        additionalRegions: person.regions
          .filter((r) => r.regionId !== person.primaryRegionId)
          .map((r) => ({
            id: r.region.id,
            name: r.region.name,
            code: r.region.code,
          })),
        verificationLevel: person.verificationLevel,
        votingPower: Number(person.votingPower),
        reputation: Number(person.reputation),
        status: person.status,
        dateOfBirth: person.dateOfBirth,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt,
        emailVerified: metadata.emailVerified || false,
        phoneVerified: metadata.phoneVerified || false,
      };
    }
  );

  /**
   * PUT /users/me - Update current user profile
   */
  fastify.put<{ Body: UpdateProfileInput }>(
    '/me',
    {
      schema: {
        tags: ['Users', 'Profile'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            preferredName: { type: 'string' },
            contactPhone: { type: 'string' },
            primaryRegionId: { type: 'string', format: 'uuid' },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request, reply) => {
      const user = request.user as TokenPayload;
      const updates = updateProfileSchema.parse(request.body);

      // Validate region if provided
      if (updates.primaryRegionId) {
        const region = await prisma.region.findUnique({
          where: { id: updates.primaryRegionId },
        });

        if (!region) {
          reply.status(400).send({
            error: 'Invalid region ID',
            code: 'INVALID_REGION',
          });
          return;
        }
      }

      const updatedPerson = await prisma.person.update({
        where: { id: user.personId },
        data: {
          ...(updates.preferredName !== undefined && { preferredName: updates.preferredName }),
          ...(updates.contactPhone !== undefined && { contactPhone: updates.contactPhone }),
          ...(updates.primaryRegionId && { primaryRegionId: updates.primaryRegionId }),
        },
        include: {
          primaryRegion: true,
        },
      });

      return {
        message: 'Profile updated successfully',
        success: true,
        profile: {
          id: updatedPerson.id,
          preferredName: updatedPerson.preferredName,
          contactPhone: updatedPerson.contactPhone,
          primaryRegion: {
            id: updatedPerson.primaryRegion.id,
            name: updatedPerson.primaryRegion.name,
          },
          updatedAt: updatedPerson.updatedAt,
        },
      };
    }
  );

  /**
   * GET /users/:id - Get user by ID (public info only)
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Users', 'Profile'],
        summary: 'Get user by ID (public info)',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const person = await prisma.person.findUnique({
        where: { id },
        include: {
          primaryRegion: true,
        },
      });

      if (!person) {
        reply.status(404).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      const metadata = person.metadata as { publicProfile?: boolean };

      // Return limited info for non-public profiles
      if (!metadata.publicProfile) {
        return {
          id: person.id,
          preferredName: person.preferredName || 'Anonymous',
          verificationLevel: person.verificationLevel,
          region: person.primaryRegion.name,
          createdAt: person.createdAt,
        };
      }

      return {
        id: person.id,
        preferredName: person.preferredName,
        legalName: person.legalName,
        verificationLevel: person.verificationLevel,
        votingPower: Number(person.votingPower),
        reputation: Number(person.reputation),
        region: {
          id: person.primaryRegion.id,
          name: person.primaryRegion.name,
        },
        createdAt: person.createdAt,
      };
    }
  );

  /**
   * GET /users/:id/public - Get user public profile
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id/public',
    {
      schema: {
        tags: ['Users', 'Profile'],
        summary: 'Get user public profile',
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const person = await prisma.person.findUnique({
        where: { id, status: 'ACTIVE' },
        include: {
          primaryRegion: true,
        },
      });

      if (!person) {
        reply.status(404).send({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
        return;
      }

      return {
        id: person.id,
        displayName: person.preferredName || 'Citizen',
        verificationLevel: person.verificationLevel,
        votingPower: Number(person.votingPower),
        reputation: Number(person.reputation),
        region: person.primaryRegion.name,
        memberSince: person.createdAt,
      };
    }
  );

  /**
   * GET /users/search - Search users
   */
  fastify.get<{ Querystring: SearchUsersInput }>(
    '/search',
    {
      schema: {
        tags: ['Users'],
        summary: 'Search users',
        querystring: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', minLength: 2 },
            limit: { type: 'number', default: 20 },
            offset: { type: 'number', default: 0 },
          },
        },
      },
      preHandler: [authGuard],
    },
    async (request) => {
      const { query, limit, offset } = searchUsersSchema.parse(request.query);

      const users = await prisma.person.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { preferredName: { contains: query, mode: 'insensitive' } },
            { legalName: { contains: query, mode: 'insensitive' } },
            { contactEmail: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          preferredName: true,
          legalName: true,
          verificationLevel: true,
          votingPower: true,
          primaryRegion: {
            select: { name: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { reputation: 'desc' },
      });

      const total = await prisma.person.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { preferredName: { contains: query, mode: 'insensitive' } },
            { legalName: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      return {
        users: users.map((u) => ({
          id: u.id,
          displayName: u.preferredName || u.legalName,
          verificationLevel: u.verificationLevel,
          votingPower: Number(u.votingPower),
          region: u.primaryRegion.name,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + users.length < total,
        },
      };
    }
  );
}
