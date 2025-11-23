/**
 * Summarization Routes
 * API endpoints for bill summarization
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getBillAnalyzer } from '../services/analysis/bill-analyzer.js';

interface SummarizeBody {
  content: string;
  maxLength?: number;
  format?: 'plain' | 'bullet' | 'executive';
}

interface SummarizeBillParams {
  id: string;
}

interface ExplainBody {
  text: string;
  audience?: 'general' | 'expert' | 'child';
}

export async function summarizeRoutes(fastify: FastifyInstance): Promise<void> {
  const analyzer = getBillAnalyzer();

  // Summarize text
  fastify.post<{ Body: SummarizeBody }>(
    '/',
    {
      schema: {
        description: 'Summarize legislation text',
        tags: ['Summarization'],
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            maxLength: { type: 'number' },
            format: { type: 'string', enum: ['plain', 'bullet', 'executive'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              keyPoints: { type: 'array', items: { type: 'string' } },
              affectedGroups: { type: 'array', items: { type: 'string' } },
              tldr: { type: 'string' },
              readingLevel: { type: 'string' },
              wordCount: { type: 'number' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SummarizeBody }>, reply: FastifyReply) => {
      const { content } = request.body;
      const summary = await analyzer.summarizeBill(content);
      return reply.send(summary);
    }
  );

  // Summarize bill by ID
  fastify.post<{ Params: SummarizeBillParams; Body: { billContent: string } }>(
    '/bill/:id',
    {
      schema: {
        description: 'Summarize a specific bill',
        tags: ['Summarization'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: SummarizeBillParams; Body: { billContent: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { billContent } = request.body;

      const summary = await analyzer.summarizeBill(billContent);
      return reply.send({
        billId: id,
        ...summary,
      });
    }
  );

  // Explain text in plain language
  fastify.post<{ Body: ExplainBody }>(
    '/explain',
    {
      schema: {
        description: 'Explain legislation in plain language',
        tags: ['Summarization'],
        body: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string' },
            audience: { type: 'string', enum: ['general', 'expert', 'child'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              explanation: { type: 'string' },
              legalTerms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    term: { type: 'string' },
                    definition: { type: 'string' },
                    context: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ExplainBody }>, reply: FastifyReply) => {
      const { text, audience } = request.body;

      const explanation = await analyzer.explainSection(text, audience || 'general');
      return reply.send(explanation);
    }
  );
}
