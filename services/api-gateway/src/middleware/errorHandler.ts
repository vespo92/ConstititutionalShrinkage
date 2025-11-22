/**
 * Global Error Handler
 *
 * Standardized error responses across the API.
 */

import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export interface APIError {
  code: number;
  error: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = request.id;

  // Log the error
  request.log.error({
    err: error,
    requestId,
    url: request.url,
    method: request.method,
  });

  // Handle validation errors
  if (error.validation) {
    reply.status(400).send({
      code: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.validation,
      requestId,
    } satisfies APIError);
    return;
  }

  // Handle known status codes
  if (error.statusCode) {
    reply.status(error.statusCode).send({
      code: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
      requestId,
    } satisfies APIError);
    return;
  }

  // Handle specific error types
  if (error.message.includes('not found')) {
    reply.status(404).send({
      code: 404,
      error: 'Not Found',
      message: error.message,
      requestId,
    } satisfies APIError);
    return;
  }

  if (error.message.includes('already exists') || error.message.includes('duplicate')) {
    reply.status(409).send({
      code: 409,
      error: 'Conflict',
      message: error.message,
      requestId,
    } satisfies APIError);
    return;
  }

  if (error.message.includes('not authorized') || error.message.includes('forbidden')) {
    reply.status(403).send({
      code: 403,
      error: 'Forbidden',
      message: error.message,
      requestId,
    } satisfies APIError);
    return;
  }

  // Default: Internal Server Error
  reply.status(500).send({
    code: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
    requestId,
  } satisfies APIError);
}

/**
 * Custom error classes
 */
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  statusCode = 400;
  details: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
