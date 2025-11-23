'use client';

import { useState, useEffect, useCallback } from 'react';

interface AnalyticsData {
  activeCitizens: number;
  billsInProgress: number;
  participationRate: number;
  tblScore: number;
  votingTrend: Array<{ date: string; votes: number }>;
  regionalParticipation: Array<{ region: string; rate: number }>;
  tbl: {
    people: number;
    planet: number;
    profit: number;
  };
  legislationByCategory: Array<{ category: string; count: number }>;
  systemHealth: {
    apiLatency: number;
    errorRate: number;
    activeSessions: number;
    queueDepth: number;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    time: string;
  }>;
}

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const mockData: AnalyticsData = {
  activeCitizens: 127453,
  billsInProgress: 42,
  participationRate: 68.5,
  tblScore: 82,
  votingTrend: [
    { date: 'Jan 1', votes: 1200 },
    { date: 'Jan 8', votes: 1450 },
    { date: 'Jan 15', votes: 1380 },
    { date: 'Jan 22', votes: 1620 },
    { date: 'Jan 29', votes: 1850 },
    { date: 'Feb 5', votes: 1720 },
    { date: 'Feb 12', votes: 1940 },
  ],
  regionalParticipation: [
    { region: 'Northeast', rate: 72 },
    { region: 'Southeast', rate: 65 },
    { region: 'Midwest', rate: 58 },
    { region: 'Southwest', rate: 71 },
    { region: 'West', rate: 68 },
  ],
  tbl: {
    people: 78,
    planet: 85,
    profit: 72,
  },
  legislationByCategory: [
    { category: 'Environment', count: 12 },
    { category: 'Economy', count: 8 },
    { category: 'Healthcare', count: 7 },
    { category: 'Education', count: 6 },
    { category: 'Infrastructure', count: 5 },
  ],
  systemHealth: {
    apiLatency: 45,
    errorRate: 0.2,
    activeSessions: 3421,
    queueDepth: 127,
  },
  recentActivity: [
    { type: 'vote', title: 'Climate Action Bill', description: 'Passed with 78% approval', time: '2 min ago' },
    { type: 'bill', title: 'Education Reform Act', description: 'New bill proposed', time: '15 min ago' },
    { type: 'delegation', title: 'Delegation Update', description: '500 new delegations today', time: '1 hour ago' },
    { type: 'amendment', title: 'Tax Code Amendment', description: 'Amendment proposed', time: '2 hours ago' },
    { type: 'sunset', title: 'Housing Policy Review', description: 'Sunset review initiated', time: '3 hours ago' },
  ],
};

export function useAnalytics(endpoint: string): UseAnalyticsResult {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In production, this would be:
      // const response = await fetch(`/api/analytics/${endpoint}`);
      // const data = await response.json();

      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
