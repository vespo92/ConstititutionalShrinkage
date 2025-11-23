/**
 * Common types shared across all resources
 */

export interface ConstitutionalConfig {
  apiKey: string;
  baseUrl?: string;
  region?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

export interface ListParams {
  limit?: number;
  cursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export class ConstitutionalError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  requestId?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
    this.name = 'ConstitutionalError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
  }
}

export class RateLimitError extends ConstitutionalError {
  retryAfter: number;

  constructor(message: string, retryAfter: number, requestId?: string) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter }, requestId);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class AuthenticationError extends ConstitutionalError {
  constructor(message: string, requestId?: string) {
    super(message, 'AUTHENTICATION_ERROR', 401, undefined, requestId);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ConstitutionalError {
  constructor(resource: string, id: string, requestId?: string) {
    super(`${resource} ${id} not found`, 'NOT_FOUND', 404, { resource, id }, requestId);
    this.name = 'NotFoundError';
  }
}
