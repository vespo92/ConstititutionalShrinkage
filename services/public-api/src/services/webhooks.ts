import { createHmac, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Webhook, WebhookEvent, WebhookPayload, WebhookDelivery } from '../types';

// In-memory stores for demo - replace with database in production
const webhooks = new Map<string, Webhook>();
const deliveries = new Map<string, WebhookDelivery>();

// Exponential backoff schedule: 1min, 5min, 30min, 2hr, 12hr
const RETRY_SCHEDULE = [60, 300, 1800, 7200, 43200];

export const webhookService = {
  /**
   * Create a new webhook subscription
   */
  async create(params: {
    url: string;
    events: WebhookEvent[];
    apiKeyId: string;
  }): Promise<{ webhook: Webhook; secret: string }> {
    // Generate webhook secret
    const secret = `whsec_${randomBytes(32).toString('base64url')}`;

    const webhook: Webhook = {
      id: uuidv4(),
      url: params.url,
      events: params.events,
      secret: hashSecret(secret),
      isActive: true,
      apiKeyId: params.apiKeyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    webhooks.set(webhook.id, webhook);

    // Return raw secret only once
    return { webhook: { ...webhook, secret: '***' }, secret };
  },

  /**
   * Get webhook by ID
   */
  async getById(id: string): Promise<Webhook | null> {
    const webhook = webhooks.get(id);
    if (!webhook) return null;
    return { ...webhook, secret: '***' };
  },

  /**
   * List webhooks for an API key
   */
  async listByApiKey(apiKeyId: string): Promise<Webhook[]> {
    const result: Webhook[] = [];
    for (const webhook of webhooks.values()) {
      if (webhook.apiKeyId === apiKeyId) {
        result.push({ ...webhook, secret: '***' });
      }
    }
    return result;
  },

  /**
   * Update webhook
   */
  async update(
    id: string,
    updates: Partial<Pick<Webhook, 'url' | 'events' | 'isActive'>>
  ): Promise<Webhook | null> {
    const webhook = webhooks.get(id);
    if (!webhook) return null;

    if (updates.url) webhook.url = updates.url;
    if (updates.events) webhook.events = updates.events;
    if (updates.isActive !== undefined) webhook.isActive = updates.isActive;
    webhook.updatedAt = new Date();

    return { ...webhook, secret: '***' };
  },

  /**
   * Delete webhook
   */
  async delete(id: string): Promise<boolean> {
    return webhooks.delete(id);
  },

  /**
   * Deliver webhook event to all subscribers
   */
  async deliverEvent<T>(event: WebhookEvent, data: T): Promise<void> {
    const eventId = uuidv4();
    const payload: WebhookPayload<T> = {
      id: eventId,
      type: event,
      created: new Date().toISOString(),
      data,
      api_version: '2024-01-01',
    };

    // Find all webhooks subscribed to this event
    for (const webhook of webhooks.values()) {
      if (webhook.isActive && webhook.events.includes(event)) {
        await scheduleDelivery(webhook, payload);
      }
    }
  },

  /**
   * Sign webhook payload
   */
  signPayload(payload: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  },

  /**
   * Get delivery attempts for a webhook
   */
  async getDeliveries(
    webhookId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const result: WebhookDelivery[] = [];
    for (const delivery of deliveries.values()) {
      if (delivery.webhookId === webhookId) {
        result.push(delivery);
      }
    }
    return result
      .sort((a, b) => (b.lastAttemptAt?.getTime() || 0) - (a.lastAttemptAt?.getTime() || 0))
      .slice(0, limit);
  },

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const delivery = deliveries.get(deliveryId);
    if (!delivery || delivery.status === 'success') return false;

    const webhook = webhooks.get(delivery.webhookId);
    if (!webhook) return false;

    // Mark for immediate retry
    delivery.nextRetryAt = new Date();
    return true;
  },

  /**
   * Get all events
   */
  getAllEvents(): WebhookEvent[] {
    return [
      'bill.created',
      'bill.updated',
      'bill.status_changed',
      'bill.submitted',
      'bill.passed',
      'bill.rejected',
      'bill.sunset',
      'vote.session_created',
      'vote.session_started',
      'vote.session_ended',
      'vote.threshold_reached',
      'region.pod_created',
      'region.metrics_updated',
      'system.maintenance',
      'system.rate_limit_warning',
    ];
  },
};

async function scheduleDelivery<T>(
  webhook: Webhook,
  payload: WebhookPayload<T>
): Promise<void> {
  const delivery: WebhookDelivery = {
    id: uuidv4(),
    webhookId: webhook.id,
    eventId: payload.id,
    status: 'pending',
    attempts: 0,
    nextRetryAt: new Date(),
  };

  deliveries.set(delivery.id, delivery);

  // In production, this would be handled by a job queue
  await attemptDelivery(webhook, payload, delivery);
}

async function attemptDelivery<T>(
  webhook: Webhook,
  payload: WebhookPayload<T>,
  delivery: WebhookDelivery
): Promise<void> {
  try {
    const payloadStr = JSON.stringify(payload);
    const signature = webhookService.signPayload(payloadStr, webhook.secret);

    // In production, use actual HTTP client
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': webhook.id,
        'X-Event-ID': payload.id,
      },
      body: payloadStr,
    });

    delivery.attempts++;
    delivery.lastAttemptAt = new Date();
    delivery.response = {
      statusCode: response.status,
    };

    if (response.ok) {
      delivery.status = 'success';
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    delivery.attempts++;
    delivery.lastAttemptAt = new Date();

    if (delivery.attempts < RETRY_SCHEDULE.length) {
      delivery.nextRetryAt = new Date(
        Date.now() + RETRY_SCHEDULE[delivery.attempts - 1] * 1000
      );
    } else {
      delivery.status = 'failed';
    }
  }
}

function hashSecret(secret: string): string {
  return createHmac('sha256', 'webhook-secret-salt')
    .update(secret)
    .digest('hex');
}
