/**
 * Votes API Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { voteRoutes } from '../../src/routes/votes.js';
import {
  buildTestServer,
  generateTestToken,
  authHeaders,
} from '../setup.js';

describe('Votes API', () => {
  let server: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    server = await buildTestServer();
    await server.register(voteRoutes, { prefix: '/api/votes' });
    await server.ready();
    authToken = generateTestToken(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/votes', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/votes',
        payload: {
          billId: '550e8400-e29b-41d4-a716-446655440000',
          choice: 'for',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should cast a vote with valid data and auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/votes',
        headers: authHeaders(authToken),
        payload: {
          billId: '550e8400-e29b-41d4-a716-446655440000',
          choice: 'for',
          isPublic: false,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('voteId');
      expect(body).toHaveProperty('receipt');
      expect(body.choice).toBe('for');
    });

    it('should reject invalid vote choice', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/votes',
        headers: authHeaders(authToken),
        payload: {
          billId: '550e8400-e29b-41d4-a716-446655440000',
          choice: 'invalid-choice',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/votes/:id', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/test-vote-id',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return vote details with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/test-vote-id',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('voteId');
    });
  });

  describe('GET /api/votes/verify/:proof', () => {
    it('should verify a vote proof (public endpoint)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/verify/test-proof-123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('valid');
      expect(body).toHaveProperty('proof');
    });
  });

  describe('GET /api/votes/history', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/history',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return voting history with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/history',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('votes');
      expect(body).toHaveProperty('pagination');
      expect(body).toHaveProperty('summary');
    });

    it('should support pagination', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/history?page=1&limit=5',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/votes/stats', () => {
    it('should return global voting statistics (public)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/stats',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalVotes');
      expect(body).toHaveProperty('totalVoters');
      expect(body).toHaveProperty('averageParticipation');
    });
  });

  describe('GET /api/votes/delegated', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/delegated',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return delegated votes with auth', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/votes/delegated',
        headers: authHeaders(authToken),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('delegatedVotes');
    });
  });

  describe('POST /api/votes/:id/override', () => {
    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/votes/test-vote-id/override',
        payload: { newChoice: 'against' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should override a delegated vote with auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/votes/test-vote-id/override',
        headers: authHeaders(authToken),
        payload: { newChoice: 'against' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('overriddenVoteId');
      expect(body).toHaveProperty('newVoteId');
    });
  });
});
