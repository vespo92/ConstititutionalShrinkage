import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

import { jobRoutes } from './routes/jobs.js';
import { sourceRoutes } from './routes/sources.js';
import { mappingRoutes } from './routes/mappings.js';
import { validationRoutes } from './routes/validation.js';

export interface AppConfig {
  port: number;
  host: string;
  logger: boolean;
}

export async function buildApp(config?: Partial<AppConfig>): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: config?.logger ?? true,
  });

  // Register plugins
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'migration-service', timestamp: new Date().toISOString() };
  });

  // API info
  fastify.get('/', async () => {
    return {
      service: 'Constitutional Shrinkage Migration Service',
      version: '1.0.0',
      description: 'Data migration and ETL service for importing government data',
      endpoints: {
        jobs: '/migration/jobs',
        sources: '/migration/sources',
        mappings: '/migration/mappings',
        validation: '/migration/validate',
      },
      documentation: '/docs',
    };
  });

  // Register routes
  await fastify.register(jobRoutes);
  await fastify.register(sourceRoutes);
  await fastify.register(mappingRoutes);
  await fastify.register(validationRoutes);

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });

  return fastify;
}

export async function startApp(config?: Partial<AppConfig>): Promise<FastifyInstance> {
  const fastify = await buildApp(config);

  const port = config?.port ?? parseInt(process.env.PORT ?? '3006', 10);
  const host = config?.host ?? '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    fastify.log.info(`Migration service listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  return fastify;
}
