/**
 * Bill Indexer
 *
 * Elasticsearch indexing for bills and legislation.
 */

import type { Client } from '@elastic/elasticsearch';

export interface BillDocument {
  id: string;
  title: string;
  content: string;
  status: string;
  level: string;
  category: string;
  categoryName: string;
  regionId?: string;
  regionName?: string;
  sponsorId: string;
  sponsorName: string;
  coSponsors: string[];
  version: string;
  sunsetDate: string;
  tags: string[];
  votesFor: number;
  votesAgainst: number;
  participation: number;
  impactPeople: number;
  impactPlanet: number;
  impactProfit: number;
  createdAt: string;
  updatedAt: string;
}

const INDEX_NAME = 'bills';

const INDEX_SETTINGS = {
  settings: {
    analysis: {
      analyzer: {
        bill_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'stop', 'snowball'],
        },
        suggest_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'edge_ngram_filter'],
        },
      },
      filter: {
        edge_ngram_filter: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: {
        type: 'text',
        analyzer: 'bill_analyzer',
        fields: {
          suggest: { type: 'text', analyzer: 'suggest_analyzer' },
          keyword: { type: 'keyword' },
        },
      },
      content: { type: 'text', analyzer: 'bill_analyzer' },
      status: { type: 'keyword' },
      level: { type: 'keyword' },
      category: { type: 'keyword' },
      categoryName: { type: 'text' },
      regionId: { type: 'keyword' },
      regionName: { type: 'text' },
      sponsorId: { type: 'keyword' },
      sponsorName: { type: 'text' },
      coSponsors: { type: 'keyword' },
      version: { type: 'keyword' },
      sunsetDate: { type: 'date' },
      tags: { type: 'keyword' },
      votesFor: { type: 'integer' },
      votesAgainst: { type: 'integer' },
      participation: { type: 'float' },
      impactPeople: { type: 'integer' },
      impactPlanet: { type: 'integer' },
      impactProfit: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};

export class BillIndexer {
  constructor(private esClient: Client) {}

  /**
   * Ensure the index exists with correct mappings
   */
  async ensureIndex(): Promise<void> {
    const exists = await this.esClient.indices.exists({ index: INDEX_NAME });

    if (!exists) {
      await this.esClient.indices.create({
        index: INDEX_NAME,
        ...INDEX_SETTINGS,
      });
    }
  }

  /**
   * Index a single bill
   */
  async index(id: string, document: BillDocument): Promise<void> {
    await this.esClient.index({
      index: INDEX_NAME,
      id,
      document,
    });
  }

  /**
   * Bulk index bills
   */
  async bulkIndex(documents: BillDocument[]): Promise<void> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: INDEX_NAME, _id: doc.id } },
      doc,
    ]);

    await this.esClient.bulk({ operations });
  }

  /**
   * Update a bill
   */
  async update(id: string, updates: Partial<BillDocument>): Promise<void> {
    await this.esClient.update({
      index: INDEX_NAME,
      id,
      doc: updates,
    });
  }

  /**
   * Delete a bill from index
   */
  async delete(id: string): Promise<void> {
    await this.esClient.delete({
      index: INDEX_NAME,
      id,
    });
  }

  /**
   * Search bills
   */
  async search(
    query: string,
    options: {
      status?: string;
      category?: string;
      region?: string;
      level?: string;
      sponsor?: string;
      page?: number;
      limit?: number;
      sort?: string;
    } = {}
  ): Promise<{ results: BillDocument[]; total: number; took: number }> {
    const { page = 1, limit = 20, sort = '_score' } = options;

    const filters: Array<{ term: Record<string, string> }> = [];

    if (options.status) filters.push({ term: { status: options.status } });
    if (options.category) filters.push({ term: { category: options.category } });
    if (options.region) filters.push({ term: { regionId: options.region } });
    if (options.level) filters.push({ term: { level: options.level } });
    if (options.sponsor) filters.push({ term: { sponsorId: options.sponsor } });

    const response = await this.esClient.search({
      index: INDEX_NAME,
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must: query
            ? [
                {
                  multi_match: {
                    query,
                    fields: ['title^3', 'content^2', 'tags', 'sponsorName'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              ]
            : [{ match_all: {} }],
          filter: filters,
        },
      },
      highlight: {
        fields: {
          title: {},
          content: { fragment_size: 150, number_of_fragments: 3 },
        },
      },
      sort: sort === '_score' ? undefined : [{ [sort]: 'desc' }],
    });

    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0;

    return {
      results: response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight,
      })),
      total,
      took: response.took,
    };
  }

  /**
   * Get similar bills
   */
  async findSimilar(billId: string, limit: number = 5): Promise<BillDocument[]> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: limit,
      query: {
        more_like_this: {
          fields: ['title', 'content', 'tags'],
          like: [{ _index: INDEX_NAME, _id: billId }],
          min_term_freq: 1,
          min_doc_freq: 1,
        },
      },
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Get aggregations for faceted search
   */
  async getAggregations(): Promise<{
    categories: Array<{ value: string; count: number }>;
    statuses: Array<{ value: string; count: number }>;
    levels: Array<{ value: string; count: number }>;
  }> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: 0,
      aggs: {
        categories: { terms: { field: 'category', size: 20 } },
        statuses: { terms: { field: 'status', size: 10 } },
        levels: { terms: { field: 'level', size: 5 } },
      },
    });

    const aggs = response.aggregations as any;

    return {
      categories: aggs?.categories?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      statuses: aggs?.statuses?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      levels: aggs?.levels?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
    };
  }
}
