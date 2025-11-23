'use client';

import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

const regions = [
  { id: 'pod-ca-sf', name: 'San Francisco Bay Area', code: 'CA-SF' },
  { id: 'pod-tx-aus', name: 'Austin Metro', code: 'TX-AUS' },
  { id: 'pod-ny-nyc', name: 'New York City', code: 'NY-NYC' },
  { id: 'pod-wa-sea', name: 'Seattle-Puget Sound', code: 'WA-SEA' },
];

export default function RegionSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-pod-green-600/50 rounded-lg text-white text-sm hover:bg-pod-green-600 transition-colors"
      >
        <MapPin size={16} />
        <span className="hidden sm:inline">{selectedRegion.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 py-1">Select your region</p>
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-2 py-2 rounded-md text-left transition-colors ${
                    selectedRegion.id === region.id
                      ? 'bg-pod-green-100 text-pod-green-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{region.name}</p>
                    <p className="text-xs text-gray-500">{region.code}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-2">
              <button className="w-full text-sm text-pod-green-600 hover:text-pod-green-700 py-2">
                Browse all pods
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
