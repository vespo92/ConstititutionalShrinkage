import { HttpClient } from '../utils/request';
import { SingleResponse } from '../types/common.types';

export type WebhookEvent =
  | 'bill.created'
  | 'bill.updated'
  | 'bill.status_changed'
  | 'bill.submitted'
  | 'bill.passed'
  | 'bill.rejected'
  | 'bill.sunset'
  | 'vote.session_created'
  | 'vote.session_started'
  | 'vote.session_ended'
  | 'vote.threshold_reached'
  | 'region.pod_created'
  | 'region.metrics_updated'
  | 'system.maintenance'
  | 'system.rate_limit_warning';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  response?: {
    statusCode: number;
  };
}

export interface WebhookEventInfo {
  event: WebhookEvent;
  description: string;
}

export class WebhooksResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Create a new webhook subscription
   */
  async create(params: {
    url: string;
    events: WebhookEvent[];
  }): Promise<Webhook & { secret: string }> {
    const response = await this.client.post<{
      data: Webhook & { secret: string };
      message: string;
    }>('/v1/webhooks', params);
    return response.data;
  }

  /**
   * List all webhooks for the current API key
   */
  async list(): Promise<Webhook[]> {
    const response = await this.client.get<{ data: Webhook[] }>('/v1/webhooks');
    return response.data;
  }

  /**
   * Get a specific webhook by ID
   */
  async get(id: string): Promise<Webhook> {
    const response = await this.client.get<SingleResponse<Webhook>>(`/v1/webhooks/${id}`);
    return response.data;
  }

  /**
   * Update a webhook
   */
  async update(
    id: string,
    params: Partial<{
      url: string;
      events: WebhookEvent[];
      isActive: boolean;
    }>
  ): Promise<Webhook> {
    const response = await this.client.put<SingleResponse<Webhook>>(
      `/v1/webhooks/${id}`,
      params
    );
    return response.data;
  }

  /**
   * Delete a webhook
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/v1/webhooks/${id}`);
  }

  /**
   * Enable a webhook
   */
  async enable(id: string): Promise<Webhook> {
    return this.update(id, { isActive: true });
  }

  /**
   * Disable a webhook
   */
  async disable(id: string): Promise<Webhook> {
    return this.update(id, { isActive: false });
  }

  /**
   * Get delivery history for a webhook
   */
  async getDeliveries(id: string): Promise<WebhookDelivery[]> {
    const response = await this.client.get<{ data: WebhookDelivery[] }>(
      `/v1/webhooks/${id}/deliveries`
    );
    return response.data;
  }

  /**
   * List all available webhook event types
   */
  async listEvents(): Promise<WebhookEventInfo[]> {
    const response = await this.client.get<{ data: WebhookEventInfo[] }>(
      '/v1/webhooks/events/list'
    );
    return response.data;
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Parse signature header: t=timestamp,v1=signature
    const parts = signature.split(',');
    const timestampPart = parts.find((p) => p.startsWith('t='));
    const signaturePart = parts.find((p) => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.substring(2);
    const providedSignature = signaturePart.substring(3);

    // Check timestamp is within 5 minutes
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
    if (Math.abs(timestampAge) > 300) {
      return false;
    }

    // Compute expected signature
    // In browser, use SubtleCrypto; in Node, use crypto
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Browser implementation would be async
      console.warn('Use async verifySignatureAsync in browser environments');
      return false;
    }

    // Node.js implementation
    try {
      const cryptoModule = require('crypto');
      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = cryptoModule
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

      return cryptoModule.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }
}
