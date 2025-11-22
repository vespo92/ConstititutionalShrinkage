/**
 * Notification Service - Main Entry Point
 *
 * Handles real-time notifications, email, and push notifications
 * for the Constitutional Shrinkage platform.
 */

import Fastify from 'fastify';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { createServer } from 'http';

import { EmailChannel } from './channels/email.js';
import { WebSocketChannel } from './channels/websocket.js';
import { PushChannel } from './channels/push.js';
import { NotificationTemplates } from './templates/index.js';

const PORT = process.env.NOTIFICATION_PORT ? parseInt(process.env.NOTIFICATION_PORT) : 3003;
const HOST = process.env.HOST || '0.0.0.0';

// Notification types
export type NotificationType =
  | 'VOTE_AVAILABLE'
  | 'VOTE_ENDING_SOON'
  | 'VOTE_RESULT'
  | 'BILL_UPDATE'
  | 'BILL_PASSED'
  | 'BILL_REJECTED'
  | 'DELEGATION_REQUEST'
  | 'DELEGATION_ACCEPTED'
  | 'DELEGATION_REJECTED'
  | 'DELEGATION_USED'
  | 'REGION_ANNOUNCEMENT'
  | 'SYSTEM_ALERT'
  | 'VERIFICATION_COMPLETE';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: ('websocket' | 'email' | 'push')[];
  read: boolean;
  createdAt: Date;
}

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // Create HTTP server for Socket.IO
  const httpServer = createServer(fastify.server as any);

  // Redis for pub/sub
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  const subscriber = redis.duplicate();

  // Initialize channels
  const websocketChannel = new WebSocketChannel(httpServer);
  const emailChannel = new EmailChannel();
  const pushChannel = new PushChannel();
  const templates = new NotificationTemplates();

  // Subscribe to notification events
  await subscriber.subscribe('notifications');

  subscriber.on('message', async (channel, message) => {
    if (channel === 'notifications') {
      try {
        const notification = JSON.parse(message) as Notification;
        await dispatchNotification(notification, {
          websocket: websocketChannel,
          email: emailChannel,
          push: pushChannel,
          templates,
        });
      } catch (err) {
        fastify.log.error({ err, message }, 'Failed to dispatch notification');
      }
    }
  });

  // Health check
  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    connections: websocketChannel.getConnectionCount(),
  }));

  // API to send notifications (internal use)
  fastify.post('/notifications/send', async (request, reply) => {
    const notification = request.body as Notification;

    // Publish to Redis for distributed processing
    await redis.publish('notifications', JSON.stringify(notification));

    reply.status(202);
    return { message: 'Notification queued' };
  });

  // API to get user notifications
  fastify.get<{ Querystring: { userId: string; page?: number; limit?: number } }>(
    '/notifications',
    async (request) => {
      const { userId, page = 1, limit = 20 } = request.query;

      // TODO: Fetch from database
      return {
        notifications: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        unreadCount: 0,
      };
    }
  );

  // Mark notification as read
  fastify.put<{ Params: { id: string } }>(
    '/notifications/:id/read',
    async (request) => {
      const { id } = request.params;

      // TODO: Update in database
      return { id, read: true };
    }
  );

  // Mark all notifications as read
  fastify.put<{ Body: { userId: string } }>(
    '/notifications/read-all',
    async (request) => {
      const { userId } = request.body;

      // TODO: Update all in database
      return { userId, message: 'All notifications marked as read' };
    }
  );

  // Register push subscription
  fastify.post<{ Body: { userId: string; subscription: unknown } }>(
    '/notifications/push/subscribe',
    async (request) => {
      const { userId, subscription } = request.body;

      // TODO: Store subscription
      return { userId, message: 'Push subscription registered' };
    }
  );

  // Unregister push subscription
  fastify.delete<{ Body: { userId: string; endpoint: string } }>(
    '/notifications/push/unsubscribe',
    async (request) => {
      const { userId, endpoint } = request.body;

      // TODO: Remove subscription
      return { userId, message: 'Push subscription removed' };
    }
  );

  // Get notification preferences
  fastify.get<{ Params: { userId: string } }>(
    '/notifications/preferences/:userId',
    async (request) => {
      const { userId } = request.params;

      // TODO: Fetch from database
      return {
        userId,
        preferences: {
          email: {
            voteAvailable: true,
            voteEndingSoon: true,
            voteResult: true,
            billUpdate: true,
            delegationRequest: true,
            regionAnnouncement: true,
            systemAlert: true,
          },
          push: {
            voteAvailable: true,
            voteEndingSoon: true,
            voteResult: true,
            billUpdate: false,
            delegationRequest: true,
            regionAnnouncement: false,
            systemAlert: true,
          },
          websocket: {
            all: true,
          },
        },
      };
    }
  );

  // Update notification preferences
  fastify.put<{ Params: { userId: string }; Body: { preferences: unknown } }>(
    '/notifications/preferences/:userId',
    async (request) => {
      const { userId } = request.params;
      const { preferences } = request.body;

      // TODO: Update in database
      return { userId, message: 'Preferences updated' };
    }
  );

  return { fastify, httpServer };
}

async function dispatchNotification(
  notification: Notification,
  channels: {
    websocket: WebSocketChannel;
    email: EmailChannel;
    push: PushChannel;
    templates: NotificationTemplates;
  }
): Promise<void> {
  const { websocket, email, push, templates } = channels;

  for (const channel of notification.channels) {
    try {
      switch (channel) {
        case 'websocket':
          await websocket.send(notification.userId, notification);
          break;

        case 'email':
          const emailContent = templates.getEmailTemplate(notification.type, {
            title: notification.title,
            body: notification.body,
            ...notification.data,
          });
          // TODO: Get user email from database
          await email.send({
            to: 'user@example.com',
            subject: notification.title,
            html: emailContent,
          });
          break;

        case 'push':
          await push.send(notification.userId, {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          });
          break;
      }
    } catch (err) {
      console.error(`Failed to send ${channel} notification:`, err);
    }
  }
}

async function start() {
  try {
    const { fastify, httpServer } = await buildServer();

    await fastify.ready();

    httpServer.listen(PORT, HOST, () => {
      console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage Notification Service       ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  WebSocket:  ws://localhost:${PORT}                           ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Failed to start notification service:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
