import { PaginatedResponse, ListParams } from '../types/common.types';

/**
 * Async iterator for paginating through all results
 */
export async function* paginate<T, P extends ListParams>(
  fetchPage: (params: P) => Promise<PaginatedResponse<T>>,
  params: P
): AsyncGenerator<T, void, undefined> {
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchPage({
      ...params,
      cursor,
    });

    for (const item of response.data) {
      yield item;
    }

    hasMore = response.pagination.hasMore;
    cursor = response.pagination.cursor;
  }
}

/**
 * Collect all items from a paginated endpoint
 */
export async function collectAll<T, P extends ListParams>(
  fetchPage: (params: P) => Promise<PaginatedResponse<T>>,
  params: P,
  maxItems?: number
): Promise<T[]> {
  const items: T[] = [];

  for await (const item of paginate(fetchPage, params)) {
    items.push(item);
    if (maxItems && items.length >= maxItems) {
      break;
    }
  }

  return items;
}

/**
 * Create a paginated list helper
 */
export function createPaginatedList<T, P extends ListParams>(
  fetchPage: (params: P) => Promise<PaginatedResponse<T>>
) {
  return {
    /**
     * Fetch a single page of results
     */
    list: (params: P) => fetchPage(params),

    /**
     * Iterate through all results
     */
    listAll: (params: Omit<P, 'cursor'>) =>
      paginate(fetchPage, params as P),

    /**
     * Collect all results into an array
     */
    collectAll: (params: Omit<P, 'cursor'>, maxItems?: number) =>
      collectAll(fetchPage, params as P, maxItems),
  };
}
