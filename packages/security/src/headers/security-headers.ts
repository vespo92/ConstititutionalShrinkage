/**
 * Security Headers
 *
 * HTTP security header utilities.
 */

export interface SecurityHeaders {
  'Strict-Transport-Security'?: string;
  'Content-Security-Policy'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Cache-Control'?: string;
  'Pragma'?: string;
  'X-Permitted-Cross-Domain-Policies'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
}

export interface SecurityHeadersConfig {
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  } | false;
  csp?: {
    directives?: Record<string, string | string[]>;
    reportUri?: string;
    reportOnly?: boolean;
  };
  frameOptions?: 'DENY' | 'SAMEORIGIN' | { allowFrom: string } | false;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
  noSniff?: boolean;
  xssProtection?: boolean;
  crossOriginPolicies?: {
    embedder?: 'require-corp' | 'credentialless' | 'unsafe-none';
    opener?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
    resource?: 'same-origin' | 'same-site' | 'cross-origin';
  };
}

/**
 * Generate security headers
 */
export function generateSecurityHeaders(
  config: SecurityHeadersConfig = {}
): SecurityHeaders {
  const headers: SecurityHeaders = {};

  // HSTS
  if (config.hsts !== false) {
    const hsts = config.hsts || {};
    const maxAge = hsts.maxAge ?? 31536000;
    let value = `max-age=${maxAge}`;
    if (hsts.includeSubDomains !== false) {
      value += '; includeSubDomains';
    }
    if (hsts.preload) {
      value += '; preload';
    }
    headers['Strict-Transport-Security'] = value;
  }

  // CSP
  if (config.csp) {
    const directives = config.csp.directives || getDefaultCSPDirectives();
    const cspParts: string[] = [];

    for (const [directive, value] of Object.entries(directives)) {
      const valueStr = Array.isArray(value) ? value.join(' ') : value;
      cspParts.push(`${directive} ${valueStr}`);
    }

    if (config.csp.reportUri) {
      cspParts.push(`report-uri ${config.csp.reportUri}`);
    }

    const headerName = config.csp.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';
    headers[headerName as keyof SecurityHeaders] = cspParts.join('; ');
  }

  // X-Content-Type-Options
  if (config.noSniff !== false) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // X-Frame-Options
  if (config.frameOptions !== false) {
    if (typeof config.frameOptions === 'object') {
      headers['X-Frame-Options'] = `ALLOW-FROM ${config.frameOptions.allowFrom}`;
    } else {
      headers['X-Frame-Options'] = config.frameOptions || 'DENY';
    }
  }

  // X-XSS-Protection (legacy but still useful)
  if (config.xssProtection !== false) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Referrer-Policy
  headers['Referrer-Policy'] = config.referrerPolicy || 'strict-origin-when-cross-origin';

  // Permissions-Policy
  if (config.permissionsPolicy) {
    const policies: string[] = [];
    for (const [feature, origins] of Object.entries(config.permissionsPolicy)) {
      const originStr = origins.length === 0 ? '()' : `(${origins.join(' ')})`;
      policies.push(`${feature}=${originStr}`);
    }
    headers['Permissions-Policy'] = policies.join(', ');
  } else {
    headers['Permissions-Policy'] = getDefaultPermissionsPolicy();
  }

  // Cross-Origin Policies
  if (config.crossOriginPolicies) {
    if (config.crossOriginPolicies.embedder) {
      headers['Cross-Origin-Embedder-Policy'] = config.crossOriginPolicies.embedder;
    }
    if (config.crossOriginPolicies.opener) {
      headers['Cross-Origin-Opener-Policy'] = config.crossOriginPolicies.opener;
    }
    if (config.crossOriginPolicies.resource) {
      headers['Cross-Origin-Resource-Policy'] = config.crossOriginPolicies.resource;
    }
  }

  // X-Permitted-Cross-Domain-Policies
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';

  return headers;
}

/**
 * Get default CSP directives
 */
function getDefaultCSPDirectives(): Record<string, string | string[]> {
  return {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:', 'data:'],
    'connect-src': "'self'",
    'frame-ancestors': "'none'",
    'form-action': "'self'",
    'base-uri': "'self'",
    'object-src': "'none'",
    'upgrade-insecure-requests': '',
  };
}

/**
 * Get default Permissions-Policy
 */
function getDefaultPermissionsPolicy(): string {
  return [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', ');
}

/**
 * Generate cache control headers for sensitive content
 */
export function generateNoCacheHeaders(): SecurityHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
  };
}

/**
 * Merge security headers
 */
export function mergeHeaders(
  base: SecurityHeaders,
  override: SecurityHeaders
): SecurityHeaders {
  return { ...base, ...override };
}
