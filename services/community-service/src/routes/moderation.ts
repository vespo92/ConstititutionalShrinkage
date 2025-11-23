import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ContentFilter } from '../services/moderation/content-filter.js';
import { QueueManager } from '../services/moderation/queue-manager.js';

const contentFilter = new ContentFilter();
const queueManager = new QueueManager();

const ReportSchema = z.object({
  contentType: z.enum(['discussion', 'comment', 'petition', 'user']),
  contentId: z.string(),
  reason: z.enum(['spam', 'harassment', 'misinformation', 'hate-speech', 'off-topic', 'other']),
  details: z.string().optional(),
});

const ActionSchema = z.object({
  reportId: z.string(),
  action: z.enum(['approve', 'remove', 'warn', 'mute', 'ban', 'dismiss']),
  reason: z.string().optional(),
  duration: z.number().optional(), // For mute/ban duration in hours
});

export const moderationRoutes: FastifyPluginAsync = async (app) => {
  // Submit report
  app.post('/reports', {
    schema: {
      tags: ['moderation'],
    },
  }, async (request, reply) => {
    const data = ReportSchema.parse(request.body);

    // Check content for automatic flags
    const flags = await contentFilter.analyze(data.contentId, data.contentType);

    const report = {
      id: Date.now().toString(),
      ...data,
      reporter: { id: 'user-id', displayName: 'Reporter' },
      status: 'pending',
      priority: flags.length > 0 ? 'high' : 'normal',
      flags,
      createdAt: new Date().toISOString(),
    };

    // Add to queue
    await queueManager.add(report);

    return reply.status(201).send({ report });
  });

  // Get moderation queue (moderators only)
  app.get('/queue', {
    schema: {
      tags: ['moderation'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['pending', 'reviewed', 'resolved', 'dismissed'] },
          priority: { type: 'string', enum: ['high', 'normal', 'low'] },
          contentType: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const query = request.query as any;
    const queue = await queueManager.getQueue(query);
    return { queue };
  });

  // Take moderation action
  app.post('/action', {
    schema: {
      tags: ['moderation'],
    },
  }, async (request, reply) => {
    const data = ActionSchema.parse(request.body);

    const result = await queueManager.takeAction({
      ...data,
      moderatorId: 'moderator-id', // From auth
    });

    return { success: true, result };
  });

  // Get content flags (for preview)
  app.post('/analyze', {
    schema: {
      tags: ['moderation'],
    },
  }, async (request, reply) => {
    const { content } = request.body as { content: string };
    const flags = await contentFilter.analyzeContent(content);
    return { flags };
  });

  // Get moderation stats
  app.get('/stats', {
    schema: {
      tags: ['moderation'],
    },
  }, async (request, reply) => {
    return {
      stats: {
        pending: 23,
        reviewedToday: 156,
        resolvedThisWeek: 892,
        topReasons: [
          { reason: 'spam', count: 345 },
          { reason: 'off-topic', count: 234 },
          { reason: 'misinformation', count: 123 },
        ],
      },
    };
  });
};
