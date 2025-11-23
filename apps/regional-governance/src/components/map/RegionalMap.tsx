'use client';

import { useEffect, useRef, useState } from 'react';
import type { Pod, MapFilters } from '@/types';
import { getColorForMetric, getCenterFromPolygon } from '@/lib/geo';
import MapControls from './MapControls';
import MapLegend from './MapLegend';

interface RegionalMapProps {
  pods: Pod[];
  filters: MapFilters;
  selectedPod: string | null;
  onPodClick: (podId: string) => void;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  className?: string;
}

export default function RegionalMap({
  pods,
  filters,
  selectedPod,
  onPodClick,
  onFiltersChange,
  className = '',
}: RegionalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter pods based on current filters
  const filteredPods = pods.filter((pod) => {
    if (!filters.podTypes.includes(pod.type)) return false;
    if (!filters.podStatuses.includes(pod.status)) return false;
    if (filters.minPopulation && pod.population < filters.minPopulation) return false;
    if (filters.maxPopulation && pod.population > filters.maxPopulation) return false;
    return true;
  });

  if (!isClient) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container - Using SVG for demo, would use Leaflet in production */}
      <div
        ref={mapRef}
        className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Background */}
          <rect fill="#e8f4f8" width="800" height="500" />

          {/* Pod regions */}
          {filteredPods.map((pod) => {
            const center = getCenterFromPolygon(pod.boundaries);
            const color = getColorForMetric(pod, filters.colorBy);
            const isSelected = selectedPod === pod.id;

            // Simplified visualization - would use actual GeoJSON in production
            const x = ((center.lng + 125) / 60) * 800;
            const y = ((50 - center.lat) / 25) * 500;

            return (
              <g key={pod.id} onClick={() => onPodClick(pod.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 25 : 20}
                  fill={color}
                  stroke={isSelected ? '#1e3a5f' : '#fff'}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={0.8}
                  className="transition-all duration-200 hover:opacity-100"
                />
                {filters.showLabels && (
                  <text
                    x={x}
                    y={y + 35}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#374151"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {pod.code}
                  </text>
                )}
              </g>
            );
          })}

          {/* Legend Title */}
          <text x="20" y="30" fontSize="14" fontWeight="bold" fill="#374151">
            Regional Pods
          </text>
        </svg>
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <MapControls filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10">
        <MapLegend colorBy={filters.colorBy} />
      </div>

      {/* Pod Info Popup */}
      {selectedPod && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          {(() => {
            const pod = pods.find((p) => p.id === selectedPod);
            if (!pod) return null;
            return (
              <>
                <h3 className="font-semibold text-gray-900">{pod.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{pod.code}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Population:</span>
                    <span className="font-medium">{pod.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TBL Score:</span>
                    <span className="font-medium text-pod-green-600">
                      {pod.metrics.tblScore.overall.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Participation:</span>
                    <span className="font-medium">{pod.metrics.participationRate}%</span>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = `/pods/${pod.id}`}
                  className="mt-3 w-full bg-pod-green-600 text-white text-sm py-1.5 rounded hover:bg-pod-green-700 transition-colors"
                >
                  View Details
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
