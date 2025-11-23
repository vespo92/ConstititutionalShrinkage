import { Router, Request, Response } from 'express';
import { parsePaginationParams, createPaginatedResponse } from '../../lib/pagination';
import { sanitizeBill } from '../../lib/sanitize';
import { PublicBill } from '../../types';

const router = Router();

// Mock data for demo - replace with actual database queries
const mockBills: PublicBill[] = [
  {
    id: 'bill_001',
    title: 'Renewable Energy Infrastructure Act',
    summary: 'Establishing regional renewable energy requirements and incentives',
    status: 'voting',
    category: 'infrastructure',
    region: 'CA',
    version: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    votingEndsAt: '2024-02-15T23:59:59Z',
    author: { id: 'user_123', displayName: 'Jane Citizen' },
    metrics: { supporters: 15420, opposers: 3201, comments: 892 },
  },
  {
    id: 'bill_002',
    title: 'Community Safety Standards Update',
    summary: 'Updating regional safety standards with focus on harm reduction',
    status: 'passed',
    category: 'safety',
    region: 'CA-SF',
    version: 2,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    submittedAt: '2024-01-12T10:00:00Z',
    author: { id: 'user_456', displayName: 'Community Council' },
    metrics: { supporters: 8932, opposers: 2104, comments: 445 },
  },
];

/**
 * GET /v1/bills
 * List bills with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const { status, category, region, search } = req.query;

    // Filter bills (in production, this would be a database query)
    let filteredBills = [...mockBills];

    if (status) {
      filteredBills = filteredBills.filter((b) => b.status === status);
    }
    if (category) {
      filteredBills = filteredBills.filter((b) => b.category === category);
    }
    if (region) {
      filteredBills = filteredBills.filter((b) => b.region === region);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredBills = filteredBills.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.summary.toLowerCase().includes(searchLower)
      );
    }

    const response = createPaginatedResponse(filteredBills, pagination, filteredBills.length);

    res.json(response);
  } catch (error) {
    console.error('Error listing bills:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list bills' },
    });
  }
});

/**
 * GET /v1/bills/:id
 * Get a specific bill by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bill = mockBills.find((b) => b.id === id);

    if (!bill) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Bill ${id} not found` },
      });
      return;
    }

    res.json({ data: bill });
  } catch (error) {
    console.error('Error getting bill:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill' },
    });
  }
});

/**
 * GET /v1/bills/:id/versions
 * Get version history for a bill
 */
router.get('/:id/versions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bill = mockBills.find((b) => b.id === id);

    if (!bill) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Bill ${id} not found` },
      });
      return;
    }

    // Mock version history
    const versions = Array.from({ length: bill.version }, (_, i) => ({
      version: i + 1,
      createdAt: new Date(Date.now() - (bill.version - i) * 86400000).toISOString(),
      author: bill.author,
      summary: `Version ${i + 1} changes`,
    }));

    res.json({ data: versions });
  } catch (error) {
    console.error('Error getting bill versions:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill versions' },
    });
  }
});

/**
 * GET /v1/bills/:id/diff
 * Get diff between two versions
 */
router.get('/:id/diff', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fromVersion, toVersion } = req.query;

    const bill = mockBills.find((b) => b.id === id);

    if (!bill) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Bill ${id} not found` },
      });
      return;
    }

    const from = parseInt(fromVersion as string) || 1;
    const to = parseInt(toVersion as string) || bill.version;

    // Mock diff data
    const diff = {
      billId: id,
      fromVersion: from,
      toVersion: to,
      changes: [
        {
          section: 'Section 2.1',
          type: 'modified',
          before: 'Original text for this section...',
          after: 'Updated text with modifications...',
        },
        {
          section: 'Section 3',
          type: 'added',
          after: 'New section content...',
        },
      ],
    };

    res.json({ data: diff });
  } catch (error) {
    console.error('Error getting bill diff:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill diff' },
    });
  }
});

/**
 * GET /v1/bills/:id/amendments
 * Get amendments for a bill
 */
router.get('/:id/amendments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pagination = parsePaginationParams(req.query);

    const bill = mockBills.find((b) => b.id === id);

    if (!bill) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Bill ${id} not found` },
      });
      return;
    }

    // Mock amendments
    const amendments = [
      {
        id: 'amend_001',
        billId: id,
        title: 'Increase renewable target to 50%',
        status: 'pending',
        author: { id: 'user_789', displayName: 'Green Coalition' },
        createdAt: '2024-01-22T10:00:00Z',
        supporters: 3240,
      },
    ];

    const response = createPaginatedResponse(amendments, pagination);
    res.json(response);
  } catch (error) {
    console.error('Error getting bill amendments:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get amendments' },
    });
  }
});

export default router;
