import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { SignatureCollector } from '../services/petition/signature-collector.js';
import { ThresholdChecker } from '../services/petition/threshold-checker.js';
import { NotificationService } from '../services/petition/notification.js';

const signatureCollector = new SignatureCollector();
const thresholdChecker = new ThresholdChecker();
const notificationService = new NotificationService();

const CreatePetitionSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().min(100),
  category: z.enum(['environment', 'education', 'healthcare', 'transportation', 'housing', 'economy', 'civil-rights', 'general']),
  region: z.string(),
  goal: z.number().min(100).max(1000000),
  deadline: z.string().optional(),
});

const SignPetitionSchema = z.object({
  publicSignature: z.boolean().default(true),
  comment: z.string().max(500).optional(),
});

export const petitionsRoutes: FastifyPluginAsync = async (app) => {
  // List petitions
  app.get('/', {
    schema: {
      tags: ['petitions'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'successful', 'closed', 'rejected'] },
          category: { type: 'string' },
          region: { type: 'string' },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
      },
    },
  }, async (request, reply) => {
    const query = request.query as any;
    // Simulated response
    return {
      petitions: [
        {
          id: '1',
          title: 'Expand public transit to underserved areas',
          description: 'We call for the expansion of bus routes to suburban and rural communities.',
          creator: { id: '1', displayName: 'Transit Coalition' },
          signatures: 8567,
          goal: 10000,
          progress: 85.67,
          category: 'transportation',
          region: 'State',
          status: 'active',
          createdAt: new Date().toISOString(),
          responseRequired: true,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        hasMore: false,
      },
    };
  });

  // Get single petition
  app.get('/:id', {
    schema: {
      tags: ['petitions'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      petition: {
        id,
        title: 'Expand public transit to underserved areas',
        description: 'We call for the expansion of bus routes to suburban and rural communities that currently lack adequate public transportation.',
        creator: { id: '1', displayName: 'Transit Coalition' },
        signatures: 8567,
        goal: 10000,
        progress: 85.67,
        category: 'transportation',
        region: 'State',
        status: 'active',
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        responseRequired: true,
        recentSignatures: [
          { name: 'John D.', publicSignature: true, signedAt: new Date().toISOString() },
        ],
      },
    };
  });

  // Create petition
  app.post('/', {
    schema: {
      tags: ['petitions'],
    },
  }, async (request, reply) => {
    const data = CreatePetitionSchema.parse(request.body);
    const petition = {
      id: Date.now().toString(),
      ...data,
      creator: { id: 'user-id', displayName: 'Current User' },
      signatures: 1,
      progress: (1 / data.goal) * 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      responseRequired: false,
    };
    return reply.status(201).send({ petition });
  });

  // Sign petition
  app.post('/:id/sign', {
    schema: {
      tags: ['petitions'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = SignPetitionSchema.parse(request.body);

    const signature = await signatureCollector.collect({
      petitionId: id,
      userId: 'user-id', // Would come from auth
      ...data,
    });

    // Check if any threshold was reached
    const thresholdStatus = await thresholdChecker.check(id);
    if (thresholdStatus.newThresholdReached) {
      await notificationService.notifyThresholdReached(id, thresholdStatus.threshold);
    }

    return reply.status(201).send({
      signature,
      thresholdStatus,
    });
  });

  // Get petition threshold status
  app.get('/:id/threshold', {
    schema: {
      tags: ['petitions'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const status = await thresholdChecker.check(id);
    return { status };
  });
};
