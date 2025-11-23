'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Pod, PodType, PodStatus, PaginatedResponse } from '@/types';
import { mockPods } from '@/lib/mock-data';

interface UsePodsOptions {
  type?: PodType;
  status?: PodStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface UsePodsReturn {
  pods: Pod[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

export function usePods(options: UsePodsOptions = {}): UsePodsReturn {
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const { type, status, search, page = 1, pageSize = 10 } = options;

  const fetchPods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filtered = [...mockPods];

      if (type) {
        filtered = filtered.filter((pod) => pod.type === type);
      }

      if (status) {
        filtered = filtered.filter((pod) => pod.status === status);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (pod) =>
            pod.name.toLowerCase().includes(searchLower) ||
            pod.code.toLowerCase().includes(searchLower)
        );
      }

      setTotal(filtered.length);

      // Pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setPods(filtered.slice(start, end));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pods'));
    } finally {
      setLoading(false);
    }
  }, [type, status, search, page, pageSize]);

  useEffect(() => {
    fetchPods();
  }, [fetchPods]);

  return {
    pods,
    loading,
    error,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
    refetch: fetchPods,
  };
}

export function usePod(id: string) {
  const [pod, setPod] = useState<Pod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPod() {
      setLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const found = mockPods.find((p) => p.id === id);

        if (!found) {
          throw new Error('Pod not found');
        }

        setPod(found);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pod'));
      } finally {
        setLoading(false);
      }
    }

    fetchPod();
  }, [id]);

  return { pod, loading, error };
}
