/**
 * Semantic Search Service
 * Provides semantic search capabilities for bills and legal documents
 */

import { getLLMClient } from '../llm/client.js';
import { getVectorStore, type VectorDocument } from './vectorstore.js';
import type {
  SearchFilters,
  ScoredBill,
  SimilarBill,
  Precedent,
  RetrievedDocument,
} from '../../types/index.js';

export interface IndexedBill {
  id: string;
  title: string;
  content: string;
  status: string;
  category: string;
  region: string;
  dateIntroduced: string;
}

export class SemanticSearchService {
  private client = getLLMClient();
  private vectorStore = getVectorStore();
  private billIndex: Map<string, IndexedBill> = new Map();

  /**
   * Index a bill for search
   */
  async indexBill(bill: IndexedBill): Promise<void> {
    this.billIndex.set(bill.id, bill);

    const document: VectorDocument = {
      id: bill.id,
      content: `${bill.title}\n\n${bill.content}`,
      metadata: {
        type: 'bill',
        title: bill.title,
        status: bill.status,
        category: bill.category,
        region: bill.region,
        dateIntroduced: bill.dateIntroduced,
      },
    };

    await this.vectorStore.indexDocuments([document]);
  }

  /**
   * Index multiple bills
   */
  async indexBills(bills: IndexedBill[]): Promise<number> {
    for (const bill of bills) {
      this.billIndex.set(bill.id, bill);
    }

    const documents: VectorDocument[] = bills.map((bill) => ({
      id: bill.id,
      content: `${bill.title}\n\n${bill.content}`,
      metadata: {
        type: 'bill',
        title: bill.title,
        status: bill.status,
        category: bill.category,
        region: bill.region,
        dateIntroduced: bill.dateIntroduced,
      },
    }));

    return this.vectorStore.indexDocuments(documents);
  }

  /**
   * Search bills semantically
   */
  async searchBills(
    query: string,
    filters?: SearchFilters
  ): Promise<{
    results: ScoredBill[];
    suggestedFilters: { name: string; value: string }[];
  }> {
    // Optimize query for better search
    const optimizedQuery = await this.optimizeQuery(query);

    // Build filter object
    const vectorFilter: Record<string, unknown> = { type: 'bill' };
    if (filters?.categories?.length) {
      vectorFilter.category = filters.categories[0]; // Simplified for demo
    }
    if (filters?.region) {
      vectorFilter.region = filters.region;
    }

    // Search vector store
    const searchResults = await this.vectorStore.search(
      optimizedQuery,
      20,
      Object.keys(vectorFilter).length > 1 ? vectorFilter : undefined
    );

    // Apply additional filters
    let filteredResults = searchResults;
    if (filters?.minRelevance) {
      filteredResults = searchResults.filter(
        (r) => r.score >= (filters.minRelevance || 0)
      );
    }

    // Convert to ScoredBill format
    const results: ScoredBill[] = filteredResults.slice(0, 10).map((r) => {
      const bill = this.billIndex.get(r.id);
      return {
        id: r.id,
        title: bill?.title || (r.metadata.title as string) || 'Unknown',
        score: r.score,
        highlights: this.extractHighlights(query, bill?.content || ''),
        matchedSections: [],
      };
    });

    // Suggest filters based on results
    const suggestedFilters = this.suggestFilters(searchResults);

    return { results, suggestedFilters };
  }

  /**
   * Find similar bills
   */
  async findSimilar(billId: string, limit = 5): Promise<SimilarBill[]> {
    const bill = this.billIndex.get(billId);
    if (!bill) {
      throw new Error(`Bill not found: ${billId}`);
    }

    // Use bill content as query
    const searchResults = await this.vectorStore.search(
      bill.content.slice(0, 2000),
      limit + 1 // +1 to exclude self
    );

    // Filter out the source bill and convert to SimilarBill format
    return searchResults
      .filter((r) => r.id !== billId)
      .slice(0, limit)
      .map((r) => {
        const similarBill = this.billIndex.get(r.id);
        return {
          id: r.id,
          title: similarBill?.title || (r.metadata.title as string) || 'Unknown',
          similarity: r.score,
          sharedTopics: this.identifySharedTopics(bill, similarBill),
          differingAspects: [],
        };
      });
  }

