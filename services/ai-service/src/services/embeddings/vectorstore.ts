/**
 * Vector Store Service
 * Manages vector embeddings for semantic search
 */

import type { EmbeddingVector, EmbeddingResult } from '../../types/index.js';

export interface VectorStoreConfig {
  dimensions: number;
  indexType: 'flat' | 'hnsw' | 'ivf';
  metric: 'cosine' | 'euclidean' | 'dotProduct';
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

// In-memory vector store for development
// Production would use Pinecone, Weaviate, or similar
class InMemoryVectorStore {
  private vectors: Map<string, { embedding: number[]; metadata: Record<string, unknown> }> =
    new Map();
  private dimensions: number;
  private metric: 'cosine' | 'euclidean' | 'dotProduct';

  constructor(config: VectorStoreConfig) {
    this.dimensions = config.dimensions;
    this.metric = config.metric;
  }

  async upsert(vectors: EmbeddingVector[]): Promise<void> {
    for (const vector of vectors) {
      this.vectors.set(vector.id, {
        embedding: vector.values,
        metadata: vector.metadata,
      });
    }
  }

  async query(
    queryVector: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const [id, data] of this.vectors) {
      // Apply filter if provided
      if (filter) {
        let match = true;
        for (const [key, value] of Object.entries(filter)) {
          if (data.metadata[key] !== value) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }

      const score = this.calculateSimilarity(queryVector, data.embedding);
      results.push({ id, score, metadata: data.metadata });
    }

    // Sort by score descending and take top K
    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.vectors.delete(id);
    }
  }

  async fetch(ids: string[]): Promise<Map<string, EmbeddingVector>> {
    const result = new Map<string, EmbeddingVector>();
    for (const id of ids) {
      const data = this.vectors.get(id);
      if (data) {
        result.set(id, {
          id,
          values: data.embedding,
          metadata: data.metadata,
        });
      }
    }
    return result;
  }

  private calculateSimilarity(a: number[], b: number[]): number {
    switch (this.metric) {
      case 'cosine':
        return this.cosineSimilarity(a, b);
      case 'euclidean':
        return 1 / (1 + this.euclideanDistance(a, b));
      case 'dotProduct':
        return this.dotProduct(a, b);
      default:
        return this.cosineSimilarity(a, b);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProd = this.dotProduct(a, b);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProd / (magA * magB);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  count(): number {
    return this.vectors.size;
  }

  clear(): void {
    this.vectors.clear();
  }
}

export class VectorStore {
  private store: InMemoryVectorStore;
  private config: VectorStoreConfig;
  private openaiApiKey?: string;

  constructor(config?: Partial<VectorStoreConfig>) {
    this.config = {
      dimensions: config?.dimensions || 1536, // OpenAI ada-002 dimensions
      indexType: config?.indexType || 'flat',
      metric: config?.metric || 'cosine',
    };

    this.store = new InMemoryVectorStore(this.config);
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Generate embeddings for text
   */
  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    // Use OpenAI embeddings API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: texts,
      }),
    });

    if (!response.ok) {
      // Fallback to random embeddings for development
      return texts.map((text, i) => ({
        id: `emb-${i}`,
        embedding: Array.from({ length: this.config.dimensions }, () =>
          Math.random() * 2 - 1
        ),
        tokenCount: text.split(/\s+/).length,
      }));
    }

    const data = await response.json();
    return data.data.map((item: { embedding: number[]; index: number }, i: number) => ({
      id: `emb-${i}`,
      embedding: item.embedding,
      tokenCount: texts[i].split(/\s+/).length,
    }));
  }

  /**
   * Index documents
   */
  async indexDocuments(documents: VectorDocument[]): Promise<number> {
    const texts = documents.map((d) => d.content);
    const embeddings = await this.embed(texts);

    const vectors: EmbeddingVector[] = documents.map((doc, i) => ({
      id: doc.id,
      values: embeddings[i].embedding,
      metadata: { ...doc.metadata, content: doc.content },
    }));

    await this.store.upsert(vectors);
    return vectors.length;
  }

  /**
   * Search similar documents
   */
  async search(
    query: string,
    topK = 5,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    const [embedding] = await this.embed([query]);
    return this.store.query(embedding.embedding, topK, filter);
  }

  /**
   * Delete documents by ID
   */
  async deleteDocuments(ids: string[]): Promise<void> {
    await this.store.delete(ids);
  }

  /**
   * Get documents by ID
   */
  async getDocuments(ids: string[]): Promise<VectorDocument[]> {
    const vectors = await this.store.fetch(ids);
    return Array.from(vectors.values()).map((v) => ({
      id: v.id,
      content: v.metadata.content as string,
      metadata: v.metadata,
    }));
  }

  /**
   * Get store statistics
   */
  getStats(): { count: number; dimensions: number; metric: string } {
    return {
      count: this.store.count(),
      dimensions: this.config.dimensions,
      metric: this.config.metric,
    };
  }

  /**
   * Clear all documents
   */
  clear(): void {
    this.store.clear();
  }
}

// Singleton instance
let storeInstance: VectorStore | undefined;

export function getVectorStore(config?: Partial<VectorStoreConfig>): VectorStore {
  if (config || !storeInstance) {
    storeInstance = new VectorStore(config);
  }
  return storeInstance;
}
