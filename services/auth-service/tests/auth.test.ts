/**
 * Auth Service Tests
 *
 * Tests for authentication endpoints.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';

// Mock Prisma
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    person: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    region: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));

// Mock Redis
vi.mock('../src/lib/redis.js', () => ({
  getRedis: vi.fn(() => ({
    setex: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn(),
    ttl: vi.fn().mockResolvedValue(900),
    exists: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
  })),
  checkRedisHealth: vi.fn().mockResolvedValue(true),
  disconnectRedis: vi.fn(),
  storeSession: vi.fn(),
  getSession: vi.fn(),
  deleteSession: vi.fn(),
  getUserSessions: vi.fn().mockResolvedValue([]),
  deleteAllUserSessions: vi.fn().mockResolvedValue(0),
  storeRefreshToken: vi.fn(),
  isRefreshTokenValid: vi.fn().mockResolvedValue(true),
  revokeRefreshToken: vi.fn(),
  revokeAllUserRefreshTokens: vi.fn().mockResolvedValue(0),
  storeEmailVerificationToken: vi.fn(),
  verifyEmailToken: vi.fn(),
  storePasswordResetToken: vi.fn(),
  verifyPasswordResetToken: vi.fn(),
  storeOAuthState: vi.fn(),
  verifyOAuthState: vi.fn(),
  updateSessionActivity: vi.fn(),
}));

// Mock email
vi.mock('../src/lib/email.js', () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendPasswordChangedEmail: vi.fn(),
  sendNewDeviceLoginEmail: vi.fn(),
}));

describe('Auth Service', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('auth-service');
    });

    it('should return ready status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/ready',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ready');
    });

    it('should return live status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/live',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('alive');
    });
  });

  describe('Registration', () => {
    it('should reject registration with weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'weak',
          legalName: 'Test User',
          dateOfBirth: '1990-01-01',
          primaryRegionId: '00000000-0000-0000-0000-000000000001',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject registration with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'ValidPassword123!',
          legalName: 'Test User',
          dateOfBirth: '1990-01-01',
          primaryRegionId: '00000000-0000-0000-0000-000000000001',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Login', () => {
    it('should reject login without credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject login with missing password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Protected Routes', () => {
    it('should reject /auth/me without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject /auth/logout without token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject /auth/change-password without token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/change-password',
        payload: {
          currentPassword: 'current',
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Password Reset', () => {
    it('should accept forgot-password request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        payload: {
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should reject reset-password with missing token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/reset-password',
        payload: {
          newPassword: 'NewPassword123!',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Token Refresh', () => {
    it('should reject refresh without cookie', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('OAuth Providers', () => {
    it('should list available providers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/providers',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.providers).toBeDefined();
      expect(Array.isArray(body.providers)).toBe(true);
    });
  });
});
