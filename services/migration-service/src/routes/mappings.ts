import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { FieldMapping } from '../types/index.js';

const MappingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourceType: z.string(),
  targetType: z.string(),
  fields: z.array(z.object({
    source: z.string(),
    target: z.string(),
    transform: z.string().optional(),
    required: z.boolean().optional(),
    default: z.unknown().optional(),
  })),
});

type StoredMapping = z.infer<typeof MappingSchema> & { id: string; createdAt: Date };

const mappings: Map<string, StoredMapping> = new Map();

// Pre-defined mappings
const builtinMappings: StoredMapping[] = [
  {
    id: 'congress-bill',
    name: 'Congress.gov Bill',
    description: 'Maps Congress.gov bill data to Constitutional platform bill format',
    sourceType: 'congress-gov-bill',
    targetType: 'platform-bill',
    fields: [
      { source: 'number', target: 'externalId', required: true },
      { source: 'title', target: 'title', required: true },
      { source: 'introducedDate', target: 'createdAt', transform: 'date' },
      { source: 'originChamber', target: 'metadata.chamber' },
      { source: 'policyArea.name', target: 'category' },
      { source: 'latestAction.text', target: 'status' },
      { source: 'sponsors[0].bioguideId', target: 'sponsor.id' },
      { source: 'sponsors[0].fullName', target: 'sponsor.name' },
      { source: 'cosponsors.count', target: 'cosponsorsCount', transform: 'number' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'congress-member',
    name: 'Congress.gov Member',
    description: 'Maps Congress member data to person format',
    sourceType: 'congress-gov-member',
    targetType: 'platform-person',
    fields: [
      { source: 'bioguideId', target: 'externalId', required: true },
      { source: 'fullName', target: 'name', required: true },
      { source: 'firstName', target: 'firstName' },
      { source: 'lastName', target: 'lastName' },
      { source: 'party', target: 'party' },
      { source: 'state', target: 'state' },
      { source: 'district', target: 'district', transform: 'number' },
      { source: 'chamber', target: 'role.chamber' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'census-geography',
    name: 'Census Geography',
    description: 'Maps Census Bureau geography to region format',
    sourceType: 'census-geography',
    targetType: 'platform-region',
    fields: [
      { source: 'geoId', target: 'externalId', required: true },
      { source: 'name', target: 'name', required: true },
      { source: 'type', target: 'type' },
      { source: 'stateCode', target: 'codes.state' },
      { source: 'countyCode', target: 'codes.county' },
      { source: 'population', target: 'demographics.population', transform: 'number' },
    ],
    createdAt: new Date(),
  },
  {
    id: 'state-bill',
    name: 'State Bill (OpenStates)',
    description: 'Maps OpenStates bill data to platform format',
    sourceType: 'openstates-bill',
    targetType: 'platform-bill',
    fields: [
      { source: 'identifier', target: 'externalId', required: true },
      { source: 'title', target: 'title', required: true },
      { source: 'classification[0]', target: 'type' },
      { source: 'subject', target: 'subjects', transform: 'array' },
      { source: 'first_action_date', target: 'createdAt', transform: 'date' },
      { source: 'latest_action_description', target: 'status' },
      { source: 'session', target: 'session.identifier' },
    ],
    createdAt: new Date(),
  },
];

// Initialize builtin mappings
builtinMappings.forEach((mapping) => mappings.set(mapping.id, mapping));

export async function mappingRoutes(fastify: FastifyInstance): Promise<void> {
  // List all mappings
  fastify.get('/migration/mappings', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      mappings: Array.from(mappings.values()),
    });
  });

  // Get mapping by ID
  fastify.get<{ Params: { id: string } }>(
    '/migration/mappings/:id',
    async (request, reply: FastifyReply) => {
      const mapping = mappings.get(request.params.id);

      if (!mapping) {
        return reply.status(404).send({ error: 'Mapping not found' });
      }

      return reply.send({ mapping });
    }
  );

  // Create a new mapping
  fastify.post('/migration/mappings', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = MappingSchema.parse(request.body);
      const id = `mapping_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const mapping: StoredMapping = {
        id,
        ...body,
        createdAt: new Date(),
      };

      mappings.set(id, mapping);

      return reply.status(201).send({ mapping });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  });

  // Validate a mapping against sample data
  fastify.post('/migration/mappings/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { mappingId, sampleData } = request.body as {
        mappingId?: string;
        fields?: FieldMapping[];
        sampleData: Record<string, unknown>;
      };

      let fields: FieldMapping[];

      if (mappingId) {
        const mapping = mappings.get(mappingId);
        if (!mapping) {
          return reply.status(404).send({ error: 'Mapping not found' });
        }
        fields = mapping.fields;
      } else {
        const parsed = MappingSchema.safeParse(request.body);
        if (!parsed.success) {
          return reply.status(400).send({ error: 'Invalid mapping', details: parsed.error.errors });
        }
        fields = parsed.data.fields;
      }

      // Validate the mapping
      const results = fields.map((field) => {
        const value = getNestedValue(sampleData, field.source);
        const found = value !== undefined;
        const valid = found || !field.required || field.default !== undefined;

        return {
          field: field.source,
          target: field.target,
          found,
          value: found ? value : field.default,
          valid,
          error: !valid ? `Required field "${field.source}" is missing` : undefined,
        };
      });

      const allValid = results.every((r) => r.valid);

      return reply.send({
        valid: allValid,
        results,
        errors: results.filter((r) => !r.valid),
      });
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }
  });

  // Delete a mapping
  fastify.delete<{ Params: { id: string } }>(
    '/migration/mappings/:id',
    async (request, reply: FastifyReply) => {
      const mapping = mappings.get(request.params.id);

      if (!mapping) {
        return reply.status(404).send({ error: 'Mapping not found' });
      }

      if (!request.params.id.startsWith('mapping_')) {
        return reply.status(400).send({ error: 'Cannot delete built-in mappings' });
      }

      mappings.delete(request.params.id);
      return reply.status(204).send();
    }
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current === null || current === undefined) return undefined;

    // Handle array notation like sponsors[0]
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayKey = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      const arr = (current as Record<string, unknown>)[arrayKey];
      return Array.isArray(arr) ? arr[index] : undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, obj);
}
