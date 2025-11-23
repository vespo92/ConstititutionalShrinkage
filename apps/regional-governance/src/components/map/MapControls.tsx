'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff, Filter } from 'lucide-react';
import type { MapFilters, MetricColorBy, PodType, PodStatus } from '@/types';

interface MapControlsProps {
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
}

const colorByOptions: { value: MetricColorBy; label: string }[] = [
  { value: 'tblScore', label: 'TBL Score' },
  { value: 'population', label: 'Population' },
  { value: 'participationRate', label: 'Participation' },
  { value: 'citizenSatisfaction', label: 'Satisfaction' },
  { value: 'resourceEfficiency', label: 'Efficiency' },
];

const podTypeOptions: { value: PodType; label: string }[] = [
  { value: 'municipal', label: 'Municipal' },
  { value: 'county', label: 'County' },
  { value: 'regional', label: 'Regional' },
  { value: 'state', label: 'State' },
];

const podStatusOptions: { value: PodStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'forming', label: 'Forming' },
  { value: 'merging', label: 'Merging' },
  { value: 'dissolved', label: 'Dissolved' },
];

export default function MapControls({ filters, onFiltersChange }: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePodType = (type: PodType) => {
    const current = filters.podTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ podTypes: updated });
  };

  const togglePodStatus = (status: PodStatus) => {
    const current = filters.podStatuses;
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ podStatuses: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 px-3 py-2 w-full hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Filter size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </button>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-4 max-w-xs">
          {/* Color By */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Color By
            </label>
            <select
              value={filters.colorBy}
              onChange={(e) => onFiltersChange({ colorBy: e.target.value as MetricColorBy })}
              className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-pod-green-500 focus:border-pod-green-500"
            >
              {colorByOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pod Types */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pod Types
            </label>
            <div className="mt-2 space-y-1">
              {podTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.podTypes.includes(option.value)}
                    onChange={() => togglePodType(option.value)}
                    className="rounded border-gray-300 text-pod-green-600 focus:ring-pod-green-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pod Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </label>
            <div className="mt-2 space-y-1">
              {podStatusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.podStatuses.includes(option.value)}
                    onChange={() => togglePodStatus(option.value)}
                    className="rounded border-gray-300 text-pod-green-600 focus:ring-pod-green-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-700">Show Labels</span>
            <button
              onClick={() => onFiltersChange({ showLabels: !filters.showLabels })}
              className="text-gray-500 hover:text-gray-700"
            >
              {filters.showLabels ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
