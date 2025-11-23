/**
 * Password Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword,
  secureCompare,
} from '../src/lib/password.js';

describe('Password Utilities', () => {
  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify a password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const isValid = await verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept valid password', () => {
      const result = validatePasswordStrength('SecurePassword123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short password', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('securepassword123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePasswordStrength('SECUREPASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('SecurePassword!!!!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject common passwords', () => {
      const result = validatePasswordStrength('password');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is too common, please choose a stronger password');
    });

    it('should reject password containing email', () => {
      const result = validatePasswordStrength('johndoe12345ABC', 'johndoe@example.com');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password should not contain your email address');
    });

    it('should reject repeated characters', () => {
      const result = validatePasswordStrength('Secure1111111111!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password should not contain 4 or more repeated characters');
    });

    it('should reject keyboard patterns', () => {
      const result = validatePasswordStrength('qwerty123456ABC!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password should not contain keyboard patterns');
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password of specified length', () => {
      const password = generateSecurePassword(20);
      expect(password).toHaveLength(20);
    });

    it('should generate password with required characters', () => {
      const password = generateSecurePassword(16);

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
    });

    it('should generate different passwords each time', () => {
      const password1 = generateSecurePassword(16);
      const password2 = generateSecurePassword(16);

      expect(password1).not.toBe(password2);
    });
  });

  describe('secureCompare', () => {
    it('should return true for equal strings', () => {
      expect(secureCompare('test', 'test')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(secureCompare('test', 'different')).toBe(false);
    });

    it('should return false for different length strings', () => {
      expect(secureCompare('short', 'longerstring')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(secureCompare('', '')).toBe(true);
      expect(secureCompare('', 'notempty')).toBe(false);
    });
  });
});
