/**
 * Secure Hashing
 *
 * Password hashing and general purpose hashing utilities.
 */

import crypto from 'node:crypto';

const ARGON2_MEMORY = 65536;
const ARGON2_TIME = 3;
const ARGON2_PARALLELISM = 4;
const SALT_LENGTH = 32;
const HASH_LENGTH = 64;

/**
 * SHA-256 hash
 */
export function sha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * SHA-512 hash
 */
export function sha512(data: string | Buffer): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * HMAC-SHA256
 */
export function hmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * HMAC-SHA512
 */
export function hmacSha512(data: string, secret: string): string {
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

/**
 * Hash password using scrypt (Node.js built-in, similar security to Argon2)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.scryptSync(password, salt, HASH_LENGTH, {
    N: ARGON2_MEMORY,
    r: 8,
    p: ARGON2_PARALLELISM,
  });

  // Format: salt$hash (both base64)
  return `${salt.toString('base64')}$${hash.toString('base64')}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [saltB64, hashB64] = storedHash.split('$');
    if (!saltB64 || !hashB64) return false;

    const salt = Buffer.from(saltB64, 'base64');
    const expectedHash = Buffer.from(hashB64, 'base64');

    const hash = crypto.scryptSync(password, salt, HASH_LENGTH, {
      N: ARGON2_MEMORY,
      r: 8,
      p: ARGON2_PARALLELISM,
    });

    return crypto.timingSafeEqual(hash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Hash with salt (for non-password data)
 */
export function hashWithSalt(
  data: string,
  salt?: string
): { hash: string; salt: string } {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = sha256(useSalt + data);

  return { hash, salt: useSalt };
}

/**
 * Verify salted hash
 */
export function verifySaltedHash(
  data: string,
  hash: string,
  salt: string
): boolean {
  const expectedHash = sha256(salt + data);
  return timingSafeEqual(hash, expectedHash);
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform comparison to prevent timing attacks
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Create content hash for integrity verification
 */
export function contentHash(content: unknown): string {
  const serialized =
    typeof content === 'string' ? content : JSON.stringify(content);
  return sha256(serialized);
}

/**
 * Create file hash
 */
export function fileHash(content: Buffer, algorithm = 'sha256'): string {
  return crypto.createHash(algorithm).update(content).digest('hex');
}
