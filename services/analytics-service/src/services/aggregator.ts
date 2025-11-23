/**
 * Data aggregation service for analytics
 */

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface AggregationResult<T> {
  data: T[];
  metadata: {
    period: string;
    total: number;
    average: number;
  };
}

class Aggregator {
  /**
   * Generate mock time series data
   */
  generateTimeSeries(metric: string, days: number): TimeSeriesDataPoint[] {
    const data: TimeSeriesDataPoint[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 1000) + 500,
      });
    }

    return data;
  }

  /**
   * Aggregate data by period
   */
  aggregateByPeriod<T extends Record<string, any>>(
    data: T[],
    period: 'hour' | 'day' | 'week' | 'month',
    valueKey: string
  ): AggregationResult<T> {
    // For now, return the data as-is (would implement actual aggregation)
    const values = data.map((d) => d[valueKey] as number);
    const total = values.reduce((a, b) => a + b, 0);

    return {
      data,
      metadata: {
        period,
        total,
        average: total / data.length,
      },
    };
  }

  /**
   * Calculate moving average
   */
  movingAverage(data: number[], windowSize: number): number[] {
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
  percentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  /**
   * Compute summary statistics
   */
  computeStats(values: number[]): {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  } {
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median,
      stdDev,
    };
  }
}

export const aggregator = new Aggregator();
