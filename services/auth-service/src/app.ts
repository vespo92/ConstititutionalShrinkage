/**
 * Auth Service - Fastify Application Configuration
 *
 * Main application setup with all plugins and routes.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';

import { registerJwtStrategy } from './strategies/jwt.js';
import { registerAuthGuard } from './middleware/auth-guard.js';
import { registerRBAC } from './middleware/rbac.js';
import { registerRateLimiters } from './middleware/rate-limit.js';
import { connectDatabase, checkDatabaseHealth, disconnectDatabase } from './lib/prisma.js';
import { checkRedisHealth, disconnectRedis } from './lib/redis.js';

import { authRoutes } from './routes/auth.js';
import { oauthRoutes } from './routes/oauth.js';
import { passwordRoutes } from './routes/password.js';
import { tokenRoutes } from './routes/tokens.js';
import { verifyRoutes } from './routes/verify.js';

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
    contentSecurityPolicy: false, // Configure based on needs
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

  // Cookies for refresh tokens
  await fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  // =========================================================================
  // JWT AUTHENTICATION
  // =========================================================================

  await registerJwtStrategy(fastify);

  // =========================================================================
  // MIDDLEWARE DECORATORS
  // =========================================================================

  registerAuthGuard(fastify);
  registerRBAC(fastify);
  registerRateLimiters(fastify);

  // =========================================================================
  // HEALTH CHECKS
  // =========================================================================

  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/health/ready', async (request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = await checkRedisHealth();

    const status = dbHealthy && redisHealthy ? 'ready' : 'not_ready';
    const statusCode = dbHealthy && redisHealthy ? 200 : 503;

    reply.status(statusCode).send({
      status,
      service: 'auth-service',
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString(),
    });
  });

  fastify.get('/health/live', async () => ({
    status: 'alive',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }));

  // =========================================================================
  // AUTH ROUTES
  // =========================================================================

  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(oauthRoutes, { prefix: '/auth' });
  await fastify.register(passwordRoutes, { prefix: '/auth' });
  await fastify.register(tokenRoutes, { prefix: '/auth' });
  await fastify.register(verifyRoutes, { prefix: '/auth' });

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

    // JWT errors
    if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      reply.status(401).send({
        error: 'Unauthorized',
        code: 'NO_AUTH_HEADER',
        message: 'No authorization header provided',
      });
      return;
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
      reply.status(401).send({
        error: 'Unauthorized',
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired',
      });
      return;
    }

    if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
      reply.status(401).send({
        error: 'Unauthorized',
        code: 'INVALID_TOKEN',
        message: 'Invalid access token',
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
    fastify.log.info('Shutting down auth service...');
    await fastify.close();
    await disconnectDatabase();
    await disconnectRedis();
    fastify.log.info('Auth service shutdown complete');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return fastify;
}

/**
 * Start the server
 */
export async function startServer(): Promise<FastifyInstance> {
  const PORT = process.env.AUTH_PORT ? parseInt(process.env.AUTH_PORT) : 3002;
  const HOST = process.env.HOST || '0.0.0.0';

  try {
    // Connect to database
    await connectDatabase();

    // Build and start server
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage Auth Service               ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ║  Ready:      http://localhost:${PORT}/health/ready            ║
    ╚═══════════════════════════════════════════════════════════╝
    `);

    return app;
  } catch (err) {
    console.error('Failed to start auth service:', err);
    process.exit(1);
  }
}
