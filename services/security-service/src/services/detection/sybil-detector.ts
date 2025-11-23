/**
 * Sybil Attack Detection
 *
 * Detects fake/duplicate accounts attempting to manipulate voting.
 */

import { redis } from '../../lib/redis.js';
import type { Threat, FraudIndicator } from '../../types/index.js';
import { ThreatLevel, ThreatType } from '../../types/index.js';
import { sha256 } from '../../lib/hashing.js';

interface UserFingerprint {
  userId: string;
  deviceHash: string;
  browserFingerprint: string;
  ipAddress: string;
  createdAt: Date;
  behaviorPatterns: {
    typingSpeed?: number;
    mouseMovementPattern?: string;
    sessionDuration?: number;
    interactionPattern?: string;
  };
}

interface SybilCluster {
  id: string;
  accounts: string[];
  indicators: FraudIndicator[];
  confidence: number;
  detectedAt: Date;
}

/**
 * Create a device fingerprint hash
 */
function createDeviceHash(
  userAgent: string,
  screenResolution: string,
  timezone: string,
  language: string,
  plugins?: string[]
): string {
  const components = [
    userAgent,
    screenResolution,
    timezone,
    language,
    ...(plugins || []),
  ].join('|');

  return sha256(components);
}

/**
 * Store user fingerprint for Sybil detection
 */
export async function storeFingerprint(
  fingerprint: UserFingerprint
): Promise<void> {
  const key = `fingerprint:${fingerprint.userId}`;
  await redis.hset(key, {
    deviceHash: fingerprint.deviceHash,
    browserFingerprint: fingerprint.browserFingerprint,
    ipAddress: fingerprint.ipAddress,
    createdAt: fingerprint.createdAt.toISOString(),
    behaviorPatterns: JSON.stringify(fingerprint.behaviorPatterns),
  });
  await redis.expire(key, 86400 * 30); // 30 days

  // Index by device hash for clustering
  await redis.sadd(`device:${fingerprint.deviceHash}`, fingerprint.userId);
  await redis.expire(`device:${fingerprint.deviceHash}`, 86400 * 30);

  // Index by IP
  await redis.sadd(`ip_users:${fingerprint.ipAddress}`, fingerprint.userId);
  await redis.expire(`ip_users:${fingerprint.ipAddress}`, 86400 * 7);
}

/**
 * Detect Sybil accounts by device fingerprint
 */
export async function detectByDeviceFingerprint(
  deviceHash: string,
  threshold = 3
): Promise<SybilCluster | null> {
  const accounts = await redis.smembers(`device:${deviceHash}`);

  if (accounts.length >= threshold) {
    return {
      id: `sybil_device_${Date.now()}`,
      accounts,
      indicators: [
        {
          type: 'device',
          confidence: 0.9,
          description: `${accounts.length} accounts sharing same device fingerprint`,
          evidence: { deviceHash, accountCount: accounts.length },
        },
      ],
      confidence: Math.min(0.5 + accounts.length * 0.1, 0.95),
      detectedAt: new Date(),
    };
  }

  return null;
}

/**
 * Detect Sybil accounts by IP address
 */
export async function detectByIPAddress(
  ipAddress: string,
  threshold = 5
): Promise<SybilCluster | null> {
  const accounts = await redis.smembers(`ip_users:${ipAddress}`);

  if (accounts.length >= threshold) {
    // Check if accounts were created close in time
    const creationTimes: Date[] = [];
    for (const userId of accounts) {
      const data = await redis.hget(`fingerprint:${userId}`, 'createdAt');
      if (data) {
        creationTimes.push(new Date(data));
      }
    }

    // Sort and check time clustering
    creationTimes.sort((a, b) => a.getTime() - b.getTime());
    let clusteredCreations = 0;
    for (let i = 1; i < creationTimes.length; i++) {
      const prev = creationTimes[i - 1];
      const curr = creationTimes[i];
      if (prev && curr) {
        const diff = curr.getTime() - prev.getTime();
        if (diff < 300000) {
          // Within 5 minutes
          clusteredCreations++;
        }
      }
    }

    const confidence = Math.min(
      0.3 + accounts.length * 0.05 + clusteredCreations * 0.15,
      0.95
    );

    if (confidence > 0.6) {
      return {
        id: `sybil_ip_${Date.now()}`,
        accounts,
        indicators: [
          {
            type: 'location',
            confidence,
            description: `${accounts.length} accounts from same IP, ${clusteredCreations} created in rapid succession`,
            evidence: { ipAddress, accountCount: accounts.length, clusteredCreations },
          },
        ],
        confidence,
        detectedAt: new Date(),
      };
    }
  }

  return null;
}

/**
 * Detect Sybil accounts by behavioral similarity
 */
export async function detectByBehavior(
  userId: string,
  behavior: UserFingerprint['behaviorPatterns']
): Promise<FraudIndicator[]> {
  const indicators: FraudIndicator[] = [];

  // Check for bot-like typing speed (too consistent)
  if (behavior.typingSpeed !== undefined) {
    // Humans typically have 10-20% variance in typing speed
    // Bots often have < 5% variance
    const key = `typing_speed:${userId}`;
    await redis.lpush(key, behavior.typingSpeed.toString());
    await redis.ltrim(key, 0, 99); // Keep last 100 samples
    await redis.expire(key, 86400 * 7);

    const samples = await redis.lrange(key, 0, -1);
    if (samples.length >= 10) {
      const numbers = samples.map(Number);
      const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      const variance =
        numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
      const cv = Math.sqrt(variance) / mean; // Coefficient of variation

      if (cv < 0.05) {
        indicators.push({
          type: 'behavior',
          confidence: 0.8,
          description: 'Typing speed too consistent (possible bot)',
          evidence: { coefficientOfVariation: cv, samples: samples.length },
        });
      }
    }
  }

  // Check for automated session patterns
  if (behavior.sessionDuration !== undefined) {
    const key = `session_duration:${userId}`;
    await redis.lpush(key, behavior.sessionDuration.toString());
    await redis.ltrim(key, 0, 49);
    await redis.expire(key, 86400 * 7);

    const samples = await redis.lrange(key, 0, -1);
    if (samples.length >= 5) {
      const durations = samples.map(Number);

      // Check for suspiciously identical durations
      const uniqueDurations = new Set(
        durations.map((d) => Math.round(d / 1000)) // Round to seconds
      );

      if (uniqueDurations.size <= 2 && durations.length >= 10) {
        indicators.push({
          type: 'behavior',
          confidence: 0.75,
          description: 'Session durations suspiciously uniform',
          evidence: { uniquePatterns: uniqueDurations.size, samples: durations.length },
        });
      }
    }
  }

  return indicators;
}

