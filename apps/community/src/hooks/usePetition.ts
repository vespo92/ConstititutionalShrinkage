'use client';

import { useState, useCallback } from 'react';
import { Petition } from '@/lib/types';

interface UsePetitionReturn {
  petitions: Petition[];
  petition: Petition | null;
  loading: boolean;
  error: string | null;
  fetchPetitions: (params?: { status?: string; category?: string; region?: string }) => Promise<void>;
  fetchPetition: (id: string) => Promise<void>;
  createPetition: (data: { title: string; description: string; category: string; region: string; goal: number; deadline?: string }) => Promise<Petition>;
  signPetition: (id: string, data: { publicSignature: boolean; comment?: string }) => Promise<void>;
}

export function usePetition(): UsePetitionReturn {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPetitions = useCallback(async (params?: { status?: string; category?: string; region?: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Simulated data
      setPetitions([
        {
          id: '1',
          title: 'Expand public transit to underserved areas',
          description: 'We call for the expansion of bus routes to suburban and rural communities that currently lack adequate public transportation.',
          creator: { id: '1', displayName: 'Transit Coalition' },
          signatures: 8567,
          goal: 10000,
          progress: 85.67,
          category: 'transportation',
          region: 'State',
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
          responseRequired: true,
        },
        {
          id: '2',
          title: 'Increase funding for public schools',
          description: 'Education is the foundation of our future. We demand increased funding for teacher salaries, classroom resources, and school infrastructure.',
          creator: { id: '2', displayName: 'Parents for Education' },
          signatures: 12453,
          goal: 15000,
          progress: 83.02,
          category: 'education',
          region: 'National',
          status: 'active',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
          responseRequired: true,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch petitions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPetition = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      setPetition({
        id,
        title: 'Expand public transit to underserved areas',
        description: 'We call for the expansion of bus routes to suburban and rural communities that currently lack adequate public transportation. Many residents are unable to access jobs, healthcare, and essential services due to limited transit options.',
        creator: { id: '1', displayName: 'Transit Coalition' },
        signatures: 8567,
        goal: 10000,
        progress: 85.67,
        category: 'transportation',
        region: 'State',
        status: 'active',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        responseRequired: true,
        hasSigned: false,
        recentSignatures: [
          { name: 'John D.', publicSignature: true, signedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { name: 'Anonymous', publicSignature: false, signedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
          { name: 'Sarah M.', publicSignature: true, signedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch petition');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPetition = useCallback(async (data: { title: string; description: string; category: string; region: string; goal: number; deadline?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const newPetition: Petition = {
        id: Date.now().toString(),
        ...data,
        creator: { id: 'current', displayName: 'Current User' },
        category: data.category as any,
        signatures: 1,
        progress: (1 / data.goal) * 100,
        status: 'active',
        createdAt: new Date().toISOString(),
        responseRequired: false,
      };
      return newPetition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create petition');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signPetition = useCallback(async (id: string, data: { publicSignature: boolean; comment?: string }) => {
    // API call would go here
    if (petition && petition.id === id) {
      setPetition({
        ...petition,
        signatures: petition.signatures + 1,
        progress: ((petition.signatures + 1) / petition.goal) * 100,
        hasSigned: true,
      });
    }
  }, [petition]);

  return {
    petitions,
    petition,
    loading,
    error,
    fetchPetitions,
    fetchPetition,
    createPetition,
    signPetition,
  };
}
