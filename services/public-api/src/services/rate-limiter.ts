/**
 * Rate limiter service using sliding window algorithm
 * In production, use Redis for distributed rate limiting
 */

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

// In-memory store for demo - replace with Redis in production
const windowCounts = new Map<string, { count: number; windowStart: number }>();
const dailyCounts = new Map<string, { count: number; dayStart: number }>();

export const rateLimiterService = {
  /**
   * Check if request is within rate limits
   * Uses sliding window algorithm
   */
  async checkRateLimit(
    apiKeyId: string,
    requestsPerMinute: number,
    requestsPerDay: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowKey = `minute:${apiKeyId}`;
    const dayKey = `day:${apiKeyId}`;

    // Check minute window
    const minuteResult = checkWindow(windowKey, requestsPerMinute, 60 * 1000, now);

    // Check daily window
    const dayResult = checkWindow(dayKey, requestsPerDay, 24 * 60 * 60 * 1000, now);

    // Use the more restrictive limit
    if (!minuteResult.allowed) {
      return minuteResult;
    }
    if (!dayResult.allowed) {
      return dayResult;
    }

    // Increment counters
    incrementWindow(windowKey, 60 * 1000, now);
    incrementWindow(dayKey, 24 * 60 * 60 * 1000, now);

    return minuteResult;
  },

  /**
   * Check strict rate limit for specific endpoint
   */
  async checkStrictRateLimit(
    apiKeyId: string,
    endpoint: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `strict:${apiKeyId}:${endpoint}`;
    const windowMs = windowSeconds * 1000;

    const result = checkWindow(key, maxRequests, windowMs, now);

    if (result.allowed) {
      incrementWindow(key, windowMs, now);
    }

    return result;
  },

  /**
   * Get current usage stats
   */
  async getUsageStats(apiKeyId: string): Promise<{
    minuteUsage: number;
    dayUsage: number;
  }> {
    const now = Date.now();
    const minuteWindow = windowCounts.get(`minute:${apiKeyId}`);
    const dayWindow = dailyCounts.get(`day:${apiKeyId}`);

    return {
      minuteUsage: getValidCount(minuteWindow, 60 * 1000, now),
      dayUsage: getValidCount(dayWindow, 24 * 60 * 60 * 1000, now),
    };
  },

  /**
   * Reset rate limit for an API key (admin function)
   */
  async resetRateLimit(apiKeyId: string): Promise<void> {
    windowCounts.delete(`minute:${apiKeyId}`);
    dailyCounts.delete(`day:${apiKeyId}`);
  },
};

function checkWindow(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): RateLimitResult {
  const window = windowCounts.get(key);
  const currentCount = getValidCount(window, windowMs, now);
  const windowStart = window?.windowStart || now;
  const resetAt = windowStart + windowMs;

  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount - 1),
    resetAt,
  };
}

function incrementWindow(key: string, windowMs: number, now: number): void {
  const window = windowCounts.get(key);

  if (!window || now - window.windowStart >= windowMs) {
    // Start new window
    windowCounts.set(key, { count: 1, windowStart: now });
  } else {
    // Increment existing window
    window.count++;
  }
}

function getValidCount(
  window: { count: number; windowStart: number } | undefined,
  windowMs: number,
  now: number
): number {
  if (!window) return 0;
  if (now - window.windowStart >= windowMs) return 0;
  return window.count;
}
