import type {
  Pod,
  CoordinationRequest,
  LocalLegislation,
  ForumPost,
  ForumTopic,
  CommunityEvent,
  FeedbackItem,
  PaginatedResponse,
  PodType,
  PodStatus,
  CoordinationStatus,
  LegislationStatus,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Pod API
export interface FetchPodsParams {
  type?: PodType;
  status?: PodStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchPods(params?: FetchPodsParams): Promise<PaginatedResponse<Pod>> {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  return fetchApi<PaginatedResponse<Pod>>(`/pods?${queryParams}`);
}

export async function fetchPod(id: string): Promise<Pod> {
  return fetchApi<Pod>(`/pods/${id}`);
}

export async function createPod(pod: Partial<Pod>): Promise<Pod> {
  return fetchApi<Pod>('/pods', {
    method: 'POST',
    body: JSON.stringify(pod),
  });
}

export async function updatePod(id: string, updates: Partial<Pod>): Promise<Pod> {
  return fetchApi<Pod>(`/pods/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Coordination API
export interface FetchCoordinationParams {
  status?: CoordinationStatus;
  podId?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchCoordinationRequests(
  params?: FetchCoordinationParams
): Promise<PaginatedResponse<CoordinationRequest>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.podId) queryParams.append('podId', params.podId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  return fetchApi<PaginatedResponse<CoordinationRequest>>(`/coordination?${queryParams}`);
}

export async function fetchCoordinationRequest(id: string): Promise<CoordinationRequest> {
  return fetchApi<CoordinationRequest>(`/coordination/${id}`);
}

export async function createCoordinationRequest(
  request: Partial<CoordinationRequest>
): Promise<CoordinationRequest> {
  return fetchApi<CoordinationRequest>('/coordination', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function voteOnCoordination(
  id: string,
  podId: string,
  vote: 'approve' | 'reject' | 'abstain',
  comments?: string
): Promise<CoordinationRequest> {
  return fetchApi<CoordinationRequest>(`/coordination/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ podId, vote, comments }),
  });
}

// Legislation API
export interface FetchLegislationParams {
  status?: LegislationStatus;
  podId?: string;
  scope?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchLegislation(
  params?: FetchLegislationParams
): Promise<PaginatedResponse<LocalLegislation>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.podId) queryParams.append('podId', params.podId);
  if (params?.scope) queryParams.append('scope', params.scope);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  return fetchApi<PaginatedResponse<LocalLegislation>>(`/legislation?${queryParams}`);
}

export async function fetchLegislationById(id: string): Promise<LocalLegislation> {
  return fetchApi<LocalLegislation>(`/legislation/${id}`);
}

export async function voteLegislation(
  id: string,
  vote: 'for' | 'against' | 'abstain'
): Promise<LocalLegislation> {
  return fetchApi<LocalLegislation>(`/legislation/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ vote }),
  });
}

// Community API
export async function fetchForumTopics(): Promise<ForumTopic[]> {
  return fetchApi<ForumTopic[]>('/community/topics');
}

export async function fetchForumPosts(
  topicId?: string,
  page?: number
): Promise<PaginatedResponse<ForumPost>> {
  const queryParams = new URLSearchParams();
  if (topicId) queryParams.append('topicId', topicId);
  if (page) queryParams.append('page', page.toString());

  return fetchApi<PaginatedResponse<ForumPost>>(`/community/posts?${queryParams}`);
}

export async function createForumPost(post: Partial<ForumPost>): Promise<ForumPost> {
  return fetchApi<ForumPost>('/community/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export async function fetchCommunityEvents(podId?: string): Promise<CommunityEvent[]> {
  const queryParams = podId ? `?podId=${podId}` : '';
  return fetchApi<CommunityEvent[]>(`/community/events${queryParams}`);
}

export async function submitFeedback(feedback: Partial<FeedbackItem>): Promise<FeedbackItem> {
  return fetchApi<FeedbackItem>('/community/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
}
