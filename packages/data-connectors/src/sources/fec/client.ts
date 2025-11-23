import axios, { AxiosInstance } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import {
  FecCandidate,
  FecCommittee,
  FecContribution,
  FecFiling,
  FecSearchParams,
} from './types.js';

export interface FecClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
}

interface PaginatedResponse<T> {
  results: T[];
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    count: number;
  };
}

export class FecClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;

  constructor(options: FecClientOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl ?? 'https://api.open.fec.gov/v1',
      params: {
        api_key: options.apiKey,
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
    const cacheKey = `fec:${path}:${JSON.stringify(params ?? {})}`;
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

  async getCandidates(params: FecSearchParams = {}): Promise<PaginatedResponse<FecCandidate>> {
    return this.request<PaginatedResponse<FecCandidate>>('/candidates/', {
      cycle: params.cycle,
      state: params.state,
      party: params.party,
      office: params.office,
      district: params.district,
      sort: params.sort ?? '-election_years',
      per_page: params.perPage ?? 20,
      page: params.page ?? 1,
    });
  }

  async getCandidate(candidateId: string): Promise<FecCandidate> {
    const response = await this.request<{ results: FecCandidate[] }>(
      `/candidate/${candidateId}/`
    );
    if (!response.results?.[0]) {
      throw new Error(`Candidate not found: ${candidateId}`);
    }
    return response.results[0];
  }

  async getCandidateCommittees(candidateId: string): Promise<FecCommittee[]> {
    const response = await this.request<{ results: FecCommittee[] }>(
      `/candidate/${candidateId}/committees/`
    );
    return response.results;
  }

  async getCommittees(params: FecSearchParams = {}): Promise<PaginatedResponse<FecCommittee>> {
    return this.request<PaginatedResponse<FecCommittee>>('/committees/', {
      cycle: params.cycle,
      state: params.state,
      party: params.party,
      per_page: params.perPage ?? 20,
      page: params.page ?? 1,
    });
  }

  async getCommittee(committeeId: string): Promise<FecCommittee> {
    const response = await this.request<{ results: FecCommittee[] }>(
      `/committee/${committeeId}/`
    );
    if (!response.results?.[0]) {
      throw new Error(`Committee not found: ${committeeId}`);
    }
    return response.results[0];
  }

  async getCommitteeContributions(
    committeeId: string,
    params: FecSearchParams = {}
  ): Promise<PaginatedResponse<FecContribution>> {
    return this.request<PaginatedResponse<FecContribution>>(
      `/committee/${committeeId}/schedules/schedule_a/`,
      {
        per_page: params.perPage ?? 20,
        page: params.page ?? 1,
        sort: params.sort ?? '-contribution_receipt_date',
      }
    );
  }

  async getCommitteeFilings(
    committeeId: string,
    params: FecSearchParams = {}
  ): Promise<PaginatedResponse<FecFiling>> {
    return this.request<PaginatedResponse<FecFiling>>(
      `/committee/${committeeId}/filings/`,
      {
        per_page: params.perPage ?? 20,
        page: params.page ?? 1,
      }
    );
  }

  async getElectionResults(
    state: string,
    district: string,
    cycle: number
  ): Promise<FecCandidate[]> {
    const response = await this.request<{ results: FecCandidate[] }>(
      '/elections/',
      {
        state,
        district,
        cycle,
        office: 'house',
      }
    );
    return response.results;
  }

  async *iterateCandidates(params: FecSearchParams = {}): AsyncGenerator<FecCandidate> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getCandidates({ ...params, page });

      for (const candidate of response.results) {
        yield candidate;
      }

      if (page >= response.pagination.pages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  async *iterateContributions(
    committeeId: string,
    params: FecSearchParams = {}
  ): AsyncGenerator<FecContribution> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getCommitteeContributions(committeeId, { ...params, page });

      for (const contribution of response.results) {
        yield contribution;
      }

      if (page >= response.pagination.pages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }
}

export function createFecClient(options: FecClientOptions): FecClient {
  return new FecClient(options);
}
