/**
 * Progressive Tax System
 *
 * A just marginal tax rate structure that ensures the wealthy pay their fair share.
 * Replaces the broken current system where 30% over $300k is absurdly low.
 *
 * New Marginal Tax Brackets:
 * - Up to $1M: 30%
 * - $1M - $10M: 35%
 * - $10M - $50M: 40%
 * - $50M - $100M: 50%
 * - $100M - $250M: 60%
 * - $250M - $500M: 70%
 * - Over $500M: 85%
 */

export interface TaxBracket {
  floor: number;  // Income floor for this bracket
  ceiling: number | null;  // Income ceiling (null = infinity)
  rate: number;  // Marginal tax rate (as decimal, e.g., 0.30 = 30%)
  description: string;
}

export interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  afterTaxIncome: number;
  bracketBreakdown: BracketTaxBreakdown[];
  calculatedAt: Date;
}

export interface BracketTaxBreakdown {
  bracket: string;
  incomeInBracket: number;
  rate: number;
  taxFromBracket: number;
}

export class ProgressiveTaxSystem {
  // New progressive tax brackets - much more just
  private readonly TAX_BRACKETS: TaxBracket[] = [
    {
      floor: 0,
      ceiling: 1_000_000,
      rate: 0.30,
      description: 'Up to $1M'
    },
    {
      floor: 1_000_000,
      ceiling: 10_000_000,
      rate: 0.35,
      description: '$1M - $10M'
    },
    {
      floor: 10_000_000,
      ceiling: 50_000_000,
      rate: 0.40,
      description: '$10M - $50M'
    },
    {
      floor: 50_000_000,
      ceiling: 100_000_000,
      rate: 0.50,
      description: '$50M - $100M'
    },
    {
      floor: 100_000_000,
      ceiling: 250_000_000,
      rate: 0.60,
      description: '$100M - $250M'
    },
    {
      floor: 250_000_000,
      ceiling: 500_000_000,
      rate: 0.70,
      description: '$250M - $500M'
    },
    {
      floor: 500_000_000,
      ceiling: null,  // No upper limit
      rate: 0.85,
      description: 'Over $500M'
    }
  ];

  /**
   * Calculate total tax owed based on progressive brackets
   */
  calculateTax(income: number, deductions: number = 0): TaxCalculation {
    const taxableIncome = Math.max(0, income - deductions);
    const bracketBreakdown: BracketTaxBreakdown[] = [];
    let totalTax = 0;
    let remainingIncome = taxableIncome;

    // Calculate tax for each bracket
    for (let i = 0; i < this.TAX_BRACKETS.length; i++) {
      const bracket = this.TAX_BRACKETS[i];

      if (remainingIncome <= 0) break;

      // Determine how much income falls in this bracket
      let incomeInBracket = 0;

      if (taxableIncome >= bracket.floor) {
        if (bracket.ceiling === null) {
          // Top bracket - all remaining income
          incomeInBracket = Math.max(0, taxableIncome - bracket.floor);
        } else {
          // Calculate income in this bracket
          const bracketMax = bracket.ceiling - bracket.floor;
          incomeInBracket = Math.min(
            remainingIncome,
            Math.max(0, Math.min(taxableIncome, bracket.ceiling) - bracket.floor)
          );
        }

        if (incomeInBracket > 0) {
          const taxFromBracket = incomeInBracket * bracket.rate;
          totalTax += taxFromBracket;

          bracketBreakdown.push({
            bracket: bracket.description,
            incomeInBracket,
            rate: bracket.rate,
            taxFromBracket
          });

          remainingIncome -= incomeInBracket;
        }
      }
    }

    const effectiveRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;
    const afterTaxIncome = income - totalTax;

    return {
      grossIncome: income,
      taxableIncome,
      totalTax,
      effectiveRate,
      afterTaxIncome,
      bracketBreakdown,
      calculatedAt: new Date()
    };
  }

  /**
   * Generate a transparent tax report showing exactly how tax is calculated
   */
  generateTaxReport(calculation: TaxCalculation): string {
    let report = '\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += '          PROGRESSIVE TAX CALCULATION          \n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    report += `Gross Income:    ${this.formatCurrency(calculation.grossIncome)}\n`;
    report += `Taxable Income:  ${this.formatCurrency(calculation.taxableIncome)}\n`;
    report += `Total Tax:       ${this.formatCurrency(calculation.totalTax)}\n`;
    report += `Effective Rate:  ${(calculation.effectiveRate * 100).toFixed(2)}%\n`;
    report += `After-Tax:       ${this.formatCurrency(calculation.afterTaxIncome)}\n\n`;

    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += '           MARGINAL BRACKET BREAKDOWN          \n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

    calculation.bracketBreakdown.forEach(bracket => {
      report += `${bracket.bracket.padEnd(20)} @ ${(bracket.rate * 100).toFixed(0)}%\n`;
      report += `  Income in bracket: ${this.formatCurrency(bracket.incomeInBracket)}\n`;
      report += `  Tax from bracket:  ${this.formatCurrency(bracket.taxFromBracket)}\n\n`;
    });

    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    return report;
  }

