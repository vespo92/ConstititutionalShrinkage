/**
 * Conflict Detector Service
 * Identifies conflicts between new legislation and existing laws
 */

import { getLLMClient } from '../llm/client.js';
import { renderPrompt } from '../llm/prompts.js';
import type { LegalConflict } from '../../types/index.js';

export interface ExistingLaw {
  id: string;
  title: string;
  summary: string;
  fullText?: string;
}

export interface ConflictDetectionResult {
  conflicts: LegalConflict[];
  analyzed: number;
  potentialConflicts: number;
  directConflicts: number;
  analysisDate: string;
}

export class ConflictDetector {
  private client = getLLMClient();

  /**
   * Find conflicts between a bill and existing laws
   */
  async findConflicts(
    billContent: string,
    existingLaws: ExistingLaw[]
  ): Promise<ConflictDetectionResult> {
    // Summarize existing laws for context
    const lawsSummary = existingLaws
      .map((law) => `[${law.id}] ${law.title}: ${law.summary}`)
      .join('\n\n');

    const prompt = renderPrompt('FIND_CONFLICTS', {
      billContent,
      existingLaws: lawsSummary,
    });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    const conflicts: LegalConflict[] = result.conflicts || [];

    return {
      conflicts,
      analyzed: existingLaws.length,
      potentialConflicts: conflicts.filter((c) => c.conflictType === 'potential').length,
      directConflicts: conflicts.filter((c) => c.conflictType === 'direct').length,
      analysisDate: new Date().toISOString(),
    };
  }

  /**
   * Analyze specific conflict in detail
   */
  async analyzeConflict(
    billContent: string,
    conflictingLaw: ExistingLaw
  ): Promise<{
    conflict: LegalConflict;
    detailedAnalysis: string;
    possibleResolutions: string[];
    precedents: string[];
  }> {
    const prompt = `You are a legal expert analyzing a specific conflict between legislation.

New Bill:
${billContent}

Conflicting Law [${conflictingLaw.id}] ${conflictingLaw.title}:
${conflictingLaw.fullText || conflictingLaw.summary}

Provide a detailed analysis of the conflict, possible resolutions, and relevant precedents.

Respond in JSON format:
{
  "conflict": {
    "conflictingLawId": "${conflictingLaw.id}",
    "conflictingLawTitle": "${conflictingLaw.title}",
    "conflictType": "direct|indirect|potential",
    "description": "...",
    "resolution": "..."
  },
  "detailedAnalysis": "...",
  "possibleResolutions": ["...", "..."],
  "precedents": ["...", "..."]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Check for internal consistency within a bill
   */
  async checkInternalConsistency(billContent: string): Promise<{
    consistent: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze this legislation for internal consistency.
Look for contradictions, ambiguities, or sections that conflict with each other.

Bill Text:
${billContent}

Respond in JSON format:
{
  "consistent": true/false,
  "issues": ["...", "..."],
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
   * Find superseded provisions
   */
  async findSupersededProvisions(
    newBill: string,
    existingLaws: ExistingLaw[]
  ): Promise<{
    superseded: { lawId: string; provisions: string[] }[];
    explanation: string;
  }> {
    const lawsSummary = existingLaws
      .map((law) => `[${law.id}] ${law.title}: ${law.summary}`)
      .join('\n\n');

    const prompt = `Identify which provisions in existing laws would be superseded by this new bill.

New Bill:
${newBill}

Existing Laws:
${lawsSummary}

Respond in JSON format:
{
  "superseded": [
    {"lawId": "...", "provisions": ["...", "..."]}
  ],
  "explanation": "..."
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }
}

// Singleton instance
let detectorInstance: ConflictDetector | undefined;

export function getConflictDetector(): ConflictDetector {
  if (!detectorInstance) {
    detectorInstance = new ConflictDetector();
  }
  return detectorInstance;
}
