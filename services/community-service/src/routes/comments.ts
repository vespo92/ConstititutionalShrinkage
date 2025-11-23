import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const SubmitCommentSchema = z.object({
  billId: z.string(),
  position: z.enum(['support', 'oppose', 'neutral']),
  comment: z.string().min(1),
  representingOrg: z.string().optional(),
});

export const commentsRoutes: FastifyPluginAsync = async (app) => {
  // Get comments for a bill
  app.get('/bill/:billId', {
    schema: {
      tags: ['comments'],
      params: {
        type: 'object',
        properties: {
          billId: { type: 'string' },
        },
        required: ['billId'],
      },
      querystring: {
        type: 'object',
        properties: {
          position: { type: 'string', enum: ['support', 'oppose', 'neutral'] },
          sort: { type: 'string', enum: ['recent', 'relevance'] },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
      },
    },
  }, async (request, reply) => {
    const { billId } = request.params as { billId: string };
    const query = request.query as any;

    // Simulated response
    return {
      comments: [
        {
          id: '1',
          author: { id: '1', displayName: 'Environmental Coalition' },
          organization: 'Green Future Alliance',
          position: 'support',
          comment: 'We strongly support this legislation.',
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

  // Submit public comment
  app.post('/', {
    schema: {
      tags: ['comments'],
    },
  }, async (request, reply) => {
    const data = SubmitCommentSchema.parse(request.body);
    const comment = {
      id: Date.now().toString(),
      ...data,
      author: { id: 'user-id', displayName: 'Current User' },
      createdAt: new Date().toISOString(),
    };
    return reply.status(201).send({ comment });
  });

  // Get comment summary for a bill
  app.get('/summary/:billId', {
    schema: {
      tags: ['comments'],
    },
  }, async (request, reply) => {
    const { billId } = request.params as { billId: string };
    return {
      summary: {
        billId,
        totalComments: 1247,
        breakdown: {
          support: 687,
          oppose: 412,
          neutral: 148,
        },
        topConcerns: ['Implementation timeline', 'Cost to taxpayers'],
        topSupports: ['Environmental benefits', 'Job creation'],
        organizationsRepresented: 45,
      },
    };
  });

  // Export comments for official record
  app.get('/export/:billId', {
    schema: {
      tags: ['comments'],
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['pdf', 'csv'] },
        },
      },
    },
  }, async (request, reply) => {
    const { billId } = request.params as { billId: string };
    const { format = 'csv' } = request.query as { format?: string };

    // In production, would generate actual file
    reply.header('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="comments-${billId}.${format}"`);
    return 'id,author,position,comment,createdAt\n';
  });
};
