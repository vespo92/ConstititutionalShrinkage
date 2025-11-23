/**
 * Policy comparison service
 */

import {
  TBLAggregator,
  TradeOffAnalyzer,
  PolicySimulation,
  ComparisonResult,
  PolicyOutcome,
  PolicyRanking,
  TBLScore,
  computeParetoFrontier,
  weightedSum
} from '@constitutional/modeling';
import { simulationRunner } from './runner';

export class ComparisonService {
  private aggregator: TBLAggregator;
  private tradeOffAnalyzer: TradeOffAnalyzer;

  constructor() {
    this.aggregator = new TBLAggregator();
    this.tradeOffAnalyzer = new TradeOffAnalyzer();
  }

  /**
   * Compare multiple policies
   */
  async compare(
    simulationIds: string[],
    region: string,
    timeHorizon: number
  ): Promise<ComparisonResult> {
    if (simulationIds.length < 2) {
      throw new Error('At least 2 simulations required for comparison');
    }

    // Get all simulations
    const simulations = await Promise.all(
      simulationIds.map(id => simulationRunner.get(id))
    );

    // Validate all exist and have results
    const validSimulations = simulations.filter(
      s => s !== null && s.result !== undefined
    );

    if (validSimulations.length < 2) {
      throw new Error('Not enough completed simulations for comparison');
    }

    // Build policy outcomes
    const outcomes: PolicyOutcome[] = validSimulations.map(sim => ({
      policyId: sim!.id,
      policyName: `Policy ${sim!.config.billId}`,
      tblScore: {
        people: sim!.result!.people.predicted,
        planet: sim!.result!.planet.predicted,
        profit: sim!.result!.profit.predicted
      },
      confidence: 0.85
    }));

    // Calculate rankings
    const rankings = this.calculateRankings(outcomes);

    // Calculate trade-off matrix
    const tradeOffMatrix = this.calculateTradeOffMatrix(outcomes);

    // Find Pareto frontier
    const paretoFrontier = computeParetoFrontier(
      outcomes,
      [
        o => o.tblScore.people,
        o => o.tblScore.planet,
        o => o.tblScore.profit
      ],
      [true, true, true]
    ).map(o => o.policyId);

    // Generate recommendations
    const recommendation = this.generateRecommendation(outcomes, rankings, paretoFrontier);

    return {
      policies: outcomes,
      rankings,
      tradeOffMatrix,
      paretoFrontier,
      recommendation
    };
  }

  /**
   * Calculate rankings for each dimension
   */
  private calculateRankings(outcomes: PolicyOutcome[]): {
    overall: PolicyRanking[];
    byPeople: PolicyRanking[];
    byPlanet: PolicyRanking[];
    byProfit: PolicyRanking[];
  } {
    // Overall ranking (weighted average)
    const overall = this.rankByScore(outcomes, o =>
      weightedSum(
        [o.tblScore.people, o.tblScore.planet, o.tblScore.profit],
        [1, 1, 1]
      )
    );

    // Individual dimension rankings
    const byPeople = this.rankByScore(outcomes, o => o.tblScore.people);
    const byPlanet = this.rankByScore(outcomes, o => o.tblScore.planet);
    const byProfit = this.rankByScore(outcomes, o => o.tblScore.profit);

    return { overall, byPeople, byPlanet, byProfit };
  }

  /**
   * Rank outcomes by a scoring function
   */
  private rankByScore(
    outcomes: PolicyOutcome[],
    scoreFunc: (o: PolicyOutcome) => number
  ): PolicyRanking[] {
    const scored = outcomes.map(o => ({
      policyId: o.policyId,
      score: scoreFunc(o),
      rank: 0
    }));

    scored.sort((a, b) => b.score - a.score);
    scored.forEach((item, index) => {
      item.rank = index + 1;
    });

    return scored;
  }

  /**
   * Calculate trade-off matrix
   */
  private calculateTradeOffMatrix(outcomes: PolicyOutcome[]): number[][] {
    const n = outcomes.length;
    const matrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          row.push(0);
        } else {
          // Calculate relative advantage of i over j
          const iScore = weightedSum(
            [outcomes[i].tblScore.people, outcomes[i].tblScore.planet, outcomes[i].tblScore.profit],
            [1, 1, 1]
          );
          const jScore = weightedSum(
            [outcomes[j].tblScore.people, outcomes[j].tblScore.planet, outcomes[j].tblScore.profit],
            [1, 1, 1]
          );
          row.push(iScore - jScore);
        }
      }
      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Generate recommendation based on analysis
   */
  private generateRecommendation(
    outcomes: PolicyOutcome[],
    rankings: {
      overall: PolicyRanking[];
      byPeople: PolicyRanking[];
      byPlanet: PolicyRanking[];
      byProfit: PolicyRanking[];
    },
    paretoFrontier: string[]
  ): ComparisonResult['recommendation'] {
    const bestOverall = rankings.overall[0].policyId;
    const bestForPeople = rankings.byPeople[0].policyId;
    const bestForPlanet = rankings.byPlanet[0].policyId;
    const bestForProfit = rankings.byProfit[0].policyId;

    // Find balanced choice (best among Pareto frontier)
    let balancedChoice = paretoFrontier[0] || bestOverall;
    let minVariance = Infinity;

    for (const policyId of paretoFrontier) {
      const outcome = outcomes.find(o => o.policyId === policyId);
      if (outcome) {
        const variance = this.calculateVariance([
          outcome.tblScore.people,
          outcome.tblScore.planet,
          outcome.tblScore.profit
        ]);
        if (variance < minVariance) {
          minVariance = variance;
          balancedChoice = policyId;
        }
      }
    }

    // Generate reasoning
    const reasoningParts: string[] = [];

    if (bestOverall === bestForPeople && bestOverall === bestForPlanet && bestOverall === bestForProfit) {
      reasoningParts.push(`Policy ${bestOverall} dominates across all dimensions.`);
    } else {
      reasoningParts.push(`Different policies excel in different dimensions.`);
      if (paretoFrontier.length > 1) {
        reasoningParts.push(`${paretoFrontier.length} policies are Pareto-optimal.`);
      }
    }

    return {
      bestOverall,
      bestForPeople,
      bestForPlanet,
      bestForProfit,
      balancedChoice,
      reasoning: reasoningParts.join(' ')
    };
  }

  /**
   * Calculate variance of values
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

export const comparisonService = new ComparisonService();
