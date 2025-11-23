import { PublicBill, PublicVoteSession, PublicRegion } from '../types';

/**
 * Data sanitization utilities for public API responses
 * Ensures sensitive data is not exposed through the public API
 */

/**
 * Sanitize bill data for public consumption
 */
export function sanitizeBill(bill: Record<string, unknown>): PublicBill {
  return {
    id: bill.id as string,
    title: bill.title as string,
    summary: bill.summary as string,
    status: bill.status as string,
    category: bill.category as string,
    region: bill.region as string | undefined,
    version: bill.version as number,
    createdAt: formatDate(bill.createdAt),
    updatedAt: formatDate(bill.updatedAt),
    submittedAt: bill.submittedAt ? formatDate(bill.submittedAt) : undefined,
    votingEndsAt: bill.votingEndsAt ? formatDate(bill.votingEndsAt) : undefined,
    author: {
      id: (bill.author as Record<string, unknown>)?.id as string || '',
      displayName: (bill.author as Record<string, unknown>)?.displayName as string || 'Anonymous',
    },
    metrics: bill.metrics as PublicBill['metrics'],
  };
}

/**
 * Sanitize vote session data for public consumption
 */
export function sanitizeVoteSession(session: Record<string, unknown>): PublicVoteSession {
  return {
    id: session.id as string,
    billId: session.billId as string,
    status: session.status as PublicVoteSession['status'],
    startedAt: formatDate(session.startedAt),
    endsAt: formatDate(session.endsAt),
    tally: session.tally as PublicVoteSession['tally'],
    participationRate: session.participationRate as number,
    quorumMet: session.quorumMet as boolean,
  };
}

/**
 * Sanitize region data for public consumption
 */
export function sanitizeRegion(region: Record<string, unknown>): PublicRegion {
  return {
    id: region.id as string,
    name: region.name as string,
    type: region.type as PublicRegion['type'],
    parentId: region.parentId as string | undefined,
    population: region.population as number,
    activeCitizens: region.activeCitizens as number,
    metrics: region.metrics as PublicRegion['metrics'],
  };
}

/**
 * Remove sensitive fields from any object
 */
export function removeSensitiveFields<T extends Record<string, unknown>>(
  obj: T,
  sensitiveFields: string[]
): Partial<T> {
  const result = { ...obj };
  for (const field of sensitiveFields) {
    delete result[field];
  }
  return result;
}

/**
 * Sanitize error messages to avoid leaking internal details
 */
export function sanitizeError(error: unknown): {
  code: string;
  message: string;
} {
  if (error instanceof Error) {
    // Don't expose internal error details
    if (error.message.includes('prisma') || error.message.includes('database')) {
      return {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred. Please try again later.',
      };
    }
    return {
      code: 'ERROR',
      message: error.message,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred.',
  };
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow https URLs
    if (parsed.protocol !== 'https:') {
      return null;
    }
    // Prevent localhost/internal URLs
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.endsWith('.internal')
    ) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Format date for API response
 */
function formatDate(date: unknown): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return new Date().toISOString();
}
