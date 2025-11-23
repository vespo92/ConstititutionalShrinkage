/**
 * Data aggregation utilities for analytics
 */

export type AggregationType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median';

export interface TimeSeriesPoint {
  timestamp: Date | string;
  value: number;
}

export interface AggregatedResult<T = Record<string, any>> {
  data: T[];
  metadata: {
    total: number;
    aggregationType: AggregationType;
    groupCount?: number;
  };
}

/**
 * Aggregate values using specified method
 */
export function aggregate(values: number[], type: AggregationType): number {
  if (values.length === 0) return 0;

  switch (type) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    case 'median':
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

/**
 * Group data by a key and aggregate values
 */
export function groupAndAggregate<T extends Record<string, any>>(
  data: T[],
  groupKey: string,
  valueKey: string,
  aggregationType: AggregationType = 'sum'
): AggregatedResult<{ [key: string]: any }> {
  const groups: Record<string, number[]> = {};

  for (const item of data) {
    const key = String(item[groupKey]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(Number(item[valueKey]) || 0);
  }

  const aggregatedData = Object.entries(groups).map(([key, values]) => ({
    [groupKey]: key,
    [valueKey]: aggregate(values, aggregationType),
    count: values.length,
  }));

  return {
    data: aggregatedData,
    metadata: {
      total: data.length,
      aggregationType,
      groupCount: Object.keys(groups).length,
    },
  };
}

/**
 * Roll up time series data into periods
 */
export function rollupTimeSeries(
  data: TimeSeriesPoint[],
  period: 'hour' | 'day' | 'week' | 'month',
  aggregationType: AggregationType = 'sum'
): TimeSeriesPoint[] {
  const buckets: Record<string, number[]> = {};

  for (const point of data) {
    const date = new Date(point.timestamp);
    let bucketKey: string;

    switch (period) {
      case 'hour':
        bucketKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        bucketKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        bucketKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        break;
      case 'month':
        bucketKey = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      default:
        bucketKey = date.toISOString();
    }

    if (!buckets[bucketKey]) {
      buckets[bucketKey] = [];
    }
    buckets[bucketKey].push(point.value);
  }

  return Object.entries(buckets)
    .map(([key, values]) => ({
      timestamp: key,
      value: aggregate(values, aggregationType),
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Calculate moving average
 */
export function movingAverage(
  data: number[],
  windowSize: number
): number[] {
  if (windowSize <= 0 || windowSize > data.length) return data;

  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    result.push(window.reduce((a, b) => a + b, 0) / window.length);
  }

  return result;
}

/**
 * Calculate percentage change
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : current < 0 ? -100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Calculate year-over-year growth
 */
export function yearOverYearGrowth(
  currentPeriod: number,
  previousPeriod: number
): number {
  return percentageChange(currentPeriod, previousPeriod);
}
