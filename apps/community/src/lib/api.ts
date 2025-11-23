const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Discussion API
export const discussionApi = {
  getThreads: (params?: { sort?: string; timeframe?: string; category?: string; page?: number }) =>
    fetchApi<{ threads: any[]; pagination: any }>('/community/discussions', { params }),

  getThread: (id: string) =>
    fetchApi<{ thread: any; comments: any[] }>(`/community/discussions/${id}`),

  createThread: (data: { title: string; content: string; category: string; billId?: string; tags: string[] }) =>
    fetchApi<{ thread: any }>('/community/discussions', { method: 'POST', body: JSON.stringify(data) }),

  addComment: (data: { threadId: string; content: string; parentId?: string }) =>
    fetchApi<{ comment: any }>(`/community/discussions/${data.threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  vote: (id: string, type: 'up' | 'down') =>
    fetchApi<void>(`/community/discussions/${id}/vote`, { method: 'POST', body: JSON.stringify({ type }) }),
};

// Petition API
export const petitionApi = {
  getPetitions: (params?: { status?: string; category?: string; region?: string; page?: number }) =>
    fetchApi<{ petitions: any[]; pagination: any }>('/community/petitions', { params }),

  getPetition: (id: string) =>
    fetchApi<{ petition: any }>(`/community/petitions/${id}`),

  createPetition: (data: { title: string; description: string; category: string; region: string; goal: number; deadline?: string }) =>
    fetchApi<{ petition: any }>('/community/petitions', { method: 'POST', body: JSON.stringify(data) }),

  signPetition: (id: string, data: { publicSignature: boolean; comment?: string }) =>
    fetchApi<{ signature: any }>(`/community/petitions/${id}/sign`, { method: 'POST', body: JSON.stringify(data) }),
};

// Town Hall API
export const townHallApi = {
  getEvents: (status?: string) =>
    fetchApi<{ events: any[]; liveEvents: any[] }>('/community/townhalls', { params: { status } }),

  getEvent: (id: string) =>
    fetchApi<{ event: any }>(`/community/townhalls/${id}`),

  rsvp: (id: string) =>
    fetchApi<void>(`/community/townhalls/${id}/rsvp`, { method: 'POST' }),

  submitQuestion: (id: string, question: string) =>
    fetchApi<{ question: any }>(`/community/townhalls/${id}/question`, { method: 'POST', body: JSON.stringify({ question }) }),

  raiseHand: (id: string) =>
    fetchApi<void>(`/community/townhalls/${id}/raise-hand`, { method: 'POST' }),
};

// Moderation API
export const moderationApi = {
  report: (data: { contentType: string; contentId: string; reason: string; details?: string }) =>
    fetchApi<{ report: any }>('/community/reports', { method: 'POST', body: JSON.stringify(data) }),
};

export default {
  discussion: discussionApi,
  petition: petitionApi,
  townHall: townHallApi,
  moderation: moderationApi,
};
