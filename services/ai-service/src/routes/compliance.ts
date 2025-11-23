/**
 * Compliance Routes
 * API endpoints for constitutional compliance checking
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getConstitutionalChecker } from '../services/compliance/constitutional-check.js';
import { getRightsValidator } from '../services/compliance/rights-validator.js';
import { getPrecedentFinder } from '../services/compliance/precedent-finder.js';

interface CheckComplianceBody {
  billContent: string;
  constitution?: string;
}

interface CheckRightBody {
  billContent: string;
  rightId: string;
}

interface FindConflictsBody {
  billContent: string;
}

interface ComplianceReportParams {
  billId: string;
}

export async function complianceRoutes(fastify: FastifyInstance): Promise<void> {
  const checker = getConstitutionalChecker();
  const rightsValidator = getRightsValidator();
  const precedentFinder = getPrecedentFinder();

  // Check constitutional compliance
  fastify.post<{ Body: CheckComplianceBody }>(
    '/check',
    {
      schema: {
        description: 'Check bill for constitutional compliance',
        tags: ['Compliance'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
            constitution: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              compliant: { type: 'boolean' },
              issues: { type: 'array' },
              relevantArticles: { type: 'array' },
              recommendations: { type: 'array', items: { type: 'string' } },
              analysisDate: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CheckComplianceBody }>, reply: FastifyReply) => {
      const { billContent, constitution } = request.body;

      if (constitution) {
        checker.setConstitution(constitution);
      }

      const report = await checker.checkCompliance(billContent);
      return reply.send(report);
    }
  );

  // Check specific right
  fastify.post<{ Body: CheckRightBody }>(
    '/right',
    {
      schema: {
        description: 'Check bill against a specific right',
        tags: ['Compliance'],
        body: {
          type: 'object',
          required: ['billContent', 'rightId'],
          properties: {
            billContent: { type: 'string' },
            rightId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CheckRightBody }>, reply: FastifyReply) => {
      const { billContent, rightId } = request.body;
      const analysis = await rightsValidator.checkRight(billContent, rightId);
      return reply.send(analysis);
    }
  );

  // Check all rights
  fastify.post<{ Body: { billContent: string } }>(
    '/rights',
    {
      schema: {
        description: 'Check bill against all rights',
        tags: ['Compliance'],
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
      const result = await rightsValidator.checkAllRights(billContent);
      return reply.send(result);
    }
  );

  // Find legal conflicts
  fastify.post<{ Body: FindConflictsBody }>(
    '/conflicts',
    {
      schema: {
        description: 'Find legal conflicts',
        tags: ['Compliance'],
        body: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: FindConflictsBody }>, reply: FastifyReply) => {
      const { billContent } = request.body;
      const precedents = await precedentFinder.findPrecedents(billContent);
      return reply.send({ precedents });
    }
  );

  // Get compliance report
  fastify.get<{ Params: ComplianceReportParams; Querystring: { billContent: string } }>(
    '/report/:billId',
    {
      schema: {
        description: 'Get compliance report for a bill',
        tags: ['Compliance'],
        params: {
          type: 'object',
          required: ['billId'],
          properties: {
            billId: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['billContent'],
          properties: {
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: ComplianceReportParams; Querystring: { billContent: string } }>,
      reply: FastifyReply
    ) => {
      const { billId } = request.params;
      const { billContent } = request.query;

      const report = await checker.checkCompliance(billContent);
      const summary = await checker.generateReportSummary(report);

      return reply.send({
        billId,
        report,
        summary,
      });
    }
  );

  // Get available rights
  fastify.get(
    '/rights/catalog',
    {
      schema: {
        description: 'Get catalog of available rights',
        tags: ['Compliance'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rights = rightsValidator.getRights();
      return reply.send({ rights });
    }
  );

  // Get constitutional articles
  fastify.get(
    '/articles',
    {
      schema: {
        description: 'Get constitutional articles',
        tags: ['Compliance'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const articles = checker.getArticles();
      return reply.send({ articles });
    }
  );
}
