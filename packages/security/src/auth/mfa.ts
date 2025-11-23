/**
 * Multi-Factor Authentication
 *
 * TOTP-based MFA implementation.
 */

import crypto from 'node:crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;

/**
 * Generate a secret key for TOTP
 */
export function generateSecret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  let secret = '';

  for (let i = 0; i < buffer.length; i++) {
    secret += BASE32_CHARS[buffer[i]! % 32];
  }

  return secret;
}

/**
 * Generate TOTP URI for authenticator apps
 */
export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer: string
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);

  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

/**
 * Generate current TOTP code
 */
export function generateTOTP(secret: string, time?: number): string {
  const counter = Math.floor((time || Date.now() / 1000) / TOTP_PERIOD);
  return generateHOTP(secret, counter);
}

/**
 * Verify TOTP code
 */
export function verifyTOTP(
  secret: string,
  code: string,
  options: { window?: number } = {}
): boolean {
  const window = options.window ?? 1;
  const currentTime = Math.floor(Date.now() / 1000);

  for (let i = -window; i <= window; i++) {
    const time = currentTime + i * TOTP_PERIOD;
    const expectedCode = generateTOTP(secret, time);

    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate HOTP (HMAC-based One-Time Password)
 */
function generateHOTP(secret: string, counter: number): string {
  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1]! & 0xf;
  const binary =
    ((digest[offset]! & 0x7f) << 24) |
    ((digest[offset + 1]! & 0xff) << 16) |
    ((digest[offset + 2]! & 0xff) << 8) |
    (digest[offset + 3]! & 0xff);

  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Base32 decode
 */
function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const output = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (const char of cleaned) {
    const value = BASE32_CHARS.indexOf(char);
    if (value === -1) continue;

    buffer = (buffer << 5) | value;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      output.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return Buffer.from(output);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }

  return codes;
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  const normalized = code.replace(/-/g, '').toUpperCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): {
  valid: boolean;
  index: number;
} {
  const hash = hashBackupCode(code);

  for (let i = 0; i < hashedCodes.length; i++) {
    if (hashedCodes[i] && timingSafeEqual(hash, hashedCodes[i])) {
      return { valid: true, index: i };
    }
  }

  return { valid: false, index: -1 };
}