  /**
   * Find relevant precedents
   */
  async findPrecedents(billContent: string): Promise<Precedent[]> {
    // Search for precedent-type documents
    const searchResults = await this.vectorStore.search(billContent.slice(0, 2000), 10, {
      type: 'precedent',
    });

    return searchResults.map((r) => ({
      caseId: r.id,
      caseName: (r.metadata.name as string) || 'Unknown Case',
      relevance: r.score,
      summary: (r.metadata.summary as string) || '',
      ruling: (r.metadata.ruling as string) || '',
      implications: '',
    }));
  }

  /**
   * RAG-enhanced question answering
   */
  async answerWithContext(
    question: string
  ): Promise<{
    answer: string;
    context: RetrievedDocument[];
    confidence: number;
  }> {
    // Retrieve relevant context
    const searchResults = await this.vectorStore.search(question, 5);

    const context: RetrievedDocument[] = searchResults.map((r) => ({
      id: r.id,
      content: (r.metadata.content as string) || '',
      source: (r.metadata.title as string) || r.id,
      relevance: r.score,
      metadata: r.metadata,
    }));

    // Generate answer using context
    const contextStr = context
      .map((c) => `[${c.source}]: ${c.content.slice(0, 500)}`)
      .join('\n\n');

    const prompt = `Answer the question based on the provided context.

Context:
${contextStr}

Question: ${question}

Provide a clear, accurate answer. If the context doesn't contain enough information, say so.

Respond in JSON format:
{
  "answer": "...",
  "confidence": 0.0-1.0
}`;

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    return {
      answer: result.answer,
      context,
      confidence: result.confidence,
    };
  }

  /**
   * Optimize search query
   */
  private async optimizeQuery(query: string): Promise<string> {
    // Simple query expansion - in production, use LLM
    const expansions = [
      query,
      query.replace(/bill/gi, 'legislation'),
      query.replace(/law/gi, 'statute'),
    ];

    return expansions.join(' ');
  }

  /**
   * Extract highlights from content
   */
  private extractHighlights(query: string, content: string): string[] {
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
    const sentences = content.split(/[.!?]+/).filter(Boolean);

    const highlights: string[] = [];
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (queryTerms.some((term) => lower.includes(term))) {
        highlights.push(sentence.trim().slice(0, 200));
        if (highlights.length >= 3) break;
      }
    }

    return highlights;
  }

  /**
   * Suggest filters based on results
   */
  private suggestFilters(
    results: { metadata: Record<string, unknown> }[]
  ): { name: string; value: string }[] {
    const categories = new Map<string, number>();
    const regions = new Map<string, number>();

    for (const result of results) {
      const cat = result.metadata.category as string;
      const reg = result.metadata.region as string;
      if (cat) categories.set(cat, (categories.get(cat) || 0) + 1);
      if (reg) regions.set(reg, (regions.get(reg) || 0) + 1);
    }

    const suggestions: { name: string; value: string }[] = [];

    // Add top category filter
    const topCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      suggestions.push({ name: 'category', value: topCategory[0] });
    }

    // Add top region filter
    const topRegion = [...regions.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topRegion) {
      suggestions.push({ name: 'region', value: topRegion[0] });
    }

    return suggestions;
  }

  /**
   * Identify shared topics between bills
   */
  private identifySharedTopics(
    bill1?: IndexedBill,
    bill2?: IndexedBill
  ): string[] {
    if (!bill1 || !bill2) return [];

    const topics: string[] = [];
    if (bill1.category === bill2.category) {
      topics.push(bill1.category);
    }
    if (bill1.region === bill2.region) {
      topics.push(`Same region: ${bill1.region}`);
    }

    return topics;
  }

  /**
   * Get index statistics
   */
  getStats(): { billCount: number; vectorStats: object } {
    return {
      billCount: this.billIndex.size,
      vectorStats: this.vectorStore.getStats(),
    };
  }

  /**
   * Clear all indexed data
   */
  clear(): void {
    this.billIndex.clear();
    this.vectorStore.clear();
  }
}

// Singleton instance
let searchInstance: SemanticSearchService | undefined;

export function getSemanticSearchService(): SemanticSearchService {
  if (!searchInstance) {
    searchInstance = new SemanticSearchService();
  }
  return searchInstance;
}
