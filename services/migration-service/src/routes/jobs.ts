import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createOrchestrator, MigrationOrchestrator } from '../services/orchestrator.js';

const CreateJobSchema = z.object({
  name: z.string().min(1),
  source: z.object({
    type: z.enum(['api', 'database', 'file', 'ftp']),
    name: z.string(),
    config: z.record(z.unknown()),
  }),
  destination: z.object({
    type: z.enum(['database', 'file']),
    config: z.record(z.unknown()),
  }),
  mapping: z.array(z.object({
    source: z.string(),
    target: z.string(),
    transform: z.string().optional(),
    required: z.boolean().optional(),
    default: z.unknown().optional(),
  })),
  options: z.object({
    batchSize: z.number().default(100),
    concurrency: z.number().default(5),
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(1000),
    validateBeforeLoad: z.boolean().default(true),
    skipDuplicates: z.boolean().default(true),
    dryRun: z.boolean().default(false),
    checkpoint: z.boolean().default(true),
  }).default({}),
});

let orchestrator: MigrationOrchestrator;

export async function jobRoutes(fastify: FastifyInstance): Promise<void> {
  orchestrator = createOrchestrator();

  // Create a new migration job
  fastify.post('/migration/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateJobSchema.parse(request.body);

      const job = await orchestrator.createJob(body.name, {
        source: body.source,
        destination: body.destination,
        mapping: body.mapping,
        options: body.options,
      });

      return reply.status(201).send({ job });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  });

  // List all jobs
  fastify.get('/migration/jobs', async (_request: FastifyRequest, reply: FastifyReply) => {
    const jobs = orchestrator.listJobs();
    return reply.send({ jobs });
  });

  // Get job by ID
  fastify.get<{ Params: { id: string } }>(
    '/migration/jobs/:id',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      return reply.send({ job });
    }
  );

  // Start a job
  fastify.post<{ Params: { id: string } }>(
    '/migration/jobs/:id/start',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      // Start job in background
      orchestrator.startJob(request.params.id).catch((err) => {
        console.error(`Job ${request.params.id} failed:`, err);
      });

      return reply.send({ message: 'Job started', jobId: request.params.id });
    }
  );

  // Pause a job
  fastify.post<{ Params: { id: string } }>(
    '/migration/jobs/:id/pause',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      await orchestrator.pauseJob(request.params.id);
      return reply.send({ message: 'Job paused', jobId: request.params.id });
    }
  );

  // Resume a job
  fastify.post<{ Params: { id: string } }>(
    '/migration/jobs/:id/resume',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      orchestrator.resumeJob(request.params.id).catch((err) => {
        console.error(`Job ${request.params.id} resume failed:`, err);
      });

      return reply.send({ message: 'Job resumed', jobId: request.params.id });
    }
  );

  // Cancel a job
  fastify.post<{ Params: { id: string } }>(
    '/migration/jobs/:id/cancel',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      await orchestrator.cancelJob(request.params.id);
      return reply.send({ message: 'Job cancelled', jobId: request.params.id });
    }
  );

  // Rollback a job
  fastify.post<{ Params: { id: string } }>(
    '/migration/jobs/:id/rollback',
    async (request, reply: FastifyReply) => {
      const job = orchestrator.getJob(request.params.id);

      if (!job) {
        return reply.status(404).send({ error: 'Job not found' });
      }

      await orchestrator.rollbackJob(request.params.id);
      return reply.send({ message: 'Job rolled back', jobId: request.params.id });
    }
  );
}
