/**
 * Bills API Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { billRoutes } from '../../src/routes/bills.js';
import {
  buildTestServer,
  generateTestToken,
  authHeaders,
  mockBill,
} from '../setup.js';

describe('Bills API', () => {
  let server: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    server = await buildTestServer();
    await server.register(billRoutes, { prefix: '/api/bills' });
    await server.ready();
    authToken = generateTestToken(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/bills', () => {
    it('should return a list of bills', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('pagination');
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should support status filter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills?status=DRAFT',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/bills/:id', () => {
    it('should return 404 for non-existent bill', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/bills', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/bills',
        payload: {
          title: 'Test Bill',
          content: 'This is test content for the bill.',
          level: 'FEDERAL',
          categoryId: 'test-category',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a bill with valid data and auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/bills',
        headers: authHeaders(authToken),
        payload: {
          title: 'Test Bill Title',
          content: 'This is the content of the test bill, which must be longer.',
          level: 'FEDERAL',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('message');
    });

    it('should reject invalid bill data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/bills',
        headers: authHeaders(authToken),
        payload: {
          title: 'Hi', // Too short
          content: 'Short', // Too short
          level: 'INVALID',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/bills/:id', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'PUT',
        url: '/api/bills/test-id',
        payload: { title: 'Updated Title' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/bills/:id', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/bills/test-id',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/bills/:id/history', () => {
    it('should return bill version history', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills/test-id/history',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('billId');
      expect(body).toHaveProperty('versions');
    });
  });

  describe('GET /api/bills/:id/constitutional', () => {
    it('should return constitutional compliance check', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills/test-id/constitutional',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('valid');
      expect(body).toHaveProperty('errors');
      expect(body).toHaveProperty('warnings');
    });
  });

  describe('GET /api/bills/categories', () => {
    it('should return list of categories', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills/categories',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/bills/trending', () => {
    it('should return trending bills', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/bills/trending',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('data');
    });
  });
});
