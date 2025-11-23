import cors from 'cors';

/**
 * CORS configuration for public API
 * Allows requests from any origin for public API endpoints
 */
export const corsMiddleware = cors({
  origin: true, // Allow any origin for public API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'Accept',
    'Accept-Version',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-RateLimit-RetryAfter',
    'X-Quota-Limit',
    'X-Quota-Remaining',
    'X-Request-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
});
