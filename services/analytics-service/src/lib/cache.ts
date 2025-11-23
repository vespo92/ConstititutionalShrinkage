/**
 * Simple in-memory cache for analytics service
 * In production, would use Redis
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class AnalyticsCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTtl: number = 60 * 1000; // 1 minute

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTtl;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set pattern - fetch from cache or compute and store
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const analyticsCache = new AnalyticsCache();

// Cache key generators
export const cacheKeys = {
  votingOverview: (period: string) => `voting:overview:${period}`,
  legislationOverview: (period: string) => `legislation:overview:${period}`,
  regionData: (regionId: string) => `region:${regionId}`,
  tblScore: (period: string) => `tbl:score:${period}`,
  engagement: (period: string) => `engagement:${period}`,
  report: (reportId: string) => `report:${reportId}`,
};
