/**
 * Precedent Finder Service
 * Finds relevant legal precedents for legislation
 */

import { getLLMClient } from '../llm/client.js';
import type { Precedent } from '../../types/index.js';

export interface PrecedentDatabase {
  cases: CaseRecord[];
}

export interface CaseRecord {
  id: string;
  name: string;
  year: number;
  court: string;
  summary: string;
  ruling: string;
  topics: string[];
  significance: 'landmark' | 'significant' | 'notable' | 'minor';
}

// Sample precedent database
const SAMPLE_PRECEDENTS: CaseRecord[] = [
  {
    id: 'case-001',
    name: 'Citizens Rights Foundation v. State',
    year: 2020,
    court: 'Supreme Court',
    summary: 'Established limits on government surveillance of citizens',
    ruling: 'Government surveillance programs must have judicial oversight',
    topics: ['privacy', 'surveillance', 'civil-rights'],
    significance: 'landmark',
  },
  {
    id: 'case-002',
    name: 'Environmental Coalition v. Industrial Corp',
    year: 2019,
    court: 'Federal Court',
    summary: 'Set standards for environmental impact assessments',
    ruling: 'Major projects require comprehensive environmental review',
    topics: ['environment', 'regulation', 'industry'],
    significance: 'significant',
  },
  {
    id: 'case-003',
    name: 'Free Speech Alliance v. City Council',
    year: 2021,
    court: 'Appeals Court',
    summary: 'Clarified limits on content-based restrictions',
    ruling: 'Content-neutral time, place, manner restrictions are permissible',
    topics: ['free-speech', 'assembly', 'local-government'],
    significance: 'notable',
  },
];

export class PrecedentFinder {
  private client = getLLMClient();
  private database: CaseRecord[];

  constructor(database?: PrecedentDatabase) {
    this.database = database?.cases || SAMPLE_PRECEDENTS;
  }

  /**
   * Find precedents relevant to a bill
   */
  async findPrecedents(billContent: string, limit = 5): Promise<Precedent[]> {
    // First, identify topics in the bill
    const topics = await this.identifyTopics(billContent);

    // Find matching cases
    const matchingCases = this.database
      .filter((c) => c.topics.some((t) => topics.includes(t)))
      .slice(0, limit * 2); // Get more for LLM filtering

    if (matchingCases.length === 0) {
      return this.findGeneralPrecedents(billContent, limit);
    }

    // Use LLM to rank and select most relevant
    return this.rankPrecedents(billContent, matchingCases, limit);
  }

  /**
   * Identify topics in bill content
   */
  private async identifyTopics(billContent: string): Promise<string[]> {
    const prompt = `Identify the main legal topics in this legislation.

Bill Text:
${billContent.slice(0, 2000)}

Return a JSON array of topic keywords (lowercase, hyphenated).
Example: ["privacy", "free-speech", "environment"]

Respond with: {"topics": [...]}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.topics || [];
  }

  /**
   * Rank precedents by relevance
   */
  private async rankPrecedents(
    billContent: string,
    cases: CaseRecord[],
    limit: number
  ): Promise<Precedent[]> {
    const caseSummaries = cases
      .map((c) => `[${c.id}] ${c.name} (${c.year}): ${c.summary}`)
      .join('\n');

    const prompt = `Rank these legal precedents by relevance to the given legislation.

Bill Summary (first 1000 chars):
${billContent.slice(0, 1000)}

Available Precedents:
${caseSummaries}

Select the ${limit} most relevant cases and explain why.

Respond in JSON format:
{
  "precedents": [
    {
      "caseId": "...",
      "relevance": 0.0-1.0,
      "implications": "how this precedent applies..."
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return result.precedents.map((p: { caseId: string; relevance: number; implications: string }) => {
      const caseRecord = cases.find((c) => c.id === p.caseId);
      return {
        caseId: p.caseId,
        caseName: caseRecord?.name || 'Unknown Case',
        relevance: p.relevance,
        summary: caseRecord?.summary || '',
        ruling: caseRecord?.ruling || '',
        implications: p.implications,
      };
    });
  }

  /**
   * Find general precedents when no topic matches
   */
  private async findGeneralPrecedents(
    billContent: string,
    limit: number
  ): Promise<Precedent[]> {
    const prompt = `Based on this legislation, suggest what types of legal precedents would be relevant.

Bill Text (first 1000 chars):
${billContent.slice(0, 1000)}

Describe ${limit} hypothetical precedents that would be relevant.

Respond in JSON format:
{
  "precedents": [
    {
      "caseId": "hypothetical-1",
      "caseName": "hypothetical case name",
      "relevance": 0.0-1.0,
      "summary": "what this case would establish",
      "ruling": "likely ruling",
      "implications": "how it would apply"
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.precedents;
  }

  /**
   * Analyze how a precedent applies to a bill
   */
  async analyzePrecedentApplication(
    billContent: string,
    precedent: Precedent
  ): Promise<{
    applies: boolean;
    strength: 'strong' | 'moderate' | 'weak';
    analysis: string;
    distinguishingFactors: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze how this legal precedent applies to the given legislation.

Precedent: ${precedent.caseName}
Ruling: ${precedent.ruling}
Summary: ${precedent.summary}

Bill Text (first 1500 chars):
${billContent.slice(0, 1500)}

Provide detailed analysis.

Respond in JSON format:
{
  "applies": true/false,
  "strength": "strong|moderate|weak",
  "analysis": "...",
  "distinguishingFactors": ["...", "..."],
  "recommendations": ["...", "..."]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Add a case to the database
   */
  addCase(caseRecord: CaseRecord): void {
    this.database.push(caseRecord);
  }

  /**
   * Search cases by keyword
   */
  searchCases(keyword: string): CaseRecord[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.database.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerKeyword) ||
        c.summary.toLowerCase().includes(lowerKeyword) ||
        c.topics.some((t) => t.includes(lowerKeyword))
    );
  }

  /**
   * Get all cases
   */
  getAllCases(): CaseRecord[] {
    return this.database;
  }
}

// Singleton instance
let finderInstance: PrecedentFinder | undefined;

export function getPrecedentFinder(database?: PrecedentDatabase): PrecedentFinder {
  if (database || !finderInstance) {
    finderInstance = new PrecedentFinder(database);
  }
  return finderInstance;
}
