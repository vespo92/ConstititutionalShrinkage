/**
 * Request Validation Middleware
 *
 * Zod-based schema validation for API requests.
 */

import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Common validation schemas
 */
export const schemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // UUID
  uuid: z.string().uuid(),

  // Bill creation
  createBill: z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10),
    level: z.enum(['IMMUTABLE', 'FEDERAL', 'REGIONAL', 'LOCAL']),
    regionId: z.string().uuid().optional(),
    categoryId: z.string().uuid(),
    sunsetYears: z.number().int().min(1).max(20).default(5),
  }),

  // Bill update
  updateBill: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(10).optional(),
  }),

  // Vote casting
  castVote: z.object({
    billId: z.string().uuid(),
    choice: z.enum(['for', 'against', 'abstain']),
    isPublic: z.boolean().default(false),
    signature: z.string().optional(),
  }),

  // Delegation creation
  createDelegation: z.object({
    delegateId: z.string().uuid(),
    scope: z.enum(['ALL', 'CATEGORY', 'SINGLE_BILL']),
    category: z.string().optional(),
    billId: z.string().uuid().optional(),
    expiresAt: z.string().datetime().optional(),
  }),

  // Amendment proposal
  proposeAmendment: z.object({
    description: z.string().min(10).max(500),
    changes: z.string().min(1),
  }),

  // Comment
  createComment: z.object({
    content: z.string().min(1).max(5000),
    parentId: z.string().uuid().optional(),
  }),

  // User profile update
  updateProfile: z.object({
    preferredName: z.string().max(100).optional(),
    phone: z.string().optional(),
    primaryRegionId: z.string().uuid().optional(),
    expertiseAreas: z.array(z.string()).optional(),
  }),

  // Search query
  search: z.object({
    q: z.string().min(1).max(200),
    type: z.enum(['bills', 'people', 'organizations', 'all']).default('all'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    filters: z.record(z.string()).optional(),
  }),
};

/**
 * Validate request body against schema
 */
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return async function validate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = schema.parse(request.body);
      request.body = result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          code: 400,
          error: 'Validation Error',
          message: 'Invalid request body',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw error;
    }
  };
}

/**
 * Validate query parameters against schema
 */
export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return async function validate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = schema.parse(request.query);
      (request as any).validatedQuery = result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          code: 400,
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw error;
    }
  };
}

/**
 * Validate path parameters against schema
 */
export function validateParams<T extends z.ZodSchema>(schema: T) {
  return async function validate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = schema.parse(request.params);
      request.params = result as any;
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          code: 400,
          error: 'Validation Error',
          message: 'Invalid path parameters',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      throw error;
    }
  };
}

export { z };
