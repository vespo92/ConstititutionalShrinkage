/**
 * Password Utilities
 *
 * Secure password hashing and verification using Argon2id.
 */

import * as argon2 from 'argon2';
import { createHash, timingSafeEqual } from 'crypto';

// Common passwords to reject (top 100 most common)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', '123456789', '12345',
  '1234', '111111', '1234567', 'dragon', '123123', 'baseball',
  'abc123', 'football', 'monkey', 'letmein', 'shadow', 'master',
  '666666', 'qwertyuiop', '123321', 'mustang', '1234567890', 'michael',
  '654321', 'superman', '1qaz2wsx', '7777777', '121212', '000000',
  'qazwsx', '123qwe', 'killer', 'trustno1', 'jordan', 'jennifer',
  'zxcvbnm', 'asdfgh', 'hunter', 'buster', 'soccer', 'harley',
  'batman', 'andrew', 'tigger', 'sunshine', 'iloveyou', '2000',
  'charlie', 'robert', 'thomas', 'hockey', 'ranger', 'daniel',
  'starwars', 'klaster', '112233', 'george', 'computer', 'michelle',
  'jessica', 'pepper', '1111', 'zxcvbn', '555555', '11111111',
  '131313', 'freedom', '777777', 'pass', 'maggie', '159753',
  'aaaaaa', 'ginger', 'princess', 'joshua', 'cheese', 'amanda',
  'summer', 'love', 'ashley', 'nicole', 'chelsea', 'biteme',
  'matthew', 'access', 'yankees', '987654321', 'dallas', 'austin',
  'thunder', 'taylor', 'matrix', 'mobilemail', 'mom', 'monitor',
  'monitoring', 'montana', 'moon', 'moscow',
]);

// Argon2id configuration (OWASP recommended)
const ARGON2_CONFIG: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 parallel threads
  hashLength: 32,    // 256 bits
};

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_CONFIG);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be rehashed (e.g., after config change)
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, ARGON2_CONFIG);
}

/**
 * Validate password strength
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(
  password: string,
  email?: string
): PasswordValidationResult {
  const errors: string[] = [];

  // Length check
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be at most 128 characters long');
  }

  // Character requirements
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Common password check
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password');
  }

  // Check if password contains email
  if (email) {
    const emailLocal = email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailLocal)) {
      errors.push('Password should not contain your email address');
    }
  }

  // Check for sequential characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password should not contain 4 or more repeated characters');
  }

  // Check for keyboard patterns
  const keyboardPatterns = [
    'qwerty', 'asdfgh', 'zxcvbn', '123456', 'qazwsx',
    'ytrewq', 'hgfdsa', 'nbvcxz', '654321', 'xswzaq',
  ];

  const lowerPassword = password.toLowerCase();
  for (const pattern of keyboardPatterns) {
    if (lowerPassword.includes(pattern)) {
      errors.push('Password should not contain keyboard patterns');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  // Ensure at least one of each required type
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Constant-time string comparison (for tokens)
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.length !== bufB.length) {
      // Hash both to prevent timing attacks based on length
      const hashA = createHash('sha256').update(bufA).digest();
      const hashB = createHash('sha256').update(bufB).digest();
      return timingSafeEqual(hashA, hashB);
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
