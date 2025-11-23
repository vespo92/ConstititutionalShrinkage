/**
 * Bot Detection Service
 *
 * Identifies and prevents automated attacks and bot traffic.
 */

import { redis } from '../../lib/redis.js';
import { sha256 } from '../../lib/hashing.js';
import type { Threat, ThreatIndicator } from '../../types/index.js';
import { ThreatLevel, ThreatType } from '../../types/index.js';

interface BrowserFingerprint {
  userAgent: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
  screenResolution?: string;
  timezone?: string;
  plugins?: string[];
  canvas?: string;
  webgl?: string;
  fonts?: string[];
}

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  threatLevel: ThreatLevel;
}

// Known bot user agent patterns
const BOT_UA_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /httpclient/i,
  /httpie/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
  /java/i,
  /ruby/i,
  /perl/i,
  /libwww/i,
  /phantomjs/i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /webdriver/i,
];

// Legitimate bot patterns (search engines, etc.)
const LEGITIMATE_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /slurp/i, // Yahoo
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /uptimerobot/i,
  /pingdom/i,
];

/**
 * Analyze request for bot characteristics
 */
export async function detectBot(
  fingerprint: BrowserFingerprint,
  ipAddress: string,
  requestHistory?: { timestamps: number[]; paths: string[] }
): Promise<BotDetectionResult> {
  const reasons: string[] = [];
  let score = 0;

  // Check user agent
  const uaResult = analyzeUserAgent(fingerprint.userAgent);
  if (uaResult.isBot) {
    if (uaResult.isLegitimate) {
      return {
        isBot: true,
        confidence: 0.95,
        reasons: ['Legitimate search engine bot'],
        threatLevel: ThreatLevel.INFO,
      };
    }
    score += uaResult.score;
    reasons.push(...uaResult.reasons);
  }

  // Check for missing browser headers
  const headerResult = analyzeHeaders(fingerprint);
  score += headerResult.score;
  reasons.push(...headerResult.reasons);

  // Check request patterns
  if (requestHistory) {
    const patternResult = analyzeRequestPatterns(requestHistory);
    score += patternResult.score;
    reasons.push(...patternResult.reasons);
  }

  // Check fingerprint consistency
  const consistencyResult = await checkFingerprintConsistency(
    ipAddress,
    fingerprint
  );
  score += consistencyResult.score;
  reasons.push(...consistencyResult.reasons);

  // Calculate confidence and threat level
  const confidence = Math.min(score / 100, 1);
  const isBot = confidence > 0.5;

  let threatLevel: ThreatLevel;
  if (confidence > 0.9) {
    threatLevel = ThreatLevel.HIGH;
  } else if (confidence > 0.7) {
    threatLevel = ThreatLevel.MEDIUM;
  } else if (confidence > 0.5) {
    threatLevel = ThreatLevel.LOW;
  } else {
    threatLevel = ThreatLevel.INFO;
  }

  return { isBot, confidence, reasons, threatLevel };
}

/**
 * Analyze user agent string
 */
function analyzeUserAgent(userAgent: string): {
  isBot: boolean;
  isLegitimate: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;
  let isBot = false;
  let isLegitimate = false;

  // Check for legitimate bots first
  for (const pattern of LEGITIMATE_BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, isLegitimate: true, score: 0, reasons: [] };
    }
  }

  // Check for bot patterns
  for (const pattern of BOT_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      isBot = true;
      score += 40;
      reasons.push(`Bot pattern detected: ${pattern.source}`);
      break;
    }
  }

  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    score += 30;
    reasons.push('Missing or too short user agent');
  }

  // Check for common browser signatures
  const hasBrowserSignature =
    /Mozilla|Chrome|Safari|Firefox|Edge|Opera/.test(userAgent);
  if (!hasBrowserSignature && !isBot) {
    score += 20;
    reasons.push('No standard browser signature');
  }

  // Check for version inconsistencies
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  const safariMatch = userAgent.match(/Safari\/(\d+)/);

  if (chromeMatch && safariMatch) {
    // Chrome should not claim to be Safari in certain ways
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      // OK - actual Safari
    } else if (chromeMatch[1] && parseInt(chromeMatch[1], 10) < 60) {
      score += 15;
      reasons.push('Outdated Chrome version');
    }
  }

  return { isBot, isLegitimate, score, reasons };
}

