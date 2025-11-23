/**
 * Response Cache
 * Caches AI responses for performance and cost optimization
 */

import crypto from 'crypto';
import type { CacheEntry, CacheStats } from '../types/index.js';

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

export class ResponseCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
  private config: CacheConfig;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: config?.maxSize || 1000,
      defaultTTL: config?.defaultTTL || 3600000, // 1 hour
      cleanupInterval: config?.cleanupInterval || 300000, // 5 minutes
    };

    this.startCleanup();
  }

  /**
   * Generate cache key from inputs
   */
  generateKey(inputs: unknown): string {
    const str = JSON.stringify(inputs);
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Check expiration
    if (new Date(entry.expiresAt) < new Date()) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      this.updateHitRate();
      return undefined;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Enforce max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.config.defaultTTL));

    const entry: CacheEntry<T> = {
      data: value,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      hash: this.generateKey(value),
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return result;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (new Date(entry.expiresAt) < new Date()) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0, hitRate: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(count = 1): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(0, count);

    for (const [key] of entries) {
      this.cache.delete(key);
    }

    this.stats.size = this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (new Date(entry.expiresAt) < now) {
        toDelete.push(key);
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key);
    }

    this.stats.size = this.cache.size;
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

// Singleton instance
let cacheInstance: ResponseCache | undefined;

export function getCache(config?: Partial<CacheConfig>): ResponseCache {
  if (config || !cacheInstance) {
    cacheInstance = new ResponseCache(config);
  }
  return cacheInstance;
}
