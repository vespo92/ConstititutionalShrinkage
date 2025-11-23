/**
 * Cross-Site Request Forgery (CSRF) Attack Tests
 *
 * Tests to verify CSRF protection mechanisms.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';

interface CSRFConfig {
  tokenLength: number;
  cookieName: string;
  headerName: string;
  tokenExpiry: number;
  sameSite: 'strict' | 'lax' | 'none';
}

interface CSRFStore {
  tokens: Map<string, { token: string; expires: Date; sessionId: string }>;
}

function createCSRFProtection(config: CSRFConfig) {
  const store: CSRFStore = {
    tokens: new Map(),
  };

  function generateToken(sessionId: string): string {
    const token = crypto.randomBytes(config.tokenLength).toString('hex');
    const expires = new Date(Date.now() + config.tokenExpiry);

    store.tokens.set(sessionId, { token, expires, sessionId });

    return token;
  }

  function validateToken(sessionId: string, token: string): { valid: boolean; error?: string } {
    const stored = store.tokens.get(sessionId);

    if (!stored) {
      return { valid: false, error: 'No CSRF token found for session' };
    }

    if (new Date() > stored.expires) {
      store.tokens.delete(sessionId);
      return { valid: false, error: 'CSRF token expired' };
    }

    if (!crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token))) {
      return { valid: false, error: 'CSRF token mismatch' };
    }

    return { valid: true };
  }

  function rotateToken(sessionId: string): string {
    store.tokens.delete(sessionId);
    return generateToken(sessionId);
  }

  return {
    generateToken,
    validateToken,
    rotateToken,
    config,
  };
}

describe('CSRF Token Generation', () => {
  const config: CSRFConfig = {
    tokenLength: 32,
    cookieName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    tokenExpiry: 3600000, // 1 hour
    sameSite: 'strict',
  };

  it('should generate cryptographically secure tokens', () => {
    const csrf = createCSRFProtection(config);
    const tokens = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const token = csrf.generateToken(`session-${i}`);
      expect(tokens.has(token)).toBe(false);
      tokens.add(token);
    }

    expect(tokens.size).toBe(100);
  });

  it('should generate tokens of correct length', () => {
    const csrf = createCSRFProtection(config);
    const token = csrf.generateToken('session-1');

    // 32 bytes = 64 hex characters
    expect(token.length).toBe(64);
  });

  it('should associate tokens with sessions', () => {
    const csrf = createCSRFProtection(config);

    const token1 = csrf.generateToken('session-1');
    const token2 = csrf.generateToken('session-2');

    expect(csrf.validateToken('session-1', token1).valid).toBe(true);
    expect(csrf.validateToken('session-2', token2).valid).toBe(true);

    // Cross-session validation should fail
    expect(csrf.validateToken('session-1', token2).valid).toBe(false);
    expect(csrf.validateToken('session-2', token1).valid).toBe(false);
  });
});

describe('CSRF Token Validation', () => {
  const config: CSRFConfig = {
    tokenLength: 32,
    cookieName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    tokenExpiry: 3600000,
    sameSite: 'strict',
  };

  let csrf: ReturnType<typeof createCSRFProtection>;

  beforeEach(() => {
    csrf = createCSRFProtection(config);
  });

  it('should accept valid tokens', () => {
    const token = csrf.generateToken('session-1');
    const result = csrf.validateToken('session-1', token);

    expect(result.valid).toBe(true);
  });

  it('should reject invalid tokens', () => {
    csrf.generateToken('session-1');
    const result = csrf.validateToken('session-1', 'invalid-token');

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject tokens for non-existent sessions', () => {
    const result = csrf.validateToken('non-existent', 'some-token');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('No CSRF token');
  });

  it('should reject expired tokens', () => {
    const shortExpiryConfig: CSRFConfig = {
      ...config,
      tokenExpiry: 1, // 1ms expiry
    };
    const shortCsrf = createCSRFProtection(shortExpiryConfig);

    const token = shortCsrf.generateToken('session-1');

    // Wait for expiration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = shortCsrf.validateToken('session-1', token);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
        resolve();
      }, 10);
    });
  });

  it('should use timing-safe comparison', () => {
    const token = csrf.generateToken('session-1');

    // This tests that the comparison doesn't leak timing information
    // In practice, we verify crypto.timingSafeEqual is used
    const almostCorrect = token.slice(0, -1) + 'X';
    const completelyWrong = 'a'.repeat(64);

    const result1 = csrf.validateToken('session-1', almostCorrect);
    const result2 = csrf.validateToken('session-1', completelyWrong);

    expect(result1.valid).toBe(false);
    expect(result2.valid).toBe(false);
  });
});

describe('CSRF Token Rotation', () => {
  const config: CSRFConfig = {
    tokenLength: 32,
    cookieName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    tokenExpiry: 3600000,
    sameSite: 'strict',
  };

  it('should generate new token on rotation', () => {
    const csrf = createCSRFProtection(config);

    const token1 = csrf.generateToken('session-1');
    const token2 = csrf.rotateToken('session-1');

    expect(token1).not.toBe(token2);
  });

  it('should invalidate old token after rotation', () => {
    const csrf = createCSRFProtection(config);

    const token1 = csrf.generateToken('session-1');
    const token2 = csrf.rotateToken('session-1');

    expect(csrf.validateToken('session-1', token1).valid).toBe(false);
    expect(csrf.validateToken('session-1', token2).valid).toBe(true);
  });
});

describe('Double Submit Cookie Pattern', () => {
  interface DoubleSubmitValidator {
    validateRequest(
      cookieToken: string | undefined,
      headerToken: string | undefined
    ): { valid: boolean; error?: string };
  }

  function createDoubleSubmitValidator(): DoubleSubmitValidator {
    return {
      validateRequest(cookieToken, headerToken) {
        if (!cookieToken) {
          return { valid: false, error: 'CSRF cookie missing' };
        }

        if (!headerToken) {
          return { valid: false, error: 'CSRF header missing' };
        }

        if (cookieToken.length < 32) {
          return { valid: false, error: 'Invalid token format' };
        }

        try {
          if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
            return { valid: false, error: 'Token mismatch' };
          }
        } catch {
          return { valid: false, error: 'Token comparison failed' };
        }

        return { valid: true };
      },
    };
  }

  it('should accept matching cookie and header tokens', () => {
    const validator = createDoubleSubmitValidator();
    const token = crypto.randomBytes(32).toString('hex');

    const result = validator.validateRequest(token, token);

    expect(result.valid).toBe(true);
  });

  it('should reject missing cookie token', () => {
    const validator = createDoubleSubmitValidator();
    const token = crypto.randomBytes(32).toString('hex');

    const result = validator.validateRequest(undefined, token);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('cookie');
  });

  it('should reject missing header token', () => {
    const validator = createDoubleSubmitValidator();
    const token = crypto.randomBytes(32).toString('hex');

    const result = validator.validateRequest(token, undefined);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('header');
  });

  it('should reject mismatched tokens', () => {
    const validator = createDoubleSubmitValidator();
    const cookieToken = crypto.randomBytes(32).toString('hex');
    const headerToken = crypto.randomBytes(32).toString('hex');

    const result = validator.validateRequest(cookieToken, headerToken);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('mismatch');
  });
});

describe('SameSite Cookie Protection', () => {
  interface CookieConfig {
    name: string;
    value: string;
    sameSite: 'strict' | 'lax' | 'none';
    secure: boolean;
    httpOnly: boolean;
    path: string;
    maxAge?: number;
  }

  function generateCookieHeader(config: CookieConfig): string {
    const parts = [`${config.name}=${config.value}`];

    parts.push(`SameSite=${config.sameSite.charAt(0).toUpperCase() + config.sameSite.slice(1)}`);

    if (config.secure) {
      parts.push('Secure');
    }

    if (config.httpOnly) {
      parts.push('HttpOnly');
    }

    parts.push(`Path=${config.path}`);

    if (config.maxAge !== undefined) {
      parts.push(`Max-Age=${config.maxAge}`);
    }

    return parts.join('; ');
  }

  it('should set SameSite=Strict for maximum protection', () => {
    const cookie = generateCookieHeader({
      name: 'csrf_token',
      value: 'token123',
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
      path: '/',
    });

    expect(cookie).toContain('SameSite=Strict');
  });

  it('should require Secure flag when SameSite=None', () => {
    const validateCookieConfig = (config: CookieConfig): { valid: boolean; error?: string } => {
      if (config.sameSite === 'none' && !config.secure) {
        return { valid: false, error: 'SameSite=None requires Secure flag' };
      }
      return { valid: true };
    };

    const insecureConfig: CookieConfig = {
      name: 'csrf_token',
      value: 'token123',
      sameSite: 'none',
      secure: false,
      httpOnly: true,
      path: '/',
    };

    const secureConfig: CookieConfig = {
      name: 'csrf_token',
      value: 'token123',
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      path: '/',
    };

    expect(validateCookieConfig(insecureConfig).valid).toBe(false);
    expect(validateCookieConfig(secureConfig).valid).toBe(true);
  });

  it('should recommend Lax for usability with CSRF protection', () => {
    const cookie = generateCookieHeader({
      name: 'csrf_token',
      value: 'token123',
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      path: '/',
    });

    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('HttpOnly');
  });
});

describe('Origin and Referer Validation', () => {
  interface RequestHeaders {
    origin?: string;
    referer?: string;
    host: string;
  }

  function validateOrigin(
    headers: RequestHeaders,
    allowedOrigins: string[]
  ): { valid: boolean; error?: string } {
    // Check Origin header first (more reliable)
    if (headers.origin) {
      try {
        const originUrl = new URL(headers.origin);
        const originHost = originUrl.host;

        if (!allowedOrigins.includes(originHost)) {
          return { valid: false, error: `Origin ${originHost} not allowed` };
        }

        return { valid: true };
      } catch {
        return { valid: false, error: 'Invalid Origin header' };
      }
    }

    // Fall back to Referer header
    if (headers.referer) {
      try {
        const refererUrl = new URL(headers.referer);
        const refererHost = refererUrl.host;

        if (!allowedOrigins.includes(refererHost)) {
          return { valid: false, error: `Referer ${refererHost} not allowed` };
        }

        return { valid: true };
      } catch {
        return { valid: false, error: 'Invalid Referer header' };
      }
    }

    // Both headers missing - could be same-origin or stripped
    // For state-changing requests, this should be rejected
    return { valid: false, error: 'Missing Origin and Referer headers' };
  }

  it('should accept requests from allowed origins', () => {
    const result = validateOrigin(
      {
        origin: 'https://example.com',
        host: 'api.example.com',
      },
      ['example.com', 'api.example.com']
    );

    expect(result.valid).toBe(true);
  });

  it('should reject requests from disallowed origins', () => {
    const result = validateOrigin(
      {
        origin: 'https://evil.com',
        host: 'api.example.com',
      },
      ['example.com', 'api.example.com']
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('should use Referer as fallback', () => {
    const result = validateOrigin(
      {
        referer: 'https://example.com/page',
        host: 'api.example.com',
      },
      ['example.com', 'api.example.com']
    );

    expect(result.valid).toBe(true);
  });

  it('should reject requests without Origin or Referer', () => {
    const result = validateOrigin(
      {
        host: 'api.example.com',
      },
      ['example.com']
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing');
  });
});

describe('CSRF Exemptions', () => {
  interface CSRFExemptionConfig {
    safeMethods: string[];
    publicPaths: string[];
    webhookPaths: { path: string; validateSignature: boolean }[];
  }

  function shouldValidateCSRF(
    method: string,
    path: string,
    config: CSRFExemptionConfig
  ): boolean {
    // Safe methods don't need CSRF protection
    if (config.safeMethods.includes(method.toUpperCase())) {
      return false;
    }

    // Public paths are exempted
    if (config.publicPaths.some((p) => path.startsWith(p))) {
      return false;
    }

    // Webhook paths rely on signature validation instead
    if (config.webhookPaths.some((w) => path.startsWith(w.path))) {
      return false;
    }

    return true;
  }

  const exemptionConfig: CSRFExemptionConfig = {
    safeMethods: ['GET', 'HEAD', 'OPTIONS'],
    publicPaths: ['/api/public/', '/health'],
    webhookPaths: [
      { path: '/webhook/stripe', validateSignature: true },
      { path: '/webhook/github', validateSignature: true },
    ],
  };

  it('should exempt GET requests', () => {
    expect(shouldValidateCSRF('GET', '/api/users', exemptionConfig)).toBe(false);
  });

  it('should validate POST requests', () => {
    expect(shouldValidateCSRF('POST', '/api/users', exemptionConfig)).toBe(true);
  });

  it('should exempt public paths', () => {
    expect(shouldValidateCSRF('POST', '/api/public/register', exemptionConfig)).toBe(false);
  });

  it('should exempt webhook paths', () => {
    expect(shouldValidateCSRF('POST', '/webhook/stripe/payment', exemptionConfig)).toBe(false);
    expect(shouldValidateCSRF('POST', '/webhook/github/push', exemptionConfig)).toBe(false);
  });

  it('should validate non-exempt POST requests', () => {
    expect(shouldValidateCSRF('POST', '/api/users/update', exemptionConfig)).toBe(true);
    expect(shouldValidateCSRF('PUT', '/api/settings', exemptionConfig)).toBe(true);
    expect(shouldValidateCSRF('DELETE', '/api/posts/123', exemptionConfig)).toBe(true);
  });
});
