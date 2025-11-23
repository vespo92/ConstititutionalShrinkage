import { useState, useEffect, useCallback } from 'react';
import { billsApi, Bill } from '@/services/api';

/**
 * useBills Hook
 * Provides bills data and related operations
 */
export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async (params?: { status?: string }) => {
    setIsLoading(true);
    setError(null);

    const response = await billsApi.list(params);

    setIsLoading(false);

    if (response.success) {
      setBills(response.data.bills);
      // Recent bills are the first 5
      setRecentBills(response.data.bills.slice(0, 5));
    } else {
      setError(response.error || 'Failed to fetch bills');
    }
  }, []);

  const getBill = useCallback(
    (id: string): Bill | undefined => {
      return bills.find((bill) => bill.id === id);
    },
    [bills]
  );

  const fetchBill = useCallback(async (id: string): Promise<Bill | null> => {
    const response = await billsApi.get(id);

    if (response.success) {
      // Update the bill in the local state
      setBills((prev) => {
        const index = prev.findIndex((b) => b.id === id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = response.data;
          return updated;
        }
        return [...prev, response.data];
      });
      return response.data;
    }

    return null;
  }, []);

  const searchBills = useCallback(async (query: string): Promise<Bill[]> => {
    if (!query.trim()) return [];

    const response = await billsApi.search(query);

    if (response.success) {
      return response.data.bills;
    }

    return [];
  }, []);

  const refresh = useCallback(async () => {
    await fetchBills();
  }, [fetchBills]);

  // Initial fetch
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return {
    bills,
    recentBills,
    isLoading,
    error,
    fetchBills,
    getBill,
    fetchBill,
    searchBills,
    refresh,
  };
}

export default useBills;
