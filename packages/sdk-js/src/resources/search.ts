import { HttpClient } from '../utils/request';
import { PaginatedResponse } from '../types/common.types';

export interface BillSearchResult {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  region?: string;
  relevanceScore: number;
  highlights: string[];
  createdAt: string;
}

export interface RegionSearchResult {
  id: string;
  name: string;
  type: string;
  parentName?: string;
  relevanceScore: number;
  metrics: {
    tblScore: number;
    participationRate: number;
  };
}

export interface SearchMeta {
  query: string;
  totalResults: number;
  searchTime: number;
  filters?: Record<string, unknown>;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  meta: SearchMeta;
}

export interface Suggestion {
  text: string;
  type: 'bill' | 'region';
  count: number;
}

export class SearchResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Search bills with full-text search
   */
  async bills(params: {
    query: string;
    status?: string;
    category?: string;
    region?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    cursor?: string;
  }): Promise<SearchResponse<BillSearchResult>> {
    return this.client.get<SearchResponse<BillSearchResult>>('/v1/search/bills', {
      query: params.query,
      status: params.status,
      category: params.category,
      region: params.region,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      limit: params.limit,
      cursor: params.cursor,
    });
  }

  /**
   * Search regions
   */
  async regions(params: {
    query: string;
    type?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SearchResponse<RegionSearchResult>> {
    return this.client.get<SearchResponse<RegionSearchResult>>('/v1/search/regions', {
      query: params.query,
      type: params.type,
      limit: params.limit,
      cursor: params.cursor,
    });
  }

  /**
   * Get search suggestions/autocomplete
   */
  async suggestions(params: {
    query: string;
    type?: 'bill' | 'region';
  }): Promise<Suggestion[]> {
    const response = await this.client.get<{
      data: { query: string; suggestions: Suggestion[] };
    }>('/v1/search/suggestions', params);
    return response.data.suggestions;
  }
}
