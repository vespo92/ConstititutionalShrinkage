/**
 * Impact Predictor Service
 * Predicts the overall impact of legislation
 */

import { getLLMClient } from '../llm/client.js';
import type { TBLImpactReport, Factor, RegionalComparison } from '../../types/index.js';

export interface PredictionContext {
  region: string;
  population?: number;
  economicIndicators?: Record<string, number>;
  environmentalBaseline?: Record<string, number>;
}

export class ImpactPredictor {
  private client = getLLMClient();

  /**
   * Predict overall impact of a bill
   */
  async predictImpact(
    billContent: string,
    context: PredictionContext
  ): Promise<TBLImpactReport> {
    const prompt = `You are an expert policy analyst predicting Triple Bottom Line impacts.

Bill Text:
${billContent}

Region: ${context.region}
${context.population ? `Population: ${context.population.toLocaleString()}` : ''}
${context.economicIndicators ? `Economic Indicators: ${JSON.stringify(context.economicIndicators)}` : ''}
${context.environmentalBaseline ? `Environmental Baseline: ${JSON.stringify(context.environmentalBaseline)}` : ''}

Analyze the potential impact on People, Planet, and Profit. Consider:
- People: Health, education, equality, quality of life, civil rights
- Planet: Carbon emissions, resource usage, biodiversity, sustainability
- Profit: Economic growth, jobs, tax revenue, business impact

Respond in JSON format:
{
  "people": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "affectedPopulation": number,
    "inequalityImpact": "...",
    "demographics": ["...", "..."]
  },
  "planet": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "carbonImpact": number (tons CO2),
    "resourceImpact": "...",
    "sustainabilityRating": "A|B|C|D|F"
  },
  "profit": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "economicImpact": number ($),
    "jobsImpact": number,
    "gdpEffect": "..."
  },
  "overall": -100 to +100,
  "confidence": 0.0-1.0,
  "methodology": "..."
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      ...result,
      region: context.region,
      analysisDate: new Date().toISOString(),
    };
  }

  /**
   * Compare impact across multiple regions
   */
  async compareRegionalImpact(
    billContent: string,
    regions: string[]
  ): Promise<RegionalComparison> {
    const impacts = await Promise.all(
      regions.map(async (region) => ({
        region,
        impact: await this.predictImpact(billContent, { region }),
      }))
    );

    const summary = this.generateComparisonSummary(impacts);

    return {
      billId: 'analysis',
      regions: impacts,
      summary,
    };
  }

  /**
   * Predict specific demographic impacts
   */
  async predictDemographicImpact(
    billContent: string,
    demographics: string[]
  ): Promise<{
    demographic: string;
    impact: number;
    positives: string[];
    negatives: string[];
  }[]> {
    const prompt = `Analyze how this legislation would affect different demographic groups.

Bill Text:
${billContent}

Demographics to analyze: ${demographics.join(', ')}

For each group, predict the impact.

Respond in JSON format:
{
  "impacts": [
    {
      "demographic": "...",
      "impact": -100 to +100,
      "positives": ["...", "..."],
      "negatives": ["...", "..."]
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.impacts;
  }

  /**
   * Generate uncertainty analysis
   */
  async analyzeUncertainty(
    billContent: string,
    prediction: TBLImpactReport
  ): Promise<{
    uncertainFactors: string[];
    bestCase: { people: number; planet: number; profit: number };
    worstCase: { people: number; planet: number; profit: number };
    keyAssumptions: string[];
    dataGaps: string[];
  }> {
    const prompt = `Analyze the uncertainty in this impact prediction.

Bill Summary (first 1000 chars):
${billContent.slice(0, 1000)}

Current Prediction:
- People: ${prediction.people.score}
- Planet: ${prediction.planet.score}
- Profit: ${prediction.profit.score}
- Confidence: ${prediction.confidence}

Identify sources of uncertainty and provide ranges.

Respond in JSON format:
{
  "uncertainFactors": ["...", "..."],
  "bestCase": {"people": number, "planet": number, "profit": number},
  "worstCase": {"people": number, "planet": number, "profit": number},
  "keyAssumptions": ["...", "..."],
  "dataGaps": ["...", "..."]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Generate comparison summary
   */
  private generateComparisonSummary(
    impacts: { region: string; impact: TBLImpactReport }[]
  ): string {
    const sorted = impacts.sort((a, b) => b.impact.overall - a.impact.overall);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    return `Regional analysis shows ${best.region} would benefit most (overall score: ${best.impact.overall}) while ${worst.region} shows the least benefit (overall score: ${worst.impact.overall}). Average impact across all regions: ${(impacts.reduce((sum, i) => sum + i.impact.overall, 0) / impacts.length).toFixed(1)}.`;
  }
}

// Singleton instance
let predictorInstance: ImpactPredictor | undefined;

export function getImpactPredictor(): ImpactPredictor {
  if (!predictorInstance) {
    predictorInstance = new ImpactPredictor();
  }
  return predictorInstance;
}
