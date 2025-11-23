/**
 * Indexer Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillIndexer } from '../src/indexers/bills.js';
import { PeopleIndexer } from '../src/indexers/people.js';
import { OrganizationIndexer } from '../src/indexers/organizations.js';

// Mock Elasticsearch client
const mockEsClient = {
  indices: {
    exists: vi.fn().mockResolvedValue(false),
    create: vi.fn().mockResolvedValue({}),
  },
  index: vi.fn().mockResolvedValue({}),
  bulk: vi.fn().mockResolvedValue({ errors: false }),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  search: vi.fn().mockResolvedValue({
    hits: {
      hits: [],
      total: { value: 0 },
    },
    aggregations: {
      categories: { buckets: [] },
      statuses: { buckets: [] },
      levels: { buckets: [] },
    },
    took: 5,
  }),
};

describe('BillIndexer', () => {
  let indexer: BillIndexer;

  beforeEach(() => {
    vi.clearAllMocks();
    indexer = new BillIndexer(mockEsClient as any);
  });

  describe('ensureIndex', () => {
    it('should create index if it does not exist', async () => {
      mockEsClient.indices.exists.mockResolvedValueOnce(false);
      await indexer.ensureIndex();
      expect(mockEsClient.indices.create).toHaveBeenCalled();
    });

    it('should not create index if it exists', async () => {
      mockEsClient.indices.exists.mockResolvedValueOnce(true);
      await indexer.ensureIndex();
      expect(mockEsClient.indices.create).not.toHaveBeenCalled();
    });
  });

  describe('index', () => {
    it('should index a single bill', async () => {
      const bill = {
        id: 'bill-1',
        title: 'Test Bill',
        content: 'Test content',
        status: 'DRAFT',
        level: 'FEDERAL',
        category: 'healthcare',
        categoryName: 'Healthcare',
        sponsorId: 'sponsor-1',
        sponsorName: 'John Doe',
        coSponsors: [],
        version: '1.0',
        sunsetDate: '',
        tags: ['healthcare', 'reform'],
        votesFor: 0,
        votesAgainst: 0,
        participation: 0,
        impactPeople: 5,
        impactPlanet: 3,
        impactProfit: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await indexer.index(bill.id, bill);
      expect(mockEsClient.index).toHaveBeenCalledWith({
        index: 'bills',
        id: bill.id,
        document: bill,
      });
    });
  });

  describe('bulkIndex', () => {
    it('should bulk index bills', async () => {
      const bills = [
        { id: 'bill-1', title: 'Bill 1' },
        { id: 'bill-2', title: 'Bill 2' },
      ] as any[];

      await indexer.bulkIndex(bills);
      expect(mockEsClient.bulk).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search bills with query', async () => {
      mockEsClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            { _id: 'bill-1', _source: { title: 'Test Bill' }, _score: 1.5, highlight: {} },
          ],
          total: { value: 1 },
        },
        took: 10,
      });

      const result = await indexer.search('test');
      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply filters', async () => {
      await indexer.search('test', { status: 'VOTING', category: 'healthcare' });
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      await indexer.search('test', { page: 2, limit: 10 });
      expect(mockEsClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 10,
          size: 10,
        })
      );
    });
  });

  describe('findSimilar', () => {
    it('should find similar bills', async () => {
      await indexer.findSimilar('bill-1');
      expect(mockEsClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            more_like_this: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getAggregations', () => {
    it('should return facet aggregations', async () => {
      const result = await indexer.getAggregations();
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('statuses');
      expect(result).toHaveProperty('levels');
    });
  });
});

describe('PeopleIndexer', () => {
  let indexer: PeopleIndexer;

  beforeEach(() => {
    vi.clearAllMocks();
    indexer = new PeopleIndexer(mockEsClient as any);
  });

  describe('ensureIndex', () => {
    it('should create index if it does not exist', async () => {
      mockEsClient.indices.exists.mockResolvedValueOnce(false);
      await indexer.ensureIndex();
      expect(mockEsClient.indices.create).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search people', async () => {
      mockEsClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            { _id: 'person-1', _source: { legalName: 'John Doe' }, _score: 1.5 },
          ],
          total: { value: 1 },
        },
        took: 10,
      });

      const result = await indexer.search('john');
      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by region', async () => {
      await indexer.search('test', { region: 'region-123' });
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by expertise', async () => {
      await indexer.search('test', { expertise: 'healthcare' });
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by minimum reputation', async () => {
      await indexer.search('test', { minReputation: 50 });
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('findExperts', () => {
    it('should find experts by category', async () => {
      await indexer.findExperts('healthcare');
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('getTopDelegates', () => {
    it('should get top delegates', async () => {
      await indexer.getTopDelegates();
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by region', async () => {
      await indexer.getTopDelegates('region-123');
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });
});

describe('OrganizationIndexer', () => {
  let indexer: OrganizationIndexer;

  beforeEach(() => {
    vi.clearAllMocks();
    indexer = new OrganizationIndexer(mockEsClient as any);
  });

  describe('ensureIndex', () => {
    it('should create index if it does not exist', async () => {
      mockEsClient.indices.exists.mockResolvedValueOnce(false);
      await indexer.ensureIndex();
      expect(mockEsClient.indices.create).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search organizations', async () => {
      mockEsClient.search.mockResolvedValueOnce({
        hits: {
          hits: [
            { _id: 'org-1', _source: { name: 'Test Corp' }, _score: 1.5 },
          ],
          total: { value: 1 },
        },
        took: 10,
      });

      const result = await indexer.search('test');
      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by industry', async () => {
      await indexer.search('test', { industry: 'technology' });
      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by minimum transparency score', async () => {
      await indexer.search('test', { minTransparencyScore: 70 });
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('findByIndustry', () => {
    it('should find organizations by industry', async () => {
      await indexer.findByIndustry('technology');
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('findTopLobbyists', () => {
    it('should find top lobbying organizations', async () => {
      await indexer.findTopLobbyists();
      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('getAggregations', () => {
    it('should return facet aggregations', async () => {
      mockEsClient.search.mockResolvedValueOnce({
        hits: { hits: [], total: 0 },
        aggregations: {
          types: { buckets: [] },
          industries: { buckets: [] },
          verificationStatuses: { buckets: [] },
        },
      });

      const result = await indexer.getAggregations();
      expect(result).toHaveProperty('types');
      expect(result).toHaveProperty('industries');
      expect(result).toHaveProperty('verificationStatuses');
    });
  });
});
