import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { RoomManager } from '../services/townhall/room-manager.js';
import { QuestionQueue } from '../services/townhall/question-queue.js';
import { LiveChatService } from '../services/townhall/live-chat.js';
import { RecordingService } from '../services/townhall/recording.js';

const roomManager = new RoomManager();
const questionQueue = new QuestionQueue();
const liveChatService = new LiveChatService();
const recordingService = new RecordingService();

const ScheduleTownHallSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  hostId: z.string(),
  scheduledFor: z.string(),
  duration: z.number().min(15).max(180),
  billIds: z.array(z.string()).optional(),
  region: z.string(),
  maxAttendees: z.number().optional(),
});

const SubmitQuestionSchema = z.object({
  question: z.string().min(1).max(500),
});

export const townhallsRoutes: FastifyPluginAsync = async (app) => {
  // List town halls
  app.get('/', {
    schema: {
      tags: ['townhalls'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['scheduled', 'live', 'ended'] },
          region: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { status } = request.query as any;
    const events = await roomManager.getEvents(status);
    const liveEvents = await roomManager.getLiveEvents();
    return { events, liveEvents };
  });

  // Get single event
  app.get('/:id', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const event = await roomManager.getEvent(id);
    if (!event) {
      return reply.status(404).send({ error: 'Event not found' });
    }
    return { event };
  });

  // Schedule town hall
  app.post('/', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const data = ScheduleTownHallSchema.parse(request.body);
    const event = await roomManager.schedule(data);
    return reply.status(201).send({ event });
  });

  // RSVP for event
  app.post('/:id/rsvp', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await roomManager.rsvp(id, 'user-id'); // userId from auth
    return { success: true };
  });

  // Submit question
  app.post('/:id/question', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { question } = SubmitQuestionSchema.parse(request.body);
    const questionObj = await questionQueue.submit({
      eventId: id,
      question,
      authorId: 'user-id', // From auth
    });
    return reply.status(201).send({ question: questionObj });
  });

  // Upvote question
  app.post('/:id/question/:questionId/upvote', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const { questionId } = request.params as { questionId: string };
    await questionQueue.upvote(questionId, 'user-id');
    return { success: true };
  });

  // Raise hand
  app.post('/:id/raise-hand', {
    schema: {
      tags: ['townhalls'],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await roomManager.raiseHand(id, 'user-id');
    return { success: true };
  });

  // WebSocket for live event
  app.get('/:id/live', { websocket: true }, (connection, request) => {
    const { id } = request.params as { id: string };

    connection.socket.on('message', async (message: string) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          await roomManager.join(id, 'user-id');
          break;
        case 'chat':
          const chatMessage = await liveChatService.send(id, 'user-id', data.content);
          connection.socket.send(JSON.stringify({ type: 'chat', message: chatMessage }));
          break;
        case 'leave':
          await roomManager.leave(id, 'user-id');
          break;
      }
    });

    connection.socket.on('close', () => {
      roomManager.leave(id, 'user-id');
    });
  });
};
