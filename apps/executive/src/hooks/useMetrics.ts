'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TBLScore, MetricFilters, KPI } from '@/types';
import { generateMockTBLData, generateMockKPIs } from '@/lib/metrics';

export function useTBLScore(entityId: string) {
  return useQuery({
    queryKey: ['tbl-score', entityId],
    queryFn: () => api.metrics.getTBL(entityId),
    enabled: !!entityId,
  });
}

export function useTBLHistory(entityId: string, filters?: MetricFilters) {
  return useQuery({
    queryKey: ['tbl-history', entityId, filters],
    queryFn: () => api.metrics.getTBLHistory(entityId, filters),
    enabled: !!entityId,
  });
}

export function useKPIs(regionId?: string) {
  return useQuery({
    queryKey: ['kpis', regionId],
    queryFn: () => api.metrics.getKPIs(regionId),
  });
}

export function useRegionComparison(regionIds: string[]) {
  return useQuery({
    queryKey: ['region-comparison', regionIds],
    queryFn: () => api.metrics.compareRegions(regionIds),
    enabled: regionIds.length > 0,
  });
}

// Mock data hooks for development
export function useMockTBLScore(): { data: { data: TBLScore }; isLoading: boolean } {
  const mockScore: TBLScore = {
    people: {
      score: 76,
      trend: 'up',
      components: {
        health: 82,
        education: 74,
        employment: 78,
        housing: 70,
      },
    },
    planet: {
      score: 68,
      trend: 'up',
      components: {
        emissions: 65,
        waste: 72,
        biodiversity: 64,
        water: 71,
      },
    },
    profit: {
      score: 79,
      trend: 'stable',
      components: {
        gdp: 85,
        employment: 78,
        innovation: 76,
        equity: 77,
      },
    },
    overallScore: 74,
    calculatedAt: new Date().toISOString(),
  };

  return {
    data: { data: mockScore },
    isLoading: false,
  };
}

export function useMockTBLHistory(months = 12): {
  data: { date: string; people: number; planet: number; profit: number }[];
  isLoading: boolean;
} {
  return {
    data: generateMockTBLData(months),
    isLoading: false,
  };
}

export function useMockKPIs(): { data: { data: KPI[] }; isLoading: boolean } {
  return {
    data: { data: generateMockKPIs() },
    isLoading: false,
  };
}
