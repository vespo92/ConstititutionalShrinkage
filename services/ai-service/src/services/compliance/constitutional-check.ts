/**
 * Constitutional Compliance Checker
 * Validates legislation against constitutional requirements
 */

import { getLLMClient } from '../llm/client.js';
import { renderPrompt } from '../llm/prompts.js';
import type {
  ComplianceReport,
  ConstitutionalIssue,
  Article,
} from '../../types/index.js';

export interface ConstitutionConfig {
  text: string;
  articles: Article[];
}

// Default constitution text (placeholder)
const DEFAULT_CONSTITUTION = `
CONSTITUTIONAL FRAMEWORK FOR GOVERNANCE

ARTICLE I - FUNDAMENTAL RIGHTS
Section 1. All citizens shall have equal rights under the law.
Section 2. Freedom of speech, assembly, and petition shall not be abridged.
Section 3. Privacy rights shall be protected from unreasonable intrusion.
Section 4. Due process shall be guaranteed in all proceedings.

ARTICLE II - GOVERNANCE STRUCTURE
Section 1. Power derives from the consent of the governed.
Section 2. Separation of powers shall be maintained.
Section 3. Transparency in government operations is required.

ARTICLE III - ENVIRONMENTAL PROTECTION
Section 1. The environment shall be protected for future generations.
Section 2. Sustainable practices shall be encouraged.

ARTICLE IV - ECONOMIC RIGHTS
Section 1. Fair economic opportunity shall be available to all.
Section 2. Anti-monopoly provisions shall be enforced.

ARTICLE V - AMENDMENT PROCESS
Section 1. This constitution may be amended by supermajority vote.
`;

export class ConstitutionalChecker {
  private client = getLLMClient();
  private constitution: string;
  private articles: Article[];

  constructor(config?: ConstitutionConfig) {
    this.constitution = config?.text || DEFAULT_CONSTITUTION;
    this.articles = config?.articles || this.parseArticles(this.constitution);
  }

  /**
   * Check bill for constitutional compliance
   */
  async checkCompliance(billContent: string): Promise<ComplianceReport> {
    const prompt = renderPrompt('CHECK_COMPLIANCE', {
      constitution: this.constitution,
      billContent,
    });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      score: result.score,
      compliant: result.compliant,
      issues: result.issues || [],
      relevantArticles: result.relevantArticles || [],
      recommendations: result.recommendations || [],
      analysisDate: new Date().toISOString(),
    };
  }

  /**
   * Check specific sections of a bill
   */
  async checkSections(
    sections: { id: string; content: string }[]
  ): Promise<{
    sectionId: string;
    compliant: boolean;
    issues: ConstitutionalIssue[];
  }[]> {
    const results = await Promise.all(
      sections.map(async (section) => {
        const report = await this.checkCompliance(section.content);
        return {
          sectionId: section.id,
          compliant: report.compliant,
          issues: report.issues,
        };
      })
    );

    return results;
  }

  /**
   * Get detailed analysis for a specific issue
   */
  async analyzeIssue(
    issue: ConstitutionalIssue,
    billContent: string
  ): Promise<{
    issue: ConstitutionalIssue;
    detailedAnalysis: string;
    legalPrecedents: string[];
    remediationOptions: string[];
  }> {
    const prompt = `Provide detailed analysis of this constitutional compliance issue.

Constitutional Article: ${issue.article}
Issue: ${issue.description}
Problematic Text: ${issue.excerpt}

Bill Context:
${billContent}

Respond in JSON format:
{
  "detailedAnalysis": "...",
  "legalPrecedents": ["...", "..."],
  "remediationOptions": ["...", "..."]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      issue,
      ...result,
    };
  }

  /**
   * Suggest compliant alternatives
   */
  async suggestCompliantAlternatives(
    problematicText: string,
    issue: ConstitutionalIssue
  ): Promise<{
    alternatives: {
      text: string;
      complianceScore: number;
      tradeoffs: string;
    }[];
  }> {
    const prompt = `Suggest constitutionally compliant alternatives to this text.

Problematic Text:
${problematicText}

Constitutional Issue:
Article: ${issue.article}
Problem: ${issue.description}

Provide 3 alternative versions that would be constitutionally compliant.

Respond in JSON format:
{
  "alternatives": [
    {
      "text": "...",
      "complianceScore": 0-100,
      "tradeoffs": "..."
    }
  ]
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Generate compliance report summary
   */
  async generateReportSummary(report: ComplianceReport): Promise<{
    executiveSummary: string;
    keyFindings: string[];
    actionItems: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const prompt = `Generate an executive summary of this constitutional compliance report.

Report:
${JSON.stringify(report, null, 2)}

Provide a concise summary for decision-makers.

Respond in JSON format:
{
  "executiveSummary": "...",
  "keyFindings": ["...", "..."],
  "actionItems": ["...", "..."],
  "riskLevel": "low|medium|high|critical"
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Parse articles from constitution text
   */
  private parseArticles(constitution: string): Article[] {
    const articles: Article[] = [];
    const articlePattern = /ARTICLE\s+([IVXLC]+)\s*-\s*([^\n]+)/g;
    let match;

    while ((match = articlePattern.exec(constitution)) !== null) {
      const id = match[1];
      const title = match[2].trim();

      // Extract content until next article or end
      const startIndex = match.index + match[0].length;
      const endIndex = constitution.indexOf('ARTICLE', startIndex);
      const content =
        endIndex > -1
          ? constitution.slice(startIndex, endIndex).trim()
          : constitution.slice(startIndex).trim();

      articles.push({
        id: `article-${id}`,
        title,
        content,
        relevance: 1.0,
      });
    }

    return articles;
  }

  /**
   * Update constitution text
   */
  setConstitution(text: string): void {
    this.constitution = text;
    this.articles = this.parseArticles(text);
  }

  /**
   * Get all articles
   */
  getArticles(): Article[] {
    return this.articles;
  }
}

// Singleton instance
let checkerInstance: ConstitutionalChecker | undefined;

export function getConstitutionalChecker(
  config?: ConstitutionConfig
): ConstitutionalChecker {
  if (config || !checkerInstance) {
    checkerInstance = new ConstitutionalChecker(config);
  }
  return checkerInstance;
}
