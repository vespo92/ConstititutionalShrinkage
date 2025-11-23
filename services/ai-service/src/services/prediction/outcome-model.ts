/**
 * Outcome Model Service
 * Predicts voting outcomes and legislative success
 */

import { getLLMClient } from '../llm/client.js';

export interface VotingHistory {
  billId: string;
  category: string;
  yesVotes: number;
  noVotes: number;
  abstentions: number;
  passed: boolean;
}

export interface PoliticalContext {
  majorityParty?: string;
  currentSentiment?: Record<string, number>;
  recentEvents?: string[];
  stakeholderPositions?: Record<string, 'support' | 'oppose' | 'neutral'>;
}

export interface OutcomePrediction {
  predictedOutcome: 'pass' | 'fail' | 'uncertain';
  confidence: number;
  predictedYesPercentage: number;
  predictedNoPercentage: number;
  keyFactors: string[];
  swingVoters: string[];
  risks: string[];
  recommendations: string[];
}

export interface ScenarioAnalysis {
  scenario: string;
  probability: number;
  outcome: 'pass' | 'fail';
  conditions: string[];
}

export class OutcomeModel {
  private client = getLLMClient();
  private historicalData: VotingHistory[] = [];

  /**
   * Predict voting outcome
   */
  async predictOutcome(
    billSummary: string,
    votingHistory: VotingHistory[],
    context: PoliticalContext
  ): Promise<OutcomePrediction> {
    const historyStr = votingHistory
      .slice(0, 10)
      .map(
        (v) =>
          `[${v.category}] ${v.passed ? 'PASSED' : 'FAILED'}: ${v.yesVotes} yes, ${v.noVotes} no`
      )
      .join('\n');

    const contextStr = JSON.stringify(context, null, 2);

    const prompt = `You are analyzing voting patterns to predict likely outcomes.

Bill Summary:
${billSummary}

Historical Voting Data (similar bills):
${historyStr}

Current Political Context:
${contextStr}

Predict the likely voting outcome.

Respond in JSON format:
{
  "predictedOutcome": "pass|fail|uncertain",
  "confidence": 0.0-1.0,
  "predictedYesPercentage": 0-100,
  "predictedNoPercentage": 0-100,
  "keyFactors": ["...", "..."],
  "swingVoters": ["groups or individuals who could change outcome"],
  "risks": ["factors that could change prediction"],
  "recommendations": ["actions to improve chances"]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Analyze different scenarios
   */
  async analyzeScenarios(
    billSummary: string,
    baseContext: PoliticalContext
  ): Promise<ScenarioAnalysis[]> {
    const prompt = `Analyze different scenarios for this bill's passage.

Bill Summary:
${billSummary}

Current Context:
${JSON.stringify(baseContext, null, 2)}

Provide 4-5 different scenarios with their probabilities.

Respond in JSON format:
{
  "scenarios": [
    {
      "scenario": "description of scenario",
      "probability": 0.0-1.0,
      "outcome": "pass|fail",
      "conditions": ["what would need to happen"]
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.scenarios;
  }

  /**
   * Identify key stakeholders
   */
  async identifyStakeholders(
    billSummary: string
  ): Promise<{
    stakeholder: string;
    interest: string;
    likelyPosition: 'support' | 'oppose' | 'neutral';
    influence: 'high' | 'medium' | 'low';
    concerns: string[];
  }[]> {
    const prompt = `Identify key stakeholders for this legislation.

Bill Summary:
${billSummary}

List the main stakeholders who would be affected or interested.

Respond in JSON format:
{
  "stakeholders": [
    {
      "stakeholder": "name or group",
      "interest": "what they care about",
      "likelyPosition": "support|oppose|neutral",
      "influence": "high|medium|low",
      "concerns": ["their main concerns"]
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.stakeholders;
  }

  /**
   * Suggest amendments to improve passage chances
   */
  async suggestStrategicAmendments(
    billSummary: string,
    prediction: OutcomePrediction
  ): Promise<{
    amendment: string;
    targetAudience: string;
    expectedImpact: number;
    tradeoffs: string[];
  }[]> {
    const prompt = `Suggest strategic amendments to improve this bill's chances of passing.

Bill Summary:
${billSummary}

Current Prediction:
- Outcome: ${prediction.predictedOutcome}
- Confidence: ${prediction.confidence}
- Key Factors: ${prediction.keyFactors.join(', ')}
- Risks: ${prediction.risks.join(', ')}

Suggest amendments that could swing votes.

Respond in JSON format:
{
  "amendments": [
    {
      "amendment": "proposed change",
      "targetAudience": "who this would win over",
      "expectedImpact": percentage point change in support,
      "tradeoffs": ["what you might lose"]
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.amendments;
  }

  /**
   * Track prediction accuracy
   */
  trackPrediction(
    prediction: OutcomePrediction,
    actualOutcome: 'pass' | 'fail',
    actualYesPercentage: number
  ): {
    accurate: boolean;
    predictionError: number;
    confidenceCalibration: number;
  } {
    const accurate =
      prediction.predictedOutcome === actualOutcome ||
      (prediction.predictedOutcome === 'uncertain' && prediction.confidence < 0.6);

    const predictionError = Math.abs(
      prediction.predictedYesPercentage - actualYesPercentage
    );

    // How well calibrated was the confidence?
    const expectedError = (1 - prediction.confidence) * 50;
    const confidenceCalibration = 1 - Math.abs(predictionError - expectedError) / 50;

    return {
      accurate,
      predictionError,
      confidenceCalibration: Math.max(0, confidenceCalibration),
    };
  }

  /**
   * Add historical data
   */
  addHistoricalData(history: VotingHistory[]): void {
    this.historicalData.push(...history);
  }

  /**
   * Get similar historical votes
   */
  getSimilarVotes(category: string, limit = 10): VotingHistory[] {
    return this.historicalData
      .filter((v) => v.category === category)
      .slice(0, limit);
  }
}

// Singleton instance
let modelInstance: OutcomeModel | undefined;

export function getOutcomeModel(): OutcomeModel {
  if (!modelInstance) {
    modelInstance = new OutcomeModel();
  }
  return modelInstance;
}
