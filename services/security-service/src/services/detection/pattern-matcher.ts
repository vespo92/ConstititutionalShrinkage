/**
 * Pattern Matching Engine
 *
 * Centralized pattern matching for threat detection.
 */

import type { DetectionRule, Threat, ThreatIndicator } from '../../types/index.js';
import { ThreatLevel, ThreatType } from '../../types/index.js';
import { redis } from '../../lib/redis.js';

// Default detection rules
const DEFAULT_RULES: DetectionRule[] = [
  // Authentication attacks
  {
    id: 'auth_001',
    name: 'Failed Login Spam',
    description: 'Multiple failed login attempts from same source',
    type: ThreatType.BRUTE_FORCE,
    severity: ThreatLevel.HIGH,
    enabled: true,
    pattern: 'login_failed',
    threshold: 5,
    timeWindow: 300,
    action: 'block',
  },
  {
    id: 'auth_002',
    name: 'Password Spray',
    description: 'Same password tried against multiple accounts',
    type: ThreatType.CREDENTIAL_STUFFING,
    severity: ThreatLevel.CRITICAL,
    enabled: true,
    pattern: 'password_spray',
    threshold: 3,
    timeWindow: 600,
    action: 'block',
  },

  // Session attacks
  {
    id: 'session_001',
    name: 'Session Fixation',
    description: 'Session ID reused after authentication',
    type: ThreatType.SESSION_HIJACKING,
    severity: ThreatLevel.HIGH,
    enabled: true,
    pattern: 'session_fixation',
    action: 'block',
  },
  {
    id: 'session_002',
    name: 'Concurrent Sessions',
    description: 'Too many concurrent sessions for single user',
    type: ThreatType.ANOMALY,
    severity: ThreatLevel.MEDIUM,
    enabled: true,
    pattern: 'concurrent_sessions',
    threshold: 5,
    action: 'alert',
  },

  // Data access attacks
  {
    id: 'data_001',
    name: 'Mass Data Access',
    description: 'Unusual amount of data accessed',
    type: ThreatType.DATA_EXFILTRATION,
    severity: ThreatLevel.CRITICAL,
    enabled: true,
    pattern: 'mass_data_access',
    threshold: 1000,
    timeWindow: 3600,
    action: 'block',
  },
  {
    id: 'data_002',
    name: 'Sensitive Data Access',
    description: 'Access to sensitive data from unusual location',
    type: ThreatType.DATA_EXFILTRATION,
    severity: ThreatLevel.HIGH,
    enabled: true,
    pattern: 'sensitive_access_unusual',
    action: 'alert',
  },

  // Privilege escalation
  {
    id: 'priv_001',
    name: 'Role Change Attempt',
    description: 'Unauthorized role elevation attempt',
    type: ThreatType.PRIVILEGE_ESCALATION,
    severity: ThreatLevel.CRITICAL,
    enabled: true,
    pattern: 'role_escalation',
    action: 'block',
  },
  {
    id: 'priv_002',
    name: 'Admin API Access',
    description: 'Non-admin accessing admin endpoints',
    type: ThreatType.PRIVILEGE_ESCALATION,
    severity: ThreatLevel.HIGH,
    enabled: true,
    pattern: 'unauthorized_admin_access',
    action: 'block',
  },

  // Voting-specific
  {
    id: 'vote_001',
    name: 'Vote Velocity',
    description: 'Voting too fast (possible automation)',
    type: ThreatType.VOTE_MANIPULATION,
    severity: ThreatLevel.HIGH,
    enabled: true,
    pattern: 'vote_velocity',
    threshold: 10,
    timeWindow: 60,
    action: 'block',
  },
  {
    id: 'vote_002',
    name: 'Vote Replay',
    description: 'Attempt to replay previous vote',
    type: ThreatType.REPLAY_ATTACK,
    severity: ThreatLevel.CRITICAL,
    enabled: true,
    pattern: 'vote_replay',
    action: 'block',
  },

  // Bot detection
  {
    id: 'bot_001',
    name: 'Request Rate',
    description: 'Request rate exceeds human capability',
    type: ThreatType.BOT_ATTACK,
    severity: ThreatLevel.MEDIUM,
    enabled: true,
    pattern: 'high_request_rate',
    threshold: 100,
    timeWindow: 60,
    action: 'alert',
  },
  {
    id: 'bot_002',
    name: 'Missing Browser Fingerprint',
    description: 'Request without typical browser characteristics',
    type: ThreatType.BOT_ATTACK,
    severity: ThreatLevel.LOW,
    enabled: true,
    pattern: 'missing_fingerprint',
    action: 'log',
  },
];

// In-memory rule storage (would be database in production)
const rules = new Map<string, DetectionRule>();

// Initialize with default rules
for (const rule of DEFAULT_RULES) {
  rules.set(rule.id, rule);
}

/**
 * Get all detection rules
 */
export function getRules(): DetectionRule[] {
  return Array.from(rules.values());
}

