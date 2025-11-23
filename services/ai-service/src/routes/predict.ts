/**
 * Prediction Routes
 * API endpoints for impact prediction and outcome modeling
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getImpactPredictor } from '../services/prediction/impact-predictor.js';
import { getTBLScorer } from '../services/prediction/tbl-scorer.js';
import { getOutcomeModel } from '../services/prediction/outcome-model.js';

interface PredictImpactBody {
  billContent: string;
  region: string;
  population?: number;
  economicIndicators?: Record<string, number>;
}

interface PredictOutcomeBody {
  billSummary: string;
  votingHistory?: { billId: string; category: string; yesVotes: number; noVotes: number; passed: boolean }[];
  context?: {
    majorityParty?: string;
    currentSentiment?: Record<string, number>;
    recentEvents?: string[];
  };
}

interface CompareRegionsBody {
  billContent: string;
  regions: string[];
}

export async function predictRoutes(fastify: FastifyInstance): Promise<void> {
  const predictor = getImpactPredictor();
  const scorer = getTBLScorer();
  const outcomeModel = getOutcomeModel();

  // Predict TBL impact
  fastify.post<{ Body: PredictImpactBody }>(
    '/impact',
    {
      schema: {
        description: 'Predict Triple Bottom Line impact',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['billContent', 'region'],
          properties: {
            billContent: { type: 'string' },
            region: { type: 'string' },
            population: { type: 'number' },
            economicIndicators: { type: 'object' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              people: { type: 'object' },
              planet: { type: 'object' },
              profit: { type: 'object' },
              overall: { type: 'number' },
              confidence: { type: 'number' },
              methodology: { type: 'string' },
              region: { type: 'string' },
              analysisDate: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PredictImpactBody }>, reply: FastifyReply) => {
      const { billContent, region, population, economicIndicators } = request.body;

      const impact = await predictor.predictImpact(billContent, {
        region,
        population,
        economicIndicators,
      });

      // Add TBL scoring
      const breakdown = scorer.calculateScore(impact);

      return reply.send({
        ...impact,
        score: breakdown,
      });
    }
  );

  // Predict voting outcome
  fastify.post<{ Body: PredictOutcomeBody }>(
    '/outcome',
    {
      schema: {
        description: 'Predict voting outcome',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['billSummary'],
          properties: {
            billSummary: { type: 'string' },
            votingHistory: { type: 'array' },
            context: { type: 'object' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              predictedOutcome: { type: 'string' },
              confidence: { type: 'number' },
              predictedYesPercentage: { type: 'number' },
              predictedNoPercentage: { type: 'number' },
              keyFactors: { type: 'array', items: { type: 'string' } },
              swingVoters: { type: 'array', items: { type: 'string' } },
              risks: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: PredictOutcomeBody }>, reply: FastifyReply) => {
      const { billSummary, votingHistory, context } = request.body;

      const prediction = await outcomeModel.predictOutcome(
        billSummary,
        votingHistory || [],
        context || {}
      );

      return reply.send(prediction);
    }
  );

  // Compare regional impact
  fastify.post<{ Body: CompareRegionsBody }>(
    '/comparison',
    {
      schema: {
        description: 'Compare impact across regions',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['billContent', 'regions'],
          properties: {
            billContent: { type: 'string' },
            regions: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CompareRegionsBody }>, reply: FastifyReply) => {
      const { billContent, regions } = request.body;
      const comparison = await predictor.compareRegionalImpact(billContent, regions);
      return reply.send(comparison);
    }
  );

  // Analyze scenarios
  fastify.post<{ Body: { billSummary: string; context?: Record<string, unknown> } }>(
    '/scenarios',
    {
      schema: {
        description: 'Analyze different scenarios',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['billSummary'],
          properties: {
            billSummary: { type: 'string' },
            context: { type: 'object' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: { billSummary: string; context?: Record<string, unknown> } }>,
      reply: FastifyReply
    ) => {
      const { billSummary, context } = request.body;
      const scenarios = await outcomeModel.analyzeScenarios(billSummary, context || {});
      return reply.send({ scenarios });
    }
  );

  // Identify stakeholders
  fastify.post<{ Body: { billSummary: string } }>(
    '/stakeholders',
    {
      schema: {
        description: 'Identify stakeholders',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['billSummary'],
          properties: {
            billSummary: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { billSummary: string } }>, reply: FastifyReply) => {
      const { billSummary } = request.body;
      const stakeholders = await outcomeModel.identifyStakeholders(billSummary);
      return reply.send({ stakeholders });
    }
  );

  // Get TBL score breakdown
  fastify.post<{ Body: { report: object } }>(
    '/score',
    {
      schema: {
        description: 'Calculate TBL score breakdown',
        tags: ['Prediction'],
        body: {
          type: 'object',
          required: ['report'],
          properties: {
            report: { type: 'object' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { report: object } }>, reply: FastifyReply) => {
      const { report } = request.body;
      const breakdown = scorer.calculateScore(report as any);
      const explanation = scorer.explainScore(breakdown);
      return reply.send({ breakdown, explanation });
    }
  );
}
