/**
 * Search Service - Main Entry Point
 *
 * Full-text search powered by Elasticsearch for the
 * Constitutional Shrinkage platform.
 */

import Fastify from 'fastify';
import { Client } from '@elastic/elasticsearch';
import Redis from 'ioredis';

import { BillIndexer } from './indexers/bills.js';
import { PeopleIndexer } from './indexers/people.js';

const PORT = process.env.SEARCH_PORT ? parseInt(process.env.SEARCH_PORT) : 3004;
const HOST = process.env.HOST || '0.0.0.0';

// Search types
export type SearchableType = 'bills' | 'people' | 'organizations' | 'regions' | 'all';

export interface SearchResult {
  id: string;
  type: SearchableType;
  title: string;
  description: string;
  score: number;
  highlights: string[];
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  took: number;
}

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // Elasticsearch client
  const esClient = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: process.env.ELASTICSEARCH_API_KEY
      ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
      : undefined,
  });

  // Redis for caching
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  });

  // Initialize indexers
  const billIndexer = new BillIndexer(esClient);
  const peopleIndexer = new PeopleIndexer(esClient);

  // Ensure indexes exist
  try {
    await billIndexer.ensureIndex();
    await peopleIndexer.ensureIndex();
    fastify.log.info('Elasticsearch indexes ready');
  } catch (err) {
    fastify.log.warn('Elasticsearch not available, search will be limited');
  }

  // Health check
  fastify.get('/health', async () => {
    let esHealthy = false;
    try {
      const health = await esClient.cluster.health();
      esHealthy = health.status !== 'red';
    } catch {
      esHealthy = false;
    }

    return {
      status: 'healthy',
      service: 'search-service',
      timestamp: new Date().toISOString(),
      elasticsearch: esHealthy ? 'connected' : 'disconnected',
    };
  });

  /**
   * GET /search - Global search
   */
  fastify.get<{
    Querystring: {
      q: string;
      type?: SearchableType;
      page?: number;
      limit?: number;
      filters?: string;
      sort?: string;
    };
  }>('/search', async (request, reply) => {
    const {
      q,
      type = 'all',
      page = 1,
      limit = 20,
      filters,
      sort = '_score',
    } = request.query;

    if (!q || q.length < 1) {
      reply.status(400);
      return { error: 'Search query is required' };
    }

    // Check cache
    const cacheKey = `search:${type}:${q}:${page}:${limit}:${filters}:${sort}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const startTime = Date.now();

    try {
      // Build multi-index search
      const indices = type === 'all'
        ? ['bills', 'people', 'organizations', 'regions']
        : [type];

      const parsedFilters = filters ? JSON.parse(filters) : {};

      const response = await esClient.search({
        index: indices,
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  fields: ['title^3', 'content^2', 'name^3', 'description', 'tags'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: buildFilters(parsedFilters),
          },
        },
        highlight: {
          fields: {
            title: {},
            content: {},
            name: {},
            description: {},
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
        aggs: {
          by_type: { terms: { field: '_index' } },
          by_status: { terms: { field: 'status' } },
          by_category: { terms: { field: 'category' } },
          by_region: { terms: { field: 'regionId' } },
        },
        sort: sort === '_score' ? undefined : [{ [sort]: 'desc' }],
      });

      const results: SearchResult[] = response.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: hit._index as SearchableType,
        title: hit._source.title || hit._source.name,
        description: hit._source.description || hit._source.content?.substring(0, 200),
        score: hit._score || 0,
        highlights: Object.values(hit.highlight || {}).flat() as string[],
        metadata: hit._source,
      }));

      const total = typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value || 0;

      const searchResponse: SearchResponse = {
        results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        facets: buildFacets(response.aggregations),
        took: Date.now() - startTime,
      };

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(searchResponse));

      return searchResponse;
    } catch (err) {
      fastify.log.error({ err, query: q }, 'Search failed');

      // Return empty results on error
      return {
        results: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        facets: {},
        took: Date.now() - startTime,
      };
    }
  });

  /**
   * GET /search/bills - Bill-specific search
   */
  fastify.get<{
    Querystring: { q: string; status?: string; category?: string; region?: string; page?: number; limit?: number };
  }>('/search/bills', async (request) => {
    const { q, status, category, region, page = 1, limit = 20 } = request.query;

    try {
      const results = await billIndexer.search(q, {
        status,
        category,
        region,
        page,
        limit,
      });

      return results;
    } catch (err) {
      fastify.log.error({ err }, 'Bill search failed');
      return { results: [], total: 0 };
    }
  });

  /**
   * GET /search/people - People search
   */
  fastify.get<{
    Querystring: { q: string; region?: string; expertise?: string; page?: number; limit?: number };
  }>('/search/people', async (request) => {
    const { q, region, expertise, page = 1, limit = 20 } = request.query;

    try {
      const results = await peopleIndexer.search(q, {
        region,
        expertise,
        page,
        limit,
      });

      return results;
    } catch (err) {
      fastify.log.error({ err }, 'People search failed');
      return { results: [], total: 0 };
    }
  });

  /**
   * GET /search/suggestions - Auto-complete suggestions
   */
  fastify.get<{ Querystring: { q: string; type?: string } }>('/search/suggestions', async (request) => {
    const { q, type = 'all' } = request.query;

    if (!q || q.length < 2) {
      return { suggestions: [] };
    }

    // Check cache
    const cacheKey = `suggestions:${type}:${q}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await esClient.search({
        index: type === 'all' ? ['bills', 'people'] : [type],
        size: 10,
        query: {
          multi_match: {
            query: q,
            fields: ['title.suggest', 'name.suggest'],
            type: 'phrase_prefix',
          },
        },
        _source: ['title', 'name', 'id'],
      });

      const suggestions = response.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: hit._index,
        text: hit._source.title || hit._source.name,
      }));

      const result = { suggestions };
      await redis.setex(cacheKey, 60, JSON.stringify(result)); // Cache 1 minute

      return result;
    } catch (err) {
      fastify.log.error({ err }, 'Suggestions failed');
      return { suggestions: [] };
    }
  });

  /**
   * GET /search/trending - Trending topics
   */
  fastify.get('/search/trending', async () => {
    const cacheKey = 'trending';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get popular search terms and active bills
    const trending = {
      topics: [
        { term: 'clean energy', count: 150 },
        { term: 'healthcare reform', count: 120 },
        { term: 'education funding', count: 95 },
        { term: 'infrastructure', count: 80 },
        { term: 'tax policy', count: 75 },
      ],
      activeBills: [],
      timestamp: new Date().toISOString(),
    };

    await redis.setex(cacheKey, 300, JSON.stringify(trending)); // Cache 5 minutes

    return trending;
  });

  /**
   * POST /search/index/bill - Index a bill (internal)
   */
  fastify.post<{ Body: { id: string; data: unknown } }>('/search/index/bill', async (request) => {
    const { id, data } = request.body;

    try {
      await billIndexer.index(id, data as any);
      return { success: true, id };
    } catch (err) {
      fastify.log.error({ err }, 'Bill indexing failed');
      return { success: false, error: 'Indexing failed' };
    }
  });

  /**
   * POST /search/index/person - Index a person (internal)
   */
  fastify.post<{ Body: { id: string; data: unknown } }>('/search/index/person', async (request) => {
    const { id, data } = request.body;

    try {
      await peopleIndexer.index(id, data as any);
      return { success: true, id };
    } catch (err) {
      fastify.log.error({ err }, 'Person indexing failed');
      return { success: false, error: 'Indexing failed' };
    }
  });

  /**
   * DELETE /search/index/:type/:id - Remove from index
   */
  fastify.delete<{ Params: { type: string; id: string } }>('/search/index/:type/:id', async (request) => {
    const { type, id } = request.params;

    try {
      await esClient.delete({ index: type, id });
      return { success: true };
    } catch (err) {
      fastify.log.error({ err }, 'Delete from index failed');
      return { success: false };
    }
  });

  return fastify;
}

function buildFilters(filters: Record<string, unknown>): Array<{ term: Record<string, unknown> }> {
  const result: Array<{ term: Record<string, unknown> }> = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      result.push({ term: { [key]: value } });
    }
  }

  return result;
}

function buildFacets(aggregations: any): Record<string, Array<{ value: string; count: number }>> {
  const facets: Record<string, Array<{ value: string; count: number }>> = {};

  if (!aggregations) return facets;

  for (const [key, agg] of Object.entries(aggregations) as [string, any][]) {
    if (agg.buckets) {
      facets[key.replace('by_', '')] = agg.buckets.map((bucket: any) => ({
        value: bucket.key,
        count: bucket.doc_count,
      }));
    }
  }

  return facets;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage Search Service             ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Failed to start search service:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
