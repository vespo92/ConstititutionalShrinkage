/**
 * Triple Bottom Line Metrics Implementation
 * Track People, Planet, and Profit outcomes
 */

import {
  Metric,
  MetricCategory,
  TripleBottomLineScore,
  ImpactPrediction,
  RegionalMetrics,
  BestPractice,
  MetricTrend,
  Tradeoff,
} from './types';

// Minimum acceptable scores for each category
export const MINIMUM_SCORES = {
  people: 60, // Must maintain quality of life
  planet: 50, // Must not cause environmental harm
  profit: 40, // Must be economically viable
};

// Default metric weights for composite score
export const DEFAULT_WEIGHTS = {
  people: 0.4,
  planet: 0.35,
  profit: 0.25,
};

export class MetricsSystem {
  private metrics: Map<string, Metric> = new Map();
  private regionalMetrics: Map<string, RegionalMetrics> = new Map();
  private bestPractices: BestPractice[] = [];

  /**
   * Register a metric for tracking
   */
  registerMetric(metric: Metric): void {
    this.metrics.set(metric.id, metric);
  }

  /**
   * Update a metric value
   */
  updateMetric(metricId: string, value: number, source?: string): void {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error(`Metric ${metricId} not found`);
    }

    metric.currentValue = value;
    metric.historicalData.push({
      timestamp: new Date(),
      value,
      source,
      confidence: 1.0,
    });

    this.metrics.set(metricId, metric);
  }

  /**
   * Calculate triple bottom line score for a region
   */
  calculateScore(regionId: string, weights = DEFAULT_WEIGHTS): TripleBottomLineScore {
    const regional = this.regionalMetrics.get(regionId);
    if (!regional) {
      throw new Error(`Region ${regionId} not found`);
    }

    // Calculate category scores
    const peopleScore = this.calculateCategoryScore(regional.metrics, MetricCategory.PEOPLE);
    const planetScore = this.calculateCategoryScore(regional.metrics, MetricCategory.PLANET);
    const profitScore = this.calculateCategoryScore(regional.metrics, MetricCategory.PROFIT);

    // Calculate weighted composite
    const composite =
      peopleScore * weights.people +
      planetScore * weights.planet +
      profitScore * weights.profit;

    // Identify tradeoffs
    const tradeoffs = this.identifyTradeoffs(peopleScore, planetScore, profitScore);

    return {
      people: peopleScore,
      planet: planetScore,
      profit: profitScore,
      composite,
      timestamp: new Date(),
      tradeoffs,
    };
  }

  /**
   * Predict impact of a proposed policy
   */
  predictImpact(
    policyDescription: string,
    regionId: string,
    assumptions: string[] = []
  ): ImpactPrediction {
    // Simplified prediction - production would use ML/AI models
    const currentScore = this.calculateScore(regionId);

    // Generate predictions with uncertainty
    const shortTerm = this.generatePrediction(currentScore, 0.05);
    const mediumTerm = this.generatePrediction(currentScore, 0.15);
    const longTerm = this.generatePrediction(currentScore, 0.25);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      uncertainty: {
        people: { min: -10, max: 10 },
        planet: { min: -10, max: 10 },
        profit: { min: -10, max: 10 },
      },
      assumptions: [
        'Current trends continue',
        'No major external shocks',
        'Policy is implemented as designed',
        ...assumptions,
      ],
    };
  }

  /**
   * Compare metrics across regions
   */
  compareRegions(metricId: string, regionIds: string[]): Map<string, number> {
    const comparison = new Map<string, number>();

    regionIds.forEach((regionId) => {
      const regional = this.regionalMetrics.get(regionId);
      if (regional) {
        const metric = regional.metrics.find((m) => m.id === metricId);
        if (metric) {
          comparison.set(regionId, metric.currentValue);
        }
      }
    });

    return comparison;
  }

  /**
   * Identify best practices from high-performing regions
   */
  identifyBestPractices(
    category: string,
    minImprovement: number = 10
  ): BestPractice[] {
    return this.bestPractices.filter(
      (bp) =>
        bp.category === category &&
        bp.metrics.after.composite - bp.metrics.before.composite >= minImprovement
    );
  }

  /**
   * Register a regional metrics set
   */
  registerRegion(regional: RegionalMetrics): void {
    this.regionalMetrics.set(regional.regionId, regional);
  }

  /**
   * Get metrics for a region
   */
  getRegionalMetrics(regionId: string): RegionalMetrics | undefined {
    return this.regionalMetrics.get(regionId);
  }

  /**
   * Analyze trends for a metric
   */
  analyzeTrend(metricId: string): MetricTrend | null {
    const metric = this.metrics.get(metricId);
    if (!metric || metric.historicalData.length < 2) {
      return null;
    }

    const recent = metric.historicalData.slice(-10);
    const values = recent.map((d) => d.value);

    // Simple trend analysis
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const changePercent = (change / firstAvg) * 100;

    let direction: 'improving' | 'declining' | 'stable';
    if (Math.abs(changePercent) < 2) {
      direction = 'stable';
    } else if (changePercent > 0) {
      direction = 'improving';
    } else {
      direction = 'declining';
    }

    return {
      metricId,
      direction,
      rate: changePercent,
      significance: Math.min(Math.abs(changePercent) / 10, 1),
    };
  }

  /**
   * Check if a policy meets minimum score requirements
   */
  meetsMinimumStandards(score: TripleBottomLineScore): boolean {
    return (
      score.people >= MINIMUM_SCORES.people &&
      score.planet >= MINIMUM_SCORES.planet &&
      score.profit >= MINIMUM_SCORES.profit
    );
  }

  // Private helper methods

  private calculateCategoryScore(metrics: Metric[], category: MetricCategory): number {
    const categoryMetrics = metrics.filter((m) => m.category === category);

    if (categoryMetrics.length === 0) {
      return 0;
    }

    // Normalize metrics to 0-100 scale and average
    const scores = categoryMetrics.map((metric) => {
      if (metric.targetValue) {
        // Score based on progress toward target
        return Math.min((metric.currentValue / metric.targetValue) * 100, 100);
      }
      // Assume current value is already on 0-100 scale
      return Math.min(Math.max(metric.currentValue, 0), 100);
    });

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private identifyTradeoffs(
    people: number,
    planet: number,
    profit: number
  ): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];

    // Check if any category is below minimum while others are high
    if (people < MINIMUM_SCORES.people && (planet > 70 || profit > 70)) {
      tradeoffs.push({
        category: MetricCategory.PEOPLE,
        impact: people - MINIMUM_SCORES.people,
        justification: 'Social wellbeing is below acceptable threshold',
        alternatives: [],
      });
    }

    if (planet < MINIMUM_SCORES.planet && (people > 70 || profit > 70)) {
      tradeoffs.push({
        category: MetricCategory.PLANET,
        impact: planet - MINIMUM_SCORES.planet,
        justification: 'Environmental sustainability is below acceptable threshold',
        alternatives: [],
      });
    }

    if (profit < MINIMUM_SCORES.profit && (people > 70 || planet > 70)) {
      tradeoffs.push({
        category: MetricCategory.PROFIT,
        impact: profit - MINIMUM_SCORES.profit,
        justification: 'Economic viability is below acceptable threshold',
        alternatives: [],
      });
    }

    return tradeoffs;
  }

  private generatePrediction(
    current: TripleBottomLineScore,
    variance: number
  ): TripleBottomLineScore {
    // Simplified prediction with random variance
    const randomVariance = () => (Math.random() - 0.5) * variance * 100;

    return {
      people: Math.max(0, Math.min(100, current.people + randomVariance())),
      planet: Math.max(0, Math.min(100, current.planet + randomVariance())),
      profit: Math.max(0, Math.min(100, current.profit + randomVariance())),
      composite: current.composite,
      timestamp: new Date(),
      tradeoffs: [],
    };
  }
}

