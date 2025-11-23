import axios, { AxiosInstance, AxiosError } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import {
  CongressBill,
  CongressVote,
  CongressMember,
  Committee,
  Amendment,
  BillAction,
  BillsParams,
  VotesParams,
  MembersParams,
  PaginatedBills,
  PaginatedVotes,
  PaginatedMembers,
} from './types.js';

export interface CongressGovClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
  cacheTtl?: number;
}

export class CongressGovClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;

  constructor(options: CongressGovClientOptions) {
    const baseUrl = options.baseUrl ?? 'https://api.congress.gov/v3';

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-Api-Key': options.apiKey,
        'Accept': 'application/json',
      },
    });

    this.rateLimiter = createRateLimiter({
      requestsPerSecond: options.requestsPerSecond ?? 5,
    });

    this.cache = createCache({
      ttl: options.cacheTtl ?? 5 * 60 * 1000,
    });
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = `${path}:${JSON.stringify(params ?? {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.client.get<T>(path, { params });
        this.cache.set(cacheKey, response.data);
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 429) {
            await this.sleep(60000);
            return this.request<T>(path, params);
          }
          throw new Error(
            `Congress.gov API error: ${error.response?.status} - ${error.response?.statusText}`
          );
        }
        throw error;
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Bills API
  async getBills(params: BillsParams = {}): Promise<PaginatedBills> {
    interface BillsResponse {
      bills: CongressBill[];
      pagination: { count: number; next?: string };
    }

    const path = params.congress
      ? `/bill/${params.congress}${params.type ? `/${params.type}` : ''}`
      : '/bill';

    const response = await this.request<BillsResponse>(path, {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      fromDateTime: params.fromDateTime,
      toDateTime: params.toDateTime,
      sort: params.sort,
    });

    return {
      data: response.bills,
      pagination: response.pagination,
    };
  }

  async getBill(congress: number, type: string, number: number): Promise<CongressBill> {
    interface BillResponse {
      bill: CongressBill;
    }
    const response = await this.request<BillResponse>(
      `/bill/${congress}/${type.toLowerCase()}/${number}`
    );
    return response.bill;
  }

  async getBillText(
    congress: number,
    type: string,
    number: number,
    format: 'xml' | 'pdf' | 'html' = 'xml'
  ): Promise<string> {
    interface TextVersion {
      type: string;
      date: string;
      formats: Array<{ type: string; url: string }>;
    }
    interface TextResponse {
      textVersions: TextVersion[];
    }

    const response = await this.request<TextResponse>(
      `/bill/${congress}/${type.toLowerCase()}/${number}/text`
    );

    if (!response.textVersions?.length) {
      throw new Error('No text versions available');
    }

    const latestVersion = response.textVersions[0];
    const formatUrl = latestVersion.formats.find((f) => f.type === format)?.url;

    if (!formatUrl) {
      throw new Error(`Format ${format} not available`);
    }

    const textResponse = await axios.get<string>(formatUrl);
    return textResponse.data;
  }

  async getBillActions(congress: number, type: string, number: number): Promise<BillAction[]> {
    interface ActionsResponse {
      actions: BillAction[];
    }
    const response = await this.request<ActionsResponse>(
      `/bill/${congress}/${type.toLowerCase()}/${number}/actions`
    );
    return response.actions;
  }

  async getBillAmendments(congress: number, type: string, number: number): Promise<Amendment[]> {
    interface AmendmentsResponse {
      amendments: Amendment[];
    }
    const response = await this.request<AmendmentsResponse>(
      `/bill/${congress}/${type.toLowerCase()}/${number}/amendments`
    );
    return response.amendments;
  }

  // Votes API
  async getVotes(params: VotesParams = {}): Promise<PaginatedVotes> {
    interface VotesResponse {
      rollCallVotes: CongressVote[];
      pagination: { count: number; next?: string };
    }

    let path = '/rollcall';
    if (params.congress && params.chamber) {
      path = `/rollcall/${params.congress}/${params.chamber}`;
    } else if (params.congress) {
      path = `/rollcall/${params.congress}`;
    }

    const response = await this.request<VotesResponse>(path, {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    });

    return {
      data: response.rollCallVotes ?? [],
      pagination: response.pagination,
    };
  }

  async getVote(
    congress: number,
    chamber: 'house' | 'senate',
    session: number,
    rollNumber: number
  ): Promise<CongressVote> {
    interface VoteResponse {
      rollCallVote: CongressVote;
    }
    const response = await this.request<VoteResponse>(
      `/rollcall/${congress}/${chamber}/${session}/${rollNumber}`
    );
    return response.rollCallVote;
  }

  // Members API
  async getMembers(params: MembersParams = {}): Promise<PaginatedMembers> {
    interface MembersResponse {
      members: CongressMember[];
      pagination: { count: number; next?: string };
    }

    let path = '/member';
    if (params.congress) {
      path = `/member/congress/${params.congress}${params.chamber ? `/${params.chamber}` : ''}`;
    }

    const response = await this.request<MembersResponse>(path, {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      currentMember: params.currentMember,
    });

    return {
      data: response.members,
      pagination: response.pagination,
    };
  }

  async getMember(bioguideId: string): Promise<CongressMember> {
    interface MemberResponse {
      member: CongressMember;
    }
    const response = await this.request<MemberResponse>(`/member/${bioguideId}`);
    return response.member;
  }

  async getMemberVotes(bioguideId: string, limit = 100): Promise<CongressVote[]> {
    interface VotesResponse {
      votes: CongressVote[];
    }
    const response = await this.request<VotesResponse>(`/member/${bioguideId}/votes`, {
      limit,
    });
    return response.votes ?? [];
  }

  // Committees API
  async getCommittees(congress: number, chamber?: 'house' | 'senate'): Promise<Committee[]> {
    interface CommitteesResponse {
      committees: Committee[];
    }
    const path = chamber
      ? `/committee/${congress}/${chamber}`
      : `/committee/${congress}`;
    const response = await this.request<CommitteesResponse>(path);
    return response.committees;
  }

  async getCommittee(congress: number, chamber: string, code: string): Promise<Committee> {
    interface CommitteeResponse {
      committee: Committee;
    }
    const response = await this.request<CommitteeResponse>(
      `/committee/${congress}/${chamber}/${code}`
    );
    return response.committee;
  }

  // Pagination helpers
  async *iterateBills(params: BillsParams = {}): AsyncGenerator<CongressBill> {
    let offset = params.offset ?? 0;
    const limit = params.limit ?? 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getBills({ ...params, limit, offset });

      for (const bill of response.data) {
        yield bill;
      }

      if (response.data.length < limit || !response.pagination.next) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
  }

  async *iterateMembers(params: MembersParams = {}): AsyncGenerator<CongressMember> {
    let offset = params.offset ?? 0;
    const limit = params.limit ?? 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getMembers({ ...params, limit, offset });

      for (const member of response.data) {
        yield member;
      }

      if (response.data.length < limit || !response.pagination.next) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
  }
}

export function createCongressGovClient(options: CongressGovClientOptions): CongressGovClient {
  return new CongressGovClient(options);
}