/**
 * Analyze HTTP headers
 */
function analyzeHeaders(fingerprint: BrowserFingerprint): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  // Real browsers send Accept-Language
  if (!fingerprint.acceptLanguage) {
    score += 15;
    reasons.push('Missing Accept-Language header');
  }

  // Real browsers send Accept-Encoding
  if (!fingerprint.acceptEncoding) {
    score += 10;
    reasons.push('Missing Accept-Encoding header');
  }

  // Check for suspicious Accept-Language values
  if (fingerprint.acceptLanguage === '*') {
    score += 20;
    reasons.push('Wildcard Accept-Language');
  }

  return { score, reasons };
}

/**
 * Analyze request patterns
 */
function analyzeRequestPatterns(history: {
  timestamps: number[];
  paths: string[];
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Check request timing
  if (history.timestamps.length >= 2) {
    const intervals: number[] = [];
    for (let i = 1; i < history.timestamps.length; i++) {
      const prev = history.timestamps[i - 1];
      const curr = history.timestamps[i];
      if (prev !== undefined && curr !== undefined) {
        intervals.push(curr - prev);
      }
    }

    // Check for too-regular intervals (machine-like)
    if (intervals.length >= 3) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) /
        intervals.length;
      const stdDev = Math.sqrt(variance);

      // Low variance = machine-like timing
      if (avgInterval > 0 && stdDev / avgInterval < 0.1) {
        score += 30;
        reasons.push('Machine-like request timing');
      }
    }

    // Check for impossibly fast requests
    const minInterval = Math.min(...intervals);
    if (minInterval < 50) {
      // Less than 50ms
      score += 25;
      reasons.push('Impossibly fast requests');
    }
  }

  // Check path patterns
  const uniquePaths = new Set(history.paths);
  const totalRequests = history.paths.length;

  // Too many unique paths in short time = crawling
  if (uniquePaths.size > 50 && totalRequests > 60) {
    score += 20;
    reasons.push('Crawling behavior detected');
  }

  // Sequential path enumeration
  const sortedPaths = [...history.paths].sort();
  let sequential = 0;
  for (let i = 1; i < sortedPaths.length; i++) {
    const prev = sortedPaths[i - 1];
    const curr = sortedPaths[i];
    if (prev && curr) {
      // Check for numeric incrementing
      const prevNum = prev.match(/\d+$/);
      const currNum = curr.match(/\d+$/);
      if (prevNum && currNum) {
        if (parseInt(currNum[0], 10) - parseInt(prevNum[0], 10) === 1) {
          sequential++;
        }
      }
    }
  }

  if (sequential > 5) {
    score += 25;
    reasons.push('Sequential path enumeration');
  }

  return { score, reasons };
}

/**
 * Check fingerprint consistency over time
 */
async function checkFingerprintConsistency(
  ipAddress: string,
  fingerprint: BrowserFingerprint
): Promise<{ score: number; reasons: string[] }> {
  const reasons: string[] = [];
  let score = 0;

  const key = `fp:${ipAddress}`;
  const stored = await redis.hgetall(key);

  if (Object.keys(stored).length > 0) {
    // Check for fingerprint changes
    const currentHash = sha256(JSON.stringify(fingerprint));
    const storedHash = stored.hash;

    if (storedHash && currentHash !== storedHash) {
      const changeCount = parseInt(stored.changes || '0', 10) + 1;
      await redis.hincrby(key, 'changes', 1);

      if (changeCount > 3) {
        score += 20;
        reasons.push('Frequent fingerprint changes');
      }
    }

    // Check for impossible changes
    if (stored.userAgent && stored.userAgent !== fingerprint.userAgent) {
      // User agent changed but same IP in short time
      const lastSeen = parseInt(stored.lastSeen || '0', 10);
      if (Date.now() - lastSeen < 60000) {
        // Less than 1 minute
        score += 25;
        reasons.push('User agent changed too quickly');
      }
    }
  }

  // Store current fingerprint
  await redis.hset(key, {
    hash: sha256(JSON.stringify(fingerprint)),
    userAgent: fingerprint.userAgent,
    lastSeen: Date.now().toString(),
  });
  await redis.expire(key, 3600);

  return { score, reasons };
}

