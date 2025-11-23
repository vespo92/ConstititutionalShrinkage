'use client';

import { ReactNode } from 'react';
import { Filter, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function FilterBar({ children, onRefresh, isRefreshing }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Filters</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {children}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
