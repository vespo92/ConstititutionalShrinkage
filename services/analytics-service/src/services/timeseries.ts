/**
 * Time series analysis service
 */

export interface TimePoint {
  timestamp: Date | string;
  value: number;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  slope: number;
  confidence: number;
}

export interface ForecastResult {
  predictions: TimePoint[];
  confidence: number;
  method: string;
}

class TimeSeriesService {
  /**
   * Analyze trend in time series data
   */
  analyzeTrend(data: TimePoint[]): TrendAnalysis {
    if (data.length < 2) {
      return {
        direction: 'stable',
        changePercent: 0,
        slope: 0,
        confidence: 0,
      };
    }

    const values = data.map((d) => d.value);
    const n = values.length;

    // Calculate linear regression slope
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Calculate R-squared for confidence
    const predictions = values.map((_, i) => yMean + slope * (i - xMean));
    const ssRes = values.reduce((sum, v, i) => sum + Math.pow(v - predictions[i], 2), 0);
    const ssTot = values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0);
    const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

    // Calculate percentage change
    const firstValue = values[0];
    const lastValue = values[n - 1];
    const changePercent = firstValue !== 0
      ? ((lastValue - firstValue) / Math.abs(firstValue)) * 100
      : 0;

    // Determine direction
    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(changePercent) < 1) {
      direction = 'stable';
    } else if (changePercent > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      direction,
      changePercent,
      slope,
      confidence: Math.max(0, rSquared),
    };
  }

  /**
   * Simple forecast using linear regression
   */
  forecast(data: TimePoint[], periods: number): ForecastResult {
    if (data.length < 2) {
      return {
        predictions: [],
        confidence: 0,
        method: 'linear_regression',
      };
    }

    const values = data.map((d) => d.value);
    const n = values.length;

    // Calculate linear regression
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // Generate predictions
    const lastTimestamp = new Date(data[n - 1].timestamp);
    const predictions: TimePoint[] = [];

    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastTimestamp);
      futureDate.setDate(futureDate.getDate() + i);

      predictions.push({
        timestamp: futureDate.toISOString(),
        value: Math.max(0, intercept + slope * (n - 1 + i)),
      });
    }

    // Calculate confidence based on R-squared
    const predictedValues = values.map((_, i) => intercept + slope * i);
    const ssRes = values.reduce((sum, v, i) => sum + Math.pow(v - predictedValues[i], 2), 0);
    const ssTot = values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0);
    const confidence = ssTot !== 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

    return {
      predictions,
      confidence,
      method: 'linear_regression',
    };
  }

  /**
   * Detect anomalies in time series
   */
  detectAnomalies(
    data: TimePoint[],
    threshold: number = 2
  ): { point: TimePoint; deviation: number }[] {
    const values = data.map((d) => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: { point: TimePoint; deviation: number }[] = [];

    data.forEach((point, index) => {
      const deviation = Math.abs(point.value - mean) / (stdDev || 1);
      if (deviation > threshold) {
        anomalies.push({ point, deviation });
      }
    });

    return anomalies;
  }

  /**
   * Resample time series to different frequency
   */
  resample(
    data: TimePoint[],
    period: 'hour' | 'day' | 'week' | 'month'
  ): TimePoint[] {
    // Group data by period and average
    const buckets: Record<string, number[]> = {};

    for (const point of data) {
      const date = new Date(point.timestamp);
      let key: string;

      switch (period) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
      }

      if (!buckets[key]) {
        buckets[key] = [];
      }
      buckets[key].push(point.value);
    }

    return Object.entries(buckets).map(([key, values]) => ({
      timestamp: key,
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }));
  }
}

export const timeseriesService = new TimeSeriesService();