/**
 * Create threat from bot detection
 */
export function createBotThreat(
  result: BotDetectionResult,
  ipAddress: string
): Threat | null {
  if (!result.isBot || result.confidence < 0.5) {
    return null;
  }

  const indicators: ThreatIndicator[] = result.reasons.map((reason) => ({
    type: 'behavior' as const,
    value: reason,
    confidence: result.confidence,
  }));

  return {
    id: `bot_${Date.now()}_${ipAddress}`,
    type: ThreatType.BOT_ATTACK,
    level: result.threatLevel,
    source: ipAddress,
    target: 'system',
    detectedAt: new Date(),
    description: `Bot detected with ${Math.round(result.confidence * 100)}% confidence`,
    indicators,
    status: 'active',
  };
}

/**
 * Challenge suspicious requests with CAPTCHA
 */
export async function shouldChallenge(
  ipAddress: string,
  fingerprint: BrowserFingerprint
): Promise<boolean> {
  const result = await detectBot(fingerprint, ipAddress);

  // Challenge if moderately suspicious but not certain
  return result.confidence > 0.3 && result.confidence < 0.8;
}

/**
 * Record CAPTCHA solve
 */
export async function recordCaptchaSolve(
  ipAddress: string,
  success: boolean
): Promise<void> {
  const key = `captcha:${ipAddress}`;

  if (success) {
    // Mark as human
    await redis.setex(`human:${ipAddress}`, 3600, 'true');
    await redis.del(key);
  } else {
    // Track failures
    const failures = await redis.incr(key);
    await redis.expire(key, 300);

    // Too many failures = definitely a bot
    if (failures >= 3) {
      await redis.setex(`confirmed_bot:${ipAddress}`, 86400, 'true');
    }
  }
}

/**
 * Check if IP is confirmed human (passed CAPTCHA recently)
 */
export async function isConfirmedHuman(ipAddress: string): Promise<boolean> {
  return (await redis.exists(`human:${ipAddress}`)) === 1;
}

/**
 * Check if IP is confirmed bot
 */
export async function isConfirmedBot(ipAddress: string): Promise<boolean> {
  return (await redis.exists(`confirmed_bot:${ipAddress}`)) === 1;
}

/**
 * Get bot detection statistics
 */
export async function getBotStats(): Promise<{
  totalDetected: number;
  confirmedBots: number;
  confirmedHumans: number;
  challengesPassed: number;
  challengesFailed: number;
}> {
  let confirmedBots = 0;
  let confirmedHumans = 0;
  let challengesPassed = 0;
  let challengesFailed = 0;

  // Count confirmed bots
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'confirmed_bot:*',
      'COUNT',
      100
    );
    cursor = newCursor;
    confirmedBots += keys.length;
  } while (cursor !== '0');

  // Count confirmed humans
  cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      'MATCH',
      'human:*',
      'COUNT',
      100
    );
    cursor = newCursor;
    confirmedHumans += keys.length;
  } while (cursor !== '0');

  // Get challenge stats
  const passed = await redis.get('stats:captcha:passed');
  const failed = await redis.get('stats:captcha:failed');
  challengesPassed = passed ? parseInt(passed, 10) : 0;
  challengesFailed = failed ? parseInt(failed, 10) : 0;

  return {
    totalDetected: confirmedBots + challengesFailed,
    confirmedBots,
    confirmedHumans,
    challengesPassed,
    challengesFailed,
  };
}
