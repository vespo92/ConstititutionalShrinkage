/**
 * Response Helpers
 *
 * Standardized API response formatting.
 */

import type { FastifyReply } from 'fastify';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: number;
    type: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  reply.status(statusCode).send(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(reply: FastifyReply, data: T): void {
  sendSuccess(reply, data, 201);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(reply: FastifyReply): void {
  reply.status(204).send();
}

/**
 * Send an error response
 */
export function sendError(
  reply: FastifyReply,
  statusCode: number,
  type: string,
  message: string,
  details?: unknown
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: statusCode,
      type,
      message,
    },
    requestId: reply.request.id,
  };

  if (details) {
    response.error.details = details;
  }

  reply.status(statusCode).send(response);
}

/**
 * Send a not found error
 */
export function sendNotFound(reply: FastifyReply, resource: string, id: string): void {
  sendError(reply, 404, 'NOT_FOUND', `${resource} with id '${id}' not found`);
}

/**
 * Send a validation error
 */
export function sendValidationError(reply: FastifyReply, details: unknown): void {
  sendError(reply, 400, 'VALIDATION_ERROR', 'Invalid request data', details);
}

/**
 * Send an unauthorized error
 */
export function sendUnauthorized(reply: FastifyReply, message = 'Authentication required'): void {
  sendError(reply, 401, 'UNAUTHORIZED', message);
}

/**
 * Send a forbidden error
 */
export function sendForbidden(reply: FastifyReply, message = 'Access denied'): void {
  sendError(reply, 403, 'FORBIDDEN', message);
}

/**
 * Send a conflict error
 */
export function sendConflict(reply: FastifyReply, message: string): void {
  sendError(reply, 409, 'CONFLICT', message);
}

/**
 * Send a rate limit error
 */
export function sendRateLimited(reply: FastifyReply, retryAfter: string): void {
  reply.header('Retry-After', retryAfter);
  sendError(reply, 429, 'RATE_LIMITED', `Rate limit exceeded, retry after ${retryAfter}`);
}

/**
 * Format a paginated response
 */
export function formatPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Standard response builder for consistent API responses
 */
export class ResponseBuilder<T> {
  private _data: T | null = null;
  private _statusCode = 200;
  private _meta: Record<string, unknown> = {};

  data(data: T): this {
    this._data = data;
    return this;
  }

  status(code: number): this {
    this._statusCode = code;
    return this;
  }

  meta(key: string, value: unknown): this {
    this._meta[key] = value;
    return this;
  }

  send(reply: FastifyReply): void {
    const response: SuccessResponse<T | null> = {
      success: true,
      data: this._data,
    };

    if (Object.keys(this._meta).length > 0) {
      response.meta = this._meta;
    }

    reply.status(this._statusCode).send(response);
  }
}

export function response<T>(): ResponseBuilder<T> {
  return new ResponseBuilder<T>();
}
