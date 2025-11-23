import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';

import { discussionsRoutes } from './routes/discussions.js';
import { commentsRoutes } from './routes/comments.js';
import { petitionsRoutes } from './routes/petitions.js';
import { townhallsRoutes } from './routes/townhalls.js';
import { feedbackRoutes } from './routes/feedback.js';
import { groupsRoutes } from './routes/groups.js';
import { moderationRoutes } from './routes/moderation.js';

export async function createApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Security plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // WebSocket support for real-time features
  await app.register(websocket);

  // API Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Community Service API',
        description: 'API for community engagement - discussions, petitions, town halls, and moderation',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3004' }],
      tags: [
        { name: 'discussions', description: 'Discussion thread operations' },
        { name: 'comments', description: 'Public comment operations' },
        { name: 'petitions', description: 'Petition management' },
        { name: 'townhalls', description: 'Virtual town hall events' },
        { name: 'feedback', description: 'Policy feedback' },
        { name: 'groups', description: 'Community groups' },
        { name: 'moderation', description: 'Content moderation' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
  });

  // Register routes
  await app.register(discussionsRoutes, { prefix: '/community/discussions' });
  await app.register(commentsRoutes, { prefix: '/community/comments' });
  await app.register(petitionsRoutes, { prefix: '/community/petitions' });
  await app.register(townhallsRoutes, { prefix: '/community/townhalls' });
  await app.register(feedbackRoutes, { prefix: '/community/feedback' });
  await app.register(groupsRoutes, { prefix: '/community/groups' });
  await app.register(moderationRoutes, { prefix: '/community/moderation' });

  // Health check
  app.get('/health', async () => ({
    status: 'healthy',
    service: 'community-service',
    timestamp: new Date().toISOString(),
  }));

  return app;
}
