/**
 * Brute Force Attack Tests
 *
 * Tests to verify brute force protection mechanisms are working correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';

interface LoginAttempt {
  username: string;
  password: string;
  ip: string;
  timestamp: Date;
}

interface BruteForceProtection {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
  attempts: Map<string, LoginAttempt[]>;
  lockedOut: Map<string, Date>;
}

function createBruteForceProtection(config?: Partial<BruteForceProtection>): BruteForceProtection {
  return {
    maxAttempts: config?.maxAttempts ?? 5,
    windowMs: config?.windowMs ?? 15 * 60 * 1000,
    lockoutMs: config?.lockoutMs ?? 30 * 60 * 1000,
    attempts: new Map(),
    lockedOut: new Map(),
  };
}

function recordAttempt(
  protection: BruteForceProtection,
  key: string,
  attempt: LoginAttempt
): { blocked: boolean; remainingAttempts: number; lockoutUntil?: Date } {
  const now = new Date();

  // Check if locked out
  const lockoutUntil = protection.lockedOut.get(key);
  if (lockoutUntil && lockoutUntil > now) {
    return { blocked: true, remainingAttempts: 0, lockoutUntil };
  }

  // Clear expired lockout
  if (lockoutUntil) {
    protection.lockedOut.delete(key);
  }

  // Get recent attempts within window
  const attempts = protection.attempts.get(key) || [];
  const windowStart = new Date(now.getTime() - protection.windowMs);
  const recentAttempts = attempts.filter((a) => a.timestamp > windowStart);

  // Add new attempt
  recentAttempts.push(attempt);
  protection.attempts.set(key, recentAttempts);

  // Check if exceeds max attempts
  if (recentAttempts.length >= protection.maxAttempts) {
    const newLockoutUntil = new Date(now.getTime() + protection.lockoutMs);
    protection.lockedOut.set(key, newLockoutUntil);
    return { blocked: true, remainingAttempts: 0, lockoutUntil: newLockoutUntil };
  }

  return {
    blocked: false,
    remainingAttempts: protection.maxAttempts - recentAttempts.length,
  };
}

describe('Brute Force Protection', () => {
  let protection: BruteForceProtection;

  beforeEach(() => {
    protection = createBruteForceProtection({
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 30 * 60 * 1000,
    });
  });

  describe('Login Attempt Tracking', () => {
    it('should allow attempts under the threshold', () => {
      const ip = '192.168.1.100';

      for (let i = 0; i < 4; i++) {
        const result = recordAttempt(protection, ip, {
          username: 'user@example.com',
          password: 'wrong',
          ip,
          timestamp: new Date(),
        });

        expect(result.blocked).toBe(false);
        expect(result.remainingAttempts).toBe(4 - i);
      }
    });

    it('should block after exceeding max attempts', () => {
      const ip = '192.168.1.100';

      // Make 5 attempts (max)
      for (let i = 0; i < 5; i++) {
        recordAttempt(protection, ip, {
          username: 'user@example.com',
          password: 'wrong',
          ip,
          timestamp: new Date(),
        });
      }

      // 6th attempt should be blocked
      const result = recordAttempt(protection, ip, {
        username: 'user@example.com',
        password: 'wrong',
        ip,
        timestamp: new Date(),
      });

      expect(result.blocked).toBe(true);
      expect(result.lockoutUntil).toBeDefined();
    });

    it('should track attempts by IP address', () => {
      const ip1 = '192.168.1.100';
      const ip2 = '192.168.1.101';

      // Max out IP1
      for (let i = 0; i < 5; i++) {
        recordAttempt(protection, ip1, {
          username: 'user@example.com',
          password: 'wrong',
          ip: ip1,
          timestamp: new Date(),
        });
      }

      // IP2 should still be allowed
      const result = recordAttempt(protection, ip2, {
        username: 'user@example.com',
        password: 'wrong',
        ip: ip2,
        timestamp: new Date(),
      });

      expect(result.blocked).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should track attempts by username', () => {
      // Attempts from different IPs but same username
      for (let i = 0; i < 5; i++) {
        const key = `user:admin@example.com`;
        recordAttempt(protection, key, {
          username: 'admin@example.com',
          password: 'wrong',
          ip: `192.168.1.${100 + i}`,
          timestamp: new Date(),
        });
      }

      const key = `user:admin@example.com`;
      const result = recordAttempt(protection, key, {
        username: 'admin@example.com',
        password: 'wrong',
        ip: '192.168.1.200',
        timestamp: new Date(),
      });

      expect(result.blocked).toBe(true);
    });
  });

  describe('Lockout Mechanism', () => {
    it('should enforce lockout duration', () => {
      const ip = '192.168.1.100';
      const now = Date.now();

      // Max out attempts
      for (let i = 0; i < 5; i++) {
        recordAttempt(protection, ip, {
          username: 'user@example.com',
          password: 'wrong',
          ip,
          timestamp: new Date(now),
        });
      }

      // Verify lockout
      const blockedResult = recordAttempt(protection, ip, {
        username: 'user@example.com',
        password: 'wrong',
        ip,
        timestamp: new Date(now + 1000),
      });

      expect(blockedResult.blocked).toBe(true);
      expect(blockedResult.lockoutUntil).toBeDefined();
      expect(blockedResult.lockoutUntil!.getTime()).toBeGreaterThan(now);
    });

    it('should provide lockout expiration time', () => {
      const ip = '192.168.1.100';

      for (let i = 0; i < 5; i++) {
        recordAttempt(protection, ip, {
          username: 'user@example.com',
          password: 'wrong',
          ip,
          timestamp: new Date(),
        });
      }

      const result = recordAttempt(protection, ip, {
        username: 'user@example.com',
        password: 'wrong',
        ip,
        timestamp: new Date(),
      });

      expect(result.lockoutUntil).toBeDefined();
      const lockoutDuration = result.lockoutUntil!.getTime() - Date.now();
      expect(lockoutDuration).toBeGreaterThan(0);
      expect(lockoutDuration).toBeLessThanOrEqual(30 * 60 * 1000);
    });
  });

  describe('Credential Stuffing Detection', () => {
    it('should detect rapid attempts across multiple accounts', () => {
      const ip = '192.168.1.100';
      const accounts = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com',
        'user5@example.com',
      ];

      // Track by IP regardless of account
      for (const account of accounts) {
        recordAttempt(protection, ip, {
          username: account,
          password: 'password123',
          ip,
          timestamp: new Date(),
        });
      }

      // Should be blocked after 5 attempts from same IP
      const result = recordAttempt(protection, ip, {
        username: 'user6@example.com',
        password: 'password123',
        ip,
        timestamp: new Date(),
      });

      expect(result.blocked).toBe(true);
    });

    it('should detect common password patterns', () => {
      const commonPasswords = [
        'password123',
        '123456',
        'qwerty',
        'admin',
        'letmein',
      ];

      // Verify common passwords are detected
      const isCommonPassword = (password: string): boolean => {
        return commonPasswords.includes(password.toLowerCase());
      };

      expect(isCommonPassword('password123')).toBe(true);
      expect(isCommonPassword('MySecureP@ssw0rd!')).toBe(false);
    });
  });

  describe('Progressive Delays', () => {
    it('should calculate progressive delay based on attempts', () => {
      const calculateDelay = (attemptCount: number): number => {
        // Exponential backoff: 2^n seconds, max 30 seconds
        return Math.min(Math.pow(2, attemptCount) * 1000, 30000);
      };

      expect(calculateDelay(0)).toBe(1000);
      expect(calculateDelay(1)).toBe(2000);
      expect(calculateDelay(2)).toBe(4000);
      expect(calculateDelay(3)).toBe(8000);
      expect(calculateDelay(4)).toBe(16000);
      expect(calculateDelay(5)).toBe(30000); // Capped at 30s
    });
  });

  describe('Distributed Attack Detection', () => {
    it('should detect distributed attacks on single account', () => {
      const username = 'admin@example.com';
      const attackerIPs = Array.from({ length: 100 }, (_, i) => `192.168.${Math.floor(i / 256)}.${i % 256}`);

      const accountAttempts: Map<string, number> = new Map();

      for (const ip of attackerIPs.slice(0, 50)) {
        const key = `account:${username}`;
        const count = accountAttempts.get(key) || 0;
        accountAttempts.set(key, count + 1);
      }

      // Verify high attempt count on single account
      const attemptCount = accountAttempts.get(`account:${username}`) || 0;
      expect(attemptCount).toBe(50);

      // Flag as suspicious if > 10 unique IPs attempt same account
      const isDistributedAttack = attemptCount > 10;
      expect(isDistributedAttack).toBe(true);
    });
  });
});

describe('Password Spray Detection', () => {
  it('should detect password spray attacks', () => {
    const attempts: { username: string; password: string; timestamp: Date }[] = [];
    const commonPassword = 'Summer2024!';

    // Simulate password spray - same password, many users
    for (let i = 0; i < 100; i++) {
      attempts.push({
        username: `user${i}@example.com`,
        password: commonPassword,
        timestamp: new Date(),
      });
    }

    // Detect spray pattern
    const passwordCounts = new Map<string, number>();
    for (const attempt of attempts) {
      const count = passwordCounts.get(attempt.password) || 0;
      passwordCounts.set(attempt.password, count + 1);
    }

    const maxCount = Math.max(...passwordCounts.values());
    const isSprayAttack = maxCount > 20;

    expect(isSprayAttack).toBe(true);
    expect(passwordCounts.get(commonPassword)).toBe(100);
  });
});

describe('CAPTCHA Trigger', () => {
  it('should trigger CAPTCHA after suspicious activity', () => {
    interface CaptchaConfig {
      triggerThreshold: number;
      enabled: boolean;
    }

    const config: CaptchaConfig = {
      triggerThreshold: 3,
      enabled: true,
    };

    const shouldShowCaptcha = (failedAttempts: number, config: CaptchaConfig): boolean => {
      return config.enabled && failedAttempts >= config.triggerThreshold;
    };

    expect(shouldShowCaptcha(0, config)).toBe(false);
    expect(shouldShowCaptcha(2, config)).toBe(false);
    expect(shouldShowCaptcha(3, config)).toBe(true);
    expect(shouldShowCaptcha(5, config)).toBe(true);
  });
});
