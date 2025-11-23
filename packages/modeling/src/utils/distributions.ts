/**
 * Statistical distributions for Monte Carlo simulation
 */

/**
 * Generate random number from normal distribution using Box-Muller transform
 */
export function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Generate random number from uniform distribution
 */
export function uniformRandom(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Generate random number from triangular distribution
 */
export function triangularRandom(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Generate random number from lognormal distribution
 */
export function lognormalRandom(meanLog: number, stdDevLog: number): number {
  const normalValue = normalRandom(meanLog, stdDevLog);
  return Math.exp(normalValue);
}

/**
 * Calculate mean of array
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of array
 */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squaredDiffs));
}

/**
 * Calculate percentile of array
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

/**
 * Calculate multiple percentiles efficiently
 */
export function percentiles(values: number[], ps: number[]): Record<number, number> {
  const sorted = [...values].sort((a, b) => a - b);
  const result: Record<number, number> = {};

  for (const p of ps) {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      result[p] = sorted[lower];
    } else {
      result[p] = sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    }
  }

  return result;
}

/**
 * Generate sample from specified distribution
 */
export function sampleDistribution(
  distribution: 'normal' | 'uniform' | 'triangular' | 'lognormal',
  params: number[]
): number {
  switch (distribution) {
    case 'normal':
      return normalRandom(params[0], params[1]);
    case 'uniform':
      return uniformRandom(params[0], params[1]);
    case 'triangular':
      return triangularRandom(params[0], params[1], params[2]);
    case 'lognormal':
      return lognormalRandom(params[0], params[1]);
    default:
      throw new Error(`Unknown distribution: ${distribution}`);
  }
}

/**
 * Compute distribution statistics from samples
 */
export function computeDistributionStats(samples: number[]): {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: Record<number, number>;
} {
  const sorted = [...samples].sort((a, b) => a - b);

  return {
    mean: mean(samples),
    stdDev: stdDev(samples),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    percentiles: percentiles(samples, [5, 10, 25, 50, 75, 90, 95])
  };
}

/**
 * Correlation coefficient between two arrays
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}
