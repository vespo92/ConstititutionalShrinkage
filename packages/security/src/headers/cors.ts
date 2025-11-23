/**
 * CORS Configuration
 *
 * Cross-Origin Resource Sharing utilities.
 */

export interface CORSConfig {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export interface CORSHeaders {
  'Access-Control-Allow-Origin'?: string;
  'Access-Control-Allow-Methods'?: string;
  'Access-Control-Allow-Headers'?: string;
  'Access-Control-Expose-Headers'?: string;
  'Access-Control-Allow-Credentials'?: string;
  'Access-Control-Max-Age'?: string;
  'Vary'?: string;
}

const DEFAULT_METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

/**
 * Generate CORS headers for a request
 */
export function generateCORSHeaders(
  requestOrigin: string | undefined,
  config: CORSConfig
): CORSHeaders {
  const headers: CORSHeaders = {};

  // Check if origin is allowed
  const allowedOrigin = checkOrigin(requestOrigin, config.origin);

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;

    // Vary header when origin is dynamic
    if (typeof config.origin !== 'string' || config.origin === '*') {
      headers['Vary'] = 'Origin';
    }
  }

  // Credentials
  if (config.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';

    // When credentials are enabled, origin cannot be '*'
    if (headers['Access-Control-Allow-Origin'] === '*' && requestOrigin) {
      headers['Access-Control-Allow-Origin'] = requestOrigin;
    }
  }

  // Exposed headers
  if (config.exposedHeaders && config.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  }

  return headers;
}

/**
 * Generate CORS preflight headers
 */
export function generatePreflightHeaders(
  requestOrigin: string | undefined,
  requestMethod: string | undefined,
  requestHeaders: string | undefined,
  config: CORSConfig
): CORSHeaders {
  const headers = generateCORSHeaders(requestOrigin, config);

  // Methods
  const methods = config.methods || DEFAULT_METHODS;
  headers['Access-Control-Allow-Methods'] = methods.join(', ');

  // Headers
  if (requestHeaders) {
    // Reflect requested headers if allowed
    const allowedHeaders = config.allowedHeaders || DEFAULT_HEADERS;
    const requestedHeaders = requestHeaders.split(',').map((h) => h.trim());
    const reflected = requestedHeaders.filter((h) =>
      allowedHeaders.some((a) => a.toLowerCase() === h.toLowerCase())
    );

    if (reflected.length > 0) {
      headers['Access-Control-Allow-Headers'] = reflected.join(', ');
    } else {
      headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');
    }
  } else {
    headers['Access-Control-Allow-Headers'] = (config.allowedHeaders || DEFAULT_HEADERS).join(', ');
  }

  // Max age
  if (config.maxAge) {
    headers['Access-Control-Max-Age'] = config.maxAge.toString();
  }

  return headers;
}

/**
 * Check if origin is allowed
 */
function checkOrigin(
  requestOrigin: string | undefined,
  allowedOrigin: CORSConfig['origin']
): string | null {
  if (!requestOrigin) {
    return null;
  }

  // String origin
  if (typeof allowedOrigin === 'string') {
    if (allowedOrigin === '*') {
      return '*';
    }
    return allowedOrigin === requestOrigin ? requestOrigin : null;
  }

  // Array of origins
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(requestOrigin) ? requestOrigin : null;
  }

  // Function
  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(requestOrigin) ? requestOrigin : null;
  }

  return null;
}

/**
 * Create CORS configuration for common scenarios
 */
export const corsPresets = {
  /**
   * Restrictive - only same origin
   */
  restrictive: (): CORSConfig => ({
    origin: [],
    methods: ['GET', 'POST'],
    credentials: false,
  }),

  /**
   * Standard API - specific origins with credentials
   */
  standardAPI: (origins: string[]): CORSConfig => ({
    origin: origins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  }),

  /**
   * Public API - any origin, no credentials
   */
  publicAPI: (): CORSConfig => ({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
    maxAge: 3600,
  }),

  /**
   * Development - permissive for local development
   */
  development: (): CORSConfig => ({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    methods: DEFAULT_METHODS,
    allowedHeaders: [...DEFAULT_HEADERS, 'X-Debug'],
    credentials: true,
    maxAge: 0,
  }),
};

/**
 * Validate origin URL
 */
export function isValidOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
