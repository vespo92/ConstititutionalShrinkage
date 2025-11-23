import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { createValidator } from '../services/validator.js';

const ValidateBatchSchema = z.object({
  schemaName: z.string().optional(),
  records: z.array(z.object({
    id: z.string(),
    sourceId: z.string(),
    data: z.record(z.unknown()),
  })),
});

const validationResults: Map<string, {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: Array<{ recordId: string; errors: string[] }>;
  createdAt: Date;
  completedAt?: Date;
}> = new Map();

export async function validationRoutes(fastify: FastifyInstance): Promise<void> {
  const validator = createValidator();

  // Validate a batch of records
  fastify.post('/migration/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = ValidateBatchSchema.parse(request.body);

      const validationId = `val_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const result = {
        id: validationId,
        status: 'completed' as const,
        totalRecords: body.records.length,
        validRecords: 0,
        invalidRecords: 0,
        errors: [] as Array<{ recordId: string; errors: string[] }>,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      for (const record of body.records) {
        const validation = validator.validate(record, body.schemaName);

        if (validation.valid) {
          result.validRecords++;
        } else {
          result.invalidRecords++;
          result.errors.push({
            recordId: record.id,
            errors: validation.errors.map((e) => `${e.field}: ${e.message}`),
          });
        }
      }

      validationResults.set(validationId, result);

      return reply.status(201).send({
        validationId,
        summary: {
          total: result.totalRecords,
          valid: result.validRecords,
          invalid: result.invalidRecords,
          errorCount: result.errors.length,
        },
        errors: result.errors.slice(0, 10), // First 10 errors
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  });

  // Get validation results
  fastify.get<{ Params: { id: string } }>(
    '/migration/validate/:id',
    async (request, reply: FastifyReply) => {
      const result = validationResults.get(request.params.id);

      if (!result) {
        return reply.status(404).send({ error: 'Validation result not found' });
      }

      return reply.send({ result });
    }
  );

  // Get available schemas
  fastify.get('/migration/validate/schemas', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      schemas: [
        { name: 'bill', description: 'Bill/legislation validation schema' },
        { name: 'person', description: 'Person/legislator validation schema' },
        { name: 'region', description: 'Geographic region validation schema' },
        { name: 'vote', description: 'Vote record validation schema' },
      ],
    });
  });

  // Validate a single record
  fastify.post('/migration/validate/single', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { schemaName, record } = request.body as {
        schemaName?: string;
        record: { id: string; sourceId: string; data: Record<string, unknown> };
      };

      if (!record) {
        return reply.status(400).send({ error: 'Record is required' });
      }

      const validation = validator.validate(record, schemaName);

      return reply.send({
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
  });
}
