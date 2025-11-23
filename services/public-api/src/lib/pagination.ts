import { PaginatedResponse } from '../types';

/**
 * Cursor-based pagination utilities
 */

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginationMeta {
  limit: number;
  cursor?: string;
  nextCursor?: string;
}

/**
 * Parse pagination parameters from request query
 */
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  let limit = DEFAULT_LIMIT;

  if (query.limit) {
    const parsedLimit = parseInt(query.limit as string, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }

  return {
    cursor: query.cursor as string | undefined,
    limit,
  };
}

/**
 * Encode cursor from object (typically { id, timestamp })
 */
export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/**
 * Decode cursor to object
 */
export function decodeCursor(cursor: string): Record<string, unknown> | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T extends { id: string }>(
  items: T[],
  params: PaginationParams,
  totalCount?: number
): PaginatedResponse<T> {
  const limit = params.limit || DEFAULT_LIMIT;
  const hasMore = items.length > limit;

  // Remove extra item used for hasMore check
  const data = hasMore ? items.slice(0, limit) : items;

  let nextCursor: string | undefined;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    nextCursor = encodeCursor({ id: lastItem.id });
  }

  return {
    data,
    pagination: {
      cursor: nextCursor,
      hasMore,
      total: totalCount,
    },
  };
}

/**
 * Apply cursor-based pagination to a query
 * Returns query options for prisma/database
 */
export function applyPagination(params: PaginationParams): {
  take: number;
  skip?: number;
  cursor?: { id: string };
} {
  const limit = params.limit || DEFAULT_LIMIT;

  if (params.cursor) {
    const decoded = decodeCursor(params.cursor);
    if (decoded?.id) {
      return {
        take: limit + 1, // Fetch one extra to check hasMore
        skip: 1, // Skip the cursor item
        cursor: { id: decoded.id as string },
      };
    }
  }

  return {
    take: limit + 1,
  };
}

/**
 * Create offset-based pagination (for simpler cases)
 */
export function createOffsetPagination(
  page: number,
  limit: number
): { skip: number; take: number } {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
  };
}
