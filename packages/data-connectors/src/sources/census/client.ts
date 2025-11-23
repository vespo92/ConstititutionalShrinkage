import axios, { AxiosInstance } from 'axios';
import { RateLimiter, createRateLimiter } from '../../utils/rate-limiter.js';
import { MemoryCache, createCache } from '../../utils/cache.js';
import {
  CensusGeography,
  CensusDemographics,
  CongressionalDistrict,
  CensusApiParams,
  TigerFileParams,
} from './types.js';

export interface CensusClientOptions {
  apiKey: string;
  baseUrl?: string;
  requestsPerSecond?: number;
}

export class CensusClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: MemoryCache;
  private apiKey: string;

  constructor(options: CensusClientOptions) {
    this.apiKey = options.apiKey;

    this.client = axios.create({
      baseURL: options.baseUrl ?? 'https://api.census.gov',
      headers: {
        Accept: 'application/json',
      },
    });

    this.rateLimiter = createRateLimiter({
      requestsPerSecond: options.requestsPerSecond ?? 5,
    });

    this.cache = createCache({
      ttl: 60 * 60 * 1000, // 1 hour cache for census data
    });
  }

  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const cacheKey = `census:${path}:${JSON.stringify(params ?? {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    return this.rateLimiter.execute(async () => {
      const response = await this.client.get<T>(path, {
        params: { ...params, key: this.apiKey },
      });
      this.cache.set(cacheKey, response.data);
      return response.data;
    });
  }

  async getDemographics(params: CensusApiParams): Promise<CensusDemographics[]> {
    const variables = params.variables.join(',');
    const path = `/data/${params.year}/${params.dataset}`;

    const response = await this.request<string[][]>(path, {
      get: variables,
      for: params.geography.for,
      in: params.geography.in,
    });

    if (!response || response.length < 2) {
      return [];
    }

    const headers = response[0];
    const data = response.slice(1);

    return data.map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      return this.transformDemographics(record, params.year);
    });
  }

  private transformDemographics(
    record: Record<string, string>,
    year: number
  ): CensusDemographics {
    const geoId = [record.state, record.county, record.tract]
      .filter(Boolean)
      .join('');

    return {
      geoId,
      year,
      totalPopulation: parseInt(record.B01001_001E ?? '0', 10),
      medianAge: parseFloat(record.B01002_001E ?? '0'),
      medianHouseholdIncome: parseInt(record.B19013_001E ?? '0', 10),
      povertyRate: parseFloat(record.B17001_002E ?? '0') /
        (parseFloat(record.B17001_001E ?? '1') || 1) * 100,
    };
  }

  async getStates(): Promise<CensusGeography[]> {
    const response = await this.request<string[][]>('/data/2022/acs/acs5', {
      get: 'NAME,B01001_001E',
      for: 'state:*',
    });

    if (!response || response.length < 2) {
      return [];
    }

    return response.slice(1).map((row) => ({
      geoId: row[2],
      name: row[0],
      type: 'state' as const,
      stateCode: row[2],
      population: parseInt(row[1], 10),
    }));
  }

  async getCounties(stateCode: string): Promise<CensusGeography[]> {
    const response = await this.request<string[][]>('/data/2022/acs/acs5', {
      get: 'NAME,B01001_001E',
      for: 'county:*',
      in: `state:${stateCode}`,
    });

    if (!response || response.length < 2) {
      return [];
    }

    return response.slice(1).map((row) => ({
      geoId: row[2] + row[3],
      name: row[0],
      type: 'county' as const,
      stateCode: row[2],
      countyCode: row[3],
      population: parseInt(row[1], 10),
    }));
  }

  async getCongressionalDistricts(congress: number): Promise<CongressionalDistrict[]> {
    const year = 2020 + (congress - 117) * 2;
    const response = await this.request<string[][]>(`/data/${year}/acs/acs5`, {
      get: 'NAME,B01001_001E',
      for: 'congressional district:*',
    });

    if (!response || response.length < 2) {
      return [];
    }

    return response.slice(1).map((row) => {
      const nameParts = row[0].split(',');
      const districtMatch = nameParts[0].match(/District (\d+)/);

      return {
        districtId: row[2] + row[3],
        state: nameParts[1]?.trim() ?? '',
        districtNumber: districtMatch ? parseInt(districtMatch[1], 10) : 0,
        congress,
        population: parseInt(row[1], 10),
      };
    });
  }

  async getTracts(stateCode: string, countyCode: string): Promise<CensusGeography[]> {
    const response = await this.request<string[][]>('/data/2022/acs/acs5', {
      get: 'NAME,B01001_001E',
      for: 'tract:*',
      in: `state:${stateCode} county:${countyCode}`,
    });

    if (!response || response.length < 2) {
      return [];
    }

    return response.slice(1).map((row) => ({
      geoId: row[2] + row[3] + row[4],
      name: row[0],
      type: 'tract' as const,
      stateCode: row[2],
      countyCode: row[3],
      population: parseInt(row[1], 10),
    }));
  }

  getTigerFileUrl(params: TigerFileParams): string {
    const baseUrl = 'https://www2.census.gov/geo/tiger';
    const layerMap: Record<string, string> = {
      state: 'STATE',
      county: 'COUNTY',
      tract: 'TRACT',
      cd: 'CD',
      place: 'PLACE',
    };

    const layer = layerMap[params.layer];
    if (params.stateCode) {
      return `${baseUrl}/TIGER${params.year}/${layer}/tl_${params.year}_${params.stateCode}_${params.layer.toLowerCase()}.zip`;
    }
    return `${baseUrl}/TIGER${params.year}/${layer}/tl_${params.year}_us_${params.layer.toLowerCase()}.zip`;
  }

  async *iterateAllCounties(): AsyncGenerator<CensusGeography> {
    const states = await this.getStates();

    for (const state of states) {
      const counties = await this.getCounties(state.stateCode!);
      for (const county of counties) {
        yield county;
      }
    }
  }
}

export function createCensusClient(options: CensusClientOptions): CensusClient {
  return new CensusClient(options);
}
