'use client';

import type { MetricColorBy } from '@/types';

interface MapLegendProps {
  colorBy: MetricColorBy;
}

const metricLabels: Record<MetricColorBy, string> = {
  tblScore: 'TBL Score',
  population: 'Population',
  participationRate: 'Participation Rate',
  citizenSatisfaction: 'Citizen Satisfaction',
  resourceEfficiency: 'Resource Efficiency',
};

export default function MapLegend({ colorBy }: MapLegendProps) {
  const gradientStops = [
    { color: 'hsl(0, 70%, 45%)', label: '0' },
    { color: 'hsl(30, 70%, 45%)', label: '25' },
    { color: 'hsl(60, 70%, 45%)', label: '50' },
    { color: 'hsl(90, 70%, 45%)', label: '75' },
    { color: 'hsl(120, 70%, 45%)', label: '100' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      <p className="text-xs font-medium text-gray-500 mb-2">{metricLabels[colorBy]}</p>
      <div className="flex items-center space-x-1">
        {gradientStops.map((stop, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-6 h-4 rounded-sm"
              style={{ backgroundColor: stop.color }}
            />
            <span className="text-xs text-gray-400 mt-1">{stop.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
