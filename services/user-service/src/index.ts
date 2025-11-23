/**
 * User Service - Main Entry Point
 *
 * Handles user profile management, preferences, and verification
 * for the Constitutional Shrinkage platform.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { profileRoutes } from './routes/profile.js';
import { preferencesRoutes } from './routes/preferences.js';
import { verificationRoutes } from './routes/verification.js';
import { connectDatabase, disconnectDatabase, checkDatabaseHealth } from './lib/prisma.js';

const PORT = process.env.USER_PORT ? parseInt(process.env.USER_PORT) : 3003;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // JWT (for verifying tokens from auth service)
  await fastify.register(jwt, {
    secret: JWT_SECRET,
  });

  // Health checks
  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/health/ready', async (request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    const statusCode = dbHealthy ? 200 : 503;

    reply.status(statusCode).send({
      status: dbHealthy ? 'ready' : 'not_ready',
      service: 'user-service',
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Routes
  await fastify.register(profileRoutes, { prefix: '/users' });
  await fastify.register(preferencesRoutes, { prefix: '/users' });
  await fastify.register(verificationRoutes, { prefix: '/users' });

  // Error handling
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    if (error.name === 'ZodError') {
      reply.status(400).send({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: (error as any).issues,
      });
      return;
    }

    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
      code: error.code || 'UNKNOWN_ERROR',
    });
  });

  return fastify;
}

async function start() {
  try {
    await connectDatabase();

    const server = await buildServer();
    await server.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage User Service               ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╚═══════════════════════════════════════════════════════════╝
    `);

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down user service...');
      await server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start user service:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
