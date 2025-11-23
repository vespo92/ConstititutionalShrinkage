/**
 * Web Application Firewall
 *
 * Request filtering and attack prevention.
 */

import type { WAFRule, WAFEvent, Threat } from '../../types/index.js';
import { ThreatLevel, ThreatType } from '../../types/index.js';
import { redis } from '../../lib/redis.js';

// OWASP Core Rule Set based patterns
const OWASP_CRS_RULES: WAFRule[] = [
  // Protocol violations
  {
    id: 'waf_920100',
    name: 'Invalid HTTP Request Line',
    description: 'Request line does not conform to HTTP specification',
    enabled: true,
    phase: 1,
    action: 'block',
    pattern: '^(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)\\s',
    targets: ['request_line'],
    severity: ThreatLevel.MEDIUM,
    tags: ['protocol', 'crs'],
  },
  {
    id: 'waf_920170',
    name: 'GET/HEAD Request with Body',
    description: 'GET or HEAD request should not have a body',
    enabled: true,
    phase: 1,
    action: 'block',
    pattern: '^(GET|HEAD)',
    targets: ['request_method'],
    severity: ThreatLevel.LOW,
    tags: ['protocol', 'crs'],
  },

  // SQL Injection
  {
    id: 'waf_942100',
    name: 'SQL Injection Attack Detected',
    description: 'Detects common SQL injection patterns',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern:
      "(?i)(?:(?:'|\")?\\s*(?:or|and)\\s+(?:'|\")?\\s*\\d+\\s*=\\s*\\d+|union\\s+(?:all\\s+)?select|select\\s+.*\\s+from|insert\\s+into|delete\\s+from|drop\\s+(?:table|database)|update\\s+.*\\s+set)",
    targets: ['args', 'body', 'cookies'],
    severity: ThreatLevel.CRITICAL,
    tags: ['sqli', 'injection', 'crs'],
  },
  {
    id: 'waf_942200',
    name: 'MySQL Comment/Space Obfuscation',
    description: 'Detects MySQL comment/space obfuscation',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern: '(?i)(?:/\\*!?|\\*/|--\\s)',
    targets: ['args', 'body'],
    severity: ThreatLevel.HIGH,
    tags: ['sqli', 'injection', 'crs'],
  },

  // XSS
  {
    id: 'waf_941100',
    name: 'XSS Attack Detected',
    description: 'Detects common XSS attack patterns',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern:
      '(?i)(?:<script[^>]*>|javascript:|on(?:load|error|click|mouse|focus|blur)\\s*=|<iframe|<object|<embed|<svg[^>]*onload)',
    targets: ['args', 'body', 'cookies', 'headers'],
    severity: ThreatLevel.HIGH,
    tags: ['xss', 'injection', 'crs'],
  },
  {
    id: 'waf_941200',
    name: 'XSS Filter Evasion',
    description: 'Detects XSS filter evasion techniques',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern:
      '(?i)(?:&#x?[0-9a-f]+;?|\\\\u[0-9a-f]{4}|%[0-9a-f]{2})+.*(?:<|>|script|javascript)',
    targets: ['args', 'body'],
    severity: ThreatLevel.HIGH,
    tags: ['xss', 'injection', 'crs'],
  },

  // Command Injection
  {
    id: 'waf_932100',
    name: 'Remote Command Execution',
    description: 'Detects shell command injection',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern:
      '(?i)(?:[;&|`$]|\\$\\(|\\)\\s*\\{|\\b(?:bash|sh|cmd|powershell|wget|curl|nc|netcat)\\b)',
    targets: ['args', 'body'],
    severity: ThreatLevel.CRITICAL,
    tags: ['rce', 'injection', 'crs'],
  },

  // Path Traversal
  {
    id: 'waf_930100',
    name: 'Path Traversal Attack',
    description: 'Detects path traversal attempts',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern: '(?:\\.\\./|\\.\\.\\\\|%2e%2e%2f|%2e%2e/|%2e%2e\\\\)',
    targets: ['args', 'uri'],
    severity: ThreatLevel.HIGH,
    tags: ['lfi', 'path-traversal', 'crs'],
  },

  // File Upload
  {
    id: 'waf_933100',
    name: 'PHP Injection Attack',
    description: 'Detects PHP code in uploads',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern: '(?i)(?:<\\?(?:php)?|<%|<script\\s+language\\s*=\\s*["\']?php)',
    targets: ['files'],
    severity: ThreatLevel.CRITICAL,
    tags: ['php', 'injection', 'crs'],
  },

  // Scanner Detection
  {
    id: 'waf_913100',
    name: 'Security Scanner Detected',
    description: 'Detects common security scanner user agents',
    enabled: true,
    phase: 1,
    action: 'log',
    pattern:
      '(?i)(?:nikto|sqlmap|nmap|burp|w3af|acunetix|nessus|openvas|qualys|nexpose)',
    targets: ['user_agent'],
    severity: ThreatLevel.LOW,
    tags: ['scanner', 'recon', 'crs'],
  },

  // Session Attacks
  {
    id: 'waf_943100',
    name: 'Session Fixation',
    description: 'Detects session fixation attempts',
    enabled: true,
    phase: 2,
    action: 'block',
    pattern: '(?i)(?:session(?:_?id)?|jsessionid|phpsessid|aspsessionid)\\s*=',
    targets: ['args'],
    severity: ThreatLevel.HIGH,
    tags: ['session', 'crs'],
  },
];

