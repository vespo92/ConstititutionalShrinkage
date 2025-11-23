import { Router, Request, Response } from 'express';
import { webhookService } from '../../services/webhooks';
import { requirePermission } from '../../middleware/api-key';
import { strictRateLimit } from '../../middleware/rate-limit';
import { sanitizeUrl } from '../../lib/sanitize';
import { WebhookEvent } from '../../types';

const router = Router();

/**
 * POST /v1/webhooks
 * Create a new webhook subscription
 */
router.post(
  '/',
  requirePermission('webhooks:write'),
  strictRateLimit(10, 60), // 10 creates per minute
  async (req: Request, res: Response) => {
    try {
      const { url, events } = req.body;

      // Validate URL
      if (!url) {
        res.status(400).json({
          error: { code: 'MISSING_URL', message: 'Webhook URL is required' },
        });
        return;
      }

      const sanitizedUrl = sanitizeUrl(url);
      if (!sanitizedUrl) {
        res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: 'URL must be a valid HTTPS URL',
          },
        });
        return;
      }

      // Validate events
      if (!events || !Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          error: {
            code: 'MISSING_EVENTS',
            message: 'At least one event type is required',
          },
        });
        return;
      }

      const validEvents = webhookService.getAllEvents();
      const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
      if (invalidEvents.length > 0) {
        res.status(400).json({
          error: {
            code: 'INVALID_EVENTS',
            message: `Invalid event types: ${invalidEvents.join(', ')}`,
            details: { validEvents },
          },
        });
        return;
      }

      const { webhook, secret } = await webhookService.create({
        url: sanitizedUrl,
        events: events as WebhookEvent[],
        apiKeyId: req.apiKey!.id,
      });

      // Return secret only once
      res.status(201).json({
        data: {
          ...webhook,
          secret, // Only returned on creation
        },
        message: 'Store the secret securely. It will not be shown again.',
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' },
      });
    }
  }
);

/**
 * GET /v1/webhooks
 * List webhooks for the current API key
 */
router.get('/', requirePermission('webhooks:read'), async (req: Request, res: Response) => {
  try {
    const webhooks = await webhookService.listByApiKey(req.apiKey!.id);

    res.json({
      data: webhooks,
    });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' },
    });
  }
});

/**
 * GET /v1/webhooks/:id
 * Get a specific webhook
 */
router.get('/:id', requirePermission('webhooks:read'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const webhook = await webhookService.getById(id);

    if (!webhook) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Webhook ${id} not found` },
      });
      return;
    }

    res.json({ data: webhook });
  } catch (error) {
    console.error('Error getting webhook:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get webhook' },
    });
  }
});

/**
 * PUT /v1/webhooks/:id
 * Update a webhook
 */
router.put('/:id', requirePermission('webhooks:write'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { url, events, isActive } = req.body;

    const updates: {
      url?: string;
      events?: WebhookEvent[];
      isActive?: boolean;
    } = {};

    if (url) {
      const sanitizedUrl = sanitizeUrl(url);
      if (!sanitizedUrl) {
        res.status(400).json({
          error: {
            code: 'INVALID_URL',
            message: 'URL must be a valid HTTPS URL',
          },
        });
        return;
      }
      updates.url = sanitizedUrl;
    }

    if (events) {
      const validEvents = webhookService.getAllEvents();
      const invalidEvents = events.filter((e: string) => !validEvents.includes(e as WebhookEvent));
      if (invalidEvents.length > 0) {
        res.status(400).json({
          error: {
            code: 'INVALID_EVENTS',
            message: `Invalid event types: ${invalidEvents.join(', ')}`,
          },
        });
        return;
      }
      updates.events = events;
    }

    if (typeof isActive === 'boolean') {
      updates.isActive = isActive;
    }

    const webhook = await webhookService.update(id, updates);

    if (!webhook) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Webhook ${id} not found` },
      });
      return;
    }

    res.json({ data: webhook });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' },
    });
  }
});

/**
 * DELETE /v1/webhooks/:id
 * Delete a webhook
 */
router.delete('/:id', requirePermission('webhooks:write'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await webhookService.delete(id);

    if (!deleted) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Webhook ${id} not found` },
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' },
    });
  }
});

/**
 * GET /v1/webhooks/:id/deliveries
 * Get delivery history for a webhook
 */
router.get(
  '/:id/deliveries',
  requirePermission('webhooks:read'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deliveries = await webhookService.getDeliveries(id);

      res.json({ data: deliveries });
    } catch (error) {
      console.error('Error getting deliveries:', error);
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get delivery history' },
      });
    }
  }
);

/**
 * GET /v1/webhooks/events
 * List available webhook event types
 */
router.get('/events/list', async (req: Request, res: Response) => {
  try {
    const events = webhookService.getAllEvents();

    const eventDescriptions = {
      'bill.created': 'A new bill has been created',
      'bill.updated': 'A bill has been updated',
      'bill.status_changed': 'A bill status has changed',
      'bill.submitted': 'A bill has been submitted for voting',
      'bill.passed': 'A bill has passed voting',
      'bill.rejected': 'A bill has been rejected',
      'bill.sunset': 'A bill has reached its sunset date',
      'vote.session_created': 'A new voting session has been created',
      'vote.session_started': 'A voting session has started',
      'vote.session_ended': 'A voting session has ended',
      'vote.threshold_reached': 'A voting threshold has been reached',
      'region.pod_created': 'A new regional pod has been created',
      'region.metrics_updated': 'Regional metrics have been updated',
      'system.maintenance': 'System maintenance notification',
      'system.rate_limit_warning': 'Rate limit warning',
    };

    res.json({
      data: events.map((event) => ({
        event,
        description: eventDescriptions[event] || event,
      })),
    });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list events' },
    });
  }
});

export default router;
