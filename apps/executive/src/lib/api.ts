import type {
  Policy,
  PolicyCreate,
  PolicyUpdate,
  PolicyFilters,
  PolicyImplementation,
  TBLScore,
  MetricFilters,
  Resource,
  Allocation,
  Budget,
  Personnel,
  Incident,
  EmergencyResponse,
  Region,
  Activity,
  KPI,
  Report,
  ReportRequest,
  Alert,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const api = {
  // Policy endpoints
  policies: {
    list: (filters?: PolicyFilters) =>
      request<PaginatedResponse<Policy>>(
        `/api/v1/policies${buildQueryString(filters || {})}`
      ),
    get: (id: string) =>
      request<ApiResponse<Policy>>(`/api/v1/policies/${id}`),
    create: (data: PolicyCreate) =>
      request<ApiResponse<Policy>>('/api/v1/policies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: PolicyUpdate) =>
      request<ApiResponse<Policy>>(`/api/v1/policies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<ApiResponse<void>>(`/api/v1/policies/${id}`, {
        method: 'DELETE',
      }),
    getImplementation: (id: string) =>
      request<ApiResponse<PolicyImplementation>>(
        `/api/v1/policies/${id}/implementation`
      ),
    updateProgress: (id: string, progress: number) =>
      request<ApiResponse<Policy>>(`/api/v1/policies/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      }),
  },

  // Metrics endpoints
  metrics: {
    getTBL: (entityId: string) =>
      request<ApiResponse<TBLScore>>(`/api/v1/metrics/tbl/${entityId}`),
    getTBLHistory: (entityId: string, filters?: MetricFilters) =>
      request<ApiResponse<TBLScore[]>>(
        `/api/v1/metrics/tbl/${entityId}/history${buildQueryString(filters || {})}`
      ),
    getKPIs: (regionId?: string) =>
      request<ApiResponse<KPI[]>>(
        `/api/v1/metrics/kpis${regionId ? `?regionId=${regionId}` : ''}`
      ),
    compareRegions: (regionIds: string[]) =>
      request<ApiResponse<Record<string, TBLScore>>>(
        `/api/v1/metrics/compare?regions=${regionIds.join(',')}`
      ),
  },

  // Resource endpoints
  resources: {
    list: (regionId?: string) =>
      request<ApiResponse<Resource[]>>(
        `/api/v1/resources${regionId ? `?regionId=${regionId}` : ''}`
      ),
    get: (id: string) =>
      request<ApiResponse<Resource>>(`/api/v1/resources/${id}`),
    allocate: (data: Allocation) =>
      request<ApiResponse<void>>('/api/v1/resources/allocate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getBudget: (regionId: string, fiscalYear?: number) =>
      request<ApiResponse<Budget>>(
        `/api/v1/resources/budget/${regionId}${fiscalYear ? `?year=${fiscalYear}` : ''}`
      ),
    getPersonnel: (regionId?: string) =>
      request<ApiResponse<Personnel[]>>(
        `/api/v1/resources/personnel${regionId ? `?regionId=${regionId}` : ''}`
      ),
  },

  // Emergency endpoints
  emergency: {
    getIncidents: (status?: string) =>
      request<ApiResponse<Incident[]>>(
        `/api/v1/emergency/incidents${status ? `?status=${status}` : ''}`
      ),
    getIncident: (id: string) =>
      request<ApiResponse<Incident>>(`/api/v1/emergency/incidents/${id}`),
    createIncident: (data: Partial<Incident>) =>
      request<ApiResponse<Incident>>('/api/v1/emergency/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateIncident: (id: string, data: Partial<Incident>) =>
      request<ApiResponse<Incident>>(`/api/v1/emergency/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getResponse: (incidentId: string) =>
      request<ApiResponse<EmergencyResponse>>(
        `/api/v1/emergency/incidents/${incidentId}/response`
      ),
  },

  // Region endpoints
  regions: {
    list: () => request<ApiResponse<Region[]>>('/api/v1/regions'),
    get: (id: string) =>
      request<ApiResponse<Region>>(`/api/v1/regions/${id}`),
  },

  // Activity endpoints
  activity: {
    getRecent: (limit = 10) =>
      request<ApiResponse<Activity[]>>(`/api/v1/activity?limit=${limit}`),
    getByPolicy: (policyId: string) =>
      request<ApiResponse<Activity[]>>(`/api/v1/activity?policyId=${policyId}`),
  },

  // Report endpoints
  reports: {
    list: () => request<ApiResponse<Report[]>>('/api/v1/reports'),
    generate: (data: ReportRequest) =>
      request<ApiResponse<Report>>('/api/v1/reports/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    download: (id: string) =>
      `${API_BASE}/api/v1/reports/${id}/download`,
  },

  // Alert endpoints
  alerts: {
    list: () => request<ApiResponse<Alert[]>>('/api/v1/alerts'),
    markRead: (id: string) =>
      request<ApiResponse<void>>(`/api/v1/alerts/${id}/read`, {
        method: 'POST',
      }),
    markAllRead: () =>
      request<ApiResponse<void>>('/api/v1/alerts/read-all', {
        method: 'POST',
      }),
  },
};

export default api;
