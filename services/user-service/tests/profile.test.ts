/**
 * User Service Profile Tests
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { buildServer } from '../src/index.js';
import type { FastifyInstance } from 'fastify';

// Mock Prisma
vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    person: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    region: {
      findUnique: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
}));

describe('User Service', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('user-service');
    });
  });

  describe('Profile Endpoints', () => {
    it('should reject /users/me without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject /users/me/preferences without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me/preferences',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject /users/me/verification without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/me/verification',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Public Profile', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/00000000-0000-0000-0000-000000000001/public',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Search', () => {
    it('should reject search without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users/search?query=test',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
