/**
 * RAG (Retrieval Augmented Generation) Implementation
 * Combines retrieval with generation for accurate, sourced responses
 */

import { getLLMClient, type LLMMessage } from '../services/llm/client.js';
import { getVectorStore, type VectorDocument } from '../services/embeddings/vectorstore.js';
import type { RAGResponse, RetrievedDocument, Citation } from '../types/index.js';

export interface RAGConfig {
  topK: number;
  minRelevance: number;
  maxContextLength: number;
  includeMetadata: boolean;
}

export interface RAGSource {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  sourceType: 'bill' | 'precedent' | 'constitution' | 'regulation' | 'other';
}

export class RAGPipeline {
  private client = getLLMClient();
  private vectorStore = getVectorStore();
  private config: RAGConfig;
  private sources: Map<string, RAGSource> = new Map();

  constructor(config?: Partial<RAGConfig>) {
    this.config = {
      topK: config?.topK || 5,
      minRelevance: config?.minRelevance || 0.5,
      maxContextLength: config?.maxContextLength || 4000,
      includeMetadata: config?.includeMetadata ?? true,
    };
  }

  /**
   * Add documents to the knowledge base
   */
  async addDocuments(sources: RAGSource[]): Promise<number> {
    // Store source information
    for (const source of sources) {
      this.sources.set(source.id, source);
    }

    // Index in vector store
    const documents: VectorDocument[] = sources.map((s) => ({
      id: s.id,
      content: s.content,
      metadata: {
        ...s.metadata,
        sourceType: s.sourceType,
      },
    }));

    return this.vectorStore.indexDocuments(documents);
  }

  /**
   * Query with RAG
   */
  async query(question: string): Promise<RAGResponse> {
    // Retrieve relevant documents
    const searchResults = await this.vectorStore.search(question, this.config.topK);

    // Filter by relevance
    const relevantResults = searchResults.filter(
      (r) => r.score >= this.config.minRelevance
    );

    // Build context from retrieved documents
    const context: RetrievedDocument[] = [];
    let contextLength = 0;

    for (const result of relevantResults) {
      const source = this.sources.get(result.id);
      const content = source?.content || (result.metadata.content as string) || '';

      // Check context length limit
      if (contextLength + content.length > this.config.maxContextLength) {
        break;
      }

      context.push({
        id: result.id,
        content: content.slice(0, this.config.maxContextLength - contextLength),
        source: source?.sourceType || 'other',
        relevance: result.score,
        metadata: this.config.includeMetadata ? result.metadata : {},
      });

      contextLength += content.length;
    }

    // Generate answer with context
    const answer = await this.generateAnswer(question, context);

    return answer;
  }

  /**
   * Generate answer using retrieved context
   */
  private async generateAnswer(
    question: string,
    context: RetrievedDocument[]
  ): Promise<RAGResponse> {
    const contextStr = context
      .map((c, i) => `[Source ${i + 1}] (${c.source}, relevance: ${c.relevance.toFixed(2)}):\n${c.content}`)
      .join('\n\n---\n\n');

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `You are a knowledgeable assistant that answers questions based on provided context.
Always cite your sources using [Source N] notation.
If the context doesn't contain enough information, say so clearly.
Be accurate and precise in your answers.`,
      },
      {
        role: 'user',
        content: `Context:
${contextStr}

Question: ${question}

Answer the question based on the provided context. Cite sources for any claims.
Respond in JSON format:
{
  "answer": "...",
  "confidence": 0.0-1.0,
  "sources": [{"source": "Source N", "quote": "relevant quote"}]
}`,
      },
    ];

    const response = await this.client.complete({
      messages,
      temperature: 0.3,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    // Map sources to citations
    const citations: Citation[] = result.sources?.map((s: { source: string; quote?: string }) => {
      const sourceNum = parseInt(s.source.replace(/\D/g, '')) - 1;
      const doc = context[sourceNum];
      return {
        source: doc?.source || s.source,
        quote: s.quote,
        section: doc?.metadata?.section as string,
      };
    }) || [];

    return {
      answer: result.answer,
      context,
      confidence: result.confidence || 0.7,
      sources: citations,
    };
  }

  /**
   * Query with custom context
   */
  async queryWithContext(
    question: string,
    customContext: string[]
  ): Promise<RAGResponse> {
    const context: RetrievedDocument[] = customContext.map((c, i) => ({
      id: `custom-${i}`,
      content: c,
      source: 'provided',
      relevance: 1.0,
      metadata: {},
    }));

    return this.generateAnswer(question, context);
  }

  /**
   * Chunk large documents
   */
  chunkDocument(
    content: string,
    chunkSize = 1000,
    overlap = 100
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      let end = start + chunkSize;

      // Try to break at sentence boundary
      if (end < content.length) {
        const lastPeriod = content.lastIndexOf('.', end);
        const lastNewline = content.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > start + chunkSize / 2) {
          end = breakPoint + 1;
        }
      }

      chunks.push(content.slice(start, end).trim());
      start = end - overlap;
    }

    return chunks;
  }

  /**
   * Add chunked document
   */
  async addChunkedDocument(
    id: string,
    content: string,
    metadata: Record<string, unknown>,
    sourceType: RAGSource['sourceType']
  ): Promise<number> {
    const chunks = this.chunkDocument(content);

    const sources: RAGSource[] = chunks.map((chunk, i) => ({
      id: `${id}-chunk-${i}`,
      content: chunk,
      metadata: { ...metadata, chunkIndex: i, parentId: id },
      sourceType,
    }));

    return this.addDocuments(sources);
  }

  /**
   * Get source by ID
   */
  getSource(id: string): RAGSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Delete source
   */
  async deleteSource(id: string): Promise<void> {
    this.sources.delete(id);
    await this.vectorStore.deleteDocuments([id]);
  }

  /**
   * Get statistics
   */
  getStats(): { sourceCount: number; vectorStats: object } {
    return {
      sourceCount: this.sources.size,
      vectorStats: this.vectorStore.getStats(),
    };
  }

  /**
   * Clear all sources
   */
  clear(): void {
    this.sources.clear();
    this.vectorStore.clear();
  }
}

// Singleton instance
let ragInstance: RAGPipeline | undefined;

export function getRAGPipeline(config?: Partial<RAGConfig>): RAGPipeline {
  if (config || !ragInstance) {
    ragInstance = new RAGPipeline(config);
  }
  return ragInstance;
}
