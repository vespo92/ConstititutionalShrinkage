/**
 * Threats Routes
 *
 * API endpoints for threat detection and analysis.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as anomalyDetector from '../services/detection/anomaly-detector.js';
import * as bruteForceDetector from '../services/detection/brute-force-detector.js';
import * as sybilDetector from '../services/detection/sybil-detector.js';
import * as injectionDetector from '../services/detection/injection-detector.js';
import * as patternMatcher from '../services/detection/pattern-matcher.js';
import * as waf from '../services/prevention/waf.js';
import * as ipReputation from '../services/prevention/ip-reputation.js';
import * as botDetection from '../services/prevention/bot-detection.js';
import type { SecurityEvent } from '../types/index.js';

const analyzeRequestSchema = z.object({
  method: z.string(),
  uri: z.string(),
  headers: z.record(z.string()),
  args: z.record(z.string()).optional(),
  body: z.union([z.string(), z.record(z.unknown())]).optional(),
  cookies: z.record(z.string()).optional(),
  ipAddress: z.string(),
});

export const threatRoutes: FastifyPluginAsync = async (fastify) => {
  // Analyze request for threats
  fastify.post('/analyze', async (request) => {
    const req = analyzeRequestSchema.parse(request.body);

    // Run WAF analysis
    const wafResult = await waf.evaluateRequest(req);

    // Check IP reputation
    const reputation = await ipReputation.getReputation(req.ipAddress);

    // Check for injections in body
    const injectionThreats = req.body
      ? typeof req.body === 'string'
        ? injectionDetector.detectAllInjections(req.body)
        : injectionDetector.analyzeRequestBody(req.body as Record<string, unknown>)
      : [];

    // Check for bot
    const botResult = await botDetection.detectBot(
      {
        userAgent: req.headers['user-agent'] || '',
        acceptLanguage: req.headers['accept-language'],
        acceptEncoding: req.headers['accept-encoding'],
      },
      req.ipAddress
    );

    return {
      allowed: wafResult.allowed && reputation.score < 70,
      waf: {
        blocked: !wafResult.allowed,
        matchedRules: wafResult.matchedRules.map((r) => ({
          id: r.id,
          name: r.name,
          severity: r.severity,
        })),
      },
      ipReputation: {
        score: reputation.score,
        categories: reputation.categories,
        abuseConfidence: reputation.abuseConfidence,
      },
      injections: Array.isArray(injectionThreats)
        ? injectionThreats.map((t) => ({
            type: t.type,
            level: t.level,
            description: t.description,
          }))
        : injectionThreats
          ? [
              {
                type: injectionThreats.type,
                level: injectionThreats.level,
                description: injectionThreats.description,
              },
            ]
          : [],
      bot: botResult,
      threat: wafResult.threat,
    };
  });

  // Get active threats (recent pattern matches)
  fastify.get('/', async (request) => {
    const { limit } = z.object({ limit: z.coerce.number().default(100) }).parse(request.query);
    const matches = await patternMatcher.getRecentMatches(limit);

    return {
      threats: matches,
      count: matches.length,
    };
  });

  // Get detection rules
  fastify.get('/rules', async () => {
    return patternMatcher.getRules();
  });

  // Toggle detection rule
  fastify.put('/rules/:id/toggle', async (request) => {
    const { id } = request.params as { id: string };
    const { enabled } = z.object({ enabled: z.boolean() }).parse(request.body);

    const success = patternMatcher.toggleRule(id, enabled);
    return { success };
  });

  // Get WAF rules
  fastify.get('/waf/rules', async () => {
    return waf.getRules();
  });

  // Get WAF events
  fastify.get('/waf/events', async (request) => {
    const { limit } = z.object({ limit: z.coerce.number().default(100) }).parse(request.query);
    return waf.getEvents(limit);
  });

  // Get WAF statistics
  fastify.get('/waf/stats', async () => {
    return waf.getStats();
  });

  // Check IP reputation
  fastify.get('/ip/:ipAddress', async (request) => {
    const { ipAddress } = request.params as { ipAddress: string };
    const reputation = await ipReputation.getReputation(ipAddress);
    const reports = await ipReputation.getReports(ipAddress);
    const isWhitelisted = await ipReputation.isWhitelisted(ipAddress);

    return { reputation, reports, isWhitelisted };
  });

  // Report IP
  fastify.post('/ip/:ipAddress/report', async (request) => {
    const { ipAddress } = request.params as { ipAddress: string };
    const { reason, severity } = z
      .object({
        reason: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
      })
      .parse(request.body);

    await ipReputation.reportIP(ipAddress, reason, severity);
    return { success: true };
  });

  // Whitelist IP
  fastify.post('/ip/:ipAddress/whitelist', async (request) => {
    const { ipAddress } = request.params as { ipAddress: string };
    const { reason, duration } = z
      .object({
        reason: z.string(),
        duration: z.number().optional(),
      })
      .parse(request.body);

    await ipReputation.whitelistIP(ipAddress, reason, duration);
    return { success: true };
  });

  // Get top malicious IPs
  fastify.get('/ip/malicious', async (request) => {
    const { limit } = z.object({ limit: z.coerce.number().default(20) }).parse(request.query);
    return ipReputation.getTopMaliciousIPs(limit);
  });

  // Analyze user for Sybil indicators
  fastify.get('/sybil/:userId', async (request) => {
    const { userId } = request.params as { userId: string };
    return sybilDetector.analyzeAccount(userId);
  });

  // Check brute force status
  fastify.get('/brute-force/:identifier', async (request) => {
    const { identifier } = request.params as { identifier: string };
    const { type } = z
      .object({ type: z.enum(['ip', 'user', 'email']).default('ip') })
      .parse(request.query);

    const isBlocked = await bruteForceDetector.isBlocked(identifier);
    const lockoutRemaining = await bruteForceDetector.getLockoutTimeRemaining(identifier);
    const history = await bruteForceDetector.getAttemptHistory(identifier, type);

    return { isBlocked, lockoutRemaining, history };
  });

  // Unblock identifier
  fastify.post('/brute-force/:identifier/unblock', async (request) => {
    const { identifier } = request.params as { identifier: string };
    await bruteForceDetector.unblock(identifier);
    return { success: true };
  });

  // Get bot detection stats
  fastify.get('/bot/stats', async () => {
    return botDetection.getBotStats();
  });

  // Test pattern against rules
  fastify.post('/test-pattern', async (request) => {
    const { pattern } = z.object({ pattern: z.string() }).parse(request.body);
    const matchedRules = patternMatcher.testPattern(pattern);

    return { matchedRules };
  });

  // Get rule statistics
  fastify.get('/rules/stats', async () => {
    return patternMatcher.getRuleStats();
  });
};
