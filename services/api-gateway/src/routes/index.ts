/**
 * Route Aggregator
 *
 * Centralizes route registration for the API Gateway.
 */

import type { FastifyInstance } from 'fastify';

// Import all route modules
import { billRoutes } from './bills.js';
import { voteRoutes } from './votes.js';
import { userRoutes } from './users.js';
import { delegationRoutes } from './delegations.js';
import { regionRoutes } from './regions.js';
import { metricsRoutes } from './metrics.js';
import { personRoutes } from './persons.js';
import { organizationRoutes } from './organizations.js';

/**
 * Route configuration
 */
interface RouteConfig {
  prefix: string;
  handler: (fastify: FastifyInstance) => Promise<void>;
  description: string;
}

const routes: RouteConfig[] = [
  {
    prefix: '/api/v1/bills',
    handler: billRoutes,
    description: 'Bill management endpoints',
  },
  {
    prefix: '/api/v1/votes',
    handler: voteRoutes,
    description: 'Voting operations',
  },
  {
    prefix: '/api/v1/users',
    handler: userRoutes,
    description: 'User profile management',
  },
  {
    prefix: '/api/v1/delegations',
    handler: delegationRoutes,
    description: 'Liquid democracy delegations',
  },
  {
    prefix: '/api/v1/regions',
    handler: regionRoutes,
    description: 'Regional governance',
  },
  {
    prefix: '/api/v1/metrics',
    handler: metricsRoutes,
    description: 'Triple Bottom Line metrics',
  },
  {
    prefix: '/api/v1/persons',
    handler: personRoutes,
    description: 'Public person information',
  },
  {
    prefix: '/api/v1/organizations',
    handler: organizationRoutes,
    description: 'Organization transparency',
  },
];

/**
 * Register all API routes
 */
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  for (const route of routes) {
    await fastify.register(route.handler, { prefix: route.prefix });
    fastify.log.info(`Registered routes: ${route.prefix} - ${route.description}`);
  }
}

/**
 * Get route information for documentation
 */
export function getRouteInfo(): Array<{ prefix: string; description: string }> {
  return routes.map(({ prefix, description }) => ({ prefix, description }));
}

// Re-export individual route modules for direct use
export {
  billRoutes,
  voteRoutes,
  userRoutes,
  delegationRoutes,
  regionRoutes,
  metricsRoutes,
  personRoutes,
  organizationRoutes,
};
