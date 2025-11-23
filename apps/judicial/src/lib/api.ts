const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Bill Review API
export const reviewApi = {
  getPendingReviews: () => request<BillReview[]>('/api/reviews/pending'),
  getReview: (id: string) => request<BillReview>(`/api/reviews/${id}`),
  submitReview: (id: string, data: ReviewSubmission) =>
    request<BillReview>(`/api/reviews/${id}`, { method: 'POST', body: data }),
  getReviewHistory: () => request<BillReview[]>('/api/reviews/history'),
};

// Compliance API
export const complianceApi = {
  checkCompliance: (billText: string) =>
    request<ComplianceCheck>('/api/compliance/check', { method: 'POST', body: { text: billText } }),
  getViolations: () => request<Violation[]>('/api/compliance/violations'),
  getComplianceStats: () => request<ComplianceStats>('/api/compliance/stats'),
};

// Cases API
export const casesApi = {
  getCases: (filters?: CaseFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    const query = params.toString();
    return request<Case[]>(`/api/cases${query ? `?${query}` : ''}`);
  },
  getCase: (id: string) => request<Case>(`/api/cases/${id}`),
  createCase: (data: CaseCreation) =>
    request<Case>('/api/cases', { method: 'POST', body: data }),
  updateCase: (id: string, data: Partial<Case>) =>
    request<Case>(`/api/cases/${id}`, { method: 'PATCH', body: data }),
  addEvidence: (caseId: string, evidence: EvidenceUpload) =>
    request<Evidence>(`/api/cases/${caseId}/evidence`, { method: 'POST', body: evidence }),
  issueRuling: (caseId: string, ruling: RulingSubmission) =>
    request<Ruling>(`/api/cases/${caseId}/ruling`, { method: 'POST', body: ruling }),
};

// Conflicts API
export const conflictsApi = {
  getConflicts: () => request<LegislativeConflict[]>('/api/conflicts'),
  getConflict: (id: string) => request<LegislativeConflict>(`/api/conflicts/${id}`),
  resolveConflict: (id: string, resolution: ResolutionSubmission) =>
    request<LegislativeConflict>(`/api/conflicts/${id}/resolve`, { method: 'POST', body: resolution }),
};

// Audit API
export const auditApi = {
  getAuditTrail: (filters?: AuditFilters) => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.entityId) params.set('entityId', filters.entityId);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const query = params.toString();
    return request<AuditEntry[]>(`/api/audit${query ? `?${query}` : ''}`);
  },
  verifyIntegrity: (entityType: string, entityId: string) =>
    request<IntegrityResult>(`/api/audit/verify/${entityType}/${entityId}`),
};

// Precedents API
export const precedentsApi = {
  searchPrecedents: (query: string, category?: string) => {
    const params = new URLSearchParams({ q: query });
    if (category) params.set('category', category);
    return request<Precedent[]>(`/api/precedents/search?${params}`);
  },
  getPrecedent: (id: string) => request<Precedent>(`/api/precedents/${id}`),
  getCategories: () => request<string[]>('/api/precedents/categories'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => request<DashboardStats>('/api/dashboard/stats'),
  getRecentActivity: () => request<RecentActivity[]>('/api/dashboard/activity'),
};

// Types for API
import type {
  BillReview,
  ComplianceCheck,
  Violation,
  Case,
  Evidence,
  Ruling,
  LegislativeConflict,
  AuditEntry,
  Precedent,
  DashboardStats,
} from '@/types';

interface ReviewSubmission {
  status: 'approved' | 'rejected' | 'requires_modification';
  notes: string;
  complianceIssues?: string[];
}

interface ComplianceStats {
  totalChecks: number;
  compliantRate: number;
  violationsByCategory: Record<string, number>;
}

interface CaseFilters {
  status?: string;
  type?: string;
  region?: string;
}

interface CaseCreation {
  type: Case['type'];
  title: string;
  description: string;
  parties: Case['parties'];
}

interface EvidenceUpload {
  type: Evidence['type'];
  title: string;
  description: string;
  fileUrl?: string;
}

interface RulingSubmission {
  summary: string;
  fullText: string;
  outcome: Ruling['outcome'];
  precedentValue: boolean;
  citations: string[];
}

interface ResolutionSubmission {
  resolution: string;
  explanation: string;
}

interface AuditFilters {
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

interface IntegrityResult {
  valid: boolean;
  issues?: string[];
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  actor: string;
}
