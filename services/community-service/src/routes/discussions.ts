import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ThreadManager } from '../services/discussion/thread-manager.js';
import { CommentTreeService } from '../services/discussion/comment-tree.js';
import { VotingService } from '../services/discussion/voting.js';

const threadManager = new ThreadManager();
const commentTree = new CommentTreeService();
const votingService = new VotingService();

const CreateThreadSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  category: z.enum(['legislation', 'policy', 'local', 'feedback', 'general']),
  billId: z.string().optional(),
  tags: z.array(z.string()).max(5).default([]),
});

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentId: z.string().optional(),
});

const VoteSchema = z.object({
  type: z.enum(['up', 'down']),
});

export const discussionsRoutes: FastifyPluginAsync = async (app) => {
  // List threads
  app.get('/', {
    schema: {
      tags: ['discussions'],
      querystring: {
        type: 'object',
        properties: {
          sort: { type: 'string', enum: ['hot', 'new', 'top', 'controversial'] },
          timeframe: { type: 'string', enum: ['day', 'week', 'month', 'year', 'all'] },
          category: { type: 'string' },
          billId: { type: 'string' },
          page: { type: 'number', minimum: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { sort = 'hot', timeframe = 'week', category, billId, page = 1, limit = 20 } = request.query as any;
    const threads = await threadManager.getThreads({ sort, timeframe, category, billId, page, limit });
    return threads;
  });

  // Get single thread with comments
  app.get('/:id', {
    schema: {
      tags: ['discussions'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const thread = await threadManager.getThread(id);
    if (!thread) {
      return reply.status(404).send({ error: 'Thread not found' });
    }
    const comments = await commentTree.getComments(id);
    return { thread, comments };
  });

  // Create thread
  app.post('/', {
    schema: {
      tags: ['discussions'],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          category: { type: 'string' },
          billId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'content', 'category'],
      },
    },
  }, async (request, reply) => {
    const data = CreateThreadSchema.parse(request.body);
    const thread = await threadManager.createThread({
      ...data,
      authorId: 'user-id', // Would come from auth
    });
    return reply.status(201).send({ thread });
  });

  // Add comment to thread
  app.post('/:id/comments', {
    schema: {
      tags: ['discussions'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = CreateCommentSchema.parse(request.body);
    const comment = await commentTree.addComment({
      threadId: id,
      content: data.content,
      parentId: data.parentId,
      authorId: 'user-id', // Would come from auth
    });
    return reply.status(201).send({ comment });
  });

  // Vote on thread or comment
  app.post('/:id/vote', {
    schema: {
      tags: ['discussions'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { type } = VoteSchema.parse(request.body);
    await votingService.vote({
      targetId: id,
      targetType: 'thread',
      type,
      userId: 'user-id', // Would come from auth
    });
    return { success: true };
  });

  // Bill-specific discussions
  app.get('/bill/:billId', {
    schema: {
      tags: ['discussions'],
    },
  }, async (request, reply) => {
    const { billId } = request.params as { billId: string };
    const threads = await threadManager.getThreadsByBill(billId);
    return { threads };
  });
};
