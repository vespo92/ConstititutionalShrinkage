export interface ReviewItem {
  id: string;
  contentType: 'thread' | 'comment' | 'petition' | 'group' | 'user';
  contentId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  reportCount: number;
  autoFlags: string[];
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export class ReviewQueue {
  private items: ReviewItem[] = [];

  async add(item: Omit<ReviewItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ReviewItem> {
    const newItem: ReviewItem = {
      ...item,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.items.push(newItem);
    this.sort();

    return newItem;
  }

  async getQueue(options?: {
    status?: ReviewItem['status'];
    priority?: ReviewItem['priority'];
    assignedTo?: string;
    limit?: number;
  }): Promise<ReviewItem[]> {
    let filtered = [...this.items];

    if (options?.status) {
      filtered = filtered.filter((i) => i.status === options.status);
    }
    if (options?.priority) {
      filtered = filtered.filter((i) => i.priority === options.priority);
    }
    if (options?.assignedTo) {
      filtered = filtered.filter((i) => i.assignedTo === options.assignedTo);
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async assign(itemId: string, moderatorId: string): Promise<boolean> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return false;

    item.assignedTo = moderatorId;
    item.status = 'in_review';
    item.updatedAt = new Date().toISOString();

    return true;
  }

  async resolve(itemId: string, action: 'approve' | 'remove' | 'dismiss'): Promise<boolean> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return false;

    item.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    item.updatedAt = new Date().toISOString();

    return true;
  }

  async escalate(itemId: string): Promise<boolean> {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return false;

    // Increase priority
    const priorities: ReviewItem['priority'][] = ['low', 'medium', 'high', 'critical'];
    const currentIndex = priorities.indexOf(item.priority);
    if (currentIndex < priorities.length - 1) {
      item.priority = priorities[currentIndex + 1];
    }

    item.updatedAt = new Date().toISOString();
    this.sort();

    return true;
  }

  async incrementReportCount(contentId: string): Promise<void> {
    const item = this.items.find((i) => i.contentId === contentId && i.status === 'pending');
    if (item) {
      item.reportCount++;
      if (item.reportCount >= 5 && item.priority !== 'critical') {
        item.priority = 'high';
      }
      item.updatedAt = new Date().toISOString();
      this.sort();
    }
  }

  async getStats(): Promise<{
    pending: number;
    inReview: number;
    resolvedToday: number;
    byPriority: Record<ReviewItem['priority'], number>;
  }> {
    const today = new Date().toDateString();

    return {
      pending: this.items.filter((i) => i.status === 'pending').length,
      inReview: this.items.filter((i) => i.status === 'in_review').length,
      resolvedToday: this.items.filter(
        (i) => i.status === 'resolved' && new Date(i.updatedAt).toDateString() === today
      ).length,
      byPriority: {
        critical: this.items.filter((i) => i.priority === 'critical' && i.status === 'pending').length,
        high: this.items.filter((i) => i.priority === 'high' && i.status === 'pending').length,
        medium: this.items.filter((i) => i.priority === 'medium' && i.status === 'pending').length,
        low: this.items.filter((i) => i.priority === 'low' && i.status === 'pending').length,
      },
    };
  }

  private sort(): void {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    this.items.sort((a, b) => {
      // Pending items first
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;

      // Then by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }
}
