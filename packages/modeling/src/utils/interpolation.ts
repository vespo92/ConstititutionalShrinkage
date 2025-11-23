/**
 * Interpolation utilities for time series and projection
 */

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Linear interpolation for time series
 */
export function linearInterpolate(
  x: number[],
  y: number[],
  xNew: number[]
): number[] {
  if (x.length !== y.length || x.length < 2) {
    throw new Error('Input arrays must have matching lengths >= 2');
  }

  return xNew.map(xi => {
    // Find bounding indices
    let lowerIdx = 0;
    let upperIdx = x.length - 1;

    for (let i = 0; i < x.length - 1; i++) {
      if (x[i] <= xi && x[i + 1] >= xi) {
        lowerIdx = i;
        upperIdx = i + 1;
        break;
      }
    }

    // Handle extrapolation
    if (xi <= x[0]) return y[0];
    if (xi >= x[x.length - 1]) return y[y.length - 1];

    // Interpolate
    const t = (xi - x[lowerIdx]) / (x[upperIdx] - x[lowerIdx]);
    return lerp(y[lowerIdx], y[upperIdx], t);
  });
}

/**
 * Cubic spline interpolation
 */
export function cubicSpline(
  x: number[],
  y: number[],
  xNew: number[]
): number[] {
  const n = x.length;
  if (n < 3) return linearInterpolate(x, y, xNew);

  // Calculate second derivatives (natural spline)
  const h: number[] = [];
  const alpha: number[] = [];
  const l: number[] = [1];
  const mu: number[] = [0];
  const z: number[] = [0];

  for (let i = 0; i < n - 1; i++) {
    h.push(x[i + 1] - x[i]);
  }

  for (let i = 1; i < n - 1; i++) {
    alpha.push(
      (3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1])
    );
  }

  for (let i = 1; i < n - 1; i++) {
    l.push(2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1]);
    mu.push(h[i] / l[i]);
    z.push((alpha[i - 1] - h[i - 1] * z[i - 1]) / l[i]);
  }

  l.push(1);
  z.push(0);

  const c: number[] = new Array(n).fill(0);
  const b: number[] = new Array(n - 1).fill(0);
  const d: number[] = new Array(n - 1).fill(0);

  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (y[j + 1] - y[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  // Evaluate spline at new points
  return xNew.map(xi => {
    // Handle extrapolation
    if (xi <= x[0]) return y[0];
    if (xi >= x[n - 1]) return y[n - 1];

    // Find interval
    let i = 0;
    for (let j = 0; j < n - 1; j++) {
      if (x[j] <= xi && xi <= x[j + 1]) {
        i = j;
        break;
      }
    }

    const dx = xi - x[i];
    return y[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  });
}

/**
 * Exponential growth/decay interpolation
 */
export function exponentialInterpolate(
  startValue: number,
  endValue: number,
  steps: number
): number[] {
  if (steps < 2) return [startValue];
  if (startValue <= 0 || endValue <= 0) {
    return linearInterpolate([0, steps - 1], [startValue, endValue],
      Array.from({ length: steps }, (_, i) => i));
  }

  const ratio = Math.pow(endValue / startValue, 1 / (steps - 1));
  return Array.from({ length: steps }, (_, i) => startValue * Math.pow(ratio, i));
}

/**
 * S-curve (logistic) interpolation for adoption curves
 */
export function logisticInterpolate(
  startValue: number,
  endValue: number,
  steps: number,
  steepness: number = 0.5
): number[] {
  const range = endValue - startValue;
  const midpoint = (steps - 1) / 2;

  return Array.from({ length: steps }, (_, i) => {
    const x = steepness * (i - midpoint);
    const sigmoid = 1 / (1 + Math.exp(-x));
    return startValue + range * sigmoid;
  });
}

/**
 * Moving average smoothing
 */
export function movingAverage(values: number[], window: number): number[] {
  if (window <= 1) return values;

  const result: number[] = [];
  const halfWindow = Math.floor(window / 2);

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(values.length, i + halfWindow + 1);
    const slice = values.slice(start, end);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }

  return result;
}

/**
 * Exponential smoothing
 */
export function exponentialSmoothing(
  values: number[],
  alpha: number = 0.3
): number[] {
  if (values.length === 0) return [];

  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}
