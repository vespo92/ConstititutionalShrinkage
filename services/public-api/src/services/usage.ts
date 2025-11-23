import { UsageRecord } from '../types';

// In-memory store for demo - replace with database in production
const usageRecords: UsageRecord[] = [];
const dailyUsage = new Map<string, number>();

export const usageService = {
  /**
   * Track an API request
   */
  async trackRequest(record: UsageRecord): Promise<void> {
    usageRecords.push(record);

    // Update daily counter
    const dayKey = getDayKey(record.apiKeyId, record.timestamp);
    const current = dailyUsage.get(dayKey) || 0;
    dailyUsage.set(dayKey, current + 1);

    // Cleanup old records (keep last 7 days in memory)
    cleanupOldRecords();
  },

  /**
   * Get daily usage count for an API key
   */
  async getDailyUsage(apiKeyId: string): Promise<number> {
    const dayKey = getDayKey(apiKeyId, new Date());
    return dailyUsage.get(dayKey) || 0;
  },

  /**
   * Get usage statistics for an API key
   */
  async getUsageStats(
    apiKeyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsByEndpoint: Record<string, number>;
    requestsByDay: Record<string, number>;
  }> {
    const records = usageRecords.filter(
      (r) =>
        r.apiKeyId === apiKeyId &&
        r.timestamp >= startDate &&
        r.timestamp <= endDate
    );

    const successfulRequests = records.filter((r) => r.statusCode < 400).length;
    const failedRequests = records.filter((r) => r.statusCode >= 400).length;
    const totalResponseTime = records.reduce((sum, r) => sum + r.responseTime, 0);

    const requestsByEndpoint: Record<string, number> = {};
    const requestsByDay: Record<string, number> = {};

    for (const record of records) {
      // By endpoint
      requestsByEndpoint[record.endpoint] = (requestsByEndpoint[record.endpoint] || 0) + 1;

      // By day
      const day = record.timestamp.toISOString().split('T')[0];
      requestsByDay[day] = (requestsByDay[day] || 0) + 1;
    }

    return {
      totalRequests: records.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: records.length > 0 ? totalResponseTime / records.length : 0,
      requestsByEndpoint,
      requestsByDay,
    };
  },

  /**
   * Get top endpoints by usage
   */
  async getTopEndpoints(
    apiKeyId: string,
    limit: number = 10
  ): Promise<Array<{ endpoint: string; count: number }>> {
    const endpointCounts: Record<string, number> = {};

    for (const record of usageRecords) {
      if (record.apiKeyId === apiKeyId) {
        endpointCounts[record.endpoint] = (endpointCounts[record.endpoint] || 0) + 1;
      }
    }

    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  /**
   * Get error rate
   */
  async getErrorRate(apiKeyId: string, periodHours: number = 24): Promise<number> {
    const since = new Date(Date.now() - periodHours * 60 * 60 * 1000);
    const records = usageRecords.filter(
      (r) => r.apiKeyId === apiKeyId && r.timestamp >= since
    );

    if (records.length === 0) return 0;

    const errors = records.filter((r) => r.statusCode >= 400).length;
    return (errors / records.length) * 100;
  },
};

function getDayKey(apiKeyId: string, date: Date): string {
  const day = date.toISOString().split('T')[0];
  return `${apiKeyId}:${day}`;
}

function cleanupOldRecords(): void {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const initialLength = usageRecords.length;

  // Remove old records
  while (usageRecords.length > 0 && usageRecords[0].timestamp < sevenDaysAgo) {
    usageRecords.shift();
  }

  // Cleanup old daily usage keys
  for (const key of dailyUsage.keys()) {
    const [, dateStr] = key.split(':').slice(-1);
    if (new Date(dateStr) < sevenDaysAgo) {
      dailyUsage.delete(key);
    }
  }
}
