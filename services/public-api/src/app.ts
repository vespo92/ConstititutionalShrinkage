import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors';
import { requestId } from './middleware/request-id';
import { validateApiKey } from './middleware/api-key';
import { rateLimit } from './middleware/rate-limit';
import { trackUsage, checkQuota } from './middleware/quota';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request tracking
app.use(requestId);

// Health check endpoint (no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public endpoints that don't require auth
app.use('/api', routes);

// Apply auth middleware to v1 routes
app.use('/api/v1', validateApiKey);
app.use('/api/v1', rateLimit);
app.use('/api/v1', checkQuota);
app.use('/api/v1', trackUsage);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);

  // Don't expose internal errors
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction
        ? 'An internal error occurred'
        : err.message,
      requestId: req.requestId,
    },
  });
});

export default app;
