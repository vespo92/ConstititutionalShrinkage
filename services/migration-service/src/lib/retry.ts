export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryable(lastError, config.retryableErrors)) {
        throw lastError;
      }

      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt, config);
        config.onRetry?.(lastError, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function isRetryable(error: Error, retryableErrors?: string[]): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    return true;
  }

  return retryableErrors.some(
    (e) =>
      error.name === e ||
      error.message.includes(e) ||
      (error.constructor && error.constructor.name === e)
  );
}

function calculateDelay(attempt: number, options: RetryOptions): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: Partial<RetryOptions>
): T {
  return (async (...args: unknown[]) => {
    return retry(() => fn(...args), options);
  }) as T;
}
