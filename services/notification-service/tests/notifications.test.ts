/**
 * Notification Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../src/index.js';

describe('Notification Service', () => {
  let server: Awaited<ReturnType<typeof buildServer>>['fastify'];

  beforeEach(async () => {
    const { fastify } = await buildServer();
    server = fastify;
  });

  afterEach(async () => {
    await server?.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('notification-service');
    });
  });

  describe('GET /notifications', () => {
    it('should return paginated notifications', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/notifications',
        query: { userId: 'test-user', page: '1', limit: '20' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('notifications');
      expect(body).toHaveProperty('pagination');
      expect(body.pagination).toHaveProperty('page');
      expect(body.pagination).toHaveProperty('limit');
    });
  });

  describe('PUT /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/notifications/test-notification-id/read',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.read).toBe(true);
    });
  });

  describe('PUT /notifications/read-all', () => {
    it('should mark all notifications as read for user', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/notifications/read-all',
        payload: { userId: 'test-user-id' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('All notifications marked as read');
    });
  });

  describe('GET /notifications/preferences/:userId', () => {
    it('should return user notification preferences', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/notifications/preferences/test-user-id',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('userId');
      expect(body).toHaveProperty('preferences');
      expect(body.preferences).toHaveProperty('email');
      expect(body.preferences).toHaveProperty('push');
      expect(body.preferences).toHaveProperty('websocket');
    });
  });

  describe('PUT /notifications/preferences/:userId', () => {
    it('should update user notification preferences', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/notifications/preferences/test-user-id',
        payload: {
          preferences: {
            email: { voteAvailable: false },
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Preferences updated');
    });
  });

  describe('POST /notifications/send', () => {
    it('should queue notification for sending', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/notifications/send',
        payload: {
          id: 'test-notification-id',
          type: 'VOTE_AVAILABLE',
          userId: 'test-user-id',
          title: 'Test Notification',
          body: 'This is a test notification',
          channels: ['websocket'],
          read: false,
          createdAt: new Date().toISOString(),
        },
      });

      expect(response.statusCode).toBe(202);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Notification queued');
    });
  });
});

describe('Notification Types', () => {
  it('should have all expected notification types', async () => {
    const { NotificationType } = await import('../src/types/index.js');

    expect(NotificationType.VOTE_REMINDER).toBe('vote_reminder');
    expect(NotificationType.VOTE_RESULT).toBe('vote_result');
    expect(NotificationType.BILL_PASSED).toBe('bill_passed');
    expect(NotificationType.BILL_FAILED).toBe('bill_failed');
    expect(NotificationType.ACCOUNT_SECURITY).toBe('account_security');
  });
});
