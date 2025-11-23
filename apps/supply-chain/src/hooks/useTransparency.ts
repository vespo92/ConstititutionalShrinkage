'use client';

import { useState, useCallback } from 'react';
import type { TransparencyReport, OrganizationRanking, TransparencyScore } from '@/types';
import { transparencyApi, mockData } from '@/lib/api';
import { calculateTransparencyScore } from '@/lib/calculations';

interface UseTransparencyOptions {
  useMockData?: boolean;
}

export function useTransparency(options: UseTransparencyOptions = {}) {
  const { useMockData = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [rankings, setRankings] = useState<OrganizationRanking[]>([]);
  const [currentReport, setCurrentReport] = useState<TransparencyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async (params?: {
    industry?: string;
    limit?: number;
  }): Promise<OrganizationRanking[]> => {
    setIsLoading(true);
    setError(null);

    try {
      let data: OrganizationRanking[];

      if (useMockData) {
        data = mockData.getTransparencyRankings();
        if (params?.limit) {
          data = data.slice(0, params.limit);
        }
      } else {
        data = await transparencyApi.getRankings(params);
      }

      setRankings(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rankings';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  const fetchReport = useCallback(async (orgId: string): Promise<TransparencyReport> => {
    setIsLoading(true);
    setError(null);

    try {
      let data: TransparencyReport;

      if (useMockData) {
        // Generate mock report
        const rankings = mockData.getTransparencyRankings();
        const org = rankings.find(r => r.organizationId === orgId);

        data = {
          organizationId: orgId,
          organizationName: org?.organizationName ?? 'Unknown Organization',
          score: {
            overall: org?.transparencyScore ?? 75,
            components: {
              supplyChain: 82,
              employment: 78,
              environmental: 71,
              disclosure: 68,
            },
            badges: org?.badges ?? [],
            lastUpdated: new Date(),
          },
          supplyChainDisclosure: {
            level: 'full',
            verifiedSuppliers: 45,
            totalSuppliers: 52,
            averageDistance: 185,
          },
          employmentPractices: {
            avgWage: 52000,
            minWage: 35000,
            benefitsScore: 85,
            safetyRating: 92,
          },
          environmentalImpact: {
            co2Emissions: 1250,
            renewableEnergy: 65,
            wasteRecycling: 78,
            waterUsage: 45000,
          },
          certifications: ['Organic', 'Fair Trade', 'B Corp'],
          generatedAt: new Date(),
        };
      } else {
        data = await transparencyApi.getReport(orgId);
      }

      setCurrentReport(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  const calculateScore = useCallback((components: TransparencyScore['components']): number => {
    return calculateTransparencyScore(components);
  }, []);

  const getScoreLevel = useCallback((score: number): 'excellent' | 'good' | 'moderate' | 'poor' | 'none' => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'poor';
    return 'none';
  }, []);

  const getScoreDescription = useCallback((score: number): string => {
    if (score >= 80) return 'Exceptional transparency - Full supply chain visibility';
    if (score >= 60) return 'Good transparency - Most practices disclosed';
    if (score >= 40) return 'Moderate transparency - Some disclosure gaps';
    if (score >= 20) return 'Limited transparency - Significant gaps';
    return 'Minimal transparency - Major improvements needed';
  }, []);

  const clearReport = useCallback(() => {
    setCurrentReport(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    rankings,
    currentReport,
    error,

    // Actions
    fetchRankings,
    fetchReport,
    calculateScore,
    getScoreLevel,
    getScoreDescription,
    clearReport,
    clearError,
  };
}
