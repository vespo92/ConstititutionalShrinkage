import { HttpClient } from '../utils/request';
import { createPaginatedList } from '../utils/pagination';
import { PaginatedResponse, SingleResponse } from '../types/common.types';
import {
  Bill,
  BillListParams,
  BillVersion,
  BillDiff,
  BillDiffParams,
  Amendment,
} from '../types/bills.types';

export class BillsResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * List bills with pagination and filtering
   */
  async list(params: BillListParams = {}): Promise<PaginatedResponse<Bill>> {
    return this.client.get<PaginatedResponse<Bill>>('/v1/bills', {
      limit: params.limit,
      cursor: params.cursor,
      status: params.status,
      category: params.category,
      region: params.region,
      search: params.search,
    });
  }

  /**
   * Iterate through all bills matching the filters
   */
  listAll(params: Omit<BillListParams, 'cursor'> = {}) {
    const paginatedList = createPaginatedList<Bill, BillListParams>(
      (p) => this.list(p)
    );
    return paginatedList.listAll(params);
  }

  /**
   * Get a specific bill by ID
   */
  async get(id: string): Promise<Bill> {
    const response = await this.client.get<SingleResponse<Bill>>(`/v1/bills/${id}`);
    return response.data;
  }

  /**
   * Get version history for a bill
   */
  async getVersions(id: string): Promise<BillVersion[]> {
    const response = await this.client.get<SingleResponse<BillVersion[]>>(
      `/v1/bills/${id}/versions`
    );
    return response.data;
  }

  /**
   * Get diff between two versions of a bill
   */
  async diff(id: string, params: BillDiffParams = {}): Promise<BillDiff> {
    const response = await this.client.get<SingleResponse<BillDiff>>(
      `/v1/bills/${id}/diff`,
      {
        fromVersion: params.fromVersion,
        toVersion: params.toVersion,
      }
    );
    return response.data;
  }

  /**
   * Get amendments for a bill
   */
  async getAmendments(
    id: string,
    params: { limit?: number; cursor?: string } = {}
  ): Promise<PaginatedResponse<Amendment>> {
    return this.client.get<PaginatedResponse<Amendment>>(
      `/v1/bills/${id}/amendments`,
      params
    );
  }

  /**
   * Iterate through all amendments for a bill
   */
  listAllAmendments(id: string) {
    const paginatedList = createPaginatedList<Amendment, { limit?: number; cursor?: string }>(
      (p) => this.getAmendments(id, p)
    );
    return paginatedList.listAll({});
  }
}
