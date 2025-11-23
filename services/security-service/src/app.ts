/**
 * Security Service - Fastify Application Configuration
 *
 * Main application setup with all plugins and routes.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { connectDatabase, checkDatabaseHealth, disconnectDatabase } from './lib/prisma.js';
import { checkRedisHealth, disconnectRedis } from './lib/redis.js';

import { auditRoutes } from './routes/audit.js';
import { threatRoutes } from './routes/threats.js';
import { incidentRoutes } from './routes/incidents.js';
import { complianceRoutes } from './routes/compliance.js';

export interface AppConfig {
  logger?: boolean | object;
  trustProxy?: boolean;
}

/**
 * Build the Fastify application
 */
export async function buildApp(config: AppConfig = {}): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: config.logger ?? {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty' }
          : undefined,
    },
    trustProxy: config.trustProxy ?? true,
  });

  // =========================================================================
  // SECURITY PLUGINS
  // =========================================================================

  // Helmet for security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // =========================================================================
  // HEALTH CHECKS
  // =========================================================================

  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'security-service',
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/health/ready', async (request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = await checkRedisHealth();

    const status = dbHealthy && redisHealthy ? 'ready' : 'not_ready';
    const statusCode = dbHealthy && redisHealthy ? 200 : 503;

    reply.status(statusCode).send({
      status,
      service: 'security-service',
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString(),
    });
  });

  fastify.get('/health/live', async () => ({
    status: 'alive',
    service: 'security-service',
    timestamp: new Date().toISOString(),
  }));

  // =========================================================================
  // API ROUTES
  // =========================================================================

  await fastify.register(auditRoutes, { prefix: '/security/audit' });
  await fastify.register(threatRoutes, { prefix: '/security/threats' });
  await fastify.register(incidentRoutes, { prefix: '/security/incidents' });
  await fastify.register(complianceRoutes, { prefix: '/security/compliance' });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================

  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // Zod validation errors
    if (error.name === 'ZodError') {
      reply.status(400).send({
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      });
      return;
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
      code: error.code || 'UNKNOWN_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
      }),
    });
  });

  // =========================================================================
  // GRACEFUL SHUTDOWN
  // =========================================================================

  const shutdown = async () => {
    fastify.log.info('Shutting down security service...');
    await fastify.close();
    await disconnectDatabase();
    await disconnectRedis();
    fastify.log.info('Security service shutdown complete');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return fastify;
}

/**
 * Start the server
 */
export async function startServer(): Promise<FastifyInstance> {
  const PORT = process.env.SECURITY_PORT ? parseInt(process.env.SECURITY_PORT) : 3006;
  const HOST = process.env.HOST || '0.0.0.0';

  try {
    // Connect to database
    await connectDatabase();

    // Build and start server
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage Security Service           ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Endpoints:                                               ║
    ║  - /security/audit/*      - Audit logging & analysis      ║
    ║  - /security/threats/*    - Threat detection              ║
    ║  - /security/incidents/*  - Incident management           ║
    ║  - /security/compliance/* - Compliance reporting          ║
    ╚═══════════════════════════════════════════════════════════╝
    `);

    return app;
  } catch (err) {
    console.error('Failed to start security service:', err);
    process.exit(1);
  }
}