/**
 * Detect coordinated voting patterns
 */
export async function detectCoordinatedVoting(
  billId: string,
  windowMinutes = 5
): Promise<Threat | null> {
  const key = `votes:${billId}:recent`;
  const windowMs = windowMinutes * 60 * 1000;
  const now = Date.now();

  // Get recent votes
  const votes = await redis.zrangebyscore(
    key,
    (now - windowMs).toString(),
    now.toString(),
    'WITHSCORES'
  );

  if (votes.length < 20) return null; // Need enough votes to detect patterns

  // Parse votes
  const voteData: { userId: string; timestamp: number; vote: string }[] = [];
  for (let i = 0; i < votes.length; i += 2) {
    const data = votes[i];
    const timestamp = votes[i + 1];
    if (data && timestamp) {
      const [userId, vote] = data.split(':');
      if (userId && vote) {
        voteData.push({
          userId,
          vote,
          timestamp: parseInt(timestamp, 10),
        });
      }
    }
  }

  // Check for voting waves (many votes in short bursts)
  const burstThreshold = 10; // votes
  const burstWindow = 30000; // 30 seconds
  let maxBurst = 0;
  let burstStart = voteData[0]?.timestamp ?? 0;
  let burstCount = 0;

  for (const vote of voteData) {
    if (vote.timestamp - burstStart < burstWindow) {
      burstCount++;
      maxBurst = Math.max(maxBurst, burstCount);
    } else {
      burstStart = vote.timestamp;
      burstCount = 1;
    }
  }

  if (maxBurst >= burstThreshold) {
    // Get IPs of voters in burst
    const burstVoters = voteData
      .filter((v) => v.timestamp >= burstStart && v.timestamp < burstStart + burstWindow)
      .map((v) => v.userId);

    // Check if same vote direction
    const votes_in_burst = voteData.filter(
      (v) => v.timestamp >= burstStart && v.timestamp < burstStart + burstWindow
    );
    const yesVotes = votes_in_burst.filter((v) => v.vote === 'yes').length;
    const noVotes = votes_in_burst.filter((v) => v.vote === 'no').length;
    const unanimity = Math.max(yesVotes, noVotes) / votes_in_burst.length;

    if (unanimity > 0.9) {
      return {
        id: `coord_vote_${Date.now()}_${billId}`,
        type: ThreatType.VOTE_MANIPULATION,
        level: ThreatLevel.HIGH,
        source: 'coordinated_accounts',
        target: billId,
        detectedAt: new Date(),
        description: `Coordinated voting detected: ${maxBurst} votes in ${burstWindow / 1000}s with ${Math.round(unanimity * 100)}% unanimity`,
        indicators: [
          {
            type: 'pattern',
            value: `${maxBurst} coordinated votes`,
            confidence: Math.min(0.5 + unanimity * 0.4, 0.95),
            context: `Bill: ${billId}`,
          },
        ],
        status: 'active',
      };
    }
  }

  return null;
}

/**
 * Record a vote for pattern detection
 */
export async function recordVote(
  billId: string,
  userId: string,
  vote: 'yes' | 'no' | 'abstain'
): Promise<void> {
  const key = `votes:${billId}:recent`;
  const now = Date.now();

  await redis.zadd(key, now.toString(), `${userId}:${vote}`);
  await redis.expire(key, 3600); // Keep for 1 hour

  // Also track user's voting patterns
  await redis.lpush(`user_votes:${userId}`, `${billId}:${vote}:${now}`);
  await redis.ltrim(`user_votes:${userId}`, 0, 999);
  await redis.expire(`user_votes:${userId}`, 86400 * 30);
}

/**
 * Analyze user account for Sybil indicators
 */
export async function analyzeAccount(userId: string): Promise<{
  riskScore: number;
  indicators: FraudIndicator[];
  clusters: SybilCluster[];
}> {
  const fingerprint = await redis.hgetall(`fingerprint:${userId}`);
  const indicators: FraudIndicator[] = [];
  const clusters: SybilCluster[] = [];

  if (!fingerprint.deviceHash) {
    return { riskScore: 0, indicators, clusters };
  }

  // Check device clustering
  const deviceCluster = await detectByDeviceFingerprint(fingerprint.deviceHash);
  if (deviceCluster) {
    clusters.push(deviceCluster);
    indicators.push(...deviceCluster.indicators);
  }

  // Check IP clustering
  const ipCluster = await detectByIPAddress(fingerprint.ipAddress);
  if (ipCluster) {
    clusters.push(ipCluster);
    indicators.push(...ipCluster.indicators);
  }

  // Calculate risk score
  const riskScore = Math.min(
    indicators.reduce((sum, i) => sum + i.confidence * 0.3, 0),
    1
  );

  return { riskScore, indicators, clusters };
}
