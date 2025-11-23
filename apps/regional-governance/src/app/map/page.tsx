'use client';

import { useState } from 'react';
import { mockPods } from '@/lib/mock-data';
import RegionalMap from '@/components/map/RegionalMap';
import { useMap } from '@/hooks/useMap';
import type { MapFilters } from '@/types';

export default function MapPage() {
  const { filters, selectedPod, setFilters, selectPod } = useMap();

  const handleFiltersChange = (newFilters: Partial<MapFilters>) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Regional Map</h1>
        <p className="mt-1 text-gray-600">
          Explore regional pods and their metrics on the interactive map
        </p>
      </div>

      {/* Map */}
      <RegionalMap
        pods={mockPods}
        filters={filters}
        selectedPod={selectedPod}
        onPodClick={selectPod}
        onFiltersChange={handleFiltersChange}
        className="h-[600px]"
      />

      {/* Legend Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-2">About the Map</h3>
        <p className="text-sm text-gray-600">
          Click on any pod marker to see details. Use the filter controls to customize the view.
          Colors represent the selected metric - greener colors indicate better performance.
        </p>
      </div>
    </div>
  );
}
