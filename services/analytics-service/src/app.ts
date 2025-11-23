import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { votingRoutes } from './routes/voting.js';
import { legislationRoutes } from './routes/legislation.js';
import { regionsRoutes } from './routes/regions.js';
import { tblRoutes } from './routes/tbl.js';
import { engagementRoutes } from './routes/engagement.js';
import { reportsRoutes } from './routes/reports.js';
import { realtimeRoutes } from './routes/realtime.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(websocket);

  // Health check
  app.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(votingRoutes, { prefix: '/analytics/voting' });
  await app.register(legislationRoutes, { prefix: '/analytics/legislation' });
  await app.register(regionsRoutes, { prefix: '/analytics/regions' });
  await app.register(tblRoutes, { prefix: '/analytics/tbl' });
  await app.register(engagementRoutes, { prefix: '/analytics/engagement' });
  await app.register(reportsRoutes, { prefix: '/analytics/reports' });
  await app.register(realtimeRoutes, { prefix: '/analytics' });

  return app;
}
