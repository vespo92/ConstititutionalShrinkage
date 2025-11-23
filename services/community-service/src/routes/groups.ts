import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.string(),
  region: z.string(),
});

export const groupsRoutes: FastifyPluginAsync = async (app) => {
  // List groups
  app.get('/', {
    schema: {
      tags: ['groups'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          region: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    return {
      groups: [
        {
          id: '1',
          name: 'Climate Action Coalition',
          description: 'Working together for environmental legislation.',
          memberCount: 2456,
          category: 'environment',
          region: 'National',
          isJoined: true,
        },
      ],
    };
  });

  // Get single group
  app.get('/:id', {
    schema: {
      tags: ['groups'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      group: {
        id,
        name: 'Climate Action Coalition',
        description: 'Working together for environmental legislation and sustainable policies.',
        memberCount: 2456,
        category: 'environment',
        region: 'National',
        isJoined: true,
        admins: [{ id: '1', displayName: 'Admin User' }],
        recentActivity: [],
      },
    };
  });

  // Create group
  app.post('/', {
    schema: {
      tags: ['groups'],
    },
  }, async (request, reply) => {
    const data = CreateGroupSchema.parse(request.body);
    const group = {
      id: Date.now().toString(),
      ...data,
      memberCount: 1,
      isJoined: true,
      admins: [{ id: 'user-id', displayName: 'Current User' }],
      createdAt: new Date().toISOString(),
    };
    return reply.status(201).send({ group });
  });

  // Join group
  app.post('/:id/join', {
    schema: {
      tags: ['groups'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return { success: true };
  });

  // Leave group
  app.post('/:id/leave', {
    schema: {
      tags: ['groups'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return { success: true };
  });

  // Get group members
  app.get('/:id/members', {
    schema: {
      tags: ['groups'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      members: [
        { id: '1', displayName: 'Member 1', role: 'admin', joinedAt: new Date().toISOString() },
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 1,
        hasMore: false,
      },
    };
  });
};
