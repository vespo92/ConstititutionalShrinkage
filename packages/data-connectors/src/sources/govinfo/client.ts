import axios, { AxiosInstance } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import {
  GovInfoPackage,
  GovInfoCollection,
  FederalRegisterDoc,
  GovInfoSearchParams,
} from './types.js';

export interface GovInfoClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
}

interface SearchResponse {
  count: number;
  offsetMark: string;
  nextPage?: string;
  packages: GovInfoPackage[];
}

export class GovInfoClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;

  constructor(options: GovInfoClientOptions) {
    this.client = axios.create({
      baseURL: options.baseUrl ?? 'https://api.govinfo.gov',
      params: {
        api_key: options.apiKey,
      },
    });

    this.rateLimiter = createRateLimiter({
      requestsPerSecond: options.requestsPerSecond ?? 5,
    });

    this.cache = createCache({
      ttl: 30 * 60 * 1000,
    });
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = `govinfo:${path}:${JSON.stringify(params ?? {})}`;
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

  async getCollections(): Promise<GovInfoCollection[]> {
    interface CollectionsResponse {
      collections: GovInfoCollection[];
    }
    const response = await this.request<CollectionsResponse>('/collections');
    return response.collections;
  }

  async searchPackages(params: GovInfoSearchParams = {}): Promise<SearchResponse> {
    const queryParams: Record<string, unknown> = {
      pageSize: params.pageSize ?? 100,
    };

    if (params.congress) {
      queryParams.congress = params.congress;
    }
    if (params.docClass) {
      queryParams.docClass = params.docClass;
    }
    if (params.publishDateStart) {
      queryParams.publishDateIssuedStartDate = params.publishDateStart;
    }
    if (params.publishDateEnd) {
      queryParams.publishDateIssuedEndDate = params.publishDateEnd;
    }
    if (params.offsetMark) {
      queryParams.offsetMark = params.offsetMark;
    }

    const collection = params.collection ?? 'BILLS';
    return this.request<SearchResponse>(`/collections/${collection}`, queryParams);
  }

  async getPackage(packageId: string): Promise<GovInfoPackage> {
    return this.request<GovInfoPackage>(`/packages/${packageId}/summary`);
  }

  async getPackageContent(
    packageId: string,
    format: 'xml' | 'pdf' | 'html' | 'txt' = 'xml'
  ): Promise<string> {
    const pkg = await this.getPackage(packageId);
    const downloadLinks = pkg.download;

    if (!downloadLinks) {
      throw new Error('No download links available');
    }

    const formatMap = {
      xml: downloadLinks.xmlLink,
      pdf: downloadLinks.pdfLink,
      html: downloadLinks.htmlLink,
      txt: downloadLinks.txtLink,
    };

    const url = formatMap[format];
    if (!url) {
      throw new Error(`Format ${format} not available for package ${packageId}`);
    }

    const response = await axios.get<string>(url);
    return response.data;
  }

  async getBills(congress: number, params: Partial<GovInfoSearchParams> = {}): Promise<SearchResponse> {
    return this.searchPackages({
      ...params,
      collection: 'BILLS',
      congress,
    });
  }

  async getCongressionalRecords(
    congress: number,
    params: Partial<GovInfoSearchParams> = {}
  ): Promise<SearchResponse> {
    return this.searchPackages({
      ...params,
      collection: 'CREC',
      congress,
    });
  }

  async getPublicLaws(
    congress: number,
    params: Partial<GovInfoSearchParams> = {}
  ): Promise<SearchResponse> {
    return this.searchPackages({
      ...params,
      collection: 'PLAW',
      congress,
    });
  }

  async getFederalRegister(
    startDate: string,
    endDate: string
  ): Promise<FederalRegisterDoc[]> {
    interface FRResponse {
      results: FederalRegisterDoc[];
    }

    const response = await this.request<FRResponse>(
      '/collections/FR',
      {
        publishDateIssuedStartDate: startDate,
        publishDateIssuedEndDate: endDate,
        pageSize: 1000,
      }
    );

    return response.results ?? [];
  }

  async *iteratePackages(params: GovInfoSearchParams = {}): AsyncGenerator<GovInfoPackage> {
    let offsetMark: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const response = await this.searchPackages({ ...params, offsetMark });

      for (const pkg of response.packages) {
        yield pkg;
      }

      if (!response.nextPage || response.packages.length === 0) {
        hasMore = false;
      } else {
        offsetMark = response.offsetMark;
      }
    }
  }
}

export function createGovInfoClient(options: GovInfoClientOptions): GovInfoClient {
  return new GovInfoClient(options);
}
