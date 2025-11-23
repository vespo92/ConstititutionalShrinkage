/**
 * Injection Attack Detection
 *
 * Detects SQL injection, NoSQL injection, command injection, and other injection attacks.
 */

import type { Threat, ThreatIndicator } from '../../types/index.js';
import { ThreatLevel, ThreatType } from '../../types/index.js';

// SQL Injection patterns
const SQL_INJECTION_PATTERNS = [
  // Basic SQL keywords
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  // Comments
  /(--|#|\/\*|\*\/)/,
  // Quote manipulation
  /('|")\s*(OR|AND)\s*('|"|\d)/i,
  // Boolean-based
  /'\s*(OR|AND)\s*'?\d+\s*=\s*\d+/i,
  /'\s*(OR|AND)\s*'[^']+'\s*=\s*'[^']+'/i,
  // Time-based
  /(SLEEP|WAITFOR|DELAY|BENCHMARK)\s*\(/i,
  // UNION based
  /UNION\s+(ALL\s+)?SELECT/i,
  // Stacked queries
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
  // Common exploits
  /(\bEXEC\b|\bEXECUTE\b)/i,
  /(xp_|sp_|master\.\.)/i,
  // Encoding bypass attempts
  /(CHAR|CHR|ASCII|CONCAT)\s*\(/i,
  // Null byte
  /%00|\\x00|\\0/,
];

// NoSQL Injection patterns
const NOSQL_INJECTION_PATTERNS = [
  // MongoDB operators
  /\$where|\$regex|\$gt|\$lt|\$ne|\$in|\$or|\$and/i,
  // JavaScript injection in MongoDB
  /function\s*\(|new\s+Function/,
  // JSON manipulation
  /\{\s*"\$[a-z]+"/i,
  // Object injection
  /\[\s*"\$[a-z]+"/i,
];

// Command Injection patterns
const COMMAND_INJECTION_PATTERNS = [
  // Command chaining
  /[;&|`]|\$\(|\)\s*{/,
  // Pipe and redirect
  /\||\>\>?|\<\<?/,
  // Backticks
  /`[^`]+`/,
  // Common commands
  /\b(cat|ls|pwd|whoami|id|uname|curl|wget|nc|netcat|bash|sh|python|perl|ruby)\b/i,
  // Path traversal in commands
  /\.\.\//,
  // Environment variable access
  /\$\{?\w+\}?/,
  // Null byte
  /%00|\\x00/,
];

// LDAP Injection patterns
const LDAP_INJECTION_PATTERNS = [
  /[)(|*\\]/,
  /\x00|\x0a|\x0d/,
];

// XPath Injection patterns
const XPATH_INJECTION_PATTERNS = [
  /(\'|\"|or|and)\s*\[/i,
  /\]\s*(or|and)/i,
  /contains\s*\(/i,
  /position\s*\(/i,
  /substring\s*\(/i,
];

// Template Injection patterns
const TEMPLATE_INJECTION_PATTERNS = [
  /\{\{.*\}\}/,
  /\$\{.*\}/,
  /<%(=|-)?\s*.*%>/,
  /\[\[.*\]\]/,
];

interface DetectionResult {
  detected: boolean;
  type?: ThreatType;
  patterns: string[];
  confidence: number;
  sanitizedValue?: string;
}

/**
 * Detect SQL injection attempts
 */
export function detectSQLInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  // Calculate confidence based on number of matches and input complexity
  const confidence = Math.min(0.3 + matchedPatterns.length * 0.15, 0.95);

  return {
    detected: true,
    type: ThreatType.SQL_INJECTION,
    patterns: matchedPatterns,
    confidence,
    sanitizedValue: sanitizeSQL(input),
  };
}

/**
 * Detect NoSQL injection attempts
 */
export function detectNoSQLInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  // Check string input
  for (const pattern of NOSQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  // Also check if input is JSON with operators
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed === 'object' && parsed !== null) {
      const hasOperator = JSON.stringify(parsed).includes('$');
      if (hasOperator) {
        matchedPatterns.push('JSON with $ operators');
      }
    }
  } catch {
    // Not JSON, continue
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  return {
    detected: true,
    type: ThreatType.SQL_INJECTION, // Using SQL_INJECTION as generic injection type
    patterns: matchedPatterns,
    confidence: Math.min(0.4 + matchedPatterns.length * 0.2, 0.95),
  };
}

/**
 * Detect command injection attempts
 */
export function detectCommandInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  return {
    detected: true,
    type: ThreatType.COMMAND_INJECTION,
    patterns: matchedPatterns,
    confidence: Math.min(0.4 + matchedPatterns.length * 0.15, 0.95),
    sanitizedValue: sanitizeCommand(input),
  };
}

/**
 * Detect LDAP injection attempts
 */
export function detectLDAPInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of LDAP_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  return {
    detected: true,
    type: ThreatType.SQL_INJECTION,
    patterns: matchedPatterns,
    confidence: Math.min(0.3 + matchedPatterns.length * 0.2, 0.9),
  };
}

/**
 * Detect XPath injection attempts
 */
export function detectXPathInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of XPATH_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  return {
    detected: true,
    type: ThreatType.SQL_INJECTION,
    patterns: matchedPatterns,
    confidence: Math.min(0.3 + matchedPatterns.length * 0.2, 0.9),
  };
}

/**
 * Detect template injection attempts
 */
export function detectTemplateInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const pattern of TEMPLATE_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length === 0) {
    return { detected: false, patterns: [], confidence: 0 };
  }

  return {
    detected: true,
    type: ThreatType.XSS, // Template injection often leads to XSS
    patterns: matchedPatterns,
    confidence: Math.min(0.4 + matchedPatterns.length * 0.2, 0.95),
  };
}

/**
 * Comprehensive injection detection
 */
export function detectAllInjections(input: string): Threat | null {
  const results = [
    detectSQLInjection(input),
    detectNoSQLInjection(input),
    detectCommandInjection(input),
    detectLDAPInjection(input),
    detectXPathInjection(input),
    detectTemplateInjection(input),
  ];

  const detectedResults = results.filter((r) => r.detected);

  if (detectedResults.length === 0) {
    return null;
  }

  // Find highest confidence detection
  const highestConfidence = detectedResults.reduce((max, r) =>
    r.confidence > max.confidence ? r : max
  );

  const indicators: ThreatIndicator[] = detectedResults.map((r) => ({
    type: 'pattern' as const,
    value: r.patterns.join(', '),
    confidence: r.confidence,
    context: `Type: ${r.type}`,
  }));

  const level =
    highestConfidence.confidence > 0.8
      ? ThreatLevel.HIGH
      : highestConfidence.confidence > 0.5
        ? ThreatLevel.MEDIUM
        : ThreatLevel.LOW;

  return {
    id: `injection_${Date.now()}`,
    type: highestConfidence.type || ThreatType.SQL_INJECTION,
    level,
    source: 'user_input',
    target: 'application',
    detectedAt: new Date(),
    description: `Injection attack detected with ${Math.round(highestConfidence.confidence * 100)}% confidence`,
    indicators,
    status: 'active',
  };
}

/**
 * Sanitize SQL-like input
 */
function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Sanitize command-like input
 */
function sanitizeCommand(input: string): string {
  return input
    .replace(/[;&|`$(){}]/g, '')
    .replace(/\.\.\//g, '')
    .replace(/%00/g, '');
}

/**
 * Analyze request body for injection attempts
 */
export function analyzeRequestBody(
  body: Record<string, unknown>,
  path = ''
): Threat[] {
  const threats: Threat[] = [];

  for (const [key, value] of Object.entries(body)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      const threat = detectAllInjections(value);
      if (threat) {
        threat.id = `${threat.id}_${currentPath}`;
        threat.description = `${threat.description} in field: ${currentPath}`;
        threats.push(threat);
      }
    } else if (typeof value === 'object' && value !== null) {
      threats.push(...analyzeRequestBody(value as Record<string, unknown>, currentPath));
    }
  }

  return threats;
}
