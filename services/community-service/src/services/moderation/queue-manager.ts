interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details?: string;
  reporter: { id: string; displayName: string };
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'high' | 'normal' | 'low';
  flags: any[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  action?: string;
}

interface ActionParams {
  reportId: string;
  action: 'approve' | 'remove' | 'warn' | 'mute' | 'ban' | 'dismiss';
  moderatorId: string;
  reason?: string;
  duration?: number;
}

export class QueueManager {
  private queue: Report[] = [];

  async add(report: Report): Promise<void> {
    this.queue.push(report);
    this.sortQueue();
  }

  async getQueue(params?: {
    status?: string;
    priority?: string;
    contentType?: string;
  }): Promise<Report[]> {
    let filtered = [...this.queue];

    if (params?.status) {
      filtered = filtered.filter((r) => r.status === params.status);
    }
    if (params?.priority) {
      filtered = filtered.filter((r) => r.priority === params.priority);
    }
    if (params?.contentType) {
      filtered = filtered.filter((r) => r.contentType === params.contentType);
    }

    return filtered;
  }

  async takeAction(params: ActionParams): Promise<{ success: boolean; message: string }> {
    const { reportId, action, moderatorId, reason, duration } = params;

    const report = this.queue.find((r) => r.id === reportId);
    if (!report) {
      return { success: false, message: 'Report not found' };
    }

    switch (action) {
      case 'approve':
        // Content is approved, dismiss report
        report.status = 'dismissed';
        break;

      case 'remove':
        // Remove the content
        await this.removeContent(report.contentType, report.contentId);
        report.status = 'resolved';
        report.action = 'removed';
        break;

      case 'warn':
        // Send warning to content author
        await this.warnUser(report.contentId, reason);
        report.status = 'resolved';
        report.action = 'warned';
        break;

      case 'mute':
        // Temporarily mute user
        await this.muteUser(report.contentId, duration || 24);
        report.status = 'resolved';
        report.action = `muted for ${duration || 24} hours`;
        break;

      case 'ban':
        // Ban user
        await this.banUser(report.contentId, duration);
        report.status = 'resolved';
        report.action = duration ? `banned for ${duration} hours` : 'permanently banned';
        break;

      case 'dismiss':
        report.status = 'dismissed';
        break;
    }

    report.reviewedAt = new Date().toISOString();
    report.reviewedBy = moderatorId;

    return { success: true, message: `Action ${action} completed` };
  }

  private sortQueue(): void {
    // Sort by priority (high first) then by date (oldest first)
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => {
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  private async removeContent(contentType: string, contentId: string): Promise<void> {
    // In production, soft delete or hide the content
    console.log(`Removing ${contentType} ${contentId}`);
  }

  private async warnUser(contentId: string, reason?: string): Promise<void> {
    // Send warning notification to user
    console.log(`Warning user for content ${contentId}: ${reason}`);
  }

  private async muteUser(contentId: string, hours: number): Promise<void> {
    // Temporarily prevent user from posting
    console.log(`Muting user for ${hours} hours`);
  }

  private async banUser(contentId: string, hours?: number): Promise<void> {
    // Ban user from platform
    console.log(`Banning user ${hours ? `for ${hours} hours` : 'permanently'}`);
  }
}
