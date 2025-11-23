/**
 * Delegations API Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { delegationRoutes } from '../../src/routes/delegations.js';
import {
  buildTestServer,
  generateTestToken,
  authHeaders,
} from '../setup.js';

describe('Delegations API', () => {
  let server: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    server = await buildTestServer();
    await server.register(delegationRoutes, { prefix: '/api/delegations' });
    await server.ready();
    authToken = generateTestToken(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/delegations', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return user delegations with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('outgoing');
      expect(body).toHaveProperty('incoming');
      expect(body).toHaveProperty('summary');
      expect(body).toHaveProperty('pagination');
    });

    it('should support direction filter', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations?direction=outgoing',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/delegations', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        payload: {
          delegateId: '550e8400-e29b-41d4-a716-446655440001',
          scope: 'ALL',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should create a delegation with valid data', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        headers: authHeaders(authToken),
        payload: {
          delegateId: '550e8400-e29b-41d4-a716-446655440001',
          scope: 'ALL',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('delegateId');
      expect(body.scope).toBe('ALL');
    });

    it('should reject self-delegation', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        headers: authHeaders(authToken),
        payload: {
          delegateId: 'test-user-id', // Same as the authenticated user
          scope: 'ALL',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require category for CATEGORY scope', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        headers: authHeaders(authToken),
        payload: {
          delegateId: '550e8400-e29b-41d4-a716-446655440001',
          scope: 'CATEGORY',
          // Missing category
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require billId for SINGLE_BILL scope', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        headers: authHeaders(authToken),
        payload: {
          delegateId: '550e8400-e29b-41d4-a716-446655440001',
          scope: 'SINGLE_BILL',
          // Missing billId
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept CATEGORY scope with category', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/delegations',
        headers: authHeaders(authToken),
        payload: {
          delegateId: '550e8400-e29b-41d4-a716-446655440001',
          scope: 'CATEGORY',
          category: 'environment',
        },
      });

      expect(response.statusCode).toBe(201);
    });
  });

  describe('GET /api/delegations/:id', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/test-delegation-id',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return delegation details with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/test-delegation-id',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('delegatorId');
      expect(body).toHaveProperty('delegateId');
    });
  });

  describe('DELETE /api/delegations/:id', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/delegations/test-delegation-id',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should revoke delegation with auth', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/delegations/test-delegation-id',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(204);
    });
  });

  describe('GET /api/delegations/:id/chain', () => {
    it('should return delegation chain (public)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/test-delegation-id/chain',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('chain');
      expect(body).toHaveProperty('totalWeight');
      expect(body).toHaveProperty('depth');
    });
  });

  describe('GET /api/delegations/incoming', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/incoming',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return incoming delegations with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/incoming',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('delegations');
      expect(body).toHaveProperty('totalWeight');
    });
  });

  describe('GET /api/delegations/outgoing', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/outgoing',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return outgoing delegations with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/outgoing',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('delegations');
      expect(body).toHaveProperty('totalDelegated');
    });
  });

  describe('GET /api/delegations/check-circular', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/check-circular?delegateId=550e8400-e29b-41d4-a716-446655440001',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should check for circular delegation with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/check-circular?delegateId=550e8400-e29b-41d4-a716-446655440001',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('wouldCreateCycle');
      expect(typeof body.wouldCreateCycle).toBe('boolean');
    });
  });

  describe('GET /api/delegations/suggestions', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/suggestions',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return delegate suggestions with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/delegations/suggestions?category=environment',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('suggestions');
      expect(body).toHaveProperty('basedOn');
    });
  });
});
