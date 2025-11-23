import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware to add unique request ID for tracking and debugging
 */
export function requestId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Use provided request ID or generate new one
  const id = (req.headers['x-request-id'] as string) || uuidv4();

  req.requestId = id;
  res.set('X-Request-ID', id);

  next();
}
