/**
 * JWT Utilities
 *
 * Secure JWT handling for authentication.
 */

import crypto from 'node:crypto';

export interface JWTHeader {
  alg: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
  typ: 'JWT';
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

const base64UrlEncode = (data: string | Buffer): string => {
  const base64 = Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (data: string): string => {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString();
};

/**
 * Create a JWT token
 */
export function createToken(
  payload: JWTPayload,
  secret: string,
  options: {
    algorithm?: JWTHeader['alg'];
    expiresIn?: number;
    issuer?: string;
    audience?: string | string[];
  } = {}
): string {
  const header: JWTHeader = {
    alg: options.algorithm || 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const finalPayload: JWTPayload = {
    ...payload,
    iat: payload.iat || now,
    iss: payload.iss || options.issuer,
    aud: payload.aud || options.audience,
  };

  if (options.expiresIn && !payload.exp) {
    finalPayload.exp = now + options.expiresIn;
  }

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(finalPayload));
  const signature = sign(`${headerEncoded}.${payloadEncoded}`, secret, header.alg);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(
  token: string,
  secret: string,
  options: {
    algorithms?: JWTHeader['alg'][];
    issuer?: string | string[];
    audience?: string | string[];
    clockTolerance?: number;
  } = {}
): { valid: boolean; payload?: JWTPayload; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [headerEncoded, payloadEncoded, signatureProvided] = parts;
    if (!headerEncoded || !payloadEncoded || !signatureProvided) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const header = JSON.parse(base64UrlDecode(headerEncoded)) as JWTHeader;
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JWTPayload;

    // Verify algorithm
    const allowedAlgs = options.algorithms || ['HS256'];
    if (!allowedAlgs.includes(header.alg)) {
      return { valid: false, error: `Algorithm ${header.alg} not allowed` };
    }

    // Verify signature
    const expectedSignature = sign(`${headerEncoded}.${payloadEncoded}`, secret, header.alg);
    if (!timingSafeEqual(signatureProvided, expectedSignature)) {
      return { valid: false, error: 'Invalid signature' };
    }

    const now = Math.floor(Date.now() / 1000);
    const clockTolerance = options.clockTolerance || 0;

    // Verify expiration
    if (payload.exp && payload.exp + clockTolerance < now) {
      return { valid: false, error: 'Token expired' };
    }

    // Verify not before
    if (payload.nbf && payload.nbf - clockTolerance > now) {
      return { valid: false, error: 'Token not yet valid' };
    }

    // Verify issuer
    if (options.issuer) {
      const issuers = Array.isArray(options.issuer) ? options.issuer : [options.issuer];
      if (payload.iss && !issuers.includes(payload.iss)) {
        return { valid: false, error: 'Invalid issuer' };
      }
    }

    // Verify audience
    if (options.audience) {
      const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
      if (!tokenAudiences.some((a) => audiences.includes(a))) {
        return { valid: false, error: 'Invalid audience' };
      }
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Decode a JWT without verification (use with caution)
 */
export function decodeToken(token: string): { header: JWTHeader; payload: JWTPayload } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded] = parts;
    if (!headerEncoded || !payloadEncoded) return null;

    return {
      header: JSON.parse(base64UrlDecode(headerEncoded)),
      payload: JSON.parse(base64UrlDecode(payloadEncoded)),
    };
  } catch {
    return null;
  }
}

/**
 * Generate a JWT ID
 */
export function generateJti(): string {
  return crypto.randomBytes(16).toString('hex');
}

function sign(data: string, secret: string, algorithm: JWTHeader['alg']): string {
  const hmacAlg = algorithm.replace('HS', 'sha');
  const hmac = crypto.createHmac(hmacAlg, secret);
  hmac.update(data);
  return base64UrlEncode(hmac.digest());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
