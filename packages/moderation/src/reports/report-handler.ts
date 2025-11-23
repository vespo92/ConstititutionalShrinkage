export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'misinformation'
  | 'threats'
  | 'pii_exposure'
  | 'off_topic'
  | 'impersonation'
  | 'other';

export interface Report {
  id: string;
  contentType: 'thread' | 'comment' | 'petition' | 'group' | 'user';
  contentId: string;
  reason: ReportReason;
  details?: string;
  reporterId: string;
  reporterReputation?: number;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: {
    action: 'approved' | 'removed' | 'warned' | 'dismissed';
    note?: string;
    resolvedBy: string;
    resolvedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class ReportHandler {
  private reports = new Map<string, Report>();
  private reportsByContent = new Map<string, string[]>();

  async submit(params: {
    contentType: Report['contentType'];
    contentId: string;
    reason: ReportReason;
    details?: string;
    reporterId: string;
    reporterReputation?: number;
  }): Promise<Report> {
    // Check for duplicate report
    const existingReports = this.reportsByContent.get(params.contentId) || [];
    const hasDuplicate = existingReports.some((reportId) => {
      const report = this.reports.get(reportId);
      return report?.reporterId === params.reporterId && report?.status === 'pending';
    });

    if (hasDuplicate) {
      throw new Error('You have already reported this content');
    }

    const report: Report = {
      id: Date.now().toString(),
      ...params,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reports.set(report.id, report);

    // Index by content
    if (!this.reportsByContent.has(params.contentId)) {
      this.reportsByContent.set(params.contentId, []);
    }
    this.reportsByContent.get(params.contentId)!.push(report.id);

    return report;
  }

  async getReport(reportId: string): Promise<Report | null> {
    return this.reports.get(reportId) || null;
  }

  async getReportsForContent(contentId: string): Promise<Report[]> {
    const reportIds = this.reportsByContent.get(contentId) || [];
    return reportIds
      .map((id) => this.reports.get(id))
      .filter((r): r is Report => r !== undefined);
  }

  async resolve(
    reportId: string,
    resolution: {
      action: 'approved' | 'removed' | 'warned' | 'dismissed';
      note?: string;
      resolvedBy: string;
    }
  ): Promise<boolean> {
    const report = this.reports.get(reportId);
    if (!report) return false;

    report.status = 'resolved';
    report.resolution = {
      ...resolution,
      resolvedAt: new Date().toISOString(),
    };
    report.updatedAt = new Date().toISOString();

    return true;
  }

  async getReportCounts(contentId: string): Promise<Record<ReportReason, number>> {
    const reports = await this.getReportsForContent(contentId);
    const counts: Record<ReportReason, number> = {
      spam: 0,
      harassment: 0,
      hate_speech: 0,
      misinformation: 0,
      threats: 0,
      pii_exposure: 0,
      off_topic: 0,
      impersonation: 0,
      other: 0,
    };

    reports.forEach((report) => {
      if (report.status === 'pending') {
        counts[report.reason]++;
      }
    });

    return counts;
  }

  async getReporterHistory(reporterId: string): Promise<{
    total: number;
    accurate: number;
    accuracyRate: number;
  }> {
    const reports = Array.from(this.reports.values()).filter(
      (r) => r.reporterId === reporterId && r.status === 'resolved'
    );

    const accurate = reports.filter(
      (r) => r.resolution?.action !== 'dismissed'
    ).length;

    return {
      total: reports.length,
      accurate,
      accuracyRate: reports.length > 0 ? accurate / reports.length : 0,
    };
  }
}
