import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const SourceConfigSchema = z.object({
  type: z.enum(['api', 'database', 'file', 'ftp']),
  name: z.string(),
  config: z.record(z.unknown()),
});

type SourceConfig = z.infer<typeof SourceConfigSchema>;

const sources: Map<string, SourceConfig & { id: string }> = new Map();

// Pre-configured sources
const builtinSources = [
  {
    id: 'congress-gov',
    type: 'api' as const,
    name: 'Congress.gov',
    config: {
      baseUrl: 'https://api.congress.gov/v3',
      requiresApiKey: true,
      rateLimit: 5,
    },
  },
  {
    id: 'census-bureau',
    type: 'api' as const,
    name: 'Census Bureau',
    config: {
      baseUrl: 'https://api.census.gov',
      requiresApiKey: true,
      rateLimit: 5,
    },
  },
  {
    id: 'fec',
    type: 'api' as const,
    name: 'Federal Election Commission',
    config: {
      baseUrl: 'https://api.open.fec.gov/v1',
      requiresApiKey: true,
      rateLimit: 5,
    },
  },
  {
    id: 'govinfo',
    type: 'api' as const,
    name: 'GovInfo',
    config: {
      baseUrl: 'https://api.govinfo.gov',
      requiresApiKey: true,
      rateLimit: 5,
    },
  },
  {
    id: 'regulations-gov',
    type: 'api' as const,
    name: 'Regulations.gov',
    config: {
      baseUrl: 'https://api.regulations.gov/v4',
      requiresApiKey: true,
      rateLimit: 5,
    },
  },
  {
    id: 'openstates',
    type: 'api' as const,
    name: 'Open States',
    config: {
      baseUrl: 'https://v3.openstates.org',
      requiresApiKey: true,
      rateLimit: 3,
    },
  },
];

// Initialize builtin sources
builtinSources.forEach((source) => sources.set(source.id, source));

export async function sourceRoutes(fastify: FastifyInstance): Promise<void> {
  // List available sources
  fastify.get('/migration/sources', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      sources: Array.from(sources.values()),
    });
  });

  // Get source by ID
  fastify.get<{ Params: { id: string } }>(
    '/migration/sources/:id',
    async (request, reply: FastifyReply) => {
      const source = sources.get(request.params.id);

      if (!source) {
        return reply.status(404).send({ error: 'Source not found' });
      }

      return reply.send({ source });
    }
  );

  // Configure a new source
  fastify.post('/migration/sources', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = SourceConfigSchema.parse(request.body);
      const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const source = { id, ...body };
      sources.set(id, source);

      return reply.status(201).send({ source });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  });

  // Test source connection
  fastify.post<{ Params: { id: string } }>(
    '/migration/sources/:id/test',
    async (request, reply: FastifyReply) => {
      const source = sources.get(request.params.id);

      if (!source) {
        return reply.status(404).send({ error: 'Source not found' });
      }

      // Simulate connection test
      // In production, would actually test the connection
      const testResult = {
        success: true,
        latency: Math.floor(Math.random() * 200) + 50,
        message: 'Connection successful',
        capabilities: {
          pagination: true,
          filtering: true,
          rateLimit: source.config.rateLimit,
        },
      };

      return reply.send({ result: testResult });
    }
  );

  // Delete a custom source
  fastify.delete<{ Params: { id: string } }>(
    '/migration/sources/:id',
    async (request, reply: FastifyReply) => {
      const source = sources.get(request.params.id);

      if (!source) {
        return reply.status(404).send({ error: 'Source not found' });
      }

      if (!request.params.id.startsWith('custom_')) {
        return reply.status(400).send({ error: 'Cannot delete built-in sources' });
      }

      sources.delete(request.params.id);
      return reply.status(204).send();
    }
  );
}
