/**
 * People Indexer
 *
 * Elasticsearch indexing for people (citizens, representatives).
 */

import type { Client } from '@elastic/elasticsearch';

export interface PersonDocument {
  id: string;
  legalName: string;
  preferredName?: string;
  primaryRegionId: string;
  regionIds: string[];
  regionNames: string[];
  verificationLevel: string;
  status: string;
  votingPower: number;
  reputation: number;
  expertiseAreas: string[];
  roles: string[];
  billsSponsored: number;
  votesCount: number;
  delegationsReceived: number;
  createdAt: string;
  lastActiveAt: string;
}

const INDEX_NAME = 'people';

const INDEX_SETTINGS = {
  settings: {
    analysis: {
      analyzer: {
        name_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
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
      legalName: {
        type: 'text',
        analyzer: 'name_analyzer',
        fields: {
          suggest: { type: 'text', analyzer: 'suggest_analyzer' },
          keyword: { type: 'keyword' },
        },
      },
      preferredName: {
        type: 'text',
        analyzer: 'name_analyzer',
        fields: {
          suggest: { type: 'text', analyzer: 'suggest_analyzer' },
        },
      },
      primaryRegionId: { type: 'keyword' },
      regionIds: { type: 'keyword' },
      regionNames: { type: 'text' },
      verificationLevel: { type: 'keyword' },
      status: { type: 'keyword' },
      votingPower: { type: 'float' },
      reputation: { type: 'integer' },
      expertiseAreas: { type: 'keyword' },
      roles: { type: 'keyword' },
      billsSponsored: { type: 'integer' },
      votesCount: { type: 'integer' },
      delegationsReceived: { type: 'integer' },
      createdAt: { type: 'date' },
      lastActiveAt: { type: 'date' },
    },
  },
};

export class PeopleIndexer {
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
   * Index a single person
   */
  async index(id: string, document: PersonDocument): Promise<void> {
    await this.esClient.index({
      index: INDEX_NAME,
      id,
      document,
    });
  }

  /**
   * Bulk index people
   */
  async bulkIndex(documents: PersonDocument[]): Promise<void> {
    const operations = documents.flatMap((doc) => [
      { index: { _index: INDEX_NAME, _id: doc.id } },
      doc,
    ]);

    await this.esClient.bulk({ operations });
  }

  /**
   * Update a person
   */
  async update(id: string, updates: Partial<PersonDocument>): Promise<void> {
    await this.esClient.update({
      index: INDEX_NAME,
      id,
      doc: updates,
    });
  }

  /**
   * Delete a person from index
   */
  async delete(id: string): Promise<void> {
    await this.esClient.delete({
      index: INDEX_NAME,
      id,
    });
  }

  /**
   * Search people
   */
  async search(
    query: string,
    options: {
      region?: string;
      expertise?: string;
      verificationLevel?: string;
      role?: string;
      minReputation?: number;
      page?: number;
      limit?: number;
      sort?: string;
    } = {}
  ): Promise<{ results: PersonDocument[]; total: number; took: number }> {
    const { page = 1, limit = 20, sort = '_score' } = options;

    const filters: Array<Record<string, unknown>> = [];

    if (options.region) {
      filters.push({ term: { regionIds: options.region } });
    }
    if (options.expertise) {
      filters.push({ term: { expertiseAreas: options.expertise } });
    }
    if (options.verificationLevel) {
      filters.push({ term: { verificationLevel: options.verificationLevel } });
    }
    if (options.role) {
      filters.push({ term: { roles: options.role } });
    }
    if (options.minReputation !== undefined) {
      filters.push({ range: { reputation: { gte: options.minReputation } } });
    }

    // Always filter to active users
    filters.push({ term: { status: 'ACTIVE' } });

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
                    fields: ['legalName^2', 'preferredName^2', 'expertiseAreas'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              ]
            : [{ match_all: {} }],
          filter: filters,
        },
      },
      sort:
        sort === '_score'
          ? undefined
          : sort === 'reputation'
          ? [{ reputation: 'desc' }]
          : [{ [sort]: 'desc' }],
    });

    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value || 0;

    return {
      results: response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
      })),
      total,
      took: response.took,
    };
  }

  /**
   * Find experts by category
   */
  async findExperts(category: string, limit: number = 10): Promise<PersonDocument[]> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: limit,
      query: {
        bool: {
          must: [{ term: { expertiseAreas: category } }],
          filter: [{ term: { status: 'ACTIVE' } }],
        },
      },
      sort: [{ reputation: 'desc' }, { delegationsReceived: 'desc' }],
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Get top delegates (most trusted users)
   */
  async getTopDelegates(region?: string, limit: number = 10): Promise<PersonDocument[]> {
    const filters: Array<Record<string, unknown>> = [{ term: { status: 'ACTIVE' } }];

    if (region) {
      filters.push({ term: { regionIds: region } });
    }

    // Require minimum verification
    filters.push({
      terms: { verificationLevel: ['DOCUMENT_VERIFIED', 'FULL_KYC', 'GOVERNMENT_VERIFIED'] },
    });

    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: limit,
      query: {
        bool: { filter: filters },
      },
      sort: [{ delegationsReceived: 'desc' }, { reputation: 'desc' }],
    });

    return response.hits.hits.map((hit: any) => hit._source);
  }

  /**
   * Get aggregations for faceted search
   */
  async getAggregations(): Promise<{
    regions: Array<{ value: string; count: number }>;
    expertiseAreas: Array<{ value: string; count: number }>;
    verificationLevels: Array<{ value: string; count: number }>;
  }> {
    const response = await this.esClient.search({
      index: INDEX_NAME,
      size: 0,
      aggs: {
        regions: { terms: { field: 'primaryRegionId', size: 50 } },
        expertiseAreas: { terms: { field: 'expertiseAreas', size: 20 } },
        verificationLevels: { terms: { field: 'verificationLevel', size: 10 } },
      },
    });

    const aggs = response.aggregations as any;

    return {
      regions: aggs?.regions?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      expertiseAreas: aggs?.expertiseAreas?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
      verificationLevels: aggs?.verificationLevels?.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })) || [],
    };
  }
}