  /**
   * Compare tax burden under old vs new system
   */
  compareToOldSystem(income: number): {
    oldSystem: number;
    newSystem: number;
    difference: number;
    percentChange: number;
  } {
    // Old broken system: flat 30% over $300k (simplified)
    const oldTax = income > 300_000 ? (income - 300_000) * 0.30 : 0;

    // New progressive system
    const newCalc = this.calculateTax(income);
    const newTax = newCalc.totalTax;

    const difference = newTax - oldTax;
    const percentChange = oldTax > 0 ? (difference / oldTax) * 100 : 0;

    return {
      oldSystem: oldTax,
      newSystem: newTax,
      difference,
      percentChange
    };
  }

  /**
   * Calculate tax for different income scenarios
   */
  generateTaxScenarios(): TaxScenario[] {
    const scenarios = [
      { income: 100_000, label: 'Middle Class ($100k)' },
      { income: 500_000, label: 'Upper Middle ($500k)' },
      { income: 1_000_000, label: 'Millionaire ($1M)' },
      { income: 5_000_000, label: 'Multi-Millionaire ($5M)' },
      { income: 10_000_000, label: 'Wealthy ($10M)' },
      { income: 50_000_000, label: 'Very Wealthy ($50M)' },
      { income: 100_000_000, label: 'Ultra Wealthy ($100M)' },
      { income: 500_000_000, label: 'Billionaire ($500M)' },
      { income: 1_000_000_000, label: 'Multi-Billionaire ($1B)' }
    ];

    return scenarios.map(scenario => {
      const calc = this.calculateTax(scenario.income);
      const comparison = this.compareToOldSystem(scenario.income);

      return {
        label: scenario.label,
        income: scenario.income,
        totalTax: calc.totalTax,
        effectiveRate: calc.effectiveRate,
        afterTax: calc.afterTaxIncome,
        oldSystemTax: comparison.oldSystem,
        additionalTax: comparison.difference
      };
    });
  }

  /**
   * Calculate revenue impact from progressive tax system
   */
  estimateRevenueImpact(incomeDistribution: IncomeDistribution[]): RevenueImpact {
    let oldRevenue = 0;
    let newRevenue = 0;

    incomeDistribution.forEach(dist => {
      const oldTax = dist.income > 300_000 ? (dist.income - 300_000) * 0.30 : 0;
      const newCalc = this.calculateTax(dist.income);

      oldRevenue += oldTax * dist.numberOfPeople;
      newRevenue += newCalc.totalTax * dist.numberOfPeople;
    });

    return {
      oldSystemRevenue: oldRevenue,
      newSystemRevenue: newRevenue,
      additionalRevenue: newRevenue - oldRevenue,
      percentIncrease: ((newRevenue - oldRevenue) / oldRevenue) * 100
    };
  }

  // Helper methods

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get all tax brackets (for transparency)
   */
  getTaxBrackets(): TaxBracket[] {
    return [...this.TAX_BRACKETS];
  }

  /**
   * Validate that brackets are properly structured
   */
  validateBrackets(): boolean {
    for (let i = 0; i < this.TAX_BRACKETS.length - 1; i++) {
      const current = this.TAX_BRACKETS[i];
      const next = this.TAX_BRACKETS[i + 1];

      // Ceiling should match next floor
      if (current.ceiling !== next.floor) {
        console.error(`Gap in brackets between ${current.description} and ${next.description}`);
        return false;
      }

      // Rates should be progressive
      if (current.rate >= next.rate) {
        console.error(`Tax rate not progressive between ${current.description} and ${next.description}`);
        return false;
      }
    }

    return true;
  }
}

// Supporting interfaces

export interface TaxScenario {
  label: string;
  income: number;
  totalTax: number;
  effectiveRate: number;
  afterTax: number;
  oldSystemTax: number;
  additionalTax: number;
}

export interface IncomeDistribution {
  income: number;
  numberOfPeople: number;
}

export interface RevenueImpact {
  oldSystemRevenue: number;
  newSystemRevenue: number;
  additionalRevenue: number;
  percentIncrease: number;
}

/**
 * EXPORT PUBLIC API
 */

export function calculateProgressiveTax(income: number, deductions: number = 0): TaxCalculation {
  const system = new ProgressiveTaxSystem();
  return system.calculateTax(income, deductions);
}

export function generateProgressiveTaxReport(income: number): string {
  const system = new ProgressiveTaxSystem();
  const calc = system.calculateTax(income);
  return system.generateTaxReport(calc);
}

export function compareOldVsNewTaxSystem(income: number): string {
  const system = new ProgressiveTaxSystem();
  const comparison = system.compareToOldSystem(income);

  let report = '\n';
  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  report += '        OLD SYSTEM VS NEW SYSTEM COMPARISON     \n';
  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  const fmt = (n: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(n);

  report += `Income:              ${fmt(income)}\n\n`;
  report += `Old System Tax:      ${fmt(comparison.oldSystem)}\n`;
  report += `New System Tax:      ${fmt(comparison.newSystem)}\n`;
  report += `Difference:          ${fmt(comparison.difference)}\n`;
  report += `Percent Change:      ${comparison.percentChange.toFixed(1)}%\n\n`;

  if (comparison.difference > 0) {
    report += `✅ New system collects ${fmt(comparison.difference)} MORE\n`;
    report += `   This is a more JUST distribution of tax burden!\n`;
  }

  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  return report;
}

export default ProgressiveTaxSystem;
