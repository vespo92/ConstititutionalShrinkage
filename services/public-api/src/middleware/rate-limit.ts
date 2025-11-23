import { Request, Response, NextFunction } from 'express';
import { RateLimitHeaders, RATE_LIMIT_TIERS } from '../types';
import { rateLimiterService } from '../services/rate-limiter';

/**
 * Rate limiting middleware for public API
 * Uses sliding window algorithm with Redis
 */
export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.apiKey) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key is required for rate limiting.',
        },
      });
      return;
    }

    const tierConfig = RATE_LIMIT_TIERS[req.apiKey.tier];

    // Government tier has unlimited requests
    if (tierConfig.requestsPerMinute === 'unlimited') {
      next();
      return;
    }

    const result = await rateLimiterService.checkRateLimit(
      req.apiKey.id,
      tierConfig.requestsPerMinute as number,
      tierConfig.requestsPerDay as number
    );

    // Set rate limit headers
    const headers: RateLimitHeaders = {
      'X-RateLimit-Limit': result.limit,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': result.resetAt,
    };

    res.set('X-RateLimit-Limit', headers['X-RateLimit-Limit'].toString());
    res.set('X-RateLimit-Remaining', headers['X-RateLimit-Remaining'].toString());
    res.set('X-RateLimit-Reset', headers['X-RateLimit-Reset'].toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      res.set('X-RateLimit-RetryAfter', retryAfter.toString());
      res.set('Retry-After', retryAfter.toString());

      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          details: {
            limit: result.limit,
            remaining: result.remaining,
            resetAt: new Date(result.resetAt).toISOString(),
          },
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow request but log for monitoring
    next();
  }
}

/**
 * Stricter rate limiting for sensitive endpoints
 */
export function strictRateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.apiKey) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'API key is required.',
          },
        });
        return;
      }

      const result = await rateLimiterService.checkStrictRateLimit(
        req.apiKey.id,
        req.path,
        maxRequests,
        windowSeconds
      );

      if (!result.allowed) {
        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests to this endpoint. Try again later.`,
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Strict rate limit error:', error);
      next();
    }
  };
}
