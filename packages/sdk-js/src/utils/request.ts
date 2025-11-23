import fetch from 'cross-fetch';
import {
  ConstitutionalConfig,
  ConstitutionalError,
  RateLimitError,
  AuthenticationError,
  NotFoundError,
} from '../types/common.types';

const DEFAULT_BASE_URL = 'https://api.constitutional.io';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export class HttpClient {
  private config: Required<ConstitutionalConfig>;

  constructor(config: ConstitutionalConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      region: config.region || '',
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || DEFAULT_MAX_RETRIES,
    };
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const headers = this.buildHeaders(options.headers);

    let lastError: Error | null = null;
    let retries = 0;

    while (retries <= this.config.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const requestId = response.headers.get('x-request-id') || undefined;

        if (response.ok) {
          return await response.json();
        }

        // Handle error responses
        const errorBody = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          throw new RateLimitError(
            errorBody.error?.message || 'Rate limit exceeded',
            retryAfter,
            requestId
          );
        }

        if (response.status === 401) {
          throw new AuthenticationError(
            errorBody.error?.message || 'Invalid API key',
            requestId
          );
        }

        if (response.status === 404) {
          throw new NotFoundError('Resource', path, requestId);
        }

        throw new ConstitutionalError(
          errorBody.error?.message || `Request failed with status ${response.status}`,
          errorBody.error?.code || 'REQUEST_FAILED',
          response.status,
          errorBody.error?.details,
          requestId
        );
      } catch (error) {
        lastError = error as Error;

        // Don't retry authentication errors
        if (error instanceof AuthenticationError) {
          throw error;
        }

        // Retry rate limit errors after waiting
        if (error instanceof RateLimitError) {
          if (retries < this.config.maxRetries) {
            await this.sleep(error.retryAfter * 1000);
            retries++;
            continue;
          }
          throw error;
        }

        // Retry network errors
        if (error instanceof Error && error.name === 'AbortError') {
          if (retries < this.config.maxRetries) {
            await this.sleep(Math.pow(2, retries) * 1000);
            retries++;
            continue;
          }
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    let baseUrl = this.config.baseUrl;

    // Use regional endpoint if specified
    if (this.config.region) {
      baseUrl = `https://${this.config.region}.api.constitutional.io`;
    }

    const url = new URL(`/api${path}`, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
      'X-SDK-Version': '1.0.0',
      'X-SDK-Language': 'javascript',
      ...customHeaders,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
