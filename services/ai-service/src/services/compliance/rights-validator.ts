/**
 * Rights Validator Service
 * Validates legislation against specific rights
 */

import { getLLMClient } from '../llm/client.js';
import { renderPrompt } from '../llm/prompts.js';
import type { RightAnalysis } from '../../types/index.js';

export interface Right {
  id: string;
  name: string;
  description: string;
  constitutionalBasis: string;
  category: 'civil' | 'political' | 'economic' | 'social' | 'environmental';
}

// Core rights catalog
export const RIGHTS_CATALOG: Right[] = [
  {
    id: 'free-speech',
    name: 'Freedom of Speech',
    description: 'The right to express opinions without government censorship',
    constitutionalBasis: 'Article I, Section 2',
    category: 'civil',
  },
  {
    id: 'privacy',
    name: 'Right to Privacy',
    description: 'Protection from unreasonable government intrusion into personal matters',
    constitutionalBasis: 'Article I, Section 3',
    category: 'civil',
  },
  {
    id: 'due-process',
    name: 'Due Process',
    description: 'Right to fair treatment through the judicial system',
    constitutionalBasis: 'Article I, Section 4',
    category: 'civil',
  },
  {
    id: 'equal-protection',
    name: 'Equal Protection',
    description: 'Equal treatment under the law regardless of characteristics',
    constitutionalBasis: 'Article I, Section 1',
    category: 'civil',
  },
  {
    id: 'assembly',
    name: 'Freedom of Assembly',
    description: 'Right to gather peacefully for any purpose',
    constitutionalBasis: 'Article I, Section 2',
    category: 'political',
  },
  {
    id: 'vote',
    name: 'Right to Vote',
    description: 'Right to participate in democratic elections',
    constitutionalBasis: 'Article II, Section 1',
    category: 'political',
  },
  {
    id: 'economic-opportunity',
    name: 'Economic Opportunity',
    description: 'Fair access to economic opportunities',
    constitutionalBasis: 'Article IV, Section 1',
    category: 'economic',
  },
  {
    id: 'clean-environment',
    name: 'Right to Clean Environment',
    description: 'Right to a healthy and sustainable environment',
    constitutionalBasis: 'Article III, Section 1',
    category: 'environmental',
  },
];

export class RightsValidator {
  private client = getLLMClient();
  private rights: Right[];

  constructor(customRights?: Right[]) {
    this.rights = customRights || RIGHTS_CATALOG;
  }

  /**
   * Check a bill against a specific right
   */
  async checkRight(billContent: string, rightId: string): Promise<RightAnalysis> {
    const right = this.rights.find((r) => r.id === rightId);
    if (!right) {
      throw new Error(`Right not found: ${rightId}`);
    }

    const rightDescription = `${right.name}: ${right.description}\nConstitutional Basis: ${right.constitutionalBasis}`;

    const prompt = renderPrompt('CHECK_RIGHT', {
      right: rightDescription,
      billContent,
    });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Check a bill against all rights
   */
  async checkAllRights(billContent: string): Promise<{
    analyses: RightAnalysis[];
    overallCompliant: boolean;
    criticalIssues: string[];
    summary: string;
  }> {
    const analyses = await Promise.all(
      this.rights.map((right) => this.checkRight(billContent, right.id))
    );

    const nonCompliant = analyses.filter((a) => !a.compliant);
    const criticalIssues = nonCompliant.flatMap((a) => a.concerns);

    return {
      analyses,
      overallCompliant: nonCompliant.length === 0,
      criticalIssues,
      summary: this.generateSummary(analyses),
    };
  }

  /**
   * Check rights by category
   */
  async checkRightsByCategory(
    billContent: string,
    category: Right['category']
  ): Promise<RightAnalysis[]> {
    const categoryRights = this.rights.filter((r) => r.category === category);
    return Promise.all(
      categoryRights.map((right) => this.checkRight(billContent, right.id))
    );
  }

  /**
   * Get impact score for a specific right
   */
  async getRightImpactScore(
    billContent: string,
    rightId: string
  ): Promise<{
    rightId: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
    explanation: string;
  }> {
    const analysis = await this.checkRight(billContent, rightId);

    // Calculate score based on concerns vs protections
    const protectionWeight = analysis.protections.length;
    const concernWeight = analysis.concerns.length * 2; // Concerns weighted more heavily

    let score = 50; // Neutral baseline
    score += protectionWeight * 10;
    score -= concernWeight * 15;
    score = Math.max(0, Math.min(100, score));

    let impact: 'positive' | 'negative' | 'neutral';
    if (score > 60) impact = 'positive';
    else if (score < 40) impact = 'negative';
    else impact = 'neutral';

    return {
      rightId,
      score,
      impact,
      explanation: analysis.analysis,
    };
  }

  /**
   * Generate rights impact matrix
   */
  async generateImpactMatrix(
    billContent: string
  ): Promise<{
    matrix: {
      rightId: string;
      rightName: string;
      category: string;
      score: number;
      status: 'protected' | 'at-risk' | 'neutral';
    }[];
    recommendations: string[];
  }> {
    const analyses = await this.checkAllRights(billContent);

    const matrix = analyses.analyses.map((analysis) => {
      const right = this.rights.find((r) => r.id === analysis.rightId)!;
      const score = analysis.compliant ? 75 : 25;

      return {
        rightId: analysis.rightId,
        rightName: analysis.rightName,
        category: right.category,
        score,
        status: analysis.compliant
          ? analysis.protections.length > 0
            ? 'protected'
            : 'neutral'
          : 'at-risk',
      };
    });

    const atRisk = matrix.filter((m) => m.status === 'at-risk');
    const recommendations = atRisk.map(
      (m) => `Address concerns related to ${m.rightName}`
    );

    return { matrix, recommendations };
  }

  /**
   * Generate summary from analyses
   */
  private generateSummary(analyses: RightAnalysis[]): string {
    const compliant = analyses.filter((a) => a.compliant).length;
    const total = analyses.length;
    const nonCompliant = analyses.filter((a) => !a.compliant);

    if (nonCompliant.length === 0) {
      return `All ${total} rights analyzed are respected by this legislation.`;
    }

    const issueRights = nonCompliant.map((a) => a.rightName).join(', ');
    return `${compliant} of ${total} rights are fully compliant. Concerns exist for: ${issueRights}.`;
  }

  /**
   * Get rights catalog
   */
  getRights(): Right[] {
    return this.rights;
  }

  /**
   * Get right by ID
   */
  getRight(id: string): Right | undefined {
    return this.rights.find((r) => r.id === id);
  }
}

// Singleton instance
let validatorInstance: RightsValidator | undefined;

export function getRightsValidator(customRights?: Right[]): RightsValidator {
  if (customRights || !validatorInstance) {
    validatorInstance = new RightsValidator(customRights);
  }
  return validatorInstance;
}
