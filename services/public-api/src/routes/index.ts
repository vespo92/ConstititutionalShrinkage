import { Router } from 'express';
import billsRouter from './v1/bills';
import votesRouter from './v1/votes';
import regionsRouter from './v1/regions';
import metricsRouter from './v1/metrics';
import searchRouter from './v1/search';
import webhooksRouter from './v1/webhooks';

const router = Router();

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'Constitutional Platform Public API',
    version: 'v1',
    documentation: 'https://developers.constitutional.io/docs',
    endpoints: {
      bills: '/v1/bills',
      votes: '/v1/votes',
      regions: '/v1/regions',
      metrics: '/v1/metrics',
      search: '/v1/search',
      webhooks: '/v1/webhooks',
    },
  });
});

// V1 API routes
router.use('/v1/bills', billsRouter);
router.use('/v1/votes', votesRouter);
router.use('/v1/regions', regionsRouter);
router.use('/v1/metrics', metricsRouter);
router.use('/v1/search', searchRouter);
router.use('/v1/webhooks', webhooksRouter);

export default router;
