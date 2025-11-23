/**
 * Optimization utilities for model calibration and policy comparison
 */

/**
 * Simple gradient descent optimization
 */
export function gradientDescent(
  objective: (params: number[]) => number,
  initialParams: number[],
  options: {
    learningRate?: number;
    maxIterations?: number;
    tolerance?: number;
    epsilon?: number;
  } = {}
): { params: number[]; value: number; iterations: number } {
  const {
    learningRate = 0.01,
    maxIterations = 1000,
    tolerance = 1e-6,
    epsilon = 1e-8
  } = options;

  let params = [...initialParams];
  let prevValue = objective(params);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Compute numerical gradient
    const gradient = params.map((_, i) => {
      const paramsPlus = [...params];
      const paramsMinus = [...params];
      paramsPlus[i] += epsilon;
      paramsMinus[i] -= epsilon;
      return (objective(paramsPlus) - objective(paramsMinus)) / (2 * epsilon);
    });

    // Update parameters
    params = params.map((p, i) => p - learningRate * gradient[i]);

    // Check convergence
    const value = objective(params);
    if (Math.abs(value - prevValue) < tolerance) {
      return { params, value, iterations: iter + 1 };
    }
    prevValue = value;
  }

  return { params, value: prevValue, iterations: maxIterations };
}

/**
 * Grid search for parameter optimization
 */
export function gridSearch<T>(
  objective: (params: T) => number,
  paramGrid: Record<string, number[]>,
  minimize: boolean = true
): { bestParams: T; bestValue: number } {
  const paramNames = Object.keys(paramGrid);
  const paramValues = paramNames.map(name => paramGrid[name]);

  // Generate all combinations
  function* generateCombinations(index: number, current: Record<string, number>): Generator<Record<string, number>> {
    if (index === paramNames.length) {
      yield { ...current };
      return;
    }

    for (const value of paramValues[index]) {
      current[paramNames[index]] = value;
      yield* generateCombinations(index + 1, current);
    }
  }

  let bestParams: Record<string, number> | null = null;
  let bestValue = minimize ? Infinity : -Infinity;

  for (const params of generateCombinations(0, {})) {
    const value = objective(params as T);
    const isBetter = minimize ? value < bestValue : value > bestValue;
    if (isBetter) {
      bestValue = value;
      bestParams = { ...params };
    }
  }

  return { bestParams: bestParams as T, bestValue };
}

/**
 * Pareto frontier computation for multi-objective optimization
 */
export function computeParetoFrontier<T>(
  solutions: T[],
  objectives: ((solution: T) => number)[],
  maximize: boolean[] = objectives.map(() => true)
): T[] {
  const frontier: T[] = [];

  for (const candidate of solutions) {
    const candidateScores = objectives.map(obj => obj(candidate));
    let isDominated = false;

    for (const existing of solutions) {
      if (existing === candidate) continue;

      const existingScores = objectives.map(obj => obj(existing));
      let dominated = true;
      let strictlyBetter = false;

      for (let i = 0; i < objectives.length; i++) {
        const compare = maximize[i]
          ? existingScores[i] >= candidateScores[i]
          : existingScores[i] <= candidateScores[i];
        const strictCompare = maximize[i]
          ? existingScores[i] > candidateScores[i]
          : existingScores[i] < candidateScores[i];

        if (!compare) dominated = false;
        if (strictCompare) strictlyBetter = true;
      }

      if (dominated && strictlyBetter) {
        isDominated = true;
        break;
      }
    }

    if (!isDominated) {
      frontier.push(candidate);
    }
  }

  return frontier;
}

/**
 * Weighted sum method for multi-objective optimization
 */
export function weightedSum(
  scores: number[],
  weights: number[]
): number {
  if (scores.length !== weights.length) {
    throw new Error('Scores and weights must have same length');
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return scores.reduce((sum, score, i) => sum + score * weights[i], 0) / totalWeight;
}

/**
 * Normalize scores to 0-1 range
 */
export function normalizeScores(
  scores: number[],
  min?: number,
  max?: number
): number[] {
  const actualMin = min ?? Math.min(...scores);
  const actualMax = max ?? Math.max(...scores);
  const range = actualMax - actualMin;

  if (range === 0) return scores.map(() => 0.5);
  return scores.map(s => (s - actualMin) / range);
}

/**
 * Rank solutions by multiple criteria
 */
export function rankSolutions<T>(
  solutions: T[],
  scoreFunc: (solution: T) => number,
  ascending: boolean = false
): Array<{ solution: T; score: number; rank: number }> {
  const scored = solutions.map(solution => ({
    solution,
    score: scoreFunc(solution),
    rank: 0
  }));

  scored.sort((a, b) => ascending ? a.score - b.score : b.score - a.score);
  scored.forEach((item, index) => {
    item.rank = index + 1;
  });

  return scored;
}
