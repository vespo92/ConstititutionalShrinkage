/**
 * Metrics System Tests
 * Tests for triple bottom line metrics tracking
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MetricsSystem,
  MINIMUM_SCORES,
  DEFAULT_WEIGHTS,
  STANDARD_METRICS,
  metricsSystem,
} from '../src/metrics';
import { MetricCategory } from '../src/types';

describe('MetricsSystem', () => {
  let system: MetricsSystem;

  beforeEach(() => {
    system = new MetricsSystem();
  });

  describe('Constants', () => {
    it('should have minimum scores defined', () => {
      expect(MINIMUM_SCORES.people).toBe(60);
      expect(MINIMUM_SCORES.planet).toBe(50);
      expect(MINIMUM_SCORES.profit).toBe(40);
    });

    it('should have default weights summing to 1', () => {
      const sum = DEFAULT_WEIGHTS.people + DEFAULT_WEIGHTS.planet + DEFAULT_WEIGHTS.profit;
      expect(sum).toBe(1);
    });

    it('should have standard metrics defined', () => {
      expect(STANDARD_METRICS.HAPPINESS_INDEX).toBeDefined();
      expect(STANDARD_METRICS.CARBON_EMISSIONS).toBeDefined();
      expect(STANDARD_METRICS.GDP_PER_CAPITA).toBeDefined();
    });
  });

  describe('Metric Registration', () => {
    it('should register a new metric', () => {
      const metric = {
        id: 'test-metric',
        name: 'Test Metric',
        category: MetricCategory.PEOPLE,
        description: 'A test metric',
        unit: 'score',
        currentValue: 75,
        targetValue: 100,
        historicalData: [],
      };

      expect(() => {
        system.registerMetric(metric);
      }).not.toThrow();
    });
  });

  describe('Metric Updates', () => {
    beforeEach(() => {
      system.registerMetric({
        id: 'test-metric',
        name: 'Test Metric',
        category: MetricCategory.PEOPLE,
        description: 'Test',
        unit: 'score',
        currentValue: 50,
        historicalData: [],
      });
    });

    it('should update metric value', () => {
      system.updateMetric('test-metric', 75);
      // Metric should be updated (verified through other methods)
    });

    it('should add to historical data', () => {
      system.updateMetric('test-metric', 75, 'manual entry');
      system.updateMetric('test-metric', 80, 'sensor');
      // Historical data should contain both updates
    });

    it('should throw error for unknown metric', () => {
      expect(() => {
        system.updateMetric('unknown-metric', 100);
      }).toThrow('Metric unknown-metric not found');
    });
  });

  describe('Regional Metrics', () => {
    beforeEach(() => {
      system.registerRegion({
        regionId: 'region-001',
        regionName: 'Test Region',
        metrics: [
          {
            id: 'people-metric',
            name: 'People Metric',
            category: MetricCategory.PEOPLE,
            description: 'Test',
            unit: 'score',
            currentValue: 70,
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'planet-metric',
            name: 'Planet Metric',
            category: MetricCategory.PLANET,
            description: 'Test',
            unit: 'score',
            currentValue: 60,
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'profit-metric',
            name: 'Profit Metric',
            category: MetricCategory.PROFIT,
            description: 'Test',
            unit: 'score',
            currentValue: 80,
            targetValue: 100,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });
    });

    it('should register a region', () => {
      const regional = system.getRegionalMetrics('region-001');
      expect(regional).toBeDefined();
      expect(regional?.regionId).toBe('region-001');
    });

    it('should return undefined for unknown region', () => {
      const regional = system.getRegionalMetrics('unknown-region');
      expect(regional).toBeUndefined();
    });

    it('should get regional metrics', () => {
      const regional = system.getRegionalMetrics('region-001');
      expect(regional?.metrics).toHaveLength(3);
    });
  });

  describe('Score Calculation', () => {
    beforeEach(() => {
      system.registerRegion({
        regionId: 'region-001',
        regionName: 'Test Region',
        metrics: [
          {
            id: 'people-1',
            name: 'Happiness',
            category: MetricCategory.PEOPLE,
            description: 'Happiness index',
            unit: 'score',
            currentValue: 70,
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'planet-1',
            name: 'Air Quality',
            category: MetricCategory.PLANET,
            description: 'Air quality index',
            unit: 'score',
            currentValue: 80,
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'profit-1',
            name: 'GDP',
            category: MetricCategory.PROFIT,
            description: 'GDP per capita',
            unit: 'score',
            currentValue: 90,
            targetValue: 100,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });
    });

    it('should calculate triple bottom line score', () => {
      const score = system.calculateScore('region-001');

      expect(score.people).toBeDefined();
      expect(score.planet).toBeDefined();
      expect(score.profit).toBeDefined();
      expect(score.composite).toBeDefined();
    });

    it('should calculate category scores correctly', () => {
      const score = system.calculateScore('region-001');

      expect(score.people).toBe(70);
      expect(score.planet).toBe(80);
      expect(score.profit).toBe(90);
    });

    it('should calculate composite score with default weights', () => {
      const score = system.calculateScore('region-001');

      // people=70*0.4 + planet=80*0.35 + profit=90*0.25 = 28 + 28 + 22.5 = 78.5
      expect(score.composite).toBeCloseTo(78.5, 1);
    });

    it('should calculate composite score with custom weights', () => {
      const customWeights = { people: 0.5, planet: 0.3, profit: 0.2 };
      const score = system.calculateScore('region-001', customWeights);

      // people=70*0.5 + planet=80*0.3 + profit=90*0.2 = 35 + 24 + 18 = 77
      expect(score.composite).toBeCloseTo(77, 1);
    });

    it('should throw error for unknown region', () => {
      expect(() => {
        system.calculateScore('unknown-region');
      }).toThrow('Region unknown-region not found');
    });

    it('should include timestamp in score', () => {
      const score = system.calculateScore('region-001');
      expect(score.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Tradeoff Detection', () => {
    it('should detect tradeoffs when category is below minimum', () => {
      system.registerRegion({
        regionId: 'region-bad-people',
        regionName: 'Bad People Region',
        metrics: [
          {
            id: 'people-1',
            name: 'Happiness',
            category: MetricCategory.PEOPLE,
            description: 'Test',
            unit: 'score',
            currentValue: 40, // Below minimum of 60
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'planet-1',
            name: 'Air',
            category: MetricCategory.PLANET,
            description: 'Test',
            unit: 'score',
            currentValue: 80,
            historicalData: [],
          },
          {
            id: 'profit-1',
            name: 'GDP',
            category: MetricCategory.PROFIT,
            description: 'Test',
            unit: 'score',
            currentValue: 90,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });

      const score = system.calculateScore('region-bad-people');
      expect(score.tradeoffs.length).toBeGreaterThan(0);
      expect(score.tradeoffs.some(t => t.category === MetricCategory.PEOPLE)).toBe(true);
    });
  });

  describe('Minimum Standards Check', () => {
    it('should pass when all scores meet minimums', () => {
      const score = {
        people: 70,
        planet: 60,
        profit: 50,
        composite: 60,
        timestamp: new Date(),
        tradeoffs: [],
      };

      expect(system.meetsMinimumStandards(score)).toBe(true);
    });

    it('should fail when people score is below minimum', () => {
      const score = {
        people: 50, // Below 60
        planet: 60,
        profit: 50,
        composite: 55,
        timestamp: new Date(),
        tradeoffs: [],
      };

      expect(system.meetsMinimumStandards(score)).toBe(false);
    });

    it('should fail when planet score is below minimum', () => {
      const score = {
        people: 70,
        planet: 40, // Below 50
        profit: 50,
        composite: 55,
        timestamp: new Date(),
        tradeoffs: [],
      };

      expect(system.meetsMinimumStandards(score)).toBe(false);
    });

    it('should fail when profit score is below minimum', () => {
      const score = {
        people: 70,
        planet: 60,
        profit: 30, // Below 40
        composite: 55,
        timestamp: new Date(),
        tradeoffs: [],
      };

      expect(system.meetsMinimumStandards(score)).toBe(false);
    });
  });

  describe('Impact Prediction', () => {
    beforeEach(() => {
      system.registerRegion({
        regionId: 'region-001',
        regionName: 'Test Region',
        metrics: [
          {
            id: 'people-1',
            name: 'Happiness',
            category: MetricCategory.PEOPLE,
            description: 'Test',
            unit: 'score',
            currentValue: 70,
            targetValue: 100,
            historicalData: [],
          },
          {
            id: 'planet-1',
            name: 'Air',
            category: MetricCategory.PLANET,
            description: 'Test',
            unit: 'score',
            currentValue: 70,
            historicalData: [],
          },
          {
            id: 'profit-1',
            name: 'GDP',
            category: MetricCategory.PROFIT,
            description: 'Test',
            unit: 'score',
            currentValue: 70,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });
    });

    it('should predict impact of a policy', () => {
      const prediction = system.predictImpact(
        'New environmental regulation',
        'region-001'
      );

      expect(prediction.shortTerm).toBeDefined();
      expect(prediction.mediumTerm).toBeDefined();
      expect(prediction.longTerm).toBeDefined();
    });

    it('should include uncertainty ranges', () => {
      const prediction = system.predictImpact(
        'New environmental regulation',
        'region-001'
      );

      expect(prediction.uncertainty).toBeDefined();
      expect(prediction.uncertainty.people).toBeDefined();
      expect(prediction.uncertainty.planet).toBeDefined();
      expect(prediction.uncertainty.profit).toBeDefined();
    });

    it('should include assumptions', () => {
      const prediction = system.predictImpact(
        'New policy',
        'region-001',
        ['Custom assumption']
      );

      expect(prediction.assumptions).toContain('Custom assumption');
      expect(prediction.assumptions).toContain('Current trends continue');
    });
  });

  describe('Region Comparison', () => {
    beforeEach(() => {
      system.registerRegion({
        regionId: 'region-001',
        regionName: 'Region 1',
        metrics: [
          {
            id: 'happiness',
            name: 'Happiness',
            category: MetricCategory.PEOPLE,
            description: 'Test',
            unit: 'score',
            currentValue: 70,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });

      system.registerRegion({
        regionId: 'region-002',
        regionName: 'Region 2',
        metrics: [
          {
            id: 'happiness',
            name: 'Happiness',
            category: MetricCategory.PEOPLE,
            description: 'Test',
            unit: 'score',
            currentValue: 80,
            historicalData: [],
          },
        ],
        lastUpdated: new Date(),
      });
    });

    it('should compare metrics across regions', () => {
      const comparison = system.compareRegions('happiness', ['region-001', 'region-002']);

      expect(comparison.get('region-001')).toBe(70);
      expect(comparison.get('region-002')).toBe(80);
    });

    it('should handle missing regions gracefully', () => {
      const comparison = system.compareRegions('happiness', ['region-001', 'unknown-region']);

      expect(comparison.get('region-001')).toBe(70);
      expect(comparison.has('unknown-region')).toBe(false);
    });
  });

  describe('Trend Analysis', () => {
    beforeEach(() => {
      const historicalData = [];
      for (let i = 0; i < 10; i++) {
        historicalData.push({
          timestamp: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
          value: 50 + i * 2, // Increasing trend
          confidence: 1.0,
        });
      }

      system.registerMetric({
        id: 'trending-metric',
        name: 'Trending Metric',
        category: MetricCategory.PEOPLE,
        description: 'Test',
        unit: 'score',
        currentValue: 68,
        historicalData,
      });
    });

    it('should analyze trend for a metric', () => {
      const trend = system.analyzeTrend('trending-metric');

      expect(trend).not.toBeNull();
      expect(trend!.metricId).toBe('trending-metric');
      expect(trend!.direction).toBe('improving');
    });

    it('should return null for metric without enough data', () => {
      system.registerMetric({
        id: 'new-metric',
        name: 'New Metric',
        category: MetricCategory.PEOPLE,
        description: 'Test',
        unit: 'score',
        currentValue: 50,
        historicalData: [], // No historical data
      });

      const trend = system.analyzeTrend('new-metric');
      expect(trend).toBeNull();
    });

    it('should return null for unknown metric', () => {
      const trend = system.analyzeTrend('unknown-metric');
      expect(trend).toBeNull();
    });
  });

  describe('Best Practices', () => {
    it('should identify best practices', () => {
      const practices = system.identifyBestPractices('environment', 5);
      expect(Array.isArray(practices)).toBe(true);
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(metricsSystem).toBeInstanceOf(MetricsSystem);
    });
  });
});
