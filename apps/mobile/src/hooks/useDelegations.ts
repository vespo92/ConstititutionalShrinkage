import { useState, useEffect, useCallback } from 'react';
import { delegationsApi, Delegation, Delegate, CreateDelegationData } from '@/services/api';

/**
 * useDelegations Hook
 * Provides delegation data and management functionality
 */
export function useDelegations() {
  const [outgoingDelegations, setOutgoingDelegations] = useState<Delegation[]>([]);
  const [incomingDelegations, setIncomingDelegations] = useState<Delegation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDelegations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await delegationsApi.list();

    setIsLoading(false);

    if (response.success) {
      setOutgoingDelegations(response.data.outgoing);
      setIncomingDelegations(response.data.incoming);
    } else {
      setError(response.error || 'Failed to fetch delegations');
    }
  }, []);

  const createDelegation = useCallback(
    async (data: CreateDelegationData): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      const response = await delegationsApi.create(data);

      setIsLoading(false);

      if (response.success) {
        // Add to local state
        setOutgoingDelegations((prev) => [...prev, response.data]);
        return true;
      }

      setError(response.error || 'Failed to create delegation');
      return false;
    },
    []
  );

  const revokeDelegation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const response = await delegationsApi.revoke(id);

    setIsLoading(false);

    if (response.success) {
      // Remove from local state
      setOutgoingDelegations((prev) => prev.filter((d) => d.id !== id));
      return true;
    }

    setError(response.error || 'Failed to revoke delegation');
    return false;
  }, []);

  const findDelegates = useCallback(
    async (params?: { region?: string; specialty?: string }): Promise<Delegate[]> => {
      const response = await delegationsApi.findDelegates(params);

      if (response.success) {
        return response.data.delegates;
      }

      return [];
    },
    []
  );

  const getTotalVotingPower = useCallback(() => {
    // Base power of 1 + sum of incoming delegation weights
    return 1 + incomingDelegations.reduce((sum, d) => sum + d.weight, 0);
  }, [incomingDelegations]);

  const refresh = useCallback(async () => {
    await fetchDelegations();
  }, [fetchDelegations]);

  // Initial fetch
  useEffect(() => {
    fetchDelegations();
  }, [fetchDelegations]);

  return {
    outgoingDelegations,
    incomingDelegations,
    isLoading,
    error,
    fetchDelegations,
    createDelegation,
    revokeDelegation,
    findDelegates,
    getTotalVotingPower,
    refresh,
  };
}

export default useDelegations;
