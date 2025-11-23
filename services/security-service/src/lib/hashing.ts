/**
 * Secure Hashing Utilities
 *
 * Provides various hashing functions for security operations.
 */

import crypto from 'node:crypto';

/**
 * Create a SHA-256 hash
 */
export function sha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create a SHA-512 hash
 */
export function sha512(data: string | Buffer): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Create a HMAC-SHA256
 */
export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Create a HMAC-SHA512
 */
export function hmacSha512(data: string, secret: string): string {
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

/**
 * Create a tamper-proof hash for audit logs
 * Includes timestamp and previous hash for chain integrity
 */
export function createAuditHash(
  data: Record<string, unknown>,
  timestamp: Date,
  previousHash?: string
): string {
  const content = JSON.stringify({
    data,
    timestamp: timestamp.toISOString(),
    previousHash: previousHash || 'genesis',
  });

  return sha256(content);
}

/**
 * Verify audit log chain integrity
 */
export function verifyAuditChain(
  logs: Array<{
    hash: string;
    previousHash?: string;
    timestamp: Date;
    [key: string]: unknown;
  }>
): { valid: boolean; brokenAt?: number } {
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    if (!log) continue;

    // For each log except the first, verify the previous hash matches
    if (i > 0) {
      const prevLog = logs[i - 1];
      if (prevLog && log.previousHash !== prevLog.hash) {
        return { valid: false, brokenAt: i };
      }
    }

    // Verify the hash itself
    const { hash, previousHash, ...data } = log;
    const expectedHash = createAuditHash(data, log.timestamp, previousHash);
    if (hash !== expectedHash) {
      return { valid: false, brokenAt: i };
    }
  }

  return { valid: true };
}

/**
 * Hash a file for integrity verification
 */
export function hashFile(content: Buffer, algorithm = 'sha256'): string {
  return crypto.createHash(algorithm).update(content).digest('hex');
}

/**
 * Create a hash with salt for storing sensitive identifiers
 */
export function hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(data, useSalt, 10000, 64, 'sha512')
    .toString('hex');

  return { hash, salt: useSalt };
}

/**
 * Verify a salted hash
 */
export function verifySaltedHash(data: string, hash: string, salt: string): boolean {
  const computed = crypto
    .pbkdf2Sync(data, salt, 10000, 64, 'sha512')
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
}

/**
 * Generate a fingerprint for a request (for deduplication/tracking)
 */
export function requestFingerprint(
  method: string,
  path: string,
  body?: unknown,
  userId?: string
): string {
  const data = JSON.stringify({
    method,
    path,
    body: body || null,
    userId: userId || null,
  });

  return sha256(data).substring(0, 16);
}

/**
 * Create a content hash for integrity verification
 */
export function contentHash(content: unknown): string {
  const serialized = typeof content === 'string' ? content : JSON.stringify(content);
  return sha256(serialized);
}
