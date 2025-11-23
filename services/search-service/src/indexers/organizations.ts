/**
 * Organization Indexer
 *
 * Elasticsearch indexing for organizations.
 */

import type { Client } from '@elastic/elasticsearch';

export interface OrganizationDocument {
  id: string;
  name: string;
  type: string;
  industry: string;
  description?: string;
  regionId?: string;
  regionName?: string;
  website?: string;
  transparencyScore: number;
  lobbyingActivity: number;
  donationTotal: number;
  billsSupported: number;
  billsOpposed: number;
  verificationStatus: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const INDEX_NAME = 'organizations';

const INDEX_SETTINGS = {
  settings: {
    analysis: {
      analyzer: {
        org_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'stop'],
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
      name: {
        type: 'text',
        analyzer: 'org_analyzer',
        fields: {
          suggest: { type: 'text', analyzer: 'suggest_analyzer' },
          keyword: { type: 'keyword' },
        },
      },
      type: { type: 'keyword' },
      industry: { type: 'keyword' },
      description: { type: 'text', analyzer: 'org_analyzer' },
      regionId: { type: 'keyword' },
      regionName: { type: 'text' },
      website: { type: 'keyword' },
      transparencyScore: { type: 'float' },
      lobbyingActivity: { type: 'integer' },
      donationTotal: { type: 'float' },
      billsSupported: { type: 'integer' },
      billsOpposed: { type: 'integer' },
      verificationStatus: { type: 'keyword' },
      tags: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    },
  },
};

export class OrganizationIndexer {
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
   * Index a single organization
   */
  async index(id: string, document: OrganizationDocument): Promise<void> {
    await this.esClient.index({
      index: INDEX_NAME,
      id,
      document,
    });
  }

  /**
   * Bulk index organizations
   */
  async bulkIndex(documents: OrganizationDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const operations = documents.flatMap((doc) => [
      { index: { _index: INDEX_NAME, _id: doc.id } },
      doc,
    ]);

    await this.esClient.bulk({ operations });
  }

  /**
   * Update an organization
   */
  async update(id: string, updates: Partial<OrganizationDocument>): Promise<void> {
    await this.esClient.update({
      index: INDEX_NAME,
      id,
      doc: updates,
    });
  }

  /**
   * Delete an organization from index
   */
  async delete(id: string): Promise<void> {
    await this.esClient.delete({
      index: INDEX_NAME,
      id,
    });
  }

  /**
   * Search organizations
   */
  async search(
    query: string,
    options: {
      type?: string;
      industry?: string;
      region?: string;
      minTransparencyScore?: number;
      verificationStatus?: string;
      page?: number;
      limit?: number;
      sort?: string;
    } = {}
  ): Promise<{ results: OrganizationDocument[]; total: number; took: number }> {
    const { page = 1, limit = 20, sort = '_score' } = options;

    const filters: Array<Record<string, unknown>> = [];

    if (options.type) {
      filters.push({ term: { type: options.type } });
    }
    if (options.industry) {
      filters.push({ term: { industry: options.industry } });
    }
    if (options.region) {
      filters.push({ term: { regionId: options.region } });
    }
    if (options.verificationStatus) {
      filters.push({ term: { verificationStatus: options.verificationStatus } });
    }
    if (options.minTransparencyScore !== undefined) {
      filters.push({ range: { transparencyScore: { gte: options.minTransparencyScore } } });
    }

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
                    fields: ['name^3', 'description^2', 'industry', 'tags'],
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
          name: {},
          description: { fragment_size: 150, number_of_fragments: 2 },
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
   * Find organizations by industry
   */
  async findByIndustry(industry: string, limit: number = 20): Promise<OrganizationDocument[]> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: limit,
      query: {
        bool: {
          must: [{ term: { industry } }],
        },
      },
      sort: [{ transparencyScore: 'desc' }, { name: 'asc' }],
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Find top lobbying organizations
   */
  async findTopLobbyists(limit: number = 10): Promise<OrganizationDocument[]> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: limit,
      query: {
        range: { lobbyingActivity: { gt: 0 } },
      },
      sort: [{ lobbyingActivity: 'desc' }],
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Get aggregations for faceted search
   */
  async getAggregations(): Promise<{
    types: Array<{ value: string; count: number }>;
    industries: Array<{ value: string; count: number }>;
    verificationStatuses: Array<{ value: string; count: number }>;
  }> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: 0,
      aggs: {
        types: { terms: { field: 'type', size: 20 } },
        industries: { terms: { field: 'industry', size: 30 } },
        verificationStatuses: { terms: { field: 'verificationStatus', size: 10 } },
      },
    });

    const aggs = response.aggregations as any;

    return {
      types: aggs?.types?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      industries: aggs?.industries?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      verificationStatuses: aggs?.verificationStatuses?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
    };
  }
}
