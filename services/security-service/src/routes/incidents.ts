/**
 * Incidents Routes
 *
 * API endpoints for security incident management.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as incidentHandler from '../services/response/incident-handler.js';
import * as autoRemediation from '../services/response/auto-remediation.js';
import * as quarantine from '../services/response/quarantine.js';
import * as alerting from '../services/response/alerting.js';
import { IncidentStatus, IncidentPriority, ThreatType } from '../types/index.js';

const createIncidentSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.nativeEnum(ThreatType),
  priority: z.nativeEnum(IncidentPriority).optional(),
  affectedResources: z.array(z.string()).default([]),
  affectedUsers: z.array(z.string()).default([]),
  assignee: z.string().optional(),
});

export const incidentRoutes: FastifyPluginAsync = async (fastify) => {
  // List incidents
  fastify.get('/', async (request) => {
    const query = z
      .object({
        status: z.nativeEnum(IncidentStatus).optional(),
        priority: z.nativeEnum(IncidentPriority).optional(),
        type: z.nativeEnum(ThreatType).optional(),
        assignee: z.string().optional(),
        limit: z.coerce.number().default(100),
      })
      .parse(request.query);

    const incidents = await incidentHandler.searchIncidents(query);
    return { incidents, count: incidents.length };
  });

  // Get open incidents
  fastify.get('/open', async () => {
    const incidents = await incidentHandler.getOpenIncidents();
    return { incidents, count: incidents.length };
  });

  // Get incident by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const incident = await incidentHandler.getIncident(id);

    if (!incident) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    const related = await incidentHandler.getRelatedIncidents(id);
    return { ...incident, relatedIncidents: related };
  });

  // Create incident manually
  fastify.post('/', async (request) => {
    const data = createIncidentSchema.parse(request.body);

    const threat = {
      id: `manual_${Date.now()}`,
      type: data.type,
      level: 'medium' as const,
      source: 'manual_report',
      target: data.affectedResources[0] || 'unknown',
      detectedAt: new Date(),
      description: data.description,
      indicators: [],
      status: 'active' as const,
    };

    const incident = await incidentHandler.createIncident(threat, data.title, data.assignee);

    // Add affected users
    for (const userId of data.affectedUsers) {
      await incidentHandler.addAffectedUser(incident.id, userId);
    }

    // Add affected resources
    for (const resource of data.affectedResources.slice(1)) {
      await incidentHandler.addAffectedResource(incident.id, resource);
    }

    return incident;
  });

  // Update incident status
  fastify.put('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status, actor, details } = z
      .object({
        status: z.nativeEnum(IncidentStatus),
        actor: z.string(),
        details: z.string().optional(),
      })
      .parse(request.body);

    const incident = await incidentHandler.updateStatus(id, status, actor, details);

    if (!incident) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    return incident;
  });

  // Assign incident
  fastify.put('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { assignee, actor } = z
      .object({
        assignee: z.string(),
        actor: z.string(),
      })
      .parse(request.body);

    const success = await incidentHandler.assignIncident(id, assignee, actor);

    if (!success) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    return { success };
  });

  // Add timeline entry
  fastify.post('/:id/timeline', async (request, reply) => {
    const { id } = request.params as { id: string };
    const entry = z
      .object({
        action: z.string(),
        actor: z.string(),
        details: z.string(),
      })
      .parse(request.body);

    const success = await incidentHandler.addTimelineEntry(id, entry);

    if (!success) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    return { success };
  });

  // Trigger auto-remediation
  fastify.post('/:id/respond', async (request, reply) => {
    const { id } = request.params as { id: string };
    const incident = await incidentHandler.getIncident(id);

    if (!incident) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    const result = await autoRemediation.autoRemediate(incident);
    return result;
  });

  // Execute manual action
  fastify.post('/:id/action', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { action, params } = z
      .object({
        action: z.string(),
        params: z.record(z.unknown()).default({}),
      })
      .parse(request.body);

    const incident = await incidentHandler.getIncident(id);

    if (!incident) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    const success = await autoRemediation.executeAction(
      action,
      incident,
      params as Record<string, unknown>
    );
    return { success };
  });

  // Set root cause
  fastify.put('/:id/root-cause', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { rootCause, actor } = z
      .object({
        rootCause: z.string(),
        actor: z.string(),
      })
      .parse(request.body);

    const success = await incidentHandler.setRootCause(id, rootCause, actor);

    if (!success) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    return { success };
  });

  // Generate incident report
  fastify.get('/:id/report', async (request, reply) => {
    const { id } = request.params as { id: string };
    const report = await incidentHandler.generateReport(id);

    if (!report) {
      reply.status(404).send({ error: 'Incident not found' });
      return;
    }

    reply.header('Content-Type', 'text/markdown');
    return report;
  });

  // Get incident metrics
  fastify.get('/metrics', async () => {
    return incidentHandler.getMetrics();
  });

  // Get playbooks
  fastify.get('/playbooks', async () => {
    return autoRemediation.getPlaybooks();
  });

  // Toggle playbook
  fastify.put('/playbooks/:id/toggle', async (request) => {
    const { id } = request.params as { id: string };
    const { enabled } = z.object({ enabled: z.boolean() }).parse(request.body);

    const success = autoRemediation.togglePlaybook(id, enabled);
    return { success };
  });

  // Get quarantine status
  fastify.get('/quarantine', async () => {
    const entities = await quarantine.getQuarantinedEntities();
    const stats = await quarantine.getStats();

    return { entities, stats };
  });

  // Quarantine user
  fastify.post('/quarantine/user/:userId', async (request) => {
    const { userId } = request.params as { userId: string };
    const { reason, severity, duration, incidentId } = z
      .object({
        reason: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        duration: z.number().optional(),
        incidentId: z.string().optional(),
      })
      .parse(request.body);

    const entry = await quarantine.quarantineUser(userId, reason, {
      severity,
      duration,
      incidentId,
    });

    return entry;
  });

  // Release from quarantine
  fastify.delete('/quarantine/:type/:target', async (request) => {
    const { type, target } = request.params as {
      type: 'user' | 'ip' | 'session' | 'resource';
      target: string;
    };
    const { reason, actor } = z
      .object({
        reason: z.string(),
        actor: z.string(),
      })
      .parse(request.body);

    const success = await quarantine.release(type, target, reason, actor);
    return { success };
  });

  // Get alerts
  fastify.get('/alerts', async () => {
    const unacknowledged = await alerting.getUnacknowledgedAlerts();
    const stats = await alerting.getAlertStats();

    return { alerts: unacknowledged, stats };
  });

  // Acknowledge alert
  fastify.post('/alerts/:id/acknowledge', async (request) => {
    const { id } = request.params as { id: string };
    const { acknowledgedBy } = z
      .object({ acknowledgedBy: z.string() })
      .parse(request.body);

    const success = await alerting.acknowledgeAlert(id, acknowledgedBy);
    return { success };
  });

  // Get alert rules
  fastify.get('/alerts/rules', async () => {
    return alerting.getAlertRules();
  });
};
