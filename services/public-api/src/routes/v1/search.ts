import { Router, Request, Response } from 'express';
import { parsePaginationParams, createPaginatedResponse } from '../../lib/pagination';

const router = Router();

/**
 * GET /v1/search/bills
 * Search bills with full-text search
 */
router.get('/bills', async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const { query, status, category, region, sortBy, sortOrder } = req.query;

    if (!query) {
      res.status(400).json({
        error: { code: 'MISSING_QUERY', message: 'Search query is required' },
      });
      return;
    }

    // Mock search results
    const searchResults = [
      {
        id: 'bill_001',
        title: 'Renewable Energy Infrastructure Act',
        summary: 'Establishing regional renewable energy requirements and incentives',
        status: 'voting',
        category: 'infrastructure',
        region: 'CA',
        relevanceScore: 0.95,
        highlights: [
          'Establishing regional <em>renewable energy</em> requirements',
          'Incentives for <em>renewable</em> adoption',
        ],
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'bill_003',
        title: 'Clean Energy Transition Fund',
        summary: 'Creating a fund to support clean energy projects in underserved areas',
        status: 'draft',
        category: 'environment',
        region: 'CA',
        relevanceScore: 0.82,
        highlights: [
          'Support clean <em>energy</em> projects',
          '<em>Renewable</em> installation assistance',
        ],
        createdAt: '2024-01-18T14:00:00Z',
      },
    ];

    const response = {
      ...createPaginatedResponse(searchResults, pagination),
      meta: {
        query: query as string,
        totalResults: searchResults.length,
        searchTime: 0.045,
        filters: {
          status: status || null,
          category: category || null,
          region: region || null,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error searching bills:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Search failed' },
    });
  }
});

/**
 * GET /v1/search/regions
 * Search regions
 */
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const { query, type } = req.query;

    if (!query) {
      res.status(400).json({
        error: { code: 'MISSING_QUERY', message: 'Search query is required' },
      });
      return;
    }

    // Mock search results
    const searchResults = [
      {
        id: 'CA-SF',
        name: 'San Francisco',
        type: 'city',
        parentName: 'California',
        relevanceScore: 0.98,
        metrics: {
          tblScore: 82.1,
          participationRate: 74.5,
        },
      },
      {
        id: 'CA-SJ',
        name: 'San Jose',
        type: 'city',
        parentName: 'California',
        relevanceScore: 0.72,
        metrics: {
          tblScore: 76.4,
          participationRate: 68.2,
        },
      },
    ];

    const response = {
      ...createPaginatedResponse(searchResults, pagination),
      meta: {
        query: query as string,
        totalResults: searchResults.length,
        searchTime: 0.023,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error searching regions:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Search failed' },
    });
  }
});

/**
 * GET /v1/search/suggestions
 * Get search suggestions/autocomplete
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { query, type } = req.query;

    if (!query || (query as string).length < 2) {
      res.json({ data: { suggestions: [] } });
      return;
    }

    // Mock suggestions
    const suggestions = [
      { text: 'renewable energy', type: 'bill', count: 12 },
      { text: 'renewable infrastructure', type: 'bill', count: 5 },
      { text: 'San Francisco', type: 'region', count: 1 },
    ];

    res.json({
      data: {
        query: query as string,
        suggestions: suggestions.filter(
          (s) => !type || s.type === type
        ),
      },
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get suggestions' },
    });
  }
});

export default router;
