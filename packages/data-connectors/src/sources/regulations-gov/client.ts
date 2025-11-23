import axios, { AxiosInstance } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import { Docket, Document, Comment, RegulationsSearchParams } from './types.js';

export interface RegulationsGovClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageNumber: number;
    totalElements: number;
    totalPages: number;
  };
}

export class RegulationsGovClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;

  constructor(options: RegulationsGovClientOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl ?? 'https://api.regulations.gov/v4',
      headers: {
        'X-Api-Key': options.apiKey,
        'Accept': 'application/vnd.api+json',
      },
    });

    this.rateLimiter = createRateLimiter({
      requestsPerSecond: options.requestsPerSecond ?? 5,
    });

    this.cache = createCache({
      ttl: 15 * 60 * 1000,
    });
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = `regulations:${path}:${JSON.stringify(params ?? {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    return this.rateLimiter.execute(async () => {
      const response = await this.client.get<T>(path, { params });
      this.cache.set(cacheKey, response.data);
      return response.data;
    });
  }

  private buildFilterParams(params: RegulationsSearchParams): Record<string, unknown> {
    const queryParams: Record<string, unknown> = {};

    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value) {
          queryParams[`filter[${key}]`] = value;
        }
      });
    }

    if (params.sort) {
      queryParams.sort = params.sort;
    }

    if (params.page) {
      if (params.page.size) {
        queryParams['page[size]'] = params.page.size;
      }
      if (params.page.number) {
        queryParams['page[number]'] = params.page.number;
      }
    }

    return queryParams;
  }

  async searchDocuments(params: RegulationsSearchParams = {}): Promise<PaginatedResponse<Document>> {
    return this.request<PaginatedResponse<Document>>(
      '/documents',
      this.buildFilterParams(params)
    );
  }

  async getDocument(documentId: string): Promise<Document> {
    interface DocumentResponse {
      data: Document;
    }
    const response = await this.request<DocumentResponse>(`/documents/${documentId}`);
    return response.data;
  }

  async getDocumentContent(documentId: string): Promise<string> {
    const response = await this.client.get<string>(
      `/documents/${documentId}/file-formats/htm`,
      { responseType: 'text' }
    );
    return response.data;
  }

  async searchDockets(params: RegulationsSearchParams = {}): Promise<PaginatedResponse<Docket>> {
    return this.request<PaginatedResponse<Docket>>(
      '/dockets',
      this.buildFilterParams(params)
    );
  }

  async getDocket(docketId: string): Promise<Docket> {
    interface DocketResponse {
      data: Docket;
    }
    const response = await this.request<DocketResponse>(`/dockets/${docketId}`);
    return response.data;
  }

  async searchComments(params: RegulationsSearchParams = {}): Promise<PaginatedResponse<Comment>> {
    return this.request<PaginatedResponse<Comment>>(
      '/comments',
      this.buildFilterParams(params)
    );
  }

  async getComment(commentId: string): Promise<Comment> {
    interface CommentResponse {
      data: Comment;
    }
    const response = await this.request<CommentResponse>(`/comments/${commentId}`);
    return response.data;
  }

  async getDocketDocuments(docketId: string, params: RegulationsSearchParams = {}): Promise<PaginatedResponse<Document>> {
    return this.searchDocuments({
      ...params,
      filter: {
        ...params.filter,
        docketId,
      },
    });
  }

  async getDocketComments(docketId: string, params: RegulationsSearchParams = {}): Promise<PaginatedResponse<Comment>> {
    return this.searchComments({
      ...params,
      filter: {
        ...params.filter,
        docketId,
      },
    });
  }

  async getOpenForComment(agencyId?: string): Promise<Document[]> {
    const params: RegulationsSearchParams = {
      filter: {
        documentType: 'Proposed Rule',
        agencyId,
      },
      page: { size: 250 },
    };

    const response = await this.searchDocuments(params);
    return response.data.filter((doc) => doc.attributes.openForComment);
  }

  async *iterateDocuments(params: RegulationsSearchParams = {}): AsyncGenerator<Document> {
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchDocuments({
        ...params,
        page: { ...params.page, number: pageNumber },
      });

      for (const doc of response.data) {
        yield doc;
      }

      hasMore = response.meta.hasNextPage;
      pageNumber++;
    }
  }
}

export function createRegulationsGovClient(options: RegulationsGovClientOptions): RegulationsGovClient {
  return new RegulationsGovClient(options);
}
