/**
 * Auth Service - Main Entry Point
 *
 * Handles authentication, authorization, and user verification
 * for the Constitutional Shrinkage platform.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';

import { authRoutes } from './routes.js';

const PORT = process.env.AUTH_PORT ? parseInt(process.env.AUTH_PORT) : 3002;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-change-in-production';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? { target: 'pino-pretty' }
        : undefined,
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Cookies for refresh tokens
  await fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',
    parseOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  // JWT - Access tokens
  await fastify.register(jwt, {
    secret: JWT_SECRET,
    sign: { expiresIn: '15m' }, // Short-lived access tokens
    namespace: 'access',
  });

  // JWT - Refresh tokens
  await fastify.register(jwt, {
    secret: REFRESH_SECRET,
    sign: { expiresIn: '7d' }, // Longer-lived refresh tokens
    namespace: 'refresh',
  });

  // Health check
  fastify.get('/health', async () => ({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }));

  // Auth routes
  await fastify.register(authRoutes, { prefix: '/auth' });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║       Constitutional Shrinkage Auth Service               ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Failed to start auth service:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
