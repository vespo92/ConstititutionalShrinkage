/**
 * Notification Channels Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailChannel } from '../src/channels/email.js';
import { PushChannel } from '../src/channels/push.js';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

// Mock web-push
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
    generateVAPIDKeys: vi.fn().mockReturnValue({
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
    }),
  },
}));

// Mock ioredis
vi.mock('ioredis', () => ({
  default: class MockRedis {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue('OK');
    del = vi.fn().mockResolvedValue(1);
  },
}));

describe('Email Channel', () => {
  let emailChannel: EmailChannel;

  beforeEach(() => {
    emailChannel = new EmailChannel();
  });

  describe('send', () => {
    it('should send an email', async () => {
      await expect(
        emailChannel.send({
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>',
        })
      ).resolves.toBeUndefined();
    });

    it('should include text version from HTML', async () => {
      await expect(
        emailChannel.send({
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test <strong>content</strong></p>',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('sendBulk', () => {
    it('should send bulk emails in batches', async () => {
      const recipients = Array(75)
        .fill(null)
        .map((_, i) => `test${i}@example.com`);

      await expect(
        emailChannel.sendBulk(recipients, {
          subject: 'Bulk Test',
          html: '<p>Bulk content</p>',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('verify', () => {
    it('should verify SMTP connection', async () => {
      const result = await emailChannel.verify();
      expect(result).toBe(true);
    });
  });
});

describe('Push Channel', () => {
  let pushChannel: PushChannel;

  beforeEach(() => {
    // Set required env vars
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
    pushChannel = new PushChannel();
  });

  afterEach(() => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });

  describe('send', () => {
    it('should send push notification to user', async () => {
      await expect(
        pushChannel.send('user-123', {
          title: 'Test Push',
          body: 'Test push body',
        })
      ).resolves.toBeUndefined();
    });

    it('should include optional data', async () => {
      await expect(
        pushChannel.send('user-123', {
          title: 'Test Push',
          body: 'Test push body',
          data: { billId: 'bill-456' },
          actions: [
            { action: 'view', title: 'View Bill' },
          ],
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('sendBulk', () => {
    it('should send to multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];

      await expect(
        pushChannel.sendBulk(userIds, {
          title: 'Bulk Push',
          body: 'Bulk push body',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('subscription management', () => {
    it('should check if user has subscription', async () => {
      const result = await pushChannel.hasSubscription('user-123');
      expect(typeof result).toBe('boolean');
    });

    it('should get user subscriptions', async () => {
      const subscriptions = await pushChannel.getUserSubscriptions('user-123');
      expect(Array.isArray(subscriptions)).toBe(true);
    });
  });

  describe('VAPID keys', () => {
    it('should generate VAPID keys', () => {
      const keys = PushChannel.generateVapidKeys();
      expect(keys).toHaveProperty('publicKey');
      expect(keys).toHaveProperty('privateKey');
    });
  });
});
