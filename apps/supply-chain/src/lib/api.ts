import type {
  NetworkGraph,
  DashboardMetrics,
  TopProducer,
  ProductJourney,
  TaxCalculation,
  TransparencyReport,
  OrganizationRanking,
  GeneratedReport,
  ReportConfig,
  TaxExemption,
  NetworkNode,
  NetworkEdge,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardApi = {
  getMetrics: (): Promise<DashboardMetrics> =>
    fetchApi('/supply-chain/dashboard/metrics'),

  getTopProducers: (limit = 10): Promise<TopProducer[]> =>
    fetchApi(`/supply-chain/dashboard/top-producers?limit=${limit}`),
};

// Network Graph API
export const networkApi = {
  getGraph: (filters?: { region?: string; nodeType?: string }): Promise<NetworkGraph> => {
    const params = new URLSearchParams();
    if (filters?.region) params.append('region', filters.region);
    if (filters?.nodeType) params.append('nodeType', filters.nodeType);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/supply-chain/network${query}`);
  },

  getNode: (nodeId: string): Promise<NetworkNode> =>
    fetchApi(`/supply-chain/network/nodes/${nodeId}`),

  getNodeConnections: (nodeId: string): Promise<{ upstream: NetworkEdge[]; downstream: NetworkEdge[] }> =>
    fetchApi(`/supply-chain/network/nodes/${nodeId}/connections`),

  getEntityChain: (entityId: string): Promise<NetworkGraph> =>
    fetchApi(`/supply-chain/network/entity/${entityId}`),
};

// Distance Calculator API
export const distanceApi = {
  calculate: (params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    transportMode?: string;
  }): Promise<{
    distance: number;
    tier: string;
    taxRate: number;
    carbonFootprint: number;
  }> => fetchApi('/supply-chain/distance/calculate', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  getAlternatives: (params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
  }): Promise<{
    current: { distance: number; co2: number };
    alternatives: Array<{ distance: number; co2: number; savings: number }>;
  }> => fetchApi('/supply-chain/distance/alternatives', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
};

// Product Tracking API
export const trackingApi = {
  search: (query: string): Promise<{ productId: string; productName: string }[]> =>
    fetchApi(`/supply-chain/tracking/search?q=${encodeURIComponent(query)}`),

  getJourney: (productId: string): Promise<ProductJourney> =>
    fetchApi(`/supply-chain/tracking/${productId}`),

  verifyProduct: (productId: string, verificationCode: string): Promise<{
    verified: boolean;
    details: ProductJourney;
  }> => fetchApi('/supply-chain/tracking/verify', {
    method: 'POST',
    body: JSON.stringify({ productId, verificationCode }),
  }),
};

// Taxes API
export const taxesApi = {
  calculate: (params: {
    baseAmount: number;
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    category?: string;
  }): Promise<TaxCalculation> => fetchApi('/supply-chain/taxes/calculate', {
    method: 'POST',
    body: JSON.stringify(params),
  }),

  getRates: (): Promise<{ tiers: Array<{ label: string; maxDistance: number; rate: number }> }> =>
    fetchApi('/supply-chain/taxes/rates'),

  getExemptions: (): Promise<TaxExemption[]> =>
    fetchApi('/supply-chain/taxes/exemptions'),

  checkExemption: (params: {
    category: string;
    productType: string;
  }): Promise<{ eligible: boolean; exemption?: TaxExemption }> =>
    fetchApi('/supply-chain/taxes/exemptions/check', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getRevenue: (period: 'day' | 'week' | 'month' | 'year'): Promise<{
    total: number;
    byRegion: Record<string, number>;
    trend: number[];
  }> => fetchApi(`/supply-chain/taxes/revenue?period=${period}`),
};

// Transparency API
export const transparencyApi = {
  getRankings: (params?: {
    industry?: string;
    limit?: number;
  }): Promise<OrganizationRanking[]> => {
    const searchParams = new URLSearchParams();
    if (params?.industry) searchParams.append('industry', params.industry);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchApi(`/supply-chain/transparency/rankings${query}`);
  },

  getReport: (orgId: string): Promise<TransparencyReport> =>
    fetchApi(`/supply-chain/transparency/${orgId}`),

  searchOrganizations: (query: string): Promise<{
    id: string;
    name: string;
    industry: string;
    score: number;
  }[]> => fetchApi(`/supply-chain/transparency/search?q=${encodeURIComponent(query)}`),
};

// Reports API
export const reportsApi = {
  list: (): Promise<GeneratedReport[]> =>
    fetchApi('/supply-chain/reports'),

  getArchive: (): Promise<GeneratedReport[]> =>
    fetchApi('/supply-chain/reports/archive'),

  generate: (config: ReportConfig): Promise<GeneratedReport> =>
    fetchApi('/supply-chain/reports/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  download: (reportId: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> =>
    fetch(`${API_BASE_URL}/supply-chain/reports/${reportId}/download?format=${format}`)
      .then(res => res.blob()),

  schedule: (config: ReportConfig): Promise<{ scheduled: boolean; nextRun: Date }> =>
    fetchApi('/supply-chain/reports/schedule', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
};

// Mock data generators for development
export const mockData = {
  getDashboardMetrics: (): DashboardMetrics => ({
    totalSupplyChains: 1247,
    avgDistance: 342.5,
    totalTaxRevenue: 2847500,
    avgTransparencyScore: 72.3,
    trends: {
      distanceChange: -5.2,
      taxRevenueChange: 12.8,
      transparencyChange: 3.4,
    },
  }),

  getTopProducers: (): TopProducer[] => [
    { id: '1', name: 'Pacific Northwest Farms', region: 'Pacific Northwest', transparencyScore: 94, volumeHandled: 15420, avgDistance: 45 },
    { id: '2', name: 'Midwest Agricultural Co', region: 'Midwest', transparencyScore: 89, volumeHandled: 12350, avgDistance: 120 },
    { id: '3', name: 'California Organics', region: 'California', transparencyScore: 87, volumeHandled: 10890, avgDistance: 85 },
    { id: '4', name: 'Texas Ranch Supply', region: 'Texas', transparencyScore: 85, volumeHandled: 9750, avgDistance: 195 },
    { id: '5', name: 'New England Fresh', region: 'New England', transparencyScore: 82, volumeHandled: 8420, avgDistance: 65 },
  ],

  getNetworkGraph: (): NetworkGraph => ({
    nodes: [
      { id: 'p1', type: 'producer', name: 'Farm A', location: { lat: 47.6, lng: -122.3, region: 'Pacific Northwest', city: 'Seattle', country: 'USA' }, metrics: { transparencyScore: 92, volumeHandled: 5000, avgDistance: 50 } },
      { id: 'p2', type: 'producer', name: 'Farm B', location: { lat: 45.5, lng: -122.7, region: 'Pacific Northwest', city: 'Portland', country: 'USA' }, metrics: { transparencyScore: 88, volumeHandled: 4200, avgDistance: 75 } },
      { id: 'd1', type: 'distributor', name: 'Regional Dist', location: { lat: 46.5, lng: -120.5, region: 'Pacific Northwest', city: 'Yakima', country: 'USA' }, metrics: { transparencyScore: 85, volumeHandled: 12000, avgDistance: 150 } },
      { id: 'r1', type: 'retailer', name: 'Store Chain A', location: { lat: 47.6, lng: -122.3, region: 'Pacific Northwest', city: 'Seattle', country: 'USA' }, metrics: { transparencyScore: 78, volumeHandled: 3500, avgDistance: 200 } },
      { id: 'r2', type: 'retailer', name: 'Store Chain B', location: { lat: 45.5, lng: -122.7, region: 'Pacific Northwest', city: 'Portland', country: 'USA' }, metrics: { transparencyScore: 75, volumeHandled: 2800, avgDistance: 180 } },
    ],
    edges: [
      { id: 'e1', source: 'p1', target: 'd1', weight: 5000, distance: 120, productTypes: ['produce'], transactionCount: 52 },
      { id: 'e2', source: 'p2', target: 'd1', weight: 4200, distance: 95, productTypes: ['produce'], transactionCount: 48 },
      { id: 'e3', source: 'd1', target: 'r1', weight: 6000, distance: 145, productTypes: ['produce'], transactionCount: 104 },
      { id: 'e4', source: 'd1', target: 'r2', weight: 3200, distance: 130, productTypes: ['produce'], transactionCount: 52 },
    ],
  }),

  getProductJourney: (productId: string): ProductJourney => ({
    productId,
    productName: 'Organic Apples - 5lb Bag',
    origin: {
      entity: 'Pacific Northwest Farms',
      entityId: 'p1',
      location: 'Yakima Valley, WA',
      timestamp: new Date('2024-01-15'),
    },
    hops: [
      { sequence: 1, entity: 'Pacific Northwest Farms', entityId: 'p1', action: 'shipped', location: 'Yakima Valley, WA', coordinates: { lat: 46.6, lng: -120.5 }, timestamp: new Date('2024-01-15'), distanceFromPrevious: 0, verified: true },
      { sequence: 2, entity: 'Regional Distribution Center', entityId: 'd1', action: 'received', location: 'Seattle, WA', coordinates: { lat: 47.6, lng: -122.3 }, timestamp: new Date('2024-01-16'), distanceFromPrevious: 145, verified: true },
      { sequence: 3, entity: 'Regional Distribution Center', entityId: 'd1', action: 'processed', location: 'Seattle, WA', coordinates: { lat: 47.6, lng: -122.3 }, timestamp: new Date('2024-01-16'), distanceFromPrevious: 0, verified: true },
      { sequence: 4, entity: 'Regional Distribution Center', entityId: 'd1', action: 'shipped', location: 'Seattle, WA', coordinates: { lat: 47.6, lng: -122.3 }, timestamp: new Date('2024-01-17'), distanceFromPrevious: 0, verified: true },
      { sequence: 5, entity: 'Fresh Foods Market', entityId: 'r1', action: 'received', location: 'Bellevue, WA', coordinates: { lat: 47.6, lng: -122.2 }, timestamp: new Date('2024-01-17'), distanceFromPrevious: 12, verified: true },
    ],
    currentStatus: 'delivered',
    totalDistance: 157,
    verificationStatus: 'verified',
  }),

  getTransparencyRankings: (): OrganizationRanking[] => [
    { rank: 1, organizationId: 'org1', organizationName: 'Pacific Northwest Farms', industry: 'Agriculture', transparencyScore: 94, change: 2, badges: [{ id: 'b1', name: 'Full Disclosure', description: 'Complete supply chain transparency', level: 'platinum', earnedAt: new Date() }] },
    { rank: 2, organizationId: 'org2', organizationName: 'Midwest Agricultural Co', industry: 'Agriculture', transparencyScore: 89, change: 0, badges: [{ id: 'b2', name: 'Local First', description: 'Prioritizes local sourcing', level: 'gold', earnedAt: new Date() }] },
    { rank: 3, organizationId: 'org3', organizationName: 'California Organics', industry: 'Agriculture', transparencyScore: 87, change: 5, badges: [{ id: 'b3', name: 'Green Leader', description: 'Exceptional environmental practices', level: 'gold', earnedAt: new Date() }] },
    { rank: 4, organizationId: 'org4', organizationName: 'Texas Ranch Supply', industry: 'Agriculture', transparencyScore: 85, change: -1, badges: [] },
    { rank: 5, organizationId: 'org5', organizationName: 'New England Fresh', industry: 'Agriculture', transparencyScore: 82, change: 3, badges: [] },
  ],
};

export { ApiError };
