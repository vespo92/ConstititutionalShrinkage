'use client';

import { useState, useCallback } from 'react';
import type { Pod, MapFilters, MetricColorBy } from '@/types';
import { DEFAULT_CENTER, MapCenter, getCenterFromPolygon, getZoomFromBounds, getBoundsFromPolygon } from '@/lib/geo';

interface UseMapReturn {
  center: MapCenter;
  filters: MapFilters;
  selectedPod: string | null;
  setCenter: (center: MapCenter) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  selectPod: (podId: string | null) => void;
  focusOnPod: (pod: Pod) => void;
  resetView: () => void;
}

const defaultFilters: MapFilters = {
  podTypes: ['municipal', 'county', 'regional', 'state'],
  podStatuses: ['active', 'forming'],
  colorBy: 'tblScore',
  showLabels: true,
  showBoundaries: true,
};

export function useMap(): UseMapReturn {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [filters, setFiltersState] = useState<MapFilters>(defaultFilters);
  const [selectedPod, setSelectedPod] = useState<string | null>(null);

  const setFilters = useCallback((newFilters: Partial<MapFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const selectPod = useCallback((podId: string | null) => {
    setSelectedPod(podId);
  }, []);

  const focusOnPod = useCallback((pod: Pod) => {
    const podCenter = getCenterFromPolygon(pod.boundaries);
    const bounds = getBoundsFromPolygon(pod.boundaries);
    const zoom = getZoomFromBounds(bounds);

    setCenter({
      lat: podCenter.lat,
      lng: podCenter.lng,
      zoom: zoom + 1, // Zoom in a bit more for focus
    });
    setSelectedPod(pod.id);
  }, []);

  const resetView = useCallback(() => {
    setCenter(DEFAULT_CENTER);
    setSelectedPod(null);
    setFiltersState(defaultFilters);
  }, []);

  return {
    center,
    filters,
    selectedPod,
    setCenter,
    setFilters,
    selectPod,
    focusOnPod,
    resetView,
  };
}