// Predefined metrics for common measurements
export const STANDARD_METRICS = {
  // People metrics
  HAPPINESS_INDEX: {
    id: 'happiness-index',
    name: 'Happiness Index',
    category: MetricCategory.PEOPLE,
    description: 'Citizen-reported happiness and life satisfaction',
    unit: 'score',
    currentValue: 0,
    targetValue: 80,
    historicalData: [],
  },
  HEALTH_OUTCOMES: {
    id: 'health-outcomes',
    name: 'Health Outcomes',
    category: MetricCategory.PEOPLE,
    description: 'Life expectancy and health quality indicators',
    unit: 'score',
    currentValue: 0,
    targetValue: 85,
    historicalData: [],
  },
  EDUCATION_ATTAINMENT: {
    id: 'education-attainment',
    name: 'Education Attainment',
    category: MetricCategory.PEOPLE,
    description: 'Percentage of population with quality education',
    unit: 'percent',
    currentValue: 0,
    targetValue: 90,
    historicalData: [],
  },
  INCARCERATION_RATE: {
    id: 'incarceration-rate',
    name: 'Incarceration Rate',
    category: MetricCategory.PEOPLE,
    description: 'Incarcerated people per 100,000 (lower is better)',
    unit: 'per 100k',
    currentValue: 0,
    targetValue: 50, // Massive reduction from current ~700 in US
    historicalData: [],
  },

  // Planet metrics
  CARBON_EMISSIONS: {
    id: 'carbon-emissions',
    name: 'Carbon Emissions',
    category: MetricCategory.PLANET,
    description: 'CO2 emissions per capita (lower is better)',
    unit: 'tons CO2',
    currentValue: 0,
    targetValue: 2, // Paris Agreement compatible
    historicalData: [],
  },
  RENEWABLE_ENERGY: {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    category: MetricCategory.PLANET,
    description: 'Percentage of energy from renewable sources',
    unit: 'percent',
    currentValue: 0,
    targetValue: 80,
    historicalData: [],
  },
  AIR_QUALITY: {
    id: 'air-quality',
    name: 'Air Quality',
    category: MetricCategory.PLANET,
    description: 'Air quality index (higher is better)',
    unit: 'AQI',
    currentValue: 0,
    targetValue: 90,
    historicalData: [],
  },

  // Profit metrics
  GDP_PER_CAPITA: {
    id: 'gdp-per-capita',
    name: 'GDP Per Capita',
    category: MetricCategory.PROFIT,
    description: 'Economic output per person',
    unit: 'USD',
    currentValue: 0,
    targetValue: 70000,
    historicalData: [],
  },
  EMPLOYMENT_RATE: {
    id: 'employment-rate',
    name: 'Employment Rate',
    category: MetricCategory.PROFIT,
    description: 'Percentage of population employed',
    unit: 'percent',
    currentValue: 0,
    targetValue: 95,
    historicalData: [],
  },
  INNOVATION_INDEX: {
    id: 'innovation-index',
    name: 'Innovation Index',
    category: MetricCategory.PROFIT,
    description: 'Rate of innovation and new business formation',
    unit: 'score',
    currentValue: 0,
    targetValue: 80,
    historicalData: [],
  },
};

// Export singleton instance
export const metricsSystem = new MetricsSystem();

// Register standard metrics
Object.values(STANDARD_METRICS).forEach((metric) => {
  metricsSystem.registerMetric(metric as Metric);
});
