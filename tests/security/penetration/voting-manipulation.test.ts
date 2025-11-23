/**
 * Voting Manipulation Attack Tests
 *
 * Tests specific to the Constitutional Shrinkage voting platform
 * to verify protection against vote manipulation attacks.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';

interface Vote {
  id: string;
  voterId: string;
  proposalId: string;
  choice: 'yes' | 'no' | 'abstain';
  timestamp: Date;
  signature: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    fingerprint: string;
  };
}

interface VotingSession {
  proposalId: string;
  startTime: Date;
  endTime: Date;
  votes: Map<string, Vote>;
  eligibleVoters: Set<string>;
}

// Vote integrity functions
function signVote(vote: Omit<Vote, 'signature'>, secretKey: string): string {
  const payload = JSON.stringify({
    id: vote.id,
    voterId: vote.voterId,
    proposalId: vote.proposalId,
    choice: vote.choice,
    timestamp: vote.timestamp.toISOString(),
  });

  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

function verifyVoteSignature(vote: Vote, secretKey: string): boolean {
  const expectedSignature = signVote(vote, secretKey);
  return crypto.timingSafeEqual(
    Buffer.from(vote.signature),
    Buffer.from(expectedSignature)
  );
}

function generateVoterFingerprint(
  ipAddress: string,
  userAgent: string,
  additionalData: Record<string, unknown>
): string {
  const data = JSON.stringify({ ipAddress, userAgent, ...additionalData });
  return crypto.createHash('sha256').update(data).digest('hex');
}

describe('Double Voting Prevention', () => {
  let session: VotingSession;
  const secretKey = 'test-secret-key-12345';

  beforeEach(() => {
    session = {
      proposalId: 'proposal-001',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() + 3600000),
      votes: new Map(),
      eligibleVoters: new Set(['voter-1', 'voter-2', 'voter-3', 'voter-4', 'voter-5']),
    };
  });

  function castVote(
    session: VotingSession,
    voterId: string,
    choice: 'yes' | 'no' | 'abstain',
    metadata: Vote['metadata']
  ): { success: boolean; error?: string; vote?: Vote } {
    // Check eligibility
    if (!session.eligibleVoters.has(voterId)) {
      return { success: false, error: 'Voter not eligible' };
    }

    // Check for duplicate vote
    if (session.votes.has(voterId)) {
      return { success: false, error: 'Voter has already cast a vote' };
    }

    // Check timing
    const now = new Date();
    if (now < session.startTime) {
      return { success: false, error: 'Voting has not started' };
    }
    if (now > session.endTime) {
      return { success: false, error: 'Voting has ended' };
    }

    // Create vote
    const voteData: Omit<Vote, 'signature'> = {
      id: crypto.randomBytes(16).toString('hex'),
      voterId,
      proposalId: session.proposalId,
      choice,
      timestamp: now,
      metadata,
    };

    const vote: Vote = {
      ...voteData,
      signature: signVote(voteData, secretKey),
    };

    session.votes.set(voterId, vote);

    return { success: true, vote };
  }

  it('should allow eligible voter to cast one vote', () => {
    const result = castVote(session, 'voter-1', 'yes', {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-123',
    });

    expect(result.success).toBe(true);
    expect(result.vote?.choice).toBe('yes');
  });

  it('should reject duplicate votes from same voter', () => {
    // First vote
    castVote(session, 'voter-1', 'yes', {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-123',
    });

    // Attempt duplicate
    const result = castVote(session, 'voter-1', 'no', {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Voter has already cast a vote');
  });

  it('should reject ineligible voters', () => {
    const result = castVote(session, 'attacker', 'yes', {
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-attacker',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Voter not eligible');
  });

  it('should reject votes after voting period ends', () => {
    session.endTime = new Date(Date.now() - 1000); // Ended 1 second ago

    const result = castVote(session, 'voter-1', 'yes', {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Voting has ended');
  });

  it('should reject votes before voting period starts', () => {
    session.startTime = new Date(Date.now() + 3600000); // Starts in 1 hour

    const result = castVote(session, 'voter-1', 'yes', {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      fingerprint: 'fp-123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Voting has not started');
  });
});

describe('Vote Integrity', () => {
  const secretKey = 'vote-signing-key-secure';

  it('should sign votes cryptographically', () => {
    const voteData: Omit<Vote, 'signature'> = {
      id: 'vote-123',
      voterId: 'voter-1',
      proposalId: 'proposal-001',
      choice: 'yes',
      timestamp: new Date(),
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        fingerprint: 'fp-123',
      },
    };

    const signature = signVote(voteData, secretKey);

    expect(signature).toHaveLength(64); // SHA-256 hex
    expect(/^[0-9a-f]+$/.test(signature)).toBe(true);
  });

  it('should verify valid vote signatures', () => {
    const voteData: Omit<Vote, 'signature'> = {
      id: 'vote-123',
      voterId: 'voter-1',
      proposalId: 'proposal-001',
      choice: 'yes',
      timestamp: new Date(),
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        fingerprint: 'fp-123',
      },
    };

    const vote: Vote = {
      ...voteData,
      signature: signVote(voteData, secretKey),
    };

    expect(verifyVoteSignature(vote, secretKey)).toBe(true);
  });

  it('should reject tampered votes', () => {
    const voteData: Omit<Vote, 'signature'> = {
      id: 'vote-123',
      voterId: 'voter-1',
      proposalId: 'proposal-001',
      choice: 'yes',
      timestamp: new Date(),
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        fingerprint: 'fp-123',
      },
    };

    const vote: Vote = {
      ...voteData,
      signature: signVote(voteData, secretKey),
    };

    // Tamper with the vote
    vote.choice = 'no';

    expect(verifyVoteSignature(vote, secretKey)).toBe(false);
  });

  it('should reject votes with invalid signatures', () => {
    const vote: Vote = {
      id: 'vote-123',
      voterId: 'voter-1',
      proposalId: 'proposal-001',
      choice: 'yes',
      timestamp: new Date(),
      metadata: {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        fingerprint: 'fp-123',
      },
      signature: 'forged-signature-invalid',
    };

    expect(() => verifyVoteSignature(vote, secretKey)).toThrow();
  });
});

describe('Sybil Attack Detection', () => {
  interface VoterProfile {
    voterId: string;
    fingerprint: string;
    ipAddress: string;
    registrationTime: Date;
    accountAge: number; // days
    verificationLevel: 'none' | 'email' | 'phone' | 'id';
  }

  function detectSybilCluster(profiles: VoterProfile[]): {
    suspicious: boolean;
    reason?: string;
    clusteredVoters?: string[];
  } {
    // Group by fingerprint
    const fingerprintGroups = new Map<string, VoterProfile[]>();
    for (const profile of profiles) {
      const group = fingerprintGroups.get(profile.fingerprint) || [];
      group.push(profile);
      fingerprintGroups.set(profile.fingerprint, group);
    }

    // Check for clusters
    for (const [fingerprint, group] of fingerprintGroups) {
      if (group.length > 1) {
        return {
          suspicious: true,
          reason: `Multiple accounts sharing fingerprint: ${fingerprint}`,
          clusteredVoters: group.map((p) => p.voterId),
        };
      }
    }

    // Group by IP
    const ipGroups = new Map<string, VoterProfile[]>();
    for (const profile of profiles) {
      const group = ipGroups.get(profile.ipAddress) || [];
      group.push(profile);
      ipGroups.set(profile.ipAddress, group);
    }

    // Allow some same-IP voting (shared networks) but flag excessive
    for (const [ip, group] of ipGroups) {
      if (group.length > 5) {
        return {
          suspicious: true,
          reason: `Excessive accounts from same IP: ${ip}`,
          clusteredVoters: group.map((p) => p.voterId),
        };
      }
    }

    // Check for bulk account creation
    const recentAccounts = profiles.filter((p) => p.accountAge < 7);
    if (recentAccounts.length > profiles.length * 0.5) {
      return {
        suspicious: true,
        reason: 'High proportion of recently created accounts',
        clusteredVoters: recentAccounts.map((p) => p.voterId),
      };
    }

    return { suspicious: false };
  }

  it('should detect multiple accounts with same fingerprint', () => {
    const profiles: VoterProfile[] = [
      {
        voterId: 'voter-1',
        fingerprint: 'fp-same',
        ipAddress: '192.168.1.100',
        registrationTime: new Date(Date.now() - 30 * 24 * 3600000),
        accountAge: 30,
        verificationLevel: 'email',
      },
      {
        voterId: 'voter-2',
        fingerprint: 'fp-same', // Same fingerprint!
        ipAddress: '192.168.1.101',
        registrationTime: new Date(Date.now() - 1 * 24 * 3600000),
        accountAge: 1,
        verificationLevel: 'none',
      },
    ];

    const result = detectSybilCluster(profiles);

    expect(result.suspicious).toBe(true);
    expect(result.reason).toContain('fingerprint');
    expect(result.clusteredVoters).toContain('voter-1');
    expect(result.clusteredVoters).toContain('voter-2');
  });

  it('should detect excessive accounts from same IP', () => {
    const profiles: VoterProfile[] = Array.from({ length: 10 }, (_, i) => ({
      voterId: `voter-${i}`,
      fingerprint: `fp-${i}`,
      ipAddress: '192.168.1.100', // All same IP
      registrationTime: new Date(Date.now() - 30 * 24 * 3600000),
      accountAge: 30,
      verificationLevel: 'email' as const,
    }));

    const result = detectSybilCluster(profiles);

    expect(result.suspicious).toBe(true);
    expect(result.reason).toContain('IP');
  });

  it('should detect bulk account creation', () => {
    const profiles: VoterProfile[] = Array.from({ length: 20 }, (_, i) => ({
      voterId: `voter-${i}`,
      fingerprint: `fp-${i}`,
      ipAddress: `192.168.1.${100 + i}`,
      registrationTime: new Date(Date.now() - 2 * 24 * 3600000),
      accountAge: 2, // All created 2 days ago
      verificationLevel: 'none' as const,
    }));

    const result = detectSybilCluster(profiles);

    expect(result.suspicious).toBe(true);
    expect(result.reason).toContain('recently created');
  });

  it('should not flag legitimate voters', () => {
    const profiles: VoterProfile[] = [
      {
        voterId: 'voter-1',
        fingerprint: 'fp-unique-1',
        ipAddress: '192.168.1.100',
        registrationTime: new Date(Date.now() - 365 * 24 * 3600000),
        accountAge: 365,
        verificationLevel: 'id',
      },
      {
        voterId: 'voter-2',
        fingerprint: 'fp-unique-2',
        ipAddress: '10.0.0.50',
        registrationTime: new Date(Date.now() - 180 * 24 * 3600000),
        accountAge: 180,
        verificationLevel: 'phone',
      },
      {
        voterId: 'voter-3',
        fingerprint: 'fp-unique-3',
        ipAddress: '172.16.0.25',
        registrationTime: new Date(Date.now() - 90 * 24 * 3600000),
        accountAge: 90,
        verificationLevel: 'email',
      },
    ];

    const result = detectSybilCluster(profiles);

    expect(result.suspicious).toBe(false);
  });
});

describe('Vote Timing Attack Prevention', () => {
  it('should detect suspicious voting patterns', () => {
    const votes: { voterId: string; timestamp: Date }[] = [
      { voterId: 'voter-1', timestamp: new Date('2024-01-15T10:00:00.000Z') },
      { voterId: 'voter-2', timestamp: new Date('2024-01-15T10:00:00.100Z') },
      { voterId: 'voter-3', timestamp: new Date('2024-01-15T10:00:00.200Z') },
      { voterId: 'voter-4', timestamp: new Date('2024-01-15T10:00:00.300Z') },
      { voterId: 'voter-5', timestamp: new Date('2024-01-15T10:00:00.400Z') },
    ];

    // All votes within 500ms - suspicious bot pattern
    const timeWindow = 1000; // 1 second
    const maxVotesInWindow = 3;

    const voteCounts = new Map<number, number>();
    for (const vote of votes) {
      const bucket = Math.floor(vote.timestamp.getTime() / timeWindow);
      voteCounts.set(bucket, (voteCounts.get(bucket) || 0) + 1);
    }

    const maxInBucket = Math.max(...voteCounts.values());
    const isSuspicious = maxInBucket > maxVotesInWindow;

    expect(isSuspicious).toBe(true);
  });

  it('should add random delay to vote submissions', () => {
    const getRandomDelay = (minMs: number, maxMs: number): number => {
      return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    };

    const delays: number[] = [];
    for (let i = 0; i < 100; i++) {
      delays.push(getRandomDelay(100, 500));
    }

    // Verify delays are within range
    expect(Math.min(...delays)).toBeGreaterThanOrEqual(100);
    expect(Math.max(...delays)).toBeLessThanOrEqual(500);

    // Verify randomness (not all same)
    const uniqueDelays = new Set(delays);
    expect(uniqueDelays.size).toBeGreaterThan(10);
  });
});

describe('Vote Privacy', () => {
  it('should hash voter identity for storage', () => {
    const voterId = 'user-12345-actual-id';
    const salt = 'random-salt-value';

    const hashedId = crypto
      .createHash('sha256')
      .update(voterId + salt)
      .digest('hex');

    // Original ID should not be derivable
    expect(hashedId).not.toContain('12345');
    expect(hashedId).toHaveLength(64);
  });

  it('should separate voter identity from vote choice', () => {
    interface EncryptedVote {
      encryptedChoice: string;
      voterProof: string; // Zero-knowledge proof of eligibility
      nonce: string;
    }

    interface VoterReceipt {
      voterId: string;
      voteHash: string;
      timestamp: Date;
    }

    // Simulate encrypted vote
    const encryptVote = (choice: string, publicKey: string): EncryptedVote => {
      const nonce = crypto.randomBytes(16).toString('hex');
      // In real implementation, would use actual encryption
      const encryptedChoice = crypto
        .createHash('sha256')
        .update(choice + nonce + publicKey)
        .digest('hex');

      return {
        encryptedChoice,
        voterProof: 'zkp-placeholder',
        nonce,
      };
    };

    const vote = encryptVote('yes', 'election-public-key');

    // Cannot determine vote choice from encrypted data
    expect(vote.encryptedChoice).not.toBe('yes');
    expect(vote.encryptedChoice).not.toBe('no');
    expect(vote.encryptedChoice).toHaveLength(64);
  });
});

describe('Rate Limiting for Voting', () => {
  interface RateLimitConfig {
    maxVotesPerVoter: number;
    maxVotesPerIp: number;
    windowMs: number;
  }

  function createVoteRateLimiter(config: RateLimitConfig) {
    const voterAttempts = new Map<string, number[]>();
    const ipAttempts = new Map<string, number[]>();

    return {
      checkRateLimit(voterId: string, ipAddress: string): { allowed: boolean; reason?: string } {
        const now = Date.now();
        const windowStart = now - config.windowMs;

        // Check voter rate limit
        const voterTimestamps = (voterAttempts.get(voterId) || []).filter((t) => t > windowStart);
        if (voterTimestamps.length >= config.maxVotesPerVoter) {
          return { allowed: false, reason: 'Voter rate limit exceeded' };
        }

        // Check IP rate limit
        const ipTimestamps = (ipAttempts.get(ipAddress) || []).filter((t) => t > windowStart);
        if (ipTimestamps.length >= config.maxVotesPerIp) {
          return { allowed: false, reason: 'IP rate limit exceeded' };
        }

        return { allowed: true };
      },

      recordAttempt(voterId: string, ipAddress: string): void {
        const now = Date.now();

        const voterTimestamps = voterAttempts.get(voterId) || [];
        voterTimestamps.push(now);
        voterAttempts.set(voterId, voterTimestamps);

        const ipTimestamps = ipAttempts.get(ipAddress) || [];
        ipTimestamps.push(now);
        ipAttempts.set(ipAddress, ipTimestamps);
      },
    };
  }

  it('should limit votes per voter', () => {
    const limiter = createVoteRateLimiter({
      maxVotesPerVoter: 3,
      maxVotesPerIp: 10,
      windowMs: 60000,
    });

    // First 3 attempts should be allowed
    for (let i = 0; i < 3; i++) {
      const result = limiter.checkRateLimit('voter-1', '192.168.1.100');
      expect(result.allowed).toBe(true);
      limiter.recordAttempt('voter-1', '192.168.1.100');
    }

    // 4th attempt should be blocked
    const result = limiter.checkRateLimit('voter-1', '192.168.1.100');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Voter rate limit');
  });

  it('should limit votes per IP', () => {
    const limiter = createVoteRateLimiter({
      maxVotesPerVoter: 10,
      maxVotesPerIp: 5,
      windowMs: 60000,
    });

    // 5 different voters from same IP
    for (let i = 0; i < 5; i++) {
      const result = limiter.checkRateLimit(`voter-${i}`, '192.168.1.100');
      expect(result.allowed).toBe(true);
      limiter.recordAttempt(`voter-${i}`, '192.168.1.100');
    }

    // 6th voter from same IP should be blocked
    const result = limiter.checkRateLimit('voter-6', '192.168.1.100');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('IP rate limit');
  });
});
