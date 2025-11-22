'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Delegation, DelegationScope, Citizen } from '@/lib/types';
import { delegationApi } from '@/lib/api';

interface UseDelegationsReturn {
  incoming: Delegation[];
  outgoing: Delegation[];
  isLoading: boolean;
  error: Error | null;
  effectiveVotingPower: number;
  createDelegation: (params: CreateDelegationParams) => Promise<Delegation>;
  revokeDelegation: (delegationId: string) => Promise<void>;
  getSuggestedDelegates: (category?: string) => Promise<Citizen[]>;
  refresh: () => Promise<void>;
}

interface CreateDelegationParams {
  delegateId: string;
  scope: DelegationScope;
  category?: string;
  expiresAt?: Date;
}

/**
 * Hook for managing delegations
 */
export function useDelegations(): UseDelegationsReturn {
  const [incoming, setIncoming] = useState<Delegation[]>([]);
  const [outgoing, setOutgoing] = useState<Delegation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate effective voting power (1 + number of incoming delegations)
  const effectiveVotingPower = 1 + incoming.filter((d) => d.active).length;

  const loadDelegations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await delegationApi.getDelegations();
      setIncoming(data.incoming);
      setOutgoing(data.outgoing);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load delegations'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDelegations();
  }, [loadDelegations]);

  const createDelegation = useCallback(
    async (params: CreateDelegationParams): Promise<Delegation> => {
      const delegation = await delegationApi.createDelegation(params);
      // Refresh the list after creating
      await loadDelegations();
      return delegation;
    },
    [loadDelegations]
  );

  const revokeDelegation = useCallback(
    async (delegationId: string): Promise<void> => {
      await delegationApi.revokeDelegation(delegationId);
      // Refresh the list after revoking
      await loadDelegations();
    },
    [loadDelegations]
  );

  const getSuggestedDelegates = useCallback(
    async (category?: string): Promise<Citizen[]> => {
      return delegationApi.getSuggestedDelegates(category);
    },
    []
  );

  return {
    incoming,
    outgoing,
    isLoading,
    error,
    effectiveVotingPower,
    createDelegation,
    revokeDelegation,
    getSuggestedDelegates,
    refresh: loadDelegations,
  };
}

/**
 * Hook for getting delegation chain for a specific bill
 */
export function useDelegationChain(billId: string): {
  chain: Citizen[];
  finalVoter: Citizen | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [chain, setChain] = useState<Citizen[]>([]);
  const [finalVoter, setFinalVoter] = useState<Citizen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!billId) return;

    const loadChain = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await delegationApi.getDelegationChain(billId);
        setChain(data.chain);
        setFinalVoter(data.finalVoter);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load delegation chain'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChain();
  }, [billId]);

  return { chain, finalVoter, isLoading, error };
}
