/**
 * Audit Routes
 *
 * API endpoints for audit log queries and analysis.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as auditLogger from '../services/audit/logger.js';
import * as auditAnalyzer from '../services/audit/analyzer.js';
import * as auditRetention from '../services/audit/retention.js';
import { AuditAction } from '../types/index.js';

const querySchema = z.object({
  userId: z.string().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
});

export const auditRoutes: FastifyPluginAsync = async (fastify) => {
  // Query audit logs
  fastify.get('/logs', async (request, reply) => {
    const query = querySchema.parse(request.query);

    const logs = await auditLogger.query({
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return { logs, count: logs.length };
  });

  // Get audit log by ID
  fastify.get('/logs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const log = await auditLogger.getById(id);

    if (!log) {
      reply.status(404).send({ error: 'Audit log not found' });
      return;
    }

    return log;
  });

  // Get user activity
  fastify.get('/user/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { limit } = z.object({ limit: z.coerce.number().default(100) }).parse(request.query);

    const logs = await auditLogger.getUserActivity(userId, limit);
    const profile = await auditAnalyzer.getBehaviorProfile(userId);

    return { logs, profile };
  });

  // Get resource access log
  fastify.get('/resource/:resourceType/:resourceId', async (request, reply) => {
    const { resourceType, resourceId } = request.params as {
      resourceType: string;
      resourceId: string;
    };
    const { limit } = z.object({ limit: z.coerce.number().default(100) }).parse(request.query);

    const logs = await auditLogger.getResourceAccess(resourceType, resourceId, limit);

    return { logs, count: logs.length };
  });

  // Get audit statistics
  fastify.get('/stats', async () => {
    return auditLogger.getStats();
  });

  // Get audit summary
  fastify.get('/summary/:period', async (request) => {
    const { period } = request.params as { period: 'day' | 'week' | 'month' };
    return auditAnalyzer.getSummary(period);
  });

  // Generate insights
  fastify.get('/insights', async () => {
    return auditAnalyzer.generateInsights();
  });

  // Find correlations
  fastify.get('/correlations', async (request) => {
    const { window } = z.object({ window: z.coerce.number().default(60) }).parse(request.query);
    return auditAnalyzer.findCorrelations(window);
  });

  // Export logs
  fastify.get('/export', async (request, reply) => {
    const params = z
      .object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        format: z.enum(['json', 'csv']).default('json'),
      })
      .parse(request.query);

    const data = await auditLogger.exportLogs({
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      format: params.format,
    });

    const contentType = params.format === 'json' ? 'application/json' : 'text/csv';
    reply.header('Content-Type', contentType);
    reply.header(
      'Content-Disposition',
      `attachment; filename="audit-logs.${params.format}"`
    );

    return data;
  });

  // Verify chain integrity
  fastify.get('/verify', async (request) => {
    const { startId, endId } = z
      .object({
        startId: z.string(),
        endId: z.string().optional(),
      })
      .parse(request.query);

    return auditLogger.verifyChainIntegrity(startId, endId);
  });

  // Get retention policies
  fastify.get('/retention/policies', async () => {
    return auditRetention.getPolicies();
  });

  // Get retention stats
  fastify.get('/retention/stats', async () => {
    return auditRetention.getStats();
  });

  // Run retention maintenance (admin only)
  fastify.post('/retention/maintain', async () => {
    return auditRetention.runMaintenance();
  });
};
