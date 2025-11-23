/**
 * Search Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../src/index.js';

// Mock Elasticsearch client
vi.mock('@elastic/elasticsearch', () => ({
  Client: vi.fn().mockImplementation(() => ({
    cluster: {
      health: vi.fn().mockResolvedValue({ status: 'green' }),
    },
    indices: {
      exists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({}),
    },
    search: vi.fn().mockResolvedValue({
      hits: {
        hits: [],
        total: { value: 0 },
      },
      aggregations: {},
      took: 5,
    }),
    index: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock ioredis
vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  })),
}));

describe('Search Service', () => {
  let server: Awaited<ReturnType<typeof buildServer>>;

  beforeEach(async () => {
    server = await buildServer();
  });

  afterEach(async () => {
    await server?.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('search-service');
    });
  });

  describe('GET /search', () => {
    it('should require search query', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return search results', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search',
        query: { q: 'test query' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('results');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('facets');
    });

    it('should accept type filter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search',
        query: { q: 'test', type: 'bills' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should accept pagination parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search',
        query: { q: 'test', page: '2', limit: '10' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.page).toBe(2);
      expect(body.limit).toBe(10);
    });
  });

  describe('GET /search/bills', () => {
    it('should search bills', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/bills',
        query: { q: 'healthcare' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('results');
      expect(body).toHaveProperty('total');
    });

    it('should filter by status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/bills',
        query: { q: 'test', status: 'VOTING' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should filter by category', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/bills',
        query: { q: 'test', category: 'healthcare' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /search/people', () => {
    it('should search people', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/people',
        query: { q: 'john' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('results');
      expect(body).toHaveProperty('total');
    });

    it('should filter by region', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/people',
        query: { q: 'test', region: 'region-123' },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should filter by expertise', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/people',
        query: { q: 'test', expertise: 'healthcare' },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /search/suggestions', () => {
    it('should require minimum query length', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/suggestions',
        query: { q: 'a' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.suggestions).toEqual([]);
    });

    it('should return suggestions', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/suggestions',
        query: { q: 'heal' },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('suggestions');
    });
  });

  describe('GET /search/trending', () => {
    it('should return trending topics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/search/trending',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('topics');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('POST /search/index/bill', () => {
    it('should index a bill', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/search/index/bill',
        payload: {
          id: 'bill-123',
          data: {
            title: 'Test Bill',
            content: 'Test content',
            status: 'DRAFT',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('DELETE /search/index/:type/:id', () => {
    it('should delete from index', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/search/index/bills/bill-123',
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
