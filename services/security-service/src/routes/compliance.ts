/**
 * Compliance Routes
 *
 * API endpoints for compliance reporting and monitoring.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as soc2Checker from '../services/compliance/soc2-checker.js';
import * as fedrampChecker from '../services/compliance/fedramp-checker.js';
import * as reporter from '../services/compliance/reporter.js';
import { ComplianceFramework } from '../types/index.js';

export const complianceRoutes: FastifyPluginAsync = async (fastify) => {
  // Get overall compliance status
  fastify.get('/status', async () => {
    return reporter.generateExecutiveSummary();
  });

  // Get SOC 2 compliance report
  fastify.get('/soc2', async () => {
    return soc2Checker.generateReport();
  });

  // Run SOC 2 compliance check
  fastify.post('/soc2/check', async () => {
    return soc2Checker.runComplianceCheck();
  });

  // Get FedRAMP compliance report
  fastify.get('/fedramp', async () => {
    return fedrampChecker.generateReport();
  });

  // Get FedRAMP readiness summary
  fastify.get('/fedramp/readiness', async () => {
    return fedrampChecker.getReadinessSummary();
  });

  // Run FedRAMP automated checks
  fastify.post('/fedramp/check', async () => {
    const results = await fedrampChecker.runAutomatedChecks();
    const score = fedrampChecker.calculateReadinessScore();

    return { results: Object.fromEntries(results), score };
  });

  // Get FedRAMP POA&M
  fastify.get('/fedramp/poam', async () => {
    return fedrampChecker.getPOAM();
  });

  // Update POA&M item
  fastify.put('/fedramp/poam/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { status, notes } = z
      .object({
        status: z.enum(['open', 'in_progress', 'completed', 'delayed']),
        notes: z.string().optional(),
      })
      .parse(request.body);

    const success = await fedrampChecker.updatePOAMItem(id, status, notes);
    return { success };
  });

  // Get all FedRAMP controls
  fastify.get('/fedramp/controls', async () => {
    return fedrampChecker.getAllControls();
  });

  // Update FedRAMP control status
  fastify.put('/fedramp/controls/:controlId', async (request) => {
    const { controlId } = request.params as { controlId: string };
    const { status, implementation, evidence } = z
      .object({
        status: z.enum(['implemented', 'planned', 'not_applicable']),
        implementation: z.string().optional(),
        evidence: z.array(z.string()).optional(),
      })
      .parse(request.body);

    const success = fedrampChecker.updateControl(
      controlId,
      status,
      implementation,
      evidence
    );
    return { success };
  });

  // Get control status
  fastify.get('/controls', async () => {
    const soc2Report = await soc2Checker.generateReport();
    const fedrampReport = await fedrampChecker.generateReport();

    return {
      soc2: soc2Report.checks,
      fedramp: fedrampReport.checks,
    };
  });

  // Run compliance scan for specific framework
  fastify.post('/scan', async (request) => {
    const { framework } = z
      .object({
        framework: z.nativeEnum(ComplianceFramework),
      })
      .parse(request.body);

    const report = await reporter.generateFrameworkReport(framework);
    await reporter.storeReportHistory(report);

    return report;
  });

  // Generate detailed report
  fastify.get('/report', async () => {
    return reporter.generateDetailedReport();
  });

  // Export report
  fastify.get('/report/export', async (request, reply) => {
    const { format } = z
      .object({
        format: z.enum(['json', 'markdown', 'html']).default('json'),
      })
      .parse(request.query);

    const report = await reporter.exportReport(format);

    const contentTypes: Record<string, string> = {
      json: 'application/json',
      markdown: 'text/markdown',
      html: 'text/html',
    };

    const extensions: Record<string, string> = {
      json: 'json',
      markdown: 'md',
      html: 'html',
    };

    reply.header('Content-Type', contentTypes[format]);
    reply.header(
      'Content-Disposition',
      `attachment; filename="compliance-report.${extensions[format]}"`
    );

    return report;
  });

  // Get report history
  fastify.get('/report/history', async (request) => {
    const { limit } = z
      .object({ limit: z.coerce.number().default(10) })
      .parse(request.query);

    return reporter.getReportHistory(limit);
  });

  // Compare reports over time
  fastify.get('/report/trend', async () => {
    return reporter.compareReports();
  });

  // Get/set report schedule
  fastify.get('/schedule', async () => {
    return reporter.getSchedule();
  });

  fastify.post('/schedule', async (request) => {
    const { cron, recipients } = z
      .object({
        cron: z.string(),
        recipients: z.array(z.string()),
      })
      .parse(request.body);

    await reporter.scheduleReport(cron, recipients);
    return { success: true };
  });

  // Get evidence for controls
  fastify.get('/evidence', async () => {
    const report = await reporter.generateDetailedReport();
    return report.evidenceLinks;
  });
};
