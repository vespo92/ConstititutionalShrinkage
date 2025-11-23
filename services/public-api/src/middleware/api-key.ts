import { Request, Response, NextFunction } from 'express';
import { ApiKey, RATE_LIMIT_TIERS } from '../types';
import { apiKeyService } from '../services/api-keys';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
    }
  }
}

/**
 * Middleware to validate API keys from Authorization header or x-api-key header
 */
export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract API key from headers
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

    let keyValue: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      keyValue = authHeader.substring(7);
    } else if (apiKeyHeader) {
      keyValue = apiKeyHeader;
    }

    if (!keyValue) {
      res.status(401).json({
        error: {
          code: 'MISSING_API_KEY',
          message: 'API key is required. Provide it via Authorization: Bearer <key> or x-api-key header.',
        },
      });
      return;
    }

    // Validate the API key
    const apiKey = await apiKeyService.validateKey(keyValue);

    if (!apiKey) {
      res.status(401).json({
        error: {
          code: 'INVALID_API_KEY',
          message: 'The provided API key is invalid or has been revoked.',
        },
      });
      return;
    }

    // Check if key has expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      res.status(401).json({
        error: {
          code: 'EXPIRED_API_KEY',
          message: 'The provided API key has expired.',
        },
      });
      return;
    }

    // Attach API key to request for use in other middleware/handlers
    req.apiKey = apiKey;

    // Update last used timestamp
    await apiKeyService.updateLastUsed(apiKey.id);

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while validating the API key.',
      },
    });
  }
}

/**
 * Middleware to check if API key has specific permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'API key is required.',
        },
      });
      return;
    }

    if (!req.apiKey.permissions.includes(permission) && !req.apiKey.permissions.includes('*')) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `This operation requires the '${permission}' permission.`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Get rate limit config based on API key tier
 */
export function getRateLimitConfig(apiKey: ApiKey) {
  return RATE_LIMIT_TIERS[apiKey.tier];
}
