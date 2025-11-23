import PQueue from 'p-queue';

export interface RateLimiterOptions {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  concurrency?: number;
}

export class RateLimiter {
  private queue: PQueue;
  private requestsPerSecond: number;
  private lastRequestTime: number = 0;
  private minInterval: number;

  constructor(options: RateLimiterOptions = {}) {
    this.requestsPerSecond = options.requestsPerSecond ?? 10;
    this.minInterval = 1000 / this.requestsPerSecond;

    this.queue = new PQueue({
      concurrency: options.concurrency ?? 1,
      interval: 1000,
      intervalCap: this.requestsPerSecond,
    });
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.queue.add(async () => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minInterval) {
        await this.sleep(this.minInterval - timeSinceLastRequest);
      }

      this.lastRequestTime = Date.now();
      return fn();
    }) as Promise<T>;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get pending(): number {
    return this.queue.pending;
  }

  get size(): number {
    return this.queue.size;
  }

  pause(): void {
    this.queue.pause();
  }

  resume(): void {
    this.queue.start();
  }

  async clear(): Promise<void> {
    this.queue.clear();
  }

  async onIdle(): Promise<void> {
    return this.queue.onIdle();
  }
}

export function createRateLimiter(options?: RateLimiterOptions): RateLimiter {
  return new RateLimiter(options);
}
