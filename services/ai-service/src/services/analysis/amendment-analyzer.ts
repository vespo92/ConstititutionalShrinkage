/**
 * Amendment Analyzer Service
 * Analyzes amendments and changes to legislation
 */

import { getLLMClient } from '../llm/client.js';
import type { AmendmentAnalysis, ChangeExplanation } from '../../types/index.js';

export interface Amendment {
  id: string;
  title: string;
  sponsor: string;
  content: string;
  targetSection?: string;
}

export interface AmendmentComparisonResult {
  amendments: Amendment[];
  rankings: {
    amendmentId: string;
    overallScore: number;
    peopleImpact: number;
    planetImpact: number;
    profitImpact: number;
    recommendation: 'adopt' | 'reject' | 'modify';
    reasoning: string;
  }[];
}

export class AmendmentAnalyzer {
  private client = getLLMClient();

  /**
   * Analyze a single amendment
   */
  async analyzeAmendment(
    originalBill: string,
    amendment: Amendment
  ): Promise<AmendmentAnalysis> {
    const prompt = `Analyze this proposed amendment to legislation.

Original Bill:
${originalBill}

Proposed Amendment [${amendment.id}]: ${amendment.title}
Sponsor: ${amendment.sponsor}
${amendment.targetSection ? `Target Section: ${amendment.targetSection}` : ''}

Amendment Content:
${amendment.content}

Analyze:
1. What specific changes does this amendment make?
2. How would it affect People, Planet, and Profit scores?
3. Should this amendment be adopted?

Respond in JSON format:
{
  "changes": [
    {
      "changeType": "addition|removal|modification",
      "originalText": "...",
      "newText": "...",
      "explanation": "...",
      "impact": "..."
    }
  ],
  "impactDelta": {
    "people": -100 to +100,
    "planet": -100 to +100,
    "profit": -100 to +100
  },
  "recommendation": "..."
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      originalBillId: 'original',
      amendmentId: amendment.id,
      changes: result.changes,
      impactDelta: result.impactDelta,
      recommendation: result.recommendation,
    };
  }

  /**
   * Compare multiple amendments
   */
  async compareAmendments(
    originalBill: string,
    amendments: Amendment[]
  ): Promise<AmendmentComparisonResult> {
    const amendmentsSummary = amendments
      .map((a) => `[${a.id}] ${a.title} by ${a.sponsor}:\n${a.content}`)
      .join('\n\n---\n\n');

    const prompt = `Compare these proposed amendments to legislation.

Original Bill:
${originalBill}

Proposed Amendments:
${amendmentsSummary}

Rank and analyze each amendment. Consider impact on People, Planet, and Profit.

Respond in JSON format:
{
  "rankings": [
    {
      "amendmentId": "...",
      "overallScore": 0-100,
      "peopleImpact": -100 to +100,
      "planetImpact": -100 to +100,
      "profitImpact": -100 to +100,
      "recommendation": "adopt|reject|modify",
      "reasoning": "..."
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      amendments,
      rankings: result.rankings,
    };
  }

  /**
   * Suggest improvements to an amendment
   */
  async suggestImprovements(
    originalBill: string,
    amendment: Amendment
  ): Promise<{
    suggestions: string[];
    improvedText: string;
    rationale: string;
  }> {
    const prompt = `Suggest improvements to this proposed amendment.

Original Bill:
${originalBill}

Amendment [${amendment.id}]: ${amendment.title}
${amendment.content}

Provide suggestions to improve this amendment for better outcomes on People, Planet, and Profit.

Respond in JSON format:
{
  "suggestions": ["...", "..."],
  "improvedText": "...",
  "rationale": "..."
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Identify conflicting amendments
   */
  async findConflictingAmendments(
    amendments: Amendment[]
  ): Promise<{
    conflicts: {
      amendment1: string;
      amendment2: string;
      conflictDescription: string;
      resolution: string;
    }[];
  }> {
    const amendmentsSummary = amendments
      .map((a) => `[${a.id}] ${a.title}:\n${a.content}`)
      .join('\n\n---\n\n');

    const prompt = `Identify conflicts between these proposed amendments.

Amendments:
${amendmentsSummary}

Find any amendments that conflict with each other.

Respond in JSON format:
{
  "conflicts": [
    {
      "amendment1": "id",
      "amendment2": "id",
      "conflictDescription": "...",
      "resolution": "..."
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Simulate the combined effect of multiple amendments
   */
  async simulateCombinedEffect(
    originalBill: string,
    amendments: Amendment[]
  ): Promise<{
    combinedBill: string;
    netImpact: { people: number; planet: number; profit: number };
    warnings: string[];
    synergies: string[];
  }> {
    const amendmentsSummary = amendments
      .map((a) => `[${a.id}] ${a.title}:\n${a.content}`)
      .join('\n\n');

    const prompt = `Simulate applying all these amendments to the original bill.

Original Bill:
${originalBill}

Amendments to Apply:
${amendmentsSummary}

Show the combined effect and any interactions between amendments.

Respond in JSON format:
{
  "combinedBill": "brief summary of resulting bill",
  "netImpact": {
    "people": -100 to +100,
    "planet": -100 to +100,
    "profit": -100 to +100
  },
  "warnings": ["potential issues..."],
  "synergies": ["positive interactions..."]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }
}

// Singleton instance
let analyzerInstance: AmendmentAnalyzer | undefined;

export function getAmendmentAnalyzer(): AmendmentAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new AmendmentAnalyzer();
  }
  return analyzerInstance;
}
