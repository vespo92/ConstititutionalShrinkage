import { Request, Response, NextFunction } from 'express';
import { usageService } from '../services/usage';

/**
 * Middleware to track API usage and enforce quotas
 */
export async function trackUsage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();

  // Capture response to track status code
  const originalSend = res.send;
  res.send = function (body): Response {
    const responseTime = Date.now() - startTime;

    // Track usage asynchronously
    if (req.apiKey) {
      usageService.trackRequest({
        apiKeyId: req.apiKey.id,
        endpoint: req.path,
        method: req.method,
        timestamp: new Date(),
        responseTime,
        statusCode: res.statusCode,
      }).catch(err => console.error('Failed to track usage:', err));
    }

    return originalSend.call(this, body);
  };

  next();
}

/**
 * Middleware to check daily quota
 */
export async function checkQuota(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.apiKey) {
      next();
      return;
    }

    const usage = await usageService.getDailyUsage(req.apiKey.id);
    const limit = req.apiKey.rateLimit.requestsPerDay;

    // Add usage headers
    res.set('X-Quota-Limit', limit === 'unlimited' ? 'unlimited' : limit.toString());
    res.set('X-Quota-Remaining', limit === 'unlimited' ? 'unlimited' : Math.max(0, (limit as number) - usage).toString());

    if (limit !== 'unlimited' && usage >= (limit as number)) {
      res.status(429).json({
        error: {
          code: 'DAILY_QUOTA_EXCEEDED',
          message: 'Daily API quota exceeded. Upgrade your plan for higher limits.',
          details: {
            used: usage,
            limit: limit,
            resetsAt: getEndOfDay().toISOString(),
          },
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Quota check error:', error);
    next();
  }
}

function getEndOfDay(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
}
