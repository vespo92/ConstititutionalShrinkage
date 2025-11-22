/**
 * Progressive Tax System Tests
 * Tests for the just taxation with aggressive marginal rates
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProgressiveTaxSystem,
  calculateProgressiveTax,
  generateProgressiveTaxReport,
  compareOldVsNewTaxSystem,
} from '../src/progressive-tax';

describe('ProgressiveTaxSystem', () => {
  let taxSystem: ProgressiveTaxSystem;

  beforeEach(() => {
    taxSystem = new ProgressiveTaxSystem();
  });

  describe('Tax Brackets', () => {
    it('should have 7 tax brackets', () => {
      const brackets = taxSystem.getTaxBrackets();
      expect(brackets).toHaveLength(7);
    });

    it('should have progressive rates', () => {
      const brackets = taxSystem.getTaxBrackets();
      for (let i = 0; i < brackets.length - 1; i++) {
        expect(brackets[i].rate).toBeLessThan(brackets[i + 1].rate);
      }
    });

    it('should validate brackets structure', () => {
      expect(taxSystem.validateBrackets()).toBe(true);
    });

    it('should have correct rate for first bracket (30%)', () => {
      const brackets = taxSystem.getTaxBrackets();
      expect(brackets[0].rate).toBe(0.30);
      expect(brackets[0].ceiling).toBe(1_000_000);
    });

    it('should have correct rate for top bracket (85%)', () => {
      const brackets = taxSystem.getTaxBrackets();
      const topBracket = brackets[brackets.length - 1];
      expect(topBracket.rate).toBe(0.85);
      expect(topBracket.ceiling).toBeNull();
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate tax for $100,000 income', () => {
      const calc = taxSystem.calculateTax(100_000);
      expect(calc.grossIncome).toBe(100_000);
      expect(calc.taxableIncome).toBe(100_000);
      expect(calc.totalTax).toBe(30_000); // 100k * 30%
      expect(calc.effectiveRate).toBeCloseTo(0.30, 2);
    });

    it('should calculate tax for $500,000 income', () => {
      const calc = taxSystem.calculateTax(500_000);
      expect(calc.grossIncome).toBe(500_000);
      expect(calc.totalTax).toBe(150_000); // Still in first bracket
      expect(calc.effectiveRate).toBeCloseTo(0.30, 2);
    });

    it('should calculate tax for $1,000,000 income (at bracket boundary)', () => {
      const calc = taxSystem.calculateTax(1_000_000);
      expect(calc.totalTax).toBe(300_000); // 1M * 30%
      expect(calc.effectiveRate).toBeCloseTo(0.30, 2);
    });

    it('should calculate tax for $5,000,000 income', () => {
      const calc = taxSystem.calculateTax(5_000_000);
      // First $1M at 30% = $300,000
      // Next $4M at 35% = $1,400,000
      // Total = $1,700,000
      expect(calc.totalTax).toBe(1_700_000);
      expect(calc.effectiveRate).toBeCloseTo(0.34, 2);
    });

    it('should calculate tax for $10,000,000 income', () => {
      const calc = taxSystem.calculateTax(10_000_000);
      // First $1M at 30% = $300,000
      // Next $9M at 35% = $3,150,000
      // Total = $3,450,000
      expect(calc.totalTax).toBe(3_450_000);
      expect(calc.effectiveRate).toBeCloseTo(0.345, 2);
    });

    it('should calculate tax for $1,000,000,000 (billionaire)', () => {
      const calc = taxSystem.calculateTax(1_000_000_000);
      // This should use all brackets up to the 85% top bracket
      expect(calc.effectiveRate).toBeGreaterThan(0.70);
      expect(calc.effectiveRate).toBeLessThan(0.85);
      expect(calc.afterTaxIncome).toBeLessThan(calc.grossIncome * 0.30);
    });

    it('should handle zero income', () => {
      const calc = taxSystem.calculateTax(0);
      expect(calc.totalTax).toBe(0);
      expect(calc.effectiveRate).toBe(0);
    });

    it('should handle negative income as zero', () => {
      const calc = taxSystem.calculateTax(-50000);
      expect(calc.taxableIncome).toBe(0);
      expect(calc.totalTax).toBe(0);
    });

    it('should apply deductions correctly', () => {
      const calcWithoutDeductions = taxSystem.calculateTax(100_000);
      const calcWithDeductions = taxSystem.calculateTax(100_000, 20_000);

      expect(calcWithDeductions.taxableIncome).toBe(80_000);
      expect(calcWithDeductions.totalTax).toBe(24_000);
      expect(calcWithDeductions.totalTax).toBeLessThan(calcWithoutDeductions.totalTax);
    });

    it('should calculate after-tax income correctly', () => {
      const calc = taxSystem.calculateTax(100_000);
      expect(calc.afterTaxIncome).toBe(calc.grossIncome - calc.totalTax);
      expect(calc.afterTaxIncome).toBe(70_000);
    });

    it('should include timestamp in calculation', () => {
      const calc = taxSystem.calculateTax(100_000);
      expect(calc.calculatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Bracket Breakdown', () => {
    it('should provide bracket breakdown', () => {
      const calc = taxSystem.calculateTax(5_000_000);
      expect(calc.bracketBreakdown.length).toBeGreaterThan(1);
    });

    it('should show income in each bracket', () => {
      const calc = taxSystem.calculateTax(5_000_000);
      const firstBracket = calc.bracketBreakdown[0];

      expect(firstBracket.bracket).toBe('Up to $1M');
      expect(firstBracket.incomeInBracket).toBe(1_000_000);
      expect(firstBracket.rate).toBe(0.30);
      expect(firstBracket.taxFromBracket).toBe(300_000);
    });

    it('should sum bracket taxes to total', () => {
      const calc = taxSystem.calculateTax(50_000_000);
      const sumOfBrackets = calc.bracketBreakdown.reduce((sum, b) => sum + b.taxFromBracket, 0);
      expect(sumOfBrackets).toBeCloseTo(calc.totalTax, 0);
    });
  });

  describe('Tax Report Generation', () => {
    it('should generate a tax report string', () => {
      const calc = taxSystem.calculateTax(1_000_000);
      const report = taxSystem.generateTaxReport(calc);

      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include key information in report', () => {
      const calc = taxSystem.calculateTax(1_000_000);
      const report = taxSystem.generateTaxReport(calc);

      expect(report).toContain('Gross Income');
      expect(report).toContain('Total Tax');
      expect(report).toContain('Effective Rate');
      expect(report).toContain('After-Tax');
    });

    it('should include bracket breakdown in report', () => {
      const calc = taxSystem.calculateTax(5_000_000);
      const report = taxSystem.generateTaxReport(calc);

      expect(report).toContain('MARGINAL BRACKET BREAKDOWN');
      expect(report).toContain('Up to $1M');
    });
  });

  describe('Old vs New System Comparison', () => {
    it('should compare tax burden between systems', () => {
      const comparison = taxSystem.compareToOldSystem(1_000_000);

      expect(comparison.oldSystem).toBeDefined();
      expect(comparison.newSystem).toBeDefined();
      expect(comparison.difference).toBeDefined();
      expect(comparison.percentChange).toBeDefined();
    });

    it('should show higher tax for high earners in new system', () => {
      const comparison = taxSystem.compareToOldSystem(10_000_000);
      // New system should collect more from high earners
      expect(comparison.newSystem).toBeGreaterThan(comparison.oldSystem);
      expect(comparison.difference).toBeGreaterThan(0);
    });

    it('should calculate old system tax correctly', () => {
      // Old system: flat 30% over $300k
      const comparison = taxSystem.compareToOldSystem(1_000_000);
      // Old tax = (1M - 300k) * 0.30 = $210,000
      expect(comparison.oldSystem).toBe(210_000);
    });
  });

  describe('Tax Scenarios', () => {
    it('should generate multiple tax scenarios', () => {
      const scenarios = taxSystem.generateTaxScenarios();
      expect(scenarios.length).toBeGreaterThan(5);
    });

    it('should include income labels in scenarios', () => {
      const scenarios = taxSystem.generateTaxScenarios();
      expect(scenarios.some(s => s.label.includes('Middle Class'))).toBe(true);
      expect(scenarios.some(s => s.label.includes('Millionaire'))).toBe(true);
      expect(scenarios.some(s => s.label.includes('Billionaire'))).toBe(true);
    });

    it('should show increasing effective rates for higher incomes', () => {
      const scenarios = taxSystem.generateTaxScenarios();
      // Effective rate should increase with income (progressive)
      for (let i = 1; i < scenarios.length; i++) {
        expect(scenarios[i].effectiveRate).toBeGreaterThanOrEqual(scenarios[i - 1].effectiveRate);
      }
    });
  });

  describe('Revenue Impact Estimation', () => {
    it('should estimate revenue impact', () => {
      const distribution = [
        { income: 100_000, numberOfPeople: 1000 },
        { income: 1_000_000, numberOfPeople: 100 },
        { income: 10_000_000, numberOfPeople: 10 },
      ];

      const impact = taxSystem.estimateRevenueImpact(distribution);

      expect(impact.oldSystemRevenue).toBeDefined();
      expect(impact.newSystemRevenue).toBeDefined();
      expect(impact.additionalRevenue).toBeDefined();
      expect(impact.percentIncrease).toBeDefined();
    });

    it('should show positive additional revenue', () => {
      const distribution = [
        { income: 10_000_000, numberOfPeople: 100 },
      ];

      const impact = taxSystem.estimateRevenueImpact(distribution);
      expect(impact.additionalRevenue).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    it('calculateProgressiveTax should work as standalone function', () => {
      const calc = calculateProgressiveTax(100_000);
      expect(calc.totalTax).toBe(30_000);
    });

    it('generateProgressiveTaxReport should work as standalone function', () => {
      const report = generateProgressiveTaxReport(1_000_000);
      expect(typeof report).toBe('string');
      expect(report).toContain('PROGRESSIVE TAX');
    });

    it('compareOldVsNewTaxSystem should work as standalone function', () => {
      const report = compareOldVsNewTaxSystem(5_000_000);
      expect(typeof report).toBe('string');
      expect(report).toContain('OLD SYSTEM VS NEW SYSTEM');
    });
  });
});
