/**
 * Redis Pub/Sub
 *
 * Redis-based pub/sub for horizontal scaling of notifications.
 */

import Redis from 'ioredis';

export interface NotificationEvent {
  userId: string;
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    createdAt: Date;
  };
}

export interface RedisPubSubOptions {
  host?: string;
  port?: number;
  password?: string;
}

export class RedisPubSub {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(options?: RedisPubSubOptions) {
    const redisConfig = {
      host: options?.host || process.env.REDIS_HOST || 'localhost',
      port: options?.port || parseInt(process.env.REDIS_PORT || '6379'),
      password: options?.password || process.env.REDIS_PASSWORD,
    };

    this.publisher = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (handlers) {
        try {
          const data = JSON.parse(message);
          handlers.forEach((handler) => handler(data));
        } catch (err) {
          console.error('Failed to parse pub/sub message:', err);
        }
      }
    });
  }

  /**
   * Publish notification to a user channel
   */
  async publishNotification(userId: string, notification: NotificationEvent['notification']): Promise<void> {
    const channel = `notifications:${userId}`;
    const payload: NotificationEvent = { userId, notification };
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  /**
   * Publish to a region channel
   */
  async publishToRegion(regionId: string, notification: NotificationEvent['notification']): Promise<void> {
    const channel = `notifications:region:${regionId}`;
    await this.publisher.publish(channel, JSON.stringify(notification));
  }

  /**
   * Publish broadcast notification
   */
  async broadcast(notification: NotificationEvent['notification']): Promise<void> {
    await this.publisher.publish('notifications:broadcast', JSON.stringify(notification));
  }

  /**
   * Subscribe to user notifications
   */
  async subscribeToUser(userId: string, callback: (event: NotificationEvent) => void): Promise<void> {
    const channel = `notifications:${userId}`;
    await this.subscribe(channel, callback);
  }

  /**
   * Subscribe to region notifications
   */
  async subscribeToRegion(regionId: string, callback: (notification: NotificationEvent['notification']) => void): Promise<void> {
    const channel = `notifications:region:${regionId}`;
    await this.subscribe(channel, callback);
  }

  /**
   * Subscribe to broadcast notifications
   */
  async subscribeToBroadcast(callback: (notification: NotificationEvent['notification']) => void): Promise<void> {
    await this.subscribe('notifications:broadcast', callback);
  }

  /**
   * Generic subscribe method
   */
  async subscribe(channel: string, callback: (data: unknown) => void): Promise<void> {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.add(callback);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string, callback?: (data: unknown) => void): Promise<void> {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      if (callback) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.handlers.delete(channel);
          await this.subscriber.unsubscribe(channel);
        }
      } else {
        this.handlers.delete(channel);
        await this.subscriber.unsubscribe(channel);
      }
    }
  }

  /**
   * Unsubscribe from user channel
   */
  async unsubscribeFromUser(userId: string): Promise<void> {
    await this.unsubscribe(`notifications:${userId}`);
  }

  /**
   * Get active subscriptions count
   */
  getSubscriptionCount(): number {
    return this.handlers.size;
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

// Singleton instance
let pubSubInstance: RedisPubSub | null = null;

export function getRedisPubSub(): RedisPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisPubSub();
  }
  return pubSubInstance;
}
