'use client';

import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface Region {
  id: string;
  name: string;
}

interface RegionSelectorProps {
  regions: Region[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function RegionSelector({ regions, selected, onChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleRegion = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((r) => r !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => {
    onChange(regions.map((r) => r.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const displayText = selected.length === 0
    ? 'All regions'
    : selected.length === 1
    ? regions.find((r) => r.id === selected[0])?.name || 'Selected'
    : `${selected.length} regions`;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
      >
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">{displayText}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">REGIONS</span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-blue-600 hover:underline"
              >
                All
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:underline"
              >
                None
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-2">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                <span>{region.name}</span>
                {selected.includes(region.id) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
