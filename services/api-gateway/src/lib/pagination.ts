/**
 * Pagination Utilities
 *
 * Helpers for paginated API responses.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  startIndex: number;
  endIndex: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));

  return { page, limit };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit - 1, total - 1);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    startIndex,
    endIndex: Math.max(endIndex, 0),
  };
}

/**
 * Create a paginated result object
 */
export function paginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    data,
    pagination: calculatePaginationMeta(page, limit, total),
  };
}

/**
 * Get offset for database queries (0-indexed)
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Apply pagination to an array (for in-memory pagination)
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = items.length;
  const offset = getOffset(page, limit);
  const data = items.slice(offset, offset + limit);

  return paginatedResult(data, page, limit, total);
}

/**
 * Generate cursor-based pagination info
 */
export interface CursorPagination {
  cursor: string | null;
  hasMore: boolean;
  nextCursor: string | null;
}

export function cursorPagination<T extends { id: string }>(
  items: T[],
  limit: number
): { data: T[]; cursor: CursorPagination } {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  return {
    data,
    cursor: {
      cursor: data.length > 0 ? data[0].id : null,
      hasMore,
      nextCursor,
    },
  };
}

/**
 * Build Prisma-compatible pagination object
 */
export function toPrismaParams(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: getOffset(params.page, params.limit),
    take: params.limit,
  };
}

/**
 * Parse sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export function parseSort(
  query: Record<string, unknown>,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortParams {
  const field = String(query.sort || defaultField);
  const order = (String(query.order || defaultOrder).toLowerCase() as 'asc' | 'desc');

  // Validate field is allowed
  const validField = allowedFields.includes(field) ? field : defaultField;
  const validOrder = ['asc', 'desc'].includes(order) ? order : defaultOrder;

  return { field: validField, order: validOrder };
}

/**
 * Build Prisma-compatible orderBy object
 */
export function toPrismaOrderBy(sort: SortParams): Record<string, 'asc' | 'desc'> {
  return { [sort.field]: sort.order };
}
