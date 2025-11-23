import { describe, it, expect } from 'vitest';
import { aggregator } from '../src/services/aggregator.js';

describe('Aggregator Service', () => {
  describe('generateTimeSeries', () => {
    it('should generate correct number of data points', () => {
      const data = aggregator.generateTimeSeries('votes', 30);
      expect(data).toHaveLength(31); // 30 days + today
    });

    it('should have valid date and value properties', () => {
      const data = aggregator.generateTimeSeries('test', 7);
      data.forEach((point) => {
        expect(point.date).toBeDefined();
        expect(typeof point.value).toBe('number');
        expect(point.value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('movingAverage', () => {
    it('should calculate correct moving average', () => {
      const data = [10, 20, 30, 40, 50];
      const result = aggregator.movingAverage(data, 3);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe(10); // Only first value
      expect(result[1]).toBe(15); // (10+20)/2
      expect(result[2]).toBe(20); // (10+20+30)/3
      expect(result[3]).toBe(30); // (20+30+40)/3
      expect(result[4]).toBe(40); // (30+40+50)/3
    });

    it('should handle invalid window size', () => {
      const data = [10, 20, 30];
      expect(aggregator.movingAverage(data, 0)).toEqual(data);
      expect(aggregator.movingAverage(data, 10)).toEqual(data);
    });
  });

  describe('percentageChange', () => {
    it('should calculate positive change', () => {
      expect(aggregator.percentageChange(120, 100)).toBe(20);
    });

    it('should calculate negative change', () => {
      expect(aggregator.percentageChange(80, 100)).toBe(-20);
    });

    it('should handle zero previous value', () => {
      expect(aggregator.percentageChange(100, 0)).toBe(100);
      expect(aggregator.percentageChange(0, 0)).toBe(0);
    });
  });

  describe('computeStats', () => {
    it('should compute correct statistics', () => {
      const values = [10, 20, 30, 40, 50];
      const stats = aggregator.computeStats(values);

      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.mean).toBe(30);
      expect(stats.median).toBe(30);
      expect(stats.stdDev).toBeCloseTo(14.14, 1);
    });

    it('should handle empty array', () => {
      const stats = aggregator.computeStats([]);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.mean).toBe(0);
      expect(stats.median).toBe(0);
      expect(stats.stdDev).toBe(0);
    });

    it('should handle single value', () => {
      const stats = aggregator.computeStats([42]);
      expect(stats.min).toBe(42);
      expect(stats.max).toBe(42);
      expect(stats.mean).toBe(42);
      expect(stats.median).toBe(42);
      expect(stats.stdDev).toBe(0);
    });
  });
});
