import { HttpClient } from '../utils/request';
import { createPaginatedList } from '../utils/pagination';
import { PaginatedResponse, SingleResponse } from '../types/common.types';
import {
  VoteSession,
  VoteSessionListParams,
  DetailedTally,
  VotingStatistics,
} from '../types/votes.types';

export class VotesResource {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * List voting sessions with pagination and filtering
   */
  async listSessions(params: VoteSessionListParams = {}): Promise<PaginatedResponse<VoteSession>> {
    return this.client.get<PaginatedResponse<VoteSession>>('/v1/votes/sessions', {
      limit: params.limit,
      cursor: params.cursor,
      status: params.status,
      billId: params.billId,
    });
  }

  /**
   * Iterate through all voting sessions matching the filters
   */
  listAllSessions(params: Omit<VoteSessionListParams, 'cursor'> = {}) {
    const paginatedList = createPaginatedList<VoteSession, VoteSessionListParams>(
      (p) => this.listSessions(p)
    );
    return paginatedList.listAll(params);
  }

  /**
   * Get a specific voting session by ID
   */
  async getSession(id: string): Promise<VoteSession> {
    const response = await this.client.get<SingleResponse<VoteSession>>(
      `/v1/votes/sessions/${id}`
    );
    return response.data;
  }

  /**
   * Get detailed tally for a voting session
   */
  async getTally(sessionId: string): Promise<DetailedTally> {
    const response = await this.client.get<SingleResponse<DetailedTally>>(
      `/v1/votes/sessions/${sessionId}/tally`
    );
    return response.data;
  }

  /**
   * Get overall voting statistics
   */
  async getStatistics(params: { period?: string } = {}): Promise<VotingStatistics> {
    const response = await this.client.get<SingleResponse<VotingStatistics>>(
      '/v1/votes/statistics',
      params
    );
    return response.data;
  }

  /**
   * Get voting session for a specific bill
   */
  async getSessionForBill(billId: string): Promise<VoteSession | null> {
    const response = await this.listSessions({ billId, limit: 1 });
    return response.data[0] || null;
  }
}
