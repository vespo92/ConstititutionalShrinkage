'use client';

import { useMemo } from 'react';

interface ChartDataOptions {
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  groupBy?: string;
  limit?: number;
  sortBy?: 'value' | 'label';
  sortOrder?: 'asc' | 'desc';
}

export function useChartData<T extends Record<string, any>>(
  rawData: T[],
  valueKey: string,
  options: ChartDataOptions = {}
) {
  const {
    aggregation = 'sum',
    groupBy,
    limit,
    sortBy = 'value',
    sortOrder = 'desc',
  } = options;

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    let result = [...rawData];

    // Group data if groupBy is specified
    if (groupBy) {
      const grouped = result.reduce((acc, item) => {
        const key = item[groupBy];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as Record<string, T[]>);

      result = Object.entries(grouped).map(([key, items]) => {
        const values = items.map((item) => item[valueKey]);
        let aggregatedValue: number;

        switch (aggregation) {
          case 'sum':
            aggregatedValue = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'count':
            aggregatedValue = values.length;
            break;
          case 'max':
            aggregatedValue = Math.max(...values);
            break;
          case 'min':
            aggregatedValue = Math.min(...values);
            break;
          default:
            aggregatedValue = values.reduce((a, b) => a + b, 0);
        }

        return {
          [groupBy]: key,
          [valueKey]: aggregatedValue,
        } as T;
      });
    }

    // Sort data
    result.sort((a, b) => {
      const aVal = sortBy === 'value' ? a[valueKey] : a[groupBy || valueKey];
      const bVal = sortBy === 'value' ? b[valueKey] : b[groupBy || valueKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    // Apply limit
    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [rawData, valueKey, aggregation, groupBy, limit, sortBy, sortOrder]);

  return processedData;
}
