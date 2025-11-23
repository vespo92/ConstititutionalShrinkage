/**
 * AI Service Application
 * Fastify application setup
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { analyzeRoutes } from './routes/analyze.js';
import { summarizeRoutes } from './routes/summarize.js';
import { complianceRoutes } from './routes/compliance.js';
import { predictRoutes } from './routes/predict.js';
import { chatRoutes } from './routes/chat.js';
import { searchRoutes } from './routes/search.js';
import { getCache } from './lib/cache.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-service-development-secret';

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // Security
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

  // Rate limiting - more restrictive for AI endpoints
  await fastify.register(rateLimit, {
    max: 50, // Lower limit for AI operations (cost)
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `AI rate limit exceeded, retry in ${context.after}`,
      retryAfter: context.after,
    }),
  });

  // JWT
  await fastify.register(jwt, {
    secret: JWT_SECRET,
    sign: { expiresIn: '1h' },
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'AI Service API',
        description: 'AI/ML Analysis Services for Constitutional Shrinkage',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:3005', description: 'Development' },
        { url: 'https://ai.constitutional-shrinkage.gov', description: 'Production' },
      ],
      tags: [
        { name: 'Analysis', description: 'Bill analysis endpoints' },
        { name: 'Summarization', description: 'Text summarization' },
        { name: 'Compliance', description: 'Constitutional compliance checking' },
        { name: 'Prediction', description: 'Impact and outcome prediction' },
        { name: 'Chat', description: 'Conversational AI' },
        { name: 'Search', description: 'Semantic search and RAG' },
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

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  // Health check
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async () => ({
    status: 'healthy',
    service: 'ai-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // Cache stats endpoint
  fastify.get('/cache/stats', async () => {
    const cache = getCache();
    return cache.getStats();
  });

  // Register routes
  await fastify.register(analyzeRoutes, { prefix: '/ai/analyze' });
  await fastify.register(summarizeRoutes, { prefix: '/ai/summarize' });
  await fastify.register(complianceRoutes, { prefix: '/ai/compliance' });
  await fastify.register(predictRoutes, { prefix: '/ai/predict' });
  await fastify.register(chatRoutes, { prefix: '/ai/chat' });
  await fastify.register(searchRoutes, { prefix: '/ai/search' });

  return fastify;
}
