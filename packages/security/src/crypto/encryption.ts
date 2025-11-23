/**
 * Data Encryption
 *
 * AES-256-GCM encryption utilities.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypt data with AES-256-GCM
 */
export function encrypt(plaintext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Key must be ${KEY_LENGTH} bytes`);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Format: IV (16) + AuthTag (16) + Ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypt data encrypted with AES-256-GCM
 */
export function decrypt(ciphertext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Key must be ${KEY_LENGTH} bytes`);
  }

  const data = Buffer.from(ciphertext, 'base64');

  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid ciphertext');
  }

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Generate encryption key from password
 */
export function deriveKey(
  password: string,
  salt: Buffer,
  iterations = 100000
): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha512');
}

/**
 * Generate random encryption key
 */
export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Generate random salt
 */
export function generateSalt(length = 32): Buffer {
  return crypto.randomBytes(length);
}

/**
 * Encrypt with password
 */
export function encryptWithPassword(
  plaintext: string,
  password: string
): string {
  const salt = generateSalt();
  const key = deriveKey(password, salt);
  const encrypted = encrypt(plaintext, key);

  // Prepend salt to encrypted data
  return Buffer.concat([salt, Buffer.from(encrypted, 'base64')]).toString('base64');
}

/**
 * Decrypt with password
 */
export function decryptWithPassword(
  ciphertext: string,
  password: string
): string {
  const data = Buffer.from(ciphertext, 'base64');
  const salt = data.subarray(0, 32);
  const encrypted = data.subarray(32).toString('base64');

  const key = deriveKey(password, salt);
  return decrypt(encrypted, key);
}

/**
 * Encrypt object
 */
export function encryptObject<T>(obj: T, key: Buffer): string {
  return encrypt(JSON.stringify(obj), key);
}

/**
 * Decrypt object
 */
export function decryptObject<T>(ciphertext: string, key: Buffer): T {
  return JSON.parse(decrypt(ciphertext, key));
}