// In-memory rule storage
const rules = new Map<string, WAFRule>();

// Initialize with default rules
for (const rule of OWASP_CRS_RULES) {
  rules.set(rule.id, rule);
}

// WAF event log
const wafEvents: WAFEvent[] = [];
const MAX_EVENTS = 10000;

/**
 * Get all WAF rules
 */
export function getRules(): WAFRule[] {
  return Array.from(rules.values());
}

/**
 * Get enabled rules
 */
export function getEnabledRules(): WAFRule[] {
  return Array.from(rules.values()).filter((r) => r.enabled);
}

/**
 * Add or update a rule
 */
export function upsertRule(rule: WAFRule): void {
  rules.set(rule.id, rule);
}

/**
 * Delete a rule
 */
export function deleteRule(id: string): boolean {
  return rules.delete(id);
}

/**
 * Toggle rule
 */
export function toggleRule(id: string, enabled: boolean): boolean {
  const rule = rules.get(id);
  if (rule) {
    rule.enabled = enabled;
    return true;
  }
  return false;
}

interface WAFRequest {
  method: string;
  uri: string;
  headers: Record<string, string>;
  args?: Record<string, string>;
  body?: string | Record<string, unknown>;
  cookies?: Record<string, string>;
  ipAddress: string;
}

interface WAFResult {
  allowed: boolean;
  matchedRules: WAFRule[];
  events: WAFEvent[];
  threat?: Threat;
}

/**
 * Evaluate a request against WAF rules
 */
export async function evaluateRequest(request: WAFRequest): Promise<WAFResult> {
  const matchedRules: WAFRule[] = [];
  const events: WAFEvent[] = [];
  const enabledRules = getEnabledRules();

  // Sort rules by phase
  const sortedRules = enabledRules.sort((a, b) => a.phase - b.phase);

  for (const rule of sortedRules) {
    const matched = matchRule(rule, request);

    if (matched) {
      matchedRules.push(rule);

      const event: WAFEvent = {
        id: `waf_${Date.now()}_${rule.id}`,
        timestamp: new Date(),
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
        ipAddress: request.ipAddress,
        requestUri: request.uri,
        requestMethod: request.method,
        matchedData: matched.matchedData,
        message: rule.description,
      };

      events.push(event);
      logEvent(event);

      // If action is block, stop processing
      if (rule.action === 'block') {
        break;
      }
    }
  }

  const blocked = matchedRules.some((r) => r.action === 'block');

  let threat: Threat | undefined;
  if (blocked) {
    const highestSeverity = matchedRules.reduce(
      (max, r) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
        return severityOrder[r.severity] > severityOrder[max] ? r.severity : max;
      },
      'info' as ThreatLevel
    );

    threat = {
      id: `waf_threat_${Date.now()}`,
      type: inferThreatType(matchedRules),
      level: highestSeverity,
      source: request.ipAddress,
      target: request.uri,
      detectedAt: new Date(),
      description: `WAF blocked request matching ${matchedRules.length} rules`,
      indicators: matchedRules.map((r) => ({
        type: 'pattern' as const,
        value: r.name,
        confidence: 0.95,
        context: r.tags.join(', '),
      })),
      status: 'active',
      mitigationActions: ['Request blocked by WAF'],
    };

    // Track blocked IP
    await trackBlockedIP(request.ipAddress);
  }

  return { allowed: !blocked, matchedRules, events, threat };
}

/**
 * Match a single rule against request
 */
