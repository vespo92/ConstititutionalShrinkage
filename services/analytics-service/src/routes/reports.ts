import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReportConfig, Report } from '../types/index.js';
import { exporter } from '../services/exporter.js';

interface CreateReportBody {
  name: string;
  type: string;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  schedule?: string;
}

interface ReportParams {
  id: string;
}

interface ExportQuery {
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
}

// In-memory storage for demo
const reports: Report[] = [
  {
    id: 'rpt-001',
    name: 'Weekly Governance Summary',
    type: 'summary',
    createdAt: '2025-01-29T10:00:00Z',
    status: 'ready',
  },
  {
    id: 'rpt-002',
    name: 'Regional Performance Report',
    type: 'regional',
    createdAt: '2025-01-01T10:00:00Z',
    status: 'ready',
  },
  {
    id: 'rpt-003',
    name: 'TBL Quarterly Analysis',
    type: 'tbl',
    createdAt: '2025-01-01T10:00:00Z',
    status: 'ready',
  },
];

export async function reportsRoutes(app: FastifyInstance) {
  // POST /analytics/reports - Create report
  app.post<{ Body: CreateReportBody }>('/', async (request, reply) => {
    const { name, type, dateRange, filters, schedule } = request.body;

    const newReport: Report = {
      id: `rpt-${Date.now()}`,
      name,
      type,
      createdAt: new Date().toISOString(),
      status: schedule ? 'scheduled' : 'generating',
    };

    reports.push(newReport);

    // Simulate async report generation
    if (!schedule) {
      setTimeout(() => {
        const report = reports.find((r) => r.id === newReport.id);
        if (report) {
          report.status = 'ready';
          report.data = { generated: true, rows: 100 };
        }
      }, 2000);
    }

    return reply.status(201).send({
      success: true,
      data: newReport,
    });
  });

  // GET /analytics/reports/:id - Get report
  app.get<{ Params: ReportParams }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const report = reports.find((r) => r.id === id);

    if (!report) {
      return reply.status(404).send({
        success: false,
        error: 'Report not found',
      });
    }

    return reply.send({
      success: true,
      data: report,
    });
  });

  // GET /analytics/reports/:id/export - Export report
  app.get<{ Params: ReportParams; Querystring: ExportQuery }>(
    '/:id/export',
    async (request, reply) => {
      const { id } = request.params;
      const { format } = request.query;

      const report = reports.find((r) => r.id === id);

      if (!report) {
        return reply.status(404).send({
          success: false,
          error: 'Report not found',
        });
      }

      if (report.status !== 'ready') {
        return reply.status(400).send({
          success: false,
          error: 'Report is not ready for export',
        });
      }

      const exportedData = await exporter.exportReport(report, format);

      const contentTypes: Record<string, string> = {
        pdf: 'application/pdf',
        csv: 'text/csv',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        json: 'application/json',
      };

      reply.header('Content-Type', contentTypes[format]);
      reply.header(
        'Content-Disposition',
        `attachment; filename="${report.name}.${format}"`
      );

      return reply.send(exportedData);
    }
  );

  // GET /analytics/reports - List all reports
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      success: true,
      data: reports,
      total: reports.length,
    });
  });

  // DELETE /analytics/reports/:id - Delete report
  app.delete<{ Params: ReportParams }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) {
      return reply.status(404).send({
        success: false,
        error: 'Report not found',
      });
    }

    reports.splice(index, 1);

    return reply.send({
      success: true,
      message: 'Report deleted',
    });
  });
}
