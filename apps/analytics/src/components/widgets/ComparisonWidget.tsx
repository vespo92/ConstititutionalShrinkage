'use client';

import { clsx } from 'clsx';
import { TrendIndicator } from './TrendIndicator';

interface ComparisonItem {
  label: string;
  current: number;
  previous: number;
  format?: 'number' | 'percent' | 'currency';
}

interface ComparisonWidgetProps {
  title: string;
  items: ComparisonItem[];
  loading?: boolean;
}

export function ComparisonWidget({
  title,
  items,
  loading = false,
}: ComparisonWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, format: string = 'number'): string => {
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          const change = calculateChange(item.current, item.previous);
          return (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-500">
                  Previous: {formatValue(item.previous, item.format)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatValue(item.current, item.format)}
                </p>
                <TrendIndicator value={change} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
