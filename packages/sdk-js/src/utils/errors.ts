import {
  ConstitutionalError,
  RateLimitError,
  AuthenticationError,
  NotFoundError,
} from '../types/common.types';

/**
 * Check if error is a Constitutional SDK error
 */
export function isConstitutionalError(error: unknown): error is ConstitutionalError {
  return error instanceof ConstitutionalError;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isConstitutionalError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Create error with retry suggestion for rate limits
 */
export function formatRateLimitMessage(error: RateLimitError): string {
  const minutes = Math.ceil(error.retryAfter / 60);
  return `Rate limit exceeded. Please retry in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

// Re-export error classes
export {
  ConstitutionalError,
  RateLimitError,
  AuthenticationError,
  NotFoundError,
};
