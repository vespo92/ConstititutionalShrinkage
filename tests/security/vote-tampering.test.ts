/**
 * Security Tests - Vote Tampering Prevention
 * Tests for securing the voting system against manipulation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VotingSystem } from '../../packages/voting-system/src/voting';
import { VoteChoice, VotingStatus, DelegationScope } from '../../packages/voting-system/src/types';

describe('Vote Tampering Prevention', () => {
  let votingSystem: VotingSystem;

  beforeEach(() => {
    votingSystem = new VotingSystem();

    // Register test citizens
    for (let i = 1; i <= 10; i++) {
      votingSystem.registerCitizen({
        id: `citizen-${i.toString().padStart(3, '0')}`,
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });
    }

    // Create a voting session
    votingSystem.createSession({
      billId: 'test-bill-001',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      quorum: {
        minimumParticipation: 0.2,
        approvalThreshold: 0.6,
        urgencyModifier: 1,
        impactScaling: 1,
      },
    });
  });

  describe('Double Voting Prevention', () => {
    it('should prevent a citizen from voting twice on the same bill', () => {
      // First vote should succeed
      votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      // Second vote should fail
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill-001',
          choice: VoteChoice.AGAINST,
          signature: { signature: 'b'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Already voted on this bill');
    });

    it('should prevent vote modification after casting', () => {
      const vote = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      // Attempt to modify vote object directly should not affect stored vote
      const originalVoteId = vote.voteId;

      // Try to cast again with different choice
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill-001',
          choice: VoteChoice.AGAINST,
          signature: { signature: 'c'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Already voted');

      const results = votingSystem.getResults('test-bill-001');
      expect(results.for).toBe(1);
      expect(results.against).toBe(0);
    });
  });

  describe('Identity Verification', () => {
    it('should reject votes without valid signature', () => {
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill-001',
          choice: VoteChoice.FOR,
          signature: { signature: '', publicKey: '', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Identity verification failed');
    });

    it('should reject votes with short signature', () => {
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill-001',
          choice: VoteChoice.FOR,
          signature: { signature: 'short', publicKey: 'pk', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Identity verification failed');
    });

    it('should reject votes with expired signature timestamp', () => {
      const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill-001',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: 'pk', algorithm: 'Ed25519', timestamp: oldTimestamp },
        });
      }).toThrow('Identity verification failed');
    });

    it('should reject votes from unregistered citizens', () => {
      expect(() => {
        votingSystem.castVote({
          citizenId: 'unregistered-citizen',
          billId: 'test-bill-001',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: 'pk', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Citizen not found');
    });
  });

  describe('Session Integrity', () => {
    it('should reject votes on inactive sessions', () => {
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'non-existent-bill',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: 'pk', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Voting session is not active');
    });

    it('should reject votes on pending sessions', () => {
      // Create a session that starts in the future
      votingSystem.createSession({
        billId: 'future-bill',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: { minimumParticipation: 0.2, approvalThreshold: 0.6, urgencyModifier: 1, impactScaling: 1 },
      });

      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'future-bill',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: 'pk', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Voting session is not active');
    });
  });

  describe('Vote Weight Integrity', () => {
    it('should ensure votes have correct base weight', () => {
      const vote = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      expect(vote.weight).toBe(1); // Base weight
    });

    it('should correctly calculate delegated weight', () => {
      // Set up delegation
      votingSystem.delegateVote({
        delegatorId: 'citizen-002',
        delegateId: 'citizen-001',
        scope: DelegationScope.ALL,
      });

      const vote = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      expect(vote.weight).toBe(2); // Own weight + delegated weight
    });

    it('should not allow negative vote weights', () => {
      const vote = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      expect(vote.weight).toBeGreaterThan(0);
    });
  });

  describe('Result Integrity', () => {
    it('should accurately count votes', () => {
      // Cast multiple votes
      for (let i = 1; i <= 5; i++) {
        votingSystem.castVote({
          citizenId: `citizen-${i.toString().padStart(3, '0')}`,
          billId: 'test-bill-001',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: `pk${i}`, algorithm: 'Ed25519', timestamp: new Date() },
        });
      }

      for (let i = 6; i <= 8; i++) {
        votingSystem.castVote({
          citizenId: `citizen-${i.toString().padStart(3, '0')}`,
          billId: 'test-bill-001',
          choice: VoteChoice.AGAINST,
          signature: { signature: 'b'.repeat(64), publicKey: `pk${i}`, algorithm: 'Ed25519', timestamp: new Date() },
        });
      }

      const results = votingSystem.getResults('test-bill-001');

      expect(results.for).toBe(5);
      expect(results.against).toBe(3);
      expect(results.total).toBe(8);
      expect(results.weightedFor).toBe(5);
      expect(results.weightedAgainst).toBe(3);
    });

    it('should ensure total equals sum of individual vote types', () => {
      // Cast votes
      votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      votingSystem.castVote({
        citizenId: 'citizen-002',
        billId: 'test-bill-001',
        choice: VoteChoice.AGAINST,
        signature: { signature: 'b'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
      });

      votingSystem.castVote({
        citizenId: 'citizen-003',
        billId: 'test-bill-001',
        choice: VoteChoice.ABSTAIN,
        signature: { signature: 'c'.repeat(64), publicKey: 'pk3', algorithm: 'Ed25519', timestamp: new Date() },
      });

      const results = votingSystem.getResults('test-bill-001');

      expect(results.total).toBe(results.for + results.against + results.abstain);
    });
  });

  describe('Cryptographic Proof', () => {
    it('should include cryptographic proof in vote', () => {
      const vote = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      expect(vote.cryptographicProof).toBeDefined();
      expect(vote.cryptographicProof.length).toBeGreaterThan(0);
    });

    it('should generate unique proofs for different votes', () => {
      const vote1 = votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      const vote2 = votingSystem.castVote({
        citizenId: 'citizen-002',
        billId: 'test-bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'b'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
      });

      expect(vote1.cryptographicProof).not.toBe(vote2.cryptographicProof);
    });
  });
});

describe('Sybil Attack Prevention', () => {
  let votingSystem: VotingSystem;

  beforeEach(() => {
    votingSystem = new VotingSystem();
  });

  describe('Identity Uniqueness', () => {
    it('should only allow one vote per citizen ID', () => {
      votingSystem.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      votingSystem.createSession({
        billId: 'test-bill',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: { minimumParticipation: 0.2, approvalThreshold: 0.6, urgencyModifier: 1, impactScaling: 1 },
      });

      // First vote succeeds
      votingSystem.castVote({
        citizenId: 'citizen-001',
        billId: 'test-bill',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      // Attempt to vote with same ID fails
      expect(() => {
        votingSystem.castVote({
          citizenId: 'citizen-001',
          billId: 'test-bill',
          choice: VoteChoice.FOR,
          signature: { signature: 'b'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Already voted');
    });

    it('should require citizen registration before voting', () => {
      votingSystem.createSession({
        billId: 'test-bill',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: { minimumParticipation: 0.2, approvalThreshold: 0.6, urgencyModifier: 1, impactScaling: 1 },
      });

      // Unregistered citizen cannot vote
      expect(() => {
        votingSystem.castVote({
          citizenId: 'fake-citizen',
          billId: 'test-bill',
          choice: VoteChoice.FOR,
          signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
        });
      }).toThrow('Citizen not found');
    });
  });

  describe('Delegation Chain Limits', () => {
    it('should prevent circular delegation chains', () => {
      votingSystem.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      votingSystem.registerCitizen({
        id: 'citizen-002',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      votingSystem.registerCitizen({
        id: 'citizen-003',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      // Create delegation chain: 1 -> 2 -> 3
      votingSystem.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });

      votingSystem.delegateVote({
        delegatorId: 'citizen-002',
        delegateId: 'citizen-003',
        scope: DelegationScope.ALL,
      });

      // Attempt to complete the circle (3 -> 1) should fail
      expect(() => {
        votingSystem.delegateVote({
          delegatorId: 'citizen-003',
          delegateId: 'citizen-001',
          scope: DelegationScope.ALL,
        });
      }).toThrow('Circular delegation detected');
    });

    it('should prevent direct circular delegation', () => {
      votingSystem.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      votingSystem.registerCitizen({
        id: 'citizen-002',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      // 1 delegates to 2
      votingSystem.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });

      // 2 tries to delegate back to 1
      expect(() => {
        votingSystem.delegateVote({
          delegatorId: 'citizen-002',
          delegateId: 'citizen-001',
          scope: DelegationScope.ALL,
        });
      }).toThrow('Circular delegation detected');
    });
  });
});
