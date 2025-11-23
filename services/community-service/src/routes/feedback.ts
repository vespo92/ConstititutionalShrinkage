import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const SubmitFeedbackSchema = z.object({
  policyId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(1),
  impactAreas: z.array(z.string()).optional(),
});

export const feedbackRoutes: FastifyPluginAsync = async (app) => {
  // List policies for feedback
  app.get('/policies', {
    schema: {
      tags: ['feedback'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'under-review', 'sunset'] },
        },
      },
    },
  }, async (request, reply) => {
    return {
      policies: [
        {
          id: '1',
          title: 'Renewable Energy Standards 2024',
          description: 'Requirements for utilities to source 50% renewable energy by 2030.',
          implementedDate: '2024-01-15',
          feedbackCount: 523,
          averageRating: 4.2,
          status: 'active',
        },
      ],
    };
  });

  // Get single policy
  app.get('/policy/:id', {
    schema: {
      tags: ['feedback'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      policy: {
        id,
        title: 'Renewable Energy Standards 2024',
        description: 'Requirements for utilities to source 50% renewable energy by 2030.',
        implementedDate: '2024-01-15',
        feedbackCount: 523,
        averageRating: 4.2,
        status: 'active',
        feedbackBreakdown: {
          ratings: { 1: 23, 2: 45, 3: 89, 4: 156, 5: 210 },
          topFeedback: [
            { theme: 'Implementation costs', count: 156 },
            { theme: 'Timeline concerns', count: 98 },
          ],
        },
      },
    };
  });

  // Submit feedback
  app.post('/', {
    schema: {
      tags: ['feedback'],
    },
  }, async (request, reply) => {
    const data = SubmitFeedbackSchema.parse(request.body);
    const feedback = {
      id: Date.now().toString(),
      ...data,
      author: { id: 'user-id', displayName: 'Current User' },
      createdAt: new Date().toISOString(),
    };
    return reply.status(201).send({ feedback });
  });

  // Get feedback for a policy
  app.get('/policy/:id/feedback', {
    schema: {
      tags: ['feedback'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    return {
      feedback: [
        {
          id: '1',
          rating: 4,
          feedback: 'Great initiative but timeline is aggressive.',
          author: { id: '1', displayName: 'Jane Doe' },
          createdAt: new Date().toISOString(),
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
};
