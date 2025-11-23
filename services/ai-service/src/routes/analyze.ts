/**
 * Bill Analysis Routes
 * API endpoints for bill analysis operations
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getBillAnalyzer } from '../services/analysis/bill-analyzer.js';
import { getConflictDetector } from '../services/analysis/conflict-detector.js';
import { getAmendmentAnalyzer } from '../services/analysis/amendment-analyzer.js';

interface AnalyzeBillBody {
  billContent: string;
  billId?: string;
  region?: string;
  includeCompliance?: boolean;
  includeImpact?: boolean;
}

interface AnalyzeSectionBody {
  section: string;
  context: string;
}

interface AnalyzeDiffBody {
  original: string;
  amended: string;
}

interface FindConflictsBody {
  billContent: string;
  existingLaws: { id: string; title: string; summary: string }[];
}

interface AnalyzeAmendmentBody {
  originalBill: string;
  amendment: {
    id: string;
    title: string;
    sponsor: string;
    content: string;
    targetSection?: string;
  };
}

export async function analyzeRoutes(fastify: FastifyInstance): Promise<void> {
  const analyzer = getBillAnalyzer();
  const conflictDetector = getConflictDetector();
  const amendmentAnalyzer = getAmendmentAnalyzer();

  // Full bill analysis
  fastify.post<{ Body: AnalyzeBillBody }>(
    '/bill',
    {
      schema: {
        description: 'Perform full analysis on a bill',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
            billId: { type: 'string' },
            region: { type: 'string' },
            includeCompliance: { type: 'boolean' },
            includeImpact: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              billId: { type: 'string' },
              summary: { type: 'object' },
              categories: { type: 'array', items: { type: 'string' } },
              keywords: { type: 'array', items: { type: 'string' } },
              analysisDate: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AnalyzeBillBody }>, reply: FastifyReply) => {
      const { billContent, billId, region, includeCompliance, includeImpact } = request.body;

      const analysis = await analyzer.analyzeBill(billId || 'unknown', billContent, {
        region,
        includeCompliance,
        includeImpact,
      });

      return reply.send(analysis);
    }
  );

  // Section explanation
  fastify.post<{ Body: AnalyzeSectionBody }>(
    '/section',
    {
      schema: {
        description: 'Explain a specific section of a bill',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['section', 'context'],
          properties: {
            section: { type: 'string' },
            context: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AnalyzeSectionBody }>, reply: FastifyReply) => {
      const { section, context } = request.body;
      const explanation = await analyzer.explainSection(section, context);
      return reply.send(explanation);
    }
  );

  // Diff explanation
  fastify.post<{ Body: AnalyzeDiffBody }>(
    '/diff',
    {
      schema: {
        description: 'Explain changes between bill versions',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['original', 'amended'],
          properties: {
            original: { type: 'string' },
            amended: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AnalyzeDiffBody }>, reply: FastifyReply) => {
      const { original, amended } = request.body;
      const explanation = await analyzer.explainChanges(original, amended);
      return reply.send(explanation);
    }
  );

  // Find legal conflicts
  fastify.post<{ Body: FindConflictsBody }>(
    '/conflicts',
    {
      schema: {
        description: 'Find conflicts with existing laws',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['billContent', 'existingLaws'],
          properties: {
            billContent: { type: 'string' },
            existingLaws: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  summary: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: FindConflictsBody }>, reply: FastifyReply) => {
      const { billContent, existingLaws } = request.body;
      const result = await conflictDetector.findConflicts(billContent, existingLaws);
      return reply.send(result);
    }
  );

  // Analyze amendment
  fastify.post<{ Body: AnalyzeAmendmentBody }>(
    '/amendment',
    {
      schema: {
        description: 'Analyze a proposed amendment',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['originalBill', 'amendment'],
          properties: {
            originalBill: { type: 'string' },
            amendment: {
              type: 'object',
              required: ['id', 'title', 'sponsor', 'content'],
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                sponsor: { type: 'string' },
                content: { type: 'string' },
                targetSection: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: AnalyzeAmendmentBody }>, reply: FastifyReply) => {
      const { originalBill, amendment } = request.body;
      const analysis = await amendmentAnalyzer.analyzeAmendment(originalBill, amendment);
      return reply.send(analysis);
    }
  );

  // Categorize bill
  fastify.post<{ Body: { billContent: string } }>(
    '/categorize',
    {
      schema: {
        description: 'Categorize a bill',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { billContent: string } }>, reply: FastifyReply) => {
      const { billContent } = request.body;
      const categories = await analyzer.categorizeBill(billContent);
      return reply.send({ categories });
    }
  );

  // Extract keywords
  fastify.post<{ Body: { billContent: string } }>(
    '/keywords',
    {
      schema: {
        description: 'Extract keywords from a bill',
        tags: ['Analysis'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { billContent: string } }>, reply: FastifyReply) => {
      const { billContent } = request.body;
      const keywords = await analyzer.extractKeywords(billContent);
      return reply.send({ keywords });
    }
  );
}
