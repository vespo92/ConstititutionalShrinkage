import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.constitutional-shrinkage.gov';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

/**
 * API Client Service
 * Handles all HTTP requests to the backend with authentication and error handling
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch {
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      authenticated = true,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (authenticated) {
      const token = await this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null as T,
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Convenience methods
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// API endpoints
export const api = new ApiClient(API_BASE_URL);

// Typed API methods
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }, { authenticated: false }),

  register: (data: RegisterData) =>
    api.post<{ token: string; user: User }>('/auth/register', data, { authenticated: false }),

  logout: () => api.post('/auth/logout', {}),

  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }, { authenticated: false }),

  me: () => api.get<User>('/auth/me'),
};

export const billsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<{ bills: Bill[]; total: number }>(`/bills${buildQuery(params)}`),

  get: (id: string) => api.get<Bill>(`/bills/${id}`),

  search: (query: string) =>
    api.get<{ bills: Bill[] }>(`/bills/search?q=${encodeURIComponent(query)}`),
};

export const votingApi = {
  sessions: () => api.get<{ sessions: VotingSession[] }>('/voting/sessions'),

  getSession: (id: string) => api.get<VotingSession>(`/voting/sessions/${id}`),

  castVote: (sessionId: string, vote: 'yea' | 'nay' | 'abstain') =>
    api.post<{ hash: string }>(`/voting/sessions/${sessionId}/vote`, { vote }),

  verifyVote: (hash: string) => api.get<VoteVerification>(`/voting/verify/${hash}`),
};

export const delegationsApi = {
  list: () => api.get<{ outgoing: Delegation[]; incoming: Delegation[] }>('/delegations'),

  create: (data: CreateDelegationData) =>
    api.post<Delegation>('/delegations', data),

  revoke: (id: string) => api.delete(`/delegations/${id}`),

  findDelegates: (params?: { region?: string; specialty?: string }) =>
    api.get<{ delegates: Delegate[] }>(`/delegations/find${buildQuery(params)}`),
};

// Helper function to build query strings
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return query ? `?${query}` : '';
}

// Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  region: string;
  verified: boolean;
  stats?: {
    votesCount: number;
    delegationsCount: number;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  region: string;
}

export interface Bill {
  id: string;
  title: string;
  summary: string;
  content?: string;
  status: 'draft' | 'active' | 'passed' | 'rejected';
  sponsor: string;
  region?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: TimelineEvent[];
  votingSession?: {
    id: string;
    yea: number;
    nay: number;
    abstain: number;
  };
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'voting_started' | 'voting_ended' | 'passed' | 'rejected';
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

export interface VotingSession {
  id: string;
  billId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  deadline: string;
  hasVoted: boolean;
  votes: {
    yea: number;
    nay: number;
    abstain: number;
  };
}

export interface VoteVerification {
  valid: boolean;
  sessionId: string;
  vote: 'yea' | 'nay' | 'abstain';
  timestamp: string;
}

export interface Delegation {
  id: string;
  delegateName?: string;
  delegatorName?: string;
  category: string;
  weight: number;
  createdAt: string;
  status: 'active' | 'pending' | 'expired';
}

export interface CreateDelegationData {
  delegateId: string;
  category: string;
  weight?: number;
}

export interface Delegate {
  id: string;
  name: string;
  region: string;
  specialties: string[];
  trustScore: number;
  delegatorCount: number;
}

export default api;
