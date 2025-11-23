import { HttpClient } from '../utils/request';
import { createPaginatedList } from '../utils/pagination';
import { PaginatedResponse, SingleResponse } from '../types/common.types';
import {
  Region,
  RegionListParams,
  DetailedRegionMetrics,
  RegionMetricsParams,
  Leaderboard,
} from '../types/regions.types';

export class RegionsResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * List regions with pagination and filtering
   */
  async list(params: RegionListParams = {}): Promise<PaginatedResponse<Region>> {
    return this.client.get<PaginatedResponse<Region>>('/v1/regions', {
      limit: params.limit,
      cursor: params.cursor,
      type: params.type,
      parentId: params.parentId,
    });
  }

  /**
   * Iterate through all regions matching the filters
   */
  listAll(params: Omit<RegionListParams, 'cursor'> = {}) {
    const paginatedList = createPaginatedList<Region, RegionListParams>(
      (p) => this.list(p)
    );
    return paginatedList.listAll(params);
  }

  /**
   * Get a specific region by ID
   */
  async get(id: string): Promise<Region> {
    const response = await this.client.get<SingleResponse<Region>>(`/v1/regions/${id}`);
    return response.data;
  }

  /**
   * Get detailed metrics for a region
   */
  async getMetrics(id: string, params: RegionMetricsParams = {}): Promise<DetailedRegionMetrics> {
    const response = await this.client.get<SingleResponse<DetailedRegionMetrics>>(
      `/v1/regions/${id}/metrics`,
      {
        metrics: params.metrics?.join(','),
        period: params.period,
      }
    );
    return response.data;
  }

  /**
   * Get leaderboard for child regions
   */
  async getLeaderboard(id: string, params: { metric?: string } = {}): Promise<Leaderboard> {
    const response = await this.client.get<SingleResponse<Leaderboard>>(
      `/v1/regions/${id}/leaderboard`,
      params
    );
    return response.data;
  }

  /**
   * Get child regions of a parent region
   */
  async getChildren(parentId: string): Promise<Region[]> {
    const response = await this.list({ parentId });
    return response.data;
  }
}
