'use client';

import { useState, useCallback } from 'react';
import type { EconomicDistance, TaxCalculation, AlternativeRoute, RouteSegment } from '@/types';
import {
  calculateEconomicDistance,
  calculateDistanceTax,
  DISTANCE_TIERS,
  calculateTotalRouteDistance,
  calculateTotalRouteCO2,
  compareRoutes,
} from '@/lib/calculations';
import { calculateHaversineDistance, type Coordinates } from '@/lib/geo';

interface DistanceInput {
  from: Coordinates & { name: string };
  to: Coordinates & { name: string };
  transportMode?: 'road' | 'rail' | 'sea' | 'air';
  supplyChainHops?: number;
}

interface TaxInput extends DistanceInput {
  baseAmount: number;
  carbonTaxEnabled?: boolean;
}

export function useDistance() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [economicDistance, setEconomicDistance] = useState<EconomicDistance | null>(null);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [alternatives, setAlternatives] = useState<AlternativeRoute[]>([]);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = useCallback(async (input: DistanceInput): Promise<EconomicDistance> => {
    setIsCalculating(true);
    setError(null);

    try {
      const straightLineDistance = calculateHaversineDistance(
        { lat: input.from.lat, lng: input.from.lng },
        { lat: input.to.lat, lng: input.to.lng }
      );

      const result = calculateEconomicDistance(
        straightLineDistance,
        input.supplyChainHops ?? 0,
        input.transportMode ?? 'road'
      );

      setEconomicDistance(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate distance';
      setError(message);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const calculateTax = useCallback(async (input: TaxInput): Promise<TaxCalculation> => {
    setIsCalculating(true);
    setError(null);

    try {
      const straightLineDistance = calculateHaversineDistance(
        { lat: input.from.lat, lng: input.from.lng },
        { lat: input.to.lat, lng: input.to.lng }
      );

      const result = calculateDistanceTax(
        input.baseAmount,
        straightLineDistance,
        input.supplyChainHops ?? 0,
        input.carbonTaxEnabled ?? true
      );

      setTaxCalculation(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate tax';
      setError(message);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const findAlternatives = useCallback(async (
    currentRoute: RouteSegment[],
    baseAmount: number
  ): Promise<AlternativeRoute[]> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Generate mock alternatives (in production, this would call an API)
      const currentDistance = calculateTotalRouteDistance(currentRoute);
      const currentCO2 = calculateTotalRouteCO2(currentRoute);

      // Create some alternative routes with different characteristics
      const mockAlternatives: AlternativeRoute[] = [
        {
          id: 'alt-1',
          segments: currentRoute.map(seg => ({
            ...seg,
            distance: seg.distance * 0.85,
            mode: 'rail' as const,
          })),
          totalDistance: currentDistance * 0.85,
          totalCO2: currentCO2 * 0.4, // Rail is more efficient
          taxRate: 0.015,
          savings: {
            distance: currentDistance * 0.15,
            co2: currentCO2 * 0.6,
            tax: baseAmount * 0.01,
          },
        },
        {
          id: 'alt-2',
          segments: [
            {
              from: currentRoute[0]?.from ?? { lat: 0, lng: 0, name: 'Start' },
              to: currentRoute[currentRoute.length - 1]?.to ?? { lat: 0, lng: 0, name: 'End' },
              distance: currentDistance * 0.7,
              mode: 'road' as const,
              co2: currentCO2 * 0.75,
            },
          ],
          totalDistance: currentDistance * 0.7,
          totalCO2: currentCO2 * 0.75,
          taxRate: 0.01,
          savings: {
            distance: currentDistance * 0.3,
            co2: currentCO2 * 0.25,
            tax: baseAmount * 0.015,
          },
        },
      ];

      setAlternatives(mockAlternatives);
      return mockAlternatives;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find alternatives';
      setError(message);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const compareWithAlternative = useCallback((
    currentRoute: RouteSegment[],
    alternativeRoute: RouteSegment[],
    baseAmount: number
  ) => {
    return compareRoutes(currentRoute, alternativeRoute, baseAmount);
  }, []);

  const clearResults = useCallback(() => {
    setEconomicDistance(null);
    setTaxCalculation(null);
    setAlternatives([]);
    setError(null);
  }, []);

  return {
    // State
    isCalculating,
    economicDistance,
    taxCalculation,
    alternatives,
    error,

    // Constants
    distanceTiers: DISTANCE_TIERS,

    // Actions
    calculateDistance,
    calculateTax,
    findAlternatives,
    compareWithAlternative,
    clearResults,
  };
}
