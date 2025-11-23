import PQueue from 'p-queue';

export interface RateLimiterConfig {
  requestsPerSecond: number;
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
}

export class RateLimiter {
  private queue: PQueue;
  private config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      requestsPerSecond: config.requestsPerSecond ?? 10,
      concurrency: config.concurrency ?? 5,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
    };

    this.queue = new PQueue({
      concurrency: this.config.concurrency,
      interval: 1000,
      intervalCap: this.config.requestsPerSecond,
    });
  }

  async execute<T>(
    fn: () => Promise<T>,
    options?: { priority?: number; retries?: number }
  ): Promise<T> {
    return this.queue.add(
      async () => {
        let lastError: Error | undefined;
        const maxRetries = options?.retries ?? this.config.maxRetries;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
              const delay = this.config.retryDelay * Math.pow(2, attempt);
              await this.sleep(delay);
            }
          }
        }

        throw lastError;
      },
      { priority: options?.priority ?? 0 }
    ) as Promise<T>;
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

  clear(): void {
    this.queue.clear();
  }

  async onIdle(): Promise<void> {
    return this.queue.onIdle();
  }
}

export function createRateLimiter(config?: Partial<RateLimiterConfig>): RateLimiter {
  return new RateLimiter(config);
}
