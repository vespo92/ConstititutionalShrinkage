/**
 * Push Channel
 *
 * Web Push notifications.
 */

import webpush from 'web-push';
import Redis from 'ioredis';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushChannel {
  private redis: Redis;

  constructor() {
    // Set VAPID keys
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@constitutional-shrinkage.gov';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    } else {
      console.warn('VAPID keys not set. Push notifications will not work.');
    }

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  /**
   * Send push notification to user
   */
  async send(userId: string, notification: PushNotification): Promise<void> {
    const subscriptions = await this.getUserSubscriptions(userId);

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data,
      actions: notification.actions,
    });

    const options = {
      TTL: 60 * 60, // 1 hour
      urgency: 'normal' as const,
    };

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, payload, options);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or invalid, remove it
          await this.removeSubscription(userId, subscription.endpoint);
        } else {
          console.error('Push notification failed:', err);
        }
      }
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulk(userIds: string[], notification: PushNotification): Promise<void> {
    await Promise.allSettled(
      userIds.map((userId) => this.send(userId, notification))
    );
  }

  /**
   * Register push subscription for user
   */
  async registerSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    const key = `push:subscriptions:${userId}`;
    const subscriptions = await this.getUserSubscriptions(userId);

    // Check if subscription already exists
    const exists = subscriptions.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push(subscription);
      await this.redis.set(key, JSON.stringify(subscriptions));
    }
  }

  /**
   * Remove push subscription
   */
  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    const key = `push:subscriptions:${userId}`;
    const subscriptions = await this.getUserSubscriptions(userId);

    const filtered = subscriptions.filter((s) => s.endpoint !== endpoint);
    await this.redis.set(key, JSON.stringify(filtered));
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    const key = `push:subscriptions:${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Check if user has any push subscriptions
   */
  async hasSubscription(userId: string): Promise<boolean> {
    const subscriptions = await this.getUserSubscriptions(userId);
    return subscriptions.length > 0;
  }

  /**
   * Generate VAPID keys (run once during setup)
   */
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}
