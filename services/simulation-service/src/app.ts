/**
 * Simulation service Express application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import simulationsRouter from './routes/simulations';
import scenariosRouter from './routes/scenarios';
import analysisRouter from './routes/analysis';
import sandboxRouter from './routes/sandbox';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'simulation-service',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });

  // API info
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Constitutional Shrinkage Simulation Service',
      version: '0.1.0',
      description: 'Policy simulation and modeling API',
      endpoints: {
        simulations: '/simulations',
        scenarios: '/scenarios',
        analysis: '/analyze',
        sandbox: '/sandbox',
        health: '/health'
      }
    });
  });

  // Mount routes
  app.use('/simulations', simulationsRouter);
  app.use('/scenarios', scenariosRouter);
  app.use('/analyze', analysisRouter);
  app.use('/sandbox', sandboxRouter);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      message: 'The requested endpoint does not exist'
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  });

  return app;
}
