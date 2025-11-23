/**
 * Search Routes
 * API endpoints for semantic search
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getSemanticSearchService } from '../services/embeddings/semantic-search.js';
import { getRAGPipeline } from '../lib/rag.js';

interface SemanticSearchBody {
  query: string;
  filters?: {
    categories?: string[];
    dateRange?: { start: string; end: string };
    status?: string[];
    region?: string;
    minRelevance?: number;
  };
  limit?: number;
}

interface SimilarBillsParams {
  billId: string;
}

interface FindPrecedentsBody {
  billContent: string;
  limit?: number;
}

interface IndexBillBody {
  id: string;
  title: string;
  content: string;
  status: string;
  category: string;
  region: string;
  dateIntroduced: string;
}

interface RAGQueryBody {
  question: string;
  context?: string[];
}

export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  const searchService = getSemanticSearchService();
  const ragPipeline = getRAGPipeline();

  // Semantic search
  fastify.post<{ Body: SemanticSearchBody }>(
    '/semantic',
    {
      schema: {
        description: 'Perform semantic search across bills',
        tags: ['Search'],
        body: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string' },
            filters: { type: 'object' },
            limit: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              results: { type: 'array' },
              suggestedFilters: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SemanticSearchBody }>, reply: FastifyReply) => {
      const { query, filters } = request.body;
      const results = await searchService.searchBills(query, filters);
      return reply.send(results);
    }
  );

  // Find similar bills
  fastify.get<{ Params: SimilarBillsParams; Querystring: { limit?: number } }>(
    '/similar/:billId',
    {
      schema: {
        description: 'Find similar bills',
        tags: ['Search'],
        params: {
          type: 'object',
          required: ['billId'],
          properties: {
            billId: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: SimilarBillsParams; Querystring: { limit?: number } }>,
      reply: FastifyReply
    ) => {
      const { billId } = request.params;
      const { limit } = request.query;

      const similar = await searchService.findSimilar(billId, limit || 5);
      return reply.send({ similar });
    }
  );

  // Find precedents
  fastify.post<{ Body: FindPrecedentsBody }>(
    '/precedents',
    {
      schema: {
        description: 'Find relevant legal precedents',
        tags: ['Search'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
            limit: { type: 'number' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: FindPrecedentsBody }>, reply: FastifyReply) => {
      const { billContent } = request.body;
      const precedents = await searchService.findPrecedents(billContent);
      return reply.send({ precedents });
    }
  );

  // RAG query
  fastify.post<{ Body: RAGQueryBody }>(
    '/rag',
    {
      schema: {
        description: 'Answer question using RAG',
        tags: ['Search'],
        body: {
          type: 'object',
          required: ['question'],
          properties: {
            question: { type: 'string' },
            context: { type: 'array', items: { type: 'string' } },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              context: { type: 'array' },
              confidence: { type: 'number' },
              sources: { type: 'array' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RAGQueryBody }>, reply: FastifyReply) => {
      const { question, context } = request.body;

      let result;
      if (context && context.length > 0) {
        result = await ragPipeline.queryWithContext(question, context);
      } else {
        result = await ragPipeline.query(question);
      }

      return reply.send(result);
    }
  );

  // Index bill
  fastify.post<{ Body: IndexBillBody }>(
    '/index',
    {
      schema: {
        description: 'Index a bill for search',
        tags: ['Search'],
        body: {
          type: 'object',
          required: ['id', 'title', 'content', 'status', 'category', 'region', 'dateIntroduced'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string' },
            category: { type: 'string' },
            region: { type: 'string' },
            dateIntroduced: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IndexBillBody }>, reply: FastifyReply) => {
      const bill = request.body;
      await searchService.indexBill(bill);
      return reply.send({ success: true, indexed: bill.id });
    }
  );

  // Bulk index bills
  fastify.post<{ Body: { bills: IndexBillBody[] } }>(
    '/index/bulk',
    {
      schema: {
        description: 'Index multiple bills',
        tags: ['Search'],
        body: {
          type: 'object',
          required: ['bills'],
          properties: {
            bills: { type: 'array' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { bills: IndexBillBody[] } }>, reply: FastifyReply) => {
      const { bills } = request.body;
      const count = await searchService.indexBills(bills);
      return reply.send({ success: true, indexed: count });
    }
  );

  // Get search stats
  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get search index statistics',
        tags: ['Search'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = searchService.getStats();
      return reply.send(stats);
    }
  );

  // Clear index
  fastify.delete(
    '/index',
    {
      schema: {
        description: 'Clear the search index',
        tags: ['Search'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      searchService.clear();
      return reply.send({ success: true, message: 'Index cleared' });
    }
  );
}
