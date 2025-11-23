/**
 * Bill Analyzer Service
 * Comprehensive analysis of legislation
 */

import { getLLMClient } from '../llm/client.js';
import { renderPrompt } from '../llm/prompts.js';
import type {
  BillSummary,
  BillAnalysis,
  SectionExplanation,
  DiffExplanation,
  CategoryClassification,
} from '../../types/index.js';

export interface AnalyzerOptions {
  includeCompliance?: boolean;
  includeImpact?: boolean;
  region?: string;
  constitution?: string;
}

export class BillAnalyzer {
  private client = getLLMClient();

  /**
   * Generate a plain-language summary of a bill
   */
  async summarizeBill(billContent: string): Promise<BillSummary> {
    const prompt = renderPrompt('SUMMARIZE_BILL', { billContent });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      summary: result.summary,
      keyPoints: result.keyPoints,
      affectedGroups: result.affectedGroups,
      tldr: result.tldr,
      readingLevel: this.assessReadingLevel(result.summary),
      wordCount: billContent.split(/\s+/).length,
    };
  }

  /**
   * Explain a specific section of a bill
   */
  async explainSection(section: string, context: string): Promise<SectionExplanation> {
    const prompt = renderPrompt('EXPLAIN_SECTION', { section, context });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      section,
      explanation: result.explanation,
      legalTerms: result.legalTerms || [],
    };
  }

  /**
   * Explain changes between bill versions
   */
  async explainChanges(original: string, amended: string): Promise<DiffExplanation> {
    const prompt = renderPrompt('EXPLAIN_CHANGES', { original, amended });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Categorize a bill
   */
  async categorizeBill(billContent: string): Promise<CategoryClassification[]> {
    const categories = [
      'Healthcare',
      'Education',
      'Environment',
      'Economy',
      'Infrastructure',
      'Civil Rights',
      'Defense',
      'Immigration',
      'Technology',
      'Agriculture',
      'Housing',
      'Labor',
      'Criminal Justice',
      'Transportation',
      'Energy',
    ].join(', ');

    const prompt = renderPrompt('CATEGORIZE_BILL', { billContent, categories });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.categories;
  }

  /**
   * Extract keywords from a bill
   */
  async extractKeywords(billContent: string): Promise<string[]> {
    const prompt = `Extract the most important keywords and phrases from this legislation.
    Return only the top 10-15 keywords as a JSON array.

    Bill Text:
    ${billContent}

    Respond with: {"keywords": ["...", "..."]}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);
    return result.keywords;
  }

  /**
   * Perform full bill analysis
   */
  async analyzeBill(
    billId: string,
    billContent: string,
    options: AnalyzerOptions = {}
  ): Promise<BillAnalysis> {
    // Parallel execution of independent analyses
    const [summary, categories, keywords] = await Promise.all([
      this.summarizeBill(billContent),
      this.categorizeBill(billContent),
      this.extractKeywords(billContent),
    ]);

    // These would be filled in by compliance and impact services
    const analysis: BillAnalysis = {
      billId,
      summary,
      compliance: {
        score: 100,
        compliant: true,
        issues: [],
        relevantArticles: [],
        recommendations: [],
        analysisDate: new Date().toISOString(),
        billId,
      },
      impact: {
        people: {
          score: 0,
          factors: [],
          affectedPopulation: 0,
          inequalityImpact: 'Neutral',
          demographics: [],
        },
        planet: {
          score: 0,
          factors: [],
          carbonImpact: 0,
          resourceImpact: 'Neutral',
          sustainabilityRating: 'C',
        },
        profit: {
          score: 0,
          factors: [],
          economicImpact: 0,
          jobsImpact: 0,
          gdpEffect: 'Neutral',
        },
        overall: 0,
        confidence: 0,
        methodology: 'AI-assisted analysis',
        region: options.region || 'National',
        analysisDate: new Date().toISOString(),
      },
      conflicts: [],
      categories: categories.map((c) => c.category),
      keywords,
      analysisDate: new Date().toISOString(),
    };

    return analysis;
  }

  /**
   * Assess reading level of text
   */
  private assessReadingLevel(text: string): string {
    // Simple Flesch-Kincaid approximation
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 'Unknown';

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    if (score >= 90) return 'Elementary (5th grade)';
    if (score >= 80) return 'Middle School (6th grade)';
    if (score >= 70) return 'Middle School (7th grade)';
    if (score >= 60) return 'High School (8th-9th grade)';
    if (score >= 50) return 'High School (10th-12th grade)';
    if (score >= 30) return 'College';
    return 'Professional/Graduate';
  }

  /**
   * Count syllables in text (approximation)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    for (const word of words) {
      // Count vowel groups
      const vowels = word.match(/[aeiouy]+/g);
      if (vowels) {
        count += vowels.length;
        // Subtract silent e
        if (word.endsWith('e') && !word.endsWith('le')) {
          count--;
        }
      }
      // Minimum 1 syllable per word
      if (count === 0) count = 1;
    }

    return count;
  }
}

// Singleton instance
let analyzerInstance: BillAnalyzer | undefined;

export function getBillAnalyzer(): BillAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new BillAnalyzer();
  }
  return analyzerInstance;
}
