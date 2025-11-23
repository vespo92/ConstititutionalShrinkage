/**
 * Chat Routes
 * API endpoints for conversational AI
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getChatHandler } from '../services/assistant/chat-handler.js';

interface ChatBody {
  message: string;
  userId: string;
  sessionId?: string;
}

interface ChatBillParams {
  id: string;
}

interface ChatBillBody {
  question: string;
  billContent: string;
}

interface VotingExplanationBody {
  sessionDetails: string;
  billSummary: string;
  expertOpinions?: string;
}

interface DelegateRecommendationBody {
  preferences: string;
  category: string;
  delegates: string;
}

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  const chatHandler = getChatHandler();

  // General chat
  fastify.post<{ Body: ChatBody }>(
    '/',
    {
      schema: {
        description: 'Chat with the AI assistant',
        tags: ['Chat'],
        body: {
          type: 'object',
          required: ['message', 'userId'],
          properties: {
            message: { type: 'string' },
            userId: { type: 'string' },
            sessionId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              sources: { type: 'array' },
              relatedBills: { type: 'array' },
              followUpQuestions: { type: 'array', items: { type: 'string' } },
              confidence: { type: 'number' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ChatBody }>, reply: FastifyReply) => {
      const { message, userId, sessionId } = request.body;
      const response = await chatHandler.chat(userId, message, sessionId);
      return reply.send(response);
    }
  );

  // Chat about specific bill
  fastify.post<{ Params: ChatBillParams; Body: ChatBillBody }>(
    '/bill/:id',
    {
      schema: {
        description: 'Ask questions about a specific bill',
        tags: ['Chat'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['question', 'billContent'],
          properties: {
            question: { type: 'string' },
            billContent: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: ChatBillParams; Body: ChatBillBody }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const { question, billContent } = request.body;

      const response = await chatHandler.askAboutBill(id, billContent, question);
      return reply.send(response);
    }
  );

  // Explain voting session
  fastify.post<{ Body: VotingExplanationBody }>(
    '/voting',
    {
      schema: {
        description: 'Get explanation of a voting session',
        tags: ['Chat'],
        body: {
          type: 'object',
          required: ['sessionDetails', 'billSummary'],
          properties: {
            sessionDetails: { type: 'string' },
            billSummary: { type: 'string' },
            expertOpinions: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: VotingExplanationBody }>, reply: FastifyReply) => {
      const { sessionDetails, billSummary, expertOpinions } = request.body;
      const explanation = await chatHandler.explainVotingSession(
        sessionDetails,
        billSummary,
        expertOpinions
      );
      return reply.send(explanation);
    }
  );

  // Recommend delegates
  fastify.post<{ Body: DelegateRecommendationBody }>(
    '/delegates',
    {
      schema: {
        description: 'Get delegate recommendations',
        tags: ['Chat'],
        body: {
          type: 'object',
          required: ['preferences', 'category', 'delegates'],
          properties: {
            preferences: { type: 'string' },
            category: { type: 'string' },
            delegates: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: DelegateRecommendationBody }>, reply: FastifyReply) => {
      const { preferences, category, delegates } = request.body;
      const recommendations = await chatHandler.recommendDelegates(
        preferences,
        category,
        delegates
      );
      return reply.send(recommendations);
    }
  );

  // Get chat history
  fastify.get<{ Querystring: { userId: string; sessionId?: string } }>(
    '/history',
    {
      schema: {
        description: 'Get chat history',
        tags: ['Chat'],
        querystring: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
            sessionId: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: { userId: string; sessionId?: string } }>,
      reply: FastifyReply
    ) => {
      const { userId, sessionId } = request.query;

      if (sessionId) {
        const session = chatHandler.getSession(sessionId);
        return reply.send({ session });
      }

      const sessions = chatHandler.getUserSessions(userId);
      return reply.send({ sessions });
    }
  );

  // Get chat statistics
  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get chat statistics',
        tags: ['Chat'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const stats = chatHandler.getStats();
      return reply.send(stats);
    }
  );

  // Delete session
  fastify.delete<{ Params: { sessionId: string } }>(
    '/session/:sessionId',
    {
      schema: {
        description: 'Delete a chat session',
        tags: ['Chat'],
        params: {
          type: 'object',
          required: ['sessionId'],
          properties: {
            sessionId: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { sessionId: string } }>,
      reply: FastifyReply
    ) => {
      const { sessionId } = request.params;
      const deleted = chatHandler.deleteSession(sessionId);
      return reply.send({ deleted });
    }
  );
}
