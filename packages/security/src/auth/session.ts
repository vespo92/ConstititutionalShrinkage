/**
 * Session Management
 *
 * Secure session handling utilities.
 */

import crypto from 'node:crypto';

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent?: string;
  data: Record<string, unknown>;
  isValid: boolean;
}

export interface SessionConfig {
  maxAge: number; // seconds
  renewThreshold: number; // seconds before expiry to auto-renew
  absoluteMaxAge?: number; // seconds, maximum session lifetime
  fingerprint: boolean; // require device fingerprint match
}

const DEFAULT_CONFIG: SessionConfig = {
  maxAge: 3600, // 1 hour
  renewThreshold: 300, // 5 minutes
  absoluteMaxAge: 86400, // 24 hours
  fingerprint: true,
};

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session
 */
export function createSession(
  userId: string,
  ipAddress: string,
  userAgent?: string,
  config: Partial<SessionConfig> = {}
): Session {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();

  return {
    id: generateSessionId(),
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + finalConfig.maxAge * 1000),
    lastActivity: now,
    ipAddress,
    userAgent,
    data: {},
    isValid: true,
  };
}

/**
 * Check if session should be renewed
 */
export function shouldRenew(session: Session, config: Partial<SessionConfig> = {}): boolean {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const expiresAt = session.expiresAt.getTime();
  const timeUntilExpiry = (expiresAt - now) / 1000;

  return timeUntilExpiry < finalConfig.renewThreshold;
}

/**
 * Renew session expiration
 */
export function renewSession(
  session: Session,
  config: Partial<SessionConfig> = {}
): Session {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const now = new Date();

  // Check absolute max age
  if (finalConfig.absoluteMaxAge) {
    const absoluteExpiry = session.createdAt.getTime() + finalConfig.absoluteMaxAge * 1000;
    if (now.getTime() >= absoluteExpiry) {
      return { ...session, isValid: false };
    }
  }

  return {
    ...session,
    expiresAt: new Date(now.getTime() + finalConfig.maxAge * 1000),
    lastActivity: now,
  };
}

/**
 * Validate session
 */
export function validateSession(
  session: Session,
  ipAddress: string,
  userAgent?: string,
  config: Partial<SessionConfig> = {}
): { valid: boolean; reason?: string } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check if session is marked invalid
  if (!session.isValid) {
    return { valid: false, reason: 'Session invalidated' };
  }

  // Check expiration
  if (new Date() > session.expiresAt) {
    return { valid: false, reason: 'Session expired' };
  }

  // Check absolute max age
  if (finalConfig.absoluteMaxAge) {
    const absoluteExpiry = session.createdAt.getTime() + finalConfig.absoluteMaxAge * 1000;
    if (Date.now() >= absoluteExpiry) {
      return { valid: false, reason: 'Session exceeded maximum lifetime' };
    }
  }

  // Check fingerprint
  if (finalConfig.fingerprint) {
    if (session.ipAddress !== ipAddress) {
      return { valid: false, reason: 'IP address mismatch' };
    }
    if (session.userAgent && userAgent && session.userAgent !== userAgent) {
      return { valid: false, reason: 'User agent mismatch' };
    }
  }

  return { valid: true };
}

/**
 * Create session fingerprint
 */
export function createFingerprint(
  ipAddress: string,
  userAgent?: string,
  additionalData?: Record<string, string>
): string {
  const data = {
    ip: ipAddress,
    ua: userAgent || '',
    ...additionalData,
  };

  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Invalidate session
 */
export function invalidateSession(session: Session): Session {
  return {
    ...session,
    isValid: false,
    expiresAt: new Date(),
  };
}

/**
 * Update session data
 */
export function updateSessionData(
  session: Session,
  data: Record<string, unknown>
): Session {
  return {
    ...session,
    data: { ...session.data, ...data },
    lastActivity: new Date(),
  };
}

/**
 * Get session age in seconds
 */
export function getSessionAge(session: Session): number {
  return Math.floor((Date.now() - session.createdAt.getTime()) / 1000);
}

/**
 * Get idle time in seconds
 */
export function getIdleTime(session: Session): number {
  return Math.floor((Date.now() - session.lastActivity.getTime()) / 1000);
}
