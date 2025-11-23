/**
 * Test Setup
 *
 * Common test utilities and configuration.
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Global test server instance
let testServer: FastifyInstance | null = null;

/**
 * Build a test server instance
 */
export async function buildTestServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register minimal plugins for testing
  await server.register(import('@fastify/jwt'), {
    secret: 'test-secret',
  });

  // Add test decorators
  server.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  return server;
}

/**
 * Get or create test server
 */
export async function getTestServer(): Promise<FastifyInstance> {
  if (!testServer) {
    testServer = await buildTestServer();
  }
  return testServer;
}

/**
 * Close test server
 */
export async function closeTestServer(): Promise<void> {
  if (testServer) {
    await testServer.close();
    testServer = null;
  }
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(
  server: FastifyInstance,
  payload: Record<string, unknown> = {}
): string {
  const defaultPayload = {
    id: 'test-user-id',
    email: 'test@example.com',
    verificationLevel: 'EMAIL_VERIFIED',
    votingPower: 1,
    regions: ['region-1'],
    roles: ['CITIZEN'],
    ...payload,
  };

  return server.jwt.sign(defaultPayload);
}

/**
 * Create authenticated request headers
 */
export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Mock user data
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  verificationLevel: 'EMAIL_VERIFIED',
  votingPower: 1,
  regions: ['region-1'],
  roles: ['CITIZEN'],
};

/**
 * Mock bill data
 */
export const mockBill = {
  id: 'test-bill-id',
  title: 'Test Bill Title',
  content: 'This is the content of the test bill.',
  level: 'FEDERAL',
  status: 'DRAFT',
  regionId: 'region-1',
  categoryId: 'category-1',
  sponsorId: 'test-user-id',
  version: 1,
  sunsetDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock vote data
 */
export const mockVote = {
  id: 'test-vote-id',
  billId: 'test-bill-id',
  userId: 'test-user-id',
  choice: 'for',
  weight: 1,
  isPublic: false,
  cryptographicProof: 'test-proof',
  timestamp: new Date().toISOString(),
};

/**
 * Mock delegation data
 */
export const mockDelegation = {
  id: 'test-delegation-id',
  delegatorId: 'test-user-id',
  delegateId: 'delegate-user-id',
  scope: 'ALL',
  active: true,
  createdAt: new Date().toISOString(),
};

/**
 * Setup hooks for test suites
 */
export function setupTestHooks(): void {
  beforeAll(async () => {
    await getTestServer();
  });

  afterAll(async () => {
    await closeTestServer();
  });

  beforeEach(() => {
    // Reset any mocks or state between tests
  });
}

/**
 * Inject request helper
 */
export async function injectRequest(
  server: FastifyInstance,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    payload?: unknown;
    headers?: Record<string, string>;
  }
) {
  return server.inject({
    method: options.method,
    url: options.url,
    payload: options.payload,
    headers: options.headers,
  });
}