function matchRule(
  rule: WAFRule,
  request: WAFRequest
): { matched: boolean; matchedData: string } | null {
  const regex = new RegExp(rule.pattern, 'i');
  const targets = getTargetValues(rule.targets, request);

  for (const target of targets) {
    if (regex.test(target.value)) {
      return { matched: true, matchedData: target.value.substring(0, 100) };
    }
  }

  return null;
}

/**
 * Get target values from request
 */
function getTargetValues(
  targets: string[],
  request: WAFRequest
): Array<{ name: string; value: string }> {
  const values: Array<{ name: string; value: string }> = [];

  for (const target of targets) {
    switch (target) {
      case 'request_line':
      case 'request_method':
        values.push({ name: 'method', value: request.method });
        break;
      case 'uri':
        values.push({ name: 'uri', value: request.uri });
        break;
      case 'user_agent':
        if (request.headers['user-agent']) {
          values.push({ name: 'user-agent', value: request.headers['user-agent'] });
        }
        break;
      case 'headers':
        for (const [key, value] of Object.entries(request.headers)) {
          values.push({ name: `header:${key}`, value });
        }
        break;
      case 'args':
        if (request.args) {
          for (const [key, value] of Object.entries(request.args)) {
            values.push({ name: `arg:${key}`, value });
          }
        }
        break;
      case 'body':
        if (request.body) {
          const bodyStr =
            typeof request.body === 'string'
              ? request.body
              : JSON.stringify(request.body);
          values.push({ name: 'body', value: bodyStr });
        }
        break;
      case 'cookies':
        if (request.cookies) {
          for (const [key, value] of Object.entries(request.cookies)) {
            values.push({ name: `cookie:${key}`, value });
          }
        }
        break;
    }
  }

  return values;
}

/**
 * Infer threat type from matched rules
 */
function inferThreatType(rules: WAFRule[]): ThreatType {
  const tags = rules.flatMap((r) => r.tags);

  if (tags.includes('sqli')) return ThreatType.SQL_INJECTION;
  if (tags.includes('xss')) return ThreatType.XSS;
  if (tags.includes('rce')) return ThreatType.COMMAND_INJECTION;
  if (tags.includes('path-traversal')) return ThreatType.PATH_TRAVERSAL;
  if (tags.includes('csrf')) return ThreatType.CSRF;
  if (tags.includes('session')) return ThreatType.SESSION_HIJACKING;

  return ThreatType.ANOMALY;
}

/**
 * Log WAF event
 */
function logEvent(event: WAFEvent): void {
  wafEvents.unshift(event);
  if (wafEvents.length > MAX_EVENTS) {
    wafEvents.pop();
  }
}

/**
 * Get recent WAF events
 */
export function getEvents(limit = 100): WAFEvent[] {
  return wafEvents.slice(0, limit);
}

/**
 * Get events by IP
 */
export function getEventsByIP(ipAddress: string, limit = 100): WAFEvent[] {
  return wafEvents.filter((e) => e.ipAddress === ipAddress).slice(0, limit);
}

/**
 * Get event statistics
 */
export function getStats(): {
  totalEvents: number;
  blockedRequests: number;
  topRules: Array<{ ruleId: string; count: number }>;
  topIPs: Array<{ ip: string; count: number }>;
} {
  const ruleCounts = new Map<string, number>();
  const ipCounts = new Map<string, number>();
  let blockedRequests = 0;

  for (const event of wafEvents) {
    ruleCounts.set(event.ruleId, (ruleCounts.get(event.ruleId) || 0) + 1);
    ipCounts.set(event.ipAddress, (ipCounts.get(event.ipAddress) || 0) + 1);
    if (event.action === 'block') {
      blockedRequests++;
    }
  }

  const topRules = Array.from(ruleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ruleId, count]) => ({ ruleId, count }));

  const topIPs = Array.from(ipCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));

  return {
    totalEvents: wafEvents.length,
    blockedRequests,
    topRules,
    topIPs,
  };
}

/**
 * Track blocked IPs for escalation
 */
async function trackBlockedIP(ip: string): Promise<void> {
  const key = `waf:blocked:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour window
  }

  // Escalate if too many blocks
  if (count >= 10) {
    await redis.setex(`waf:banned:${ip}`, 86400, 'true'); // Ban for 24 hours
  }
}

/**
 * Check if IP is banned
 */
export async function isIPBanned(ip: string): Promise<boolean> {
  return (await redis.exists(`waf:banned:${ip}`)) === 1;
}
