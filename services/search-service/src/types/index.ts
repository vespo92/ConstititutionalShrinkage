/**
 * Search Service Types
 */

export type SearchableType = 'bills' | 'people' | 'organizations' | 'regions' | 'all';

export interface SearchResult {
  id: string;
  type: SearchableType;
  title: string;
  description: string;
  score: number;
  highlights: string[];
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  took: number;
}

export interface SearchFilters {
  status?: string;
  category?: string;
  region?: string;
  level?: string;
  type?: string;
  industry?: string;
  verificationLevel?: string;
  minReputation?: number;
  minTransparencyScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchOptions {
  query: string;
  type?: SearchableType;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SuggestionResult {
  id: string;
  type: SearchableType;
  text: string;
  score?: number;
}

export interface TrendingTopic {
  term: string;
  count: number;
  change?: number; // Percentage change from previous period
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  activeBills: Array<{
    id: string;
    title: string;
    votingEndsAt?: string;
  }>;
  timestamp: string;
}

export interface IndexStats {
  index: string;
  documentCount: number;
  sizeInBytes: number;
  health: 'green' | 'yellow' | 'red';
}

export interface SyncStatus {
  lastSync: string;
  nextSync?: string;
  status: 'idle' | 'running' | 'error';
  lastError?: string;
  stats?: {
    bills: { indexed: number; deleted: number };
    people: { indexed: number; deleted: number };
    organizations: { indexed: number; deleted: number };
  };
}
