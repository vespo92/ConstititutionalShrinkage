/**
 * API Gateway - Main Entry Point
 *
 * Central routing and request handling for Constitutional Shrinkage platform.
 * Built with Fastify for high performance.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { billRoutes } from './routes/bills.js';
import { voteRoutes } from './routes/votes.js';
import { userRoutes } from './routes/users.js';
import { delegationRoutes } from './routes/delegations.js';
import { regionRoutes } from './routes/regions.js';
import { metricsRoutes } from './routes/metrics.js';
import { personRoutes } from './routes/persons.js';
import { organizationRoutes } from './routes/organizations.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // Security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${context.after}`,
      retryAfter: context.after,
    }),
  });

  // JWT authentication
  await fastify.register(jwt, {
    secret: JWT_SECRET,
    sign: { expiresIn: '1h' },
  });

  // API Documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Constitutional Shrinkage API',
        description: 'API for git-style decentralized government platform',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${PORT}`, description: 'Development' },
        { url: 'https://api.constitutional-shrinkage.gov', description: 'Production' },
      ],
      tags: [
        { name: 'Bills', description: 'Legislation management' },
        { name: 'Votes', description: 'Voting operations' },
        { name: 'Users', description: 'User management' },
        { name: 'Delegations', description: 'Liquid democracy delegations' },
        { name: 'Regions', description: 'Regional governance' },
        { name: 'Metrics', description: 'Triple Bottom Line metrics' },
        { name: 'Persons', description: 'Public person information' },
        { name: 'Organizations', description: 'Organization transparency' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Custom decorators
  fastify.decorate('authenticate', authMiddleware(fastify));

  // Error handling
  fastify.setErrorHandler(errorHandler);

  // Health check
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // Register routes - v1 API
  await fastify.register(billRoutes, { prefix: '/api/v1/bills' });
  await fastify.register(voteRoutes, { prefix: '/api/v1/votes' });
  await fastify.register(userRoutes, { prefix: '/api/v1/users' });
  await fastify.register(delegationRoutes, { prefix: '/api/v1/delegations' });
  await fastify.register(regionRoutes, { prefix: '/api/v1/regions' });
  await fastify.register(metricsRoutes, { prefix: '/api/v1/metrics' });
  await fastify.register(personRoutes, { prefix: '/api/v1/persons' });
  await fastify.register(organizationRoutes, { prefix: '/api/v1/organizations' });

  // Also register without version prefix for backwards compatibility
  await fastify.register(billRoutes, { prefix: '/api/bills' });
  await fastify.register(voteRoutes, { prefix: '/api/votes' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(delegationRoutes, { prefix: '/api/delegations' });
  await fastify.register(regionRoutes, { prefix: '/api/regions' });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage API Gateway                ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Docs:       http://localhost:${PORT}/docs                    ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
