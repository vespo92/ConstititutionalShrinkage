/**
 * Triple Bottom Line Scorer
 * Calculates and tracks TBL scores for legislation
 */

import type { TBLImpactReport, Factor } from '../../types/index.js';

export interface TBLScoreWeights {
  people: number;
  planet: number;
  profit: number;
}

export interface TBLScoreBreakdown {
  rawScores: { people: number; planet: number; profit: number };
  weightedScores: { people: number; planet: number; profit: number };
  weights: TBLScoreWeights;
  overall: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';
  percentile: number;
}

export interface TBLTrend {
  period: string;
  scores: { people: number; planet: number; profit: number; overall: number }[];
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number;
}

export class TBLScorer {
  private defaultWeights: TBLScoreWeights = {
    people: 0.4,
    planet: 0.35,
    profit: 0.25,
  };

  /**
   * Calculate weighted TBL score
   */
  calculateScore(
    report: TBLImpactReport,
    weights?: Partial<TBLScoreWeights>
  ): TBLScoreBreakdown {
    const w = { ...this.defaultWeights, ...weights };

    // Normalize weights
    const totalWeight = w.people + w.planet + w.profit;
    const normalizedWeights = {
      people: w.people / totalWeight,
      planet: w.planet / totalWeight,
      profit: w.profit / totalWeight,
    };

    const rawScores = {
      people: report.people.score,
      planet: report.planet.score,
      profit: report.profit.score,
    };

    const weightedScores = {
      people: rawScores.people * normalizedWeights.people,
      planet: rawScores.planet * normalizedWeights.planet,
      profit: rawScores.profit * normalizedWeights.profit,
    };

    const overall = weightedScores.people + weightedScores.planet + weightedScores.profit;

    return {
      rawScores,
      weightedScores,
      weights: normalizedWeights,
      overall,
      grade: this.scoreToGrade(overall),
      percentile: this.scoreToPercentile(overall),
    };
  }

  /**
   * Convert score to letter grade
   */
  scoreToGrade(score: number): TBLScoreBreakdown['grade'] {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    if (score >= 35) return 'D-';
    return 'F';
  }

  /**
   * Convert score to percentile (simplified)
   */
  scoreToPercentile(score: number): number {
    // Assuming normal distribution centered at 50
    // This is a simplified approximation
    return Math.min(99, Math.max(1, Math.round(score)));
  }

  /**
   * Compare multiple bills
   */
  compareBills(
    bills: { id: string; name: string; report: TBLImpactReport }[]
  ): {
    rankings: { id: string; name: string; score: number; grade: string }[];
    best: { category: string; billId: string; score: number }[];
    worst: { category: string; billId: string; score: number }[];
  } {
    const scored = bills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      breakdown: this.calculateScore(bill.report),
      report: bill.report,
    }));

    // Overall rankings
    const rankings = scored
      .map((s) => ({
        id: s.id,
        name: s.name,
        score: s.breakdown.overall,
        grade: s.breakdown.grade,
      }))
      .sort((a, b) => b.score - a.score);

    // Best and worst by category
    const categories = ['people', 'planet', 'profit'] as const;
    const best = categories.map((category) => {
      const sorted = scored.sort(
        (a, b) => b.report[category].score - a.report[category].score
      );
      return {
        category,
        billId: sorted[0].id,
        score: sorted[0].report[category].score,
      };
    });

    const worst = categories.map((category) => {
      const sorted = scored.sort(
        (a, b) => a.report[category].score - b.report[category].score
      );
      return {
        category,
        billId: sorted[0].id,
        score: sorted[0].report[category].score,
      };
    });

    return { rankings, best, worst };
  }

  /**
   * Analyze factors contributing to score
   */
  analyzeFactors(report: TBLImpactReport): {
    topPositive: Factor[];
    topNegative: Factor[];
    highConfidence: Factor[];
    lowConfidence: Factor[];
  } {
    const allFactors = [
      ...report.people.factors,
      ...report.planet.factors,
      ...report.profit.factors,
    ];

    const sorted = [...allFactors].sort((a, b) => b.impact - a.impact);
    const byConfidence = [...allFactors].sort((a, b) => b.confidence - a.confidence);

    return {
      topPositive: sorted.filter((f) => f.impact > 0).slice(0, 5),
      topNegative: sorted.filter((f) => f.impact < 0).slice(-5).reverse(),
      highConfidence: byConfidence.filter((f) => f.confidence >= 0.8).slice(0, 5),
      lowConfidence: byConfidence.filter((f) => f.confidence < 0.5).slice(0, 5),
    };
  }

  /**
   * Calculate what-if scenarios
   */
  calculateWhatIf(
    baseReport: TBLImpactReport,
    modifications: Partial<{
      people: Partial<{ score: number; factors: Factor[] }>;
      planet: Partial<{ score: number; factors: Factor[] }>;
      profit: Partial<{ score: number; factors: Factor[] }>;
    }>
  ): {
    original: TBLScoreBreakdown;
    modified: TBLScoreBreakdown;
    delta: { people: number; planet: number; profit: number; overall: number };
  } {
    const modifiedReport: TBLImpactReport = {
      ...baseReport,
      people: { ...baseReport.people, ...modifications.people },
      planet: { ...baseReport.planet, ...modifications.planet },
      profit: { ...baseReport.profit, ...modifications.profit },
    };

    const original = this.calculateScore(baseReport);
    const modified = this.calculateScore(modifiedReport);

    return {
      original,
      modified,
      delta: {
        people: modified.rawScores.people - original.rawScores.people,
        planet: modified.rawScores.planet - original.rawScores.planet,
        profit: modified.rawScores.profit - original.rawScores.profit,
        overall: modified.overall - original.overall,
      },
    };
  }

  /**
   * Generate score explanation
   */
  explainScore(breakdown: TBLScoreBreakdown): string {
    const { rawScores, grade, percentile } = breakdown;

    const peopleDesc =
      rawScores.people >= 0
        ? `positive impact on people (+${rawScores.people})`
        : `negative impact on people (${rawScores.people})`;
    const planetDesc =
      rawScores.planet >= 0
        ? `positive environmental impact (+${rawScores.planet})`
        : `negative environmental impact (${rawScores.planet})`;
    const profitDesc =
      rawScores.profit >= 0
        ? `positive economic impact (+${rawScores.profit})`
        : `negative economic impact (${rawScores.profit})`;

    return `This legislation receives a grade of ${grade} (${percentile}th percentile). It shows ${peopleDesc}, ${planetDesc}, and ${profitDesc}.`;
  }

  /**
   * Set default weights
   */
  setDefaultWeights(weights: Partial<TBLScoreWeights>): void {
    this.defaultWeights = { ...this.defaultWeights, ...weights };
  }

  /**
   * Get default weights
   */
  getDefaultWeights(): TBLScoreWeights {
    return { ...this.defaultWeights };
  }
}

// Singleton instance
let scorerInstance: TBLScorer | undefined;

export function getTBLScorer(): TBLScorer {
  if (!scorerInstance) {
    scorerInstance = new TBLScorer();
  }
  return scorerInstance;
}
