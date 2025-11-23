import axios, { AxiosInstance } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import {
  State,
  StateBill,
  StateLegislator,
  Session,
  OpenStatesSearchParams,
} from './types.js';

export interface OpenStatesClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
}

interface PaginatedResponse<T> {
  results: T[];
  pagination: {
    page: number;
    per_page: number;
    max_page: number;
    total_items: number;
  };
}

export class OpenStatesClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;

  constructor(options: OpenStatesClientOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl ?? 'https://v3.openstates.org',
      headers: {
        'X-API-KEY': options.apiKey,
        'Accept': 'application/json',
      },
    });

    this.rateLimiter = createRateLimiter({
      requestsPerSecond: options.requestsPerSecond ?? 3,
    });

    this.cache = createCache({
      ttl: 30 * 60 * 1000,
    });
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = `openstates:${path}:${JSON.stringify(params ?? {})}`;
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

  async getJurisdictions(): Promise<State[]> {
    interface JurisdictionsResponse {
      results: State[];
    }
    const response = await this.request<JurisdictionsResponse>('/jurisdictions');
    return response.results;
  }

  async getJurisdiction(jurisdictionId: string): Promise<State> {
    return this.request<State>(`/jurisdictions/${jurisdictionId}`);
  }

  async getSessions(jurisdictionId: string): Promise<Session[]> {
    const jurisdiction = await this.getJurisdiction(jurisdictionId);
    interface JurisdictionWithSessions extends State {
      legislative_sessions: Session[];
    }
    return (jurisdiction as JurisdictionWithSessions).legislative_sessions ?? [];
  }

  async searchBills(params: OpenStatesSearchParams = {}): Promise<PaginatedResponse<StateBill>> {
    return this.request<PaginatedResponse<StateBill>>('/bills', {
      jurisdiction: params.jurisdiction,
      session: params.session,
      chamber: params.chamber,
      classification: params.classification,
      subject: params.subject,
      updated_since: params.updated_since,
      created_since: params.created_since,
      action_since: params.action_since,
      q: params.q,
      page: params.page ?? 1,
      per_page: params.per_page ?? 20,
    });
  }

  async getBill(billId: string): Promise<StateBill> {
    return this.request<StateBill>(`/bills/${billId}`);
  }

  async getBillByIdentifier(
    jurisdiction: string,
    session: string,
    identifier: string
  ): Promise<StateBill> {
    const response = await this.searchBills({
      jurisdiction,
      session,
      q: identifier,
      per_page: 1,
    });

    if (!response.results?.length) {
      throw new Error(`Bill not found: ${identifier}`);
    }

    return this.getBill(response.results[0].id);
  }

  async searchLegislators(params: OpenStatesSearchParams = {}): Promise<PaginatedResponse<StateLegislator>> {
    return this.request<PaginatedResponse<StateLegislator>>('/people', {
      jurisdiction: params.jurisdiction,
      chamber: params.chamber,
      page: params.page ?? 1,
      per_page: params.per_page ?? 20,
    });
  }

  async getLegislator(personId: string): Promise<StateLegislator> {
    return this.request<StateLegislator>(`/people/${personId}`);
  }

  async getCurrentLegislators(jurisdiction: string, chamber?: 'upper' | 'lower'): Promise<StateLegislator[]> {
    const results: StateLegislator[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchLegislators({
        jurisdiction,
        chamber,
        page,
        per_page: 100,
      });

      results.push(...response.results);

      if (page >= response.pagination.max_page) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return results;
  }

  async getRecentBills(
    jurisdiction: string,
    days: number = 7
  ): Promise<StateBill[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const results: StateBill[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchBills({
        jurisdiction,
        action_since: sinceDate.toISOString().split('T')[0],
        page,
        per_page: 100,
      });

      results.push(...response.results);

      if (page >= response.pagination.max_page) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return results;
  }

  async *iterateBills(params: OpenStatesSearchParams = {}): AsyncGenerator<StateBill> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchBills({ ...params, page, per_page: 100 });

      for (const bill of response.results) {
        yield bill;
      }

      if (page >= response.pagination.max_page) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  async *iterateLegislators(params: OpenStatesSearchParams = {}): AsyncGenerator<StateLegislator> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchLegislators({ ...params, page, per_page: 100 });

      for (const legislator of response.results) {
        yield legislator;
      }

      if (page >= response.pagination.max_page) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }
}

export function createOpenStatesClient(options: OpenStatesClientOptions): OpenStatesClient {
  return new OpenStatesClient(options);
}
