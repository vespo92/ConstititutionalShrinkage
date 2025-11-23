'use client';

import { useState, useCallback } from 'react';
import { Report } from '@/lib/types';

interface UseModerationReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  submitReport: (data: { contentType: string; contentId: string; reason: string; details?: string }) => Promise<Report>;
  fetchQueue: () => Promise<void>;
  takeAction: (reportId: string, action: 'approve' | 'remove' | 'warn' | 'dismiss') => Promise<void>;
}

export function useModeration(): UseModerationReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = useCallback(async (data: { contentType: string; contentId: string; reason: string; details?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const newReport: Report = {
        id: Date.now().toString(),
        contentType: data.contentType as any,
        contentId: data.contentId,
        reason: data.reason,
        details: data.details,
        reporter: { id: 'current', displayName: 'Current User' },
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated data for moderators
      setReports([
        {
          id: '1',
          contentType: 'comment',
          contentId: 'c123',
          reason: 'spam',
          reporter: { id: '1', displayName: 'Alice' },
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const takeAction = useCallback(async (reportId: string, action: 'approve' | 'remove' | 'warn' | 'dismiss') => {
    // API call would go here
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }, []);

  return {
    reports,
    loading,
    error,
    submitReport,
    fetchQueue,
    takeAction,
  };
}