/**
 * Get enabled rules
 */
export function getEnabledRules(): DetectionRule[] {
  return Array.from(rules.values()).filter((r) => r.enabled);
}

/**
 * Get rule by ID
 */
export function getRule(id: string): DetectionRule | undefined {
  return rules.get(id);
}

/**
 * Add or update a rule
 */
export function upsertRule(rule: DetectionRule): void {
  rules.set(rule.id, rule);
}

/**
 * Delete a rule
 */
export function deleteRule(id: string): boolean {
  return rules.delete(id);
}

/**
 * Toggle rule enabled status
 */
export function toggleRule(id: string, enabled: boolean): boolean {
  const rule = rules.get(id);
  if (rule) {
    rule.enabled = enabled;
    return true;
  }
  return false;
}

/**
 * Match an event against a specific rule
 */
export async function matchRule(
  rule: DetectionRule,
  event: { pattern: string; source: string; metadata?: Record<string, unknown> }
): Promise<boolean> {
  if (!rule.enabled) return false;

  // Check pattern match
  const patternMatch =
    typeof rule.pattern === 'string'
      ? event.pattern === rule.pattern
      : rule.pattern.test(event.pattern);

  if (!patternMatch) return false;

  // Check threshold if applicable
  if (rule.threshold && rule.timeWindow) {
    const key = `rule:${rule.id}:${event.source}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, rule.timeWindow);
    }

    return count >= rule.threshold;
  }

  return true;
}

/**
 * Match an event against all enabled rules
 */
export async function matchAllRules(event: {
  pattern: string;
  source: string;
  target?: string;
  metadata?: Record<string, unknown>;
}): Promise<Threat[]> {
  const threats: Threat[] = [];
  const enabledRules = getEnabledRules();

  for (const rule of enabledRules) {
    const matched = await matchRule(rule, event);

    if (matched) {
      const indicators: ThreatIndicator[] = [
        {
          type: 'pattern',
          value: event.pattern,
          confidence: 0.9,
          context: `Rule: ${rule.name}`,
        },
      ];

      threats.push({
        id: `threat_${rule.id}_${Date.now()}`,
        type: rule.type,
        level: rule.severity,
        source: event.source,
        target: event.target || 'system',
        detectedAt: new Date(),
        description: rule.description,
        indicators,
        status: 'active',
        mitigationActions: [rule.action],
      });

      // Log the match
      await redis.lpush(
        'threat_matches',
        JSON.stringify({
          ruleId: rule.id,
          event,
          timestamp: new Date().toISOString(),
        })
      );
      await redis.ltrim('threat_matches', 0, 9999);
    }
  }

  return threats;
}

/**
 * Get recent pattern matches
 */
export async function getRecentMatches(
  limit = 100
): Promise<Array<{ ruleId: string; event: unknown; timestamp: string }>> {
  const matches = await redis.lrange('threat_matches', 0, limit - 1);
  return matches.map((m) => JSON.parse(m));
}

/**
 * Create a custom regex-based rule
 */
export function createRegexRule(
  id: string,
  name: string,
  description: string,
  regex: string,
  type: ThreatType,
  severity: ThreatLevel,
  action: 'alert' | 'block' | 'quarantine' | 'log'
): DetectionRule {
  const rule: DetectionRule = {
    id,
    name,
    description,
    type,
    severity,
    enabled: true,
    pattern: new RegExp(regex, 'i'),
    action,
  };

  rules.set(id, rule);
  return rule;
}

/**
 * Test a pattern against rules without triggering actions
 */
export function testPattern(pattern: string): DetectionRule[] {
  const matchedRules: DetectionRule[] = [];

  for (const rule of rules.values()) {
    const patternMatch =
      typeof rule.pattern === 'string'
        ? pattern === rule.pattern
        : rule.pattern.test(pattern);

    if (patternMatch) {
      matchedRules.push(rule);
    }
  }

  return matchedRules;
}

/**
 * Get rule statistics
 */
export async function getRuleStats(): Promise<
  Array<{ ruleId: string; matchCount: number; lastMatch?: string }>
> {
  const stats: Array<{ ruleId: string; matchCount: number; lastMatch?: string }> = [];

  for (const rule of rules.values()) {
    const countKey = `rule_stats:${rule.id}:count`;
    const lastMatchKey = `rule_stats:${rule.id}:last`;

    const count = await redis.get(countKey);
    const lastMatch = await redis.get(lastMatchKey);

    stats.push({
      ruleId: rule.id,
      matchCount: count ? parseInt(count, 10) : 0,
      lastMatch: lastMatch || undefined,
    });
  }

  return stats;
}

/**
 * Increment rule match count
 */
export async function incrementRuleMatch(ruleId: string): Promise<void> {
  await redis.incr(`rule_stats:${ruleId}:count`);
  await redis.set(`rule_stats:${ruleId}:last`, new Date().toISOString());
}
