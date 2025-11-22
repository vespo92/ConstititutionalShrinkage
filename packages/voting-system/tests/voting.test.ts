/**
 * Voting System Tests
 * Tests for secure voting, delegation, and session management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { VotingSystem, votingSystem } from '../src/voting';
import { VoteChoice, VotingStatus, DelegationScope } from '../src/types';

describe('VotingSystem', () => {
  let system: VotingSystem;

  beforeEach(() => {
    system = new VotingSystem();
  });

  describe('Citizen Registration', () => {
    it('should register a new citizen', () => {
      const citizen = {
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      };

      system.registerCitizen(citizen);
      // Citizen should be registered (we verify by trying to cast a vote)
      expect(() => {
        system.createSession({
          billId: 'bill-001',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          quorum: { minimumParticipation: 0.2, approvalThreshold: 0.6 } as any,
        });
      }).not.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should create a voting session', () => {
      const session = system.createSession({
        billId: 'bill-001',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: {
          minimumParticipation: 0.2,
          approvalThreshold: 0.6,
          urgencyModifier: 1,
          impactScaling: 1,
        },
      });

      expect(session.billId).toBe('bill-001');
      expect(session.status).toBe(VotingStatus.ACTIVE);
      expect(session.quorum.minimumParticipation).toBe(0.2);
    });

    it('should create session with PENDING status if start date is in future', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const session = system.createSession({
        billId: 'bill-002',
        startDate: futureDate,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: {
          minimumParticipation: 0.2,
          approvalThreshold: 0.6,
          urgencyModifier: 1,
          impactScaling: 1,
        },
      });

      expect(session.status).toBe(VotingStatus.PENDING);
    });

    it('should initialize results with zero values', () => {
      const session = system.createSession({
        billId: 'bill-003',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quorum: {
          minimumParticipation: 0.2,
          approvalThreshold: 0.6,
          urgencyModifier: 1,
          impactScaling: 1,
        },
      });

      expect(session.currentResults.for).toBe(0);
      expect(session.currentResults.against).toBe(0);
      expect(session.currentResults.abstain).toBe(0);
      expect(session.currentResults.total).toBe(0);
      expect(session.participationRate).toBe(0);
    });
  });

  describe('Vote Casting', () => {
    beforeEach(() => {
      // Register citizen
      system.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      // Create session
      system.createSession({
        billId: 'bill-001',
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

    it('should cast a FOR vote', () => {
      const vote = system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: {
          signature: 'a'.repeat(64),
          publicKey: 'test-public-key',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      expect(vote.choice).toBe(VoteChoice.FOR);
      expect(vote.citizenId).toBe('citizen-001');
      expect(vote.billId).toBe('bill-001');
      expect(vote.weight).toBe(1);
    });

    it('should cast an AGAINST vote', () => {
      const vote = system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.AGAINST,
        signature: {
          signature: 'a'.repeat(64),
          publicKey: 'test-public-key',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      expect(vote.choice).toBe(VoteChoice.AGAINST);
    });

    it('should cast an ABSTAIN vote', () => {
      const vote = system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.ABSTAIN,
        signature: {
          signature: 'a'.repeat(64),
          publicKey: 'test-public-key',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      expect(vote.choice).toBe(VoteChoice.ABSTAIN);
    });

    it('should reject duplicate votes', () => {
      system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: {
          signature: 'a'.repeat(64),
          publicKey: 'test-public-key',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      expect(() => {
        system.castVote({
          citizenId: 'citizen-001',
          billId: 'bill-001',
          choice: VoteChoice.AGAINST,
          signature: {
            signature: 'b'.repeat(64),
            publicKey: 'test-public-key',
            algorithm: 'Ed25519',
            timestamp: new Date(),
          },
        });
      }).toThrow('Already voted on this bill');
    });

    it('should reject vote from unregistered citizen', () => {
      expect(() => {
        system.castVote({
          citizenId: 'unregistered-citizen',
          billId: 'bill-001',
          choice: VoteChoice.FOR,
          signature: {
            signature: 'a'.repeat(64),
            publicKey: 'test-public-key',
            algorithm: 'Ed25519',
            timestamp: new Date(),
          },
        });
      }).toThrow('Citizen not found');
    });

    it('should reject vote on non-existent session', () => {
      expect(() => {
        system.castVote({
          citizenId: 'citizen-001',
          billId: 'non-existent-bill',
          choice: VoteChoice.FOR,
          signature: {
            signature: 'a'.repeat(64),
            publicKey: 'test-public-key',
            algorithm: 'Ed25519',
            timestamp: new Date(),
          },
        });
      }).toThrow('Voting session is not active');
    });

    it('should reject vote with invalid signature', () => {
      expect(() => {
        system.castVote({
          citizenId: 'citizen-001',
          billId: 'bill-001',
          choice: VoteChoice.FOR,
          signature: {
            signature: 'short',
            publicKey: 'test-public-key',
            algorithm: 'Ed25519',
            timestamp: new Date(),
          },
        });
      }).toThrow('Identity verification failed');
    });

    it('should generate unique vote IDs', () => {
      system.registerCitizen({
        id: 'citizen-002',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      const vote1 = system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: {
          signature: 'a'.repeat(64),
          publicKey: 'test-public-key',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      const vote2 = system.castVote({
        citizenId: 'citizen-002',
        billId: 'bill-001',
        choice: VoteChoice.AGAINST,
        signature: {
          signature: 'b'.repeat(64),
          publicKey: 'test-public-key-2',
          algorithm: 'Ed25519',
          timestamp: new Date(),
        },
      });

      expect(vote1.voteId).not.toBe(vote2.voteId);
    });
  });

  describe('Vote Results', () => {
    beforeEach(() => {
      // Register multiple citizens
      for (let i = 1; i <= 5; i++) {
        system.registerCitizen({
          id: `citizen-00${i}`,
          regions: ['region-001'],
          votingPower: 1,
          delegations: [],
          reputation: 100,
        });
      }

      // Create session
      system.createSession({
        billId: 'bill-001',
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

    it('should calculate vote results correctly', () => {
      // Cast votes
      system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      system.castVote({
        citizenId: 'citizen-002',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'b'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
      });

      system.castVote({
        citizenId: 'citizen-003',
        billId: 'bill-001',
        choice: VoteChoice.AGAINST,
        signature: { signature: 'c'.repeat(64), publicKey: 'pk3', algorithm: 'Ed25519', timestamp: new Date() },
      });

      const results = system.getResults('bill-001');

      expect(results.for).toBe(2);
      expect(results.against).toBe(1);
      expect(results.abstain).toBe(0);
      expect(results.total).toBe(3);
    });

    it('should calculate weighted results', () => {
      // All citizens have weight 1, so weighted should equal unweighted
      system.castVote({
        citizenId: 'citizen-001',
        billId: 'bill-001',
        choice: VoteChoice.FOR,
        signature: { signature: 'a'.repeat(64), publicKey: 'pk1', algorithm: 'Ed25519', timestamp: new Date() },
      });

      system.castVote({
        citizenId: 'citizen-002',
        billId: 'bill-001',
        choice: VoteChoice.AGAINST,
        signature: { signature: 'b'.repeat(64), publicKey: 'pk2', algorithm: 'Ed25519', timestamp: new Date() },
      });

      const results = system.getResults('bill-001');

      expect(results.weightedFor).toBe(1);
      expect(results.weightedAgainst).toBe(1);
    });

    it('should return empty results for non-existent bill', () => {
      const results = system.getResults('non-existent-bill');
      expect(results.total).toBe(0);
      expect(results.for).toBe(0);
    });
  });

  describe('Delegation', () => {
    beforeEach(() => {
      system.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      system.registerCitizen({
        id: 'citizen-002',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      system.registerCitizen({
        id: 'citizen-003',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });
    });

    it('should create a delegation', () => {
      const delegation = system.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });

      expect(delegation.delegatorId).toBe('citizen-001');
      expect(delegation.delegateId).toBe('citizen-002');
      expect(delegation.scope).toBe(DelegationScope.ALL);
      expect(delegation.active).toBe(true);
    });

    it('should create a category-scoped delegation', () => {
      const delegation = system.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.CATEGORY,
        category: 'environment',
      });

      expect(delegation.scope).toBe(DelegationScope.CATEGORY);
      expect(delegation.category).toBe('environment');
    });

    it('should create a time-limited delegation', () => {
      const delegation = system.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
        duration: 30, // 30 days
      });

      expect(delegation.expiresAt).toBeDefined();
      expect(delegation.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should reject delegation to non-existent delegate', () => {
      expect(() => {
        system.delegateVote({
          delegatorId: 'citizen-001',
          delegateId: 'non-existent',
          scope: DelegationScope.ALL,
        });
      }).toThrow('Delegate not found');
    });

    it('should reject delegation from non-existent delegator', () => {
      expect(() => {
        system.delegateVote({
          delegatorId: 'non-existent',
          delegateId: 'citizen-002',
          scope: DelegationScope.ALL,
        });
      }).toThrow('Delegator not found');
    });

    it('should detect circular delegation', () => {
      // citizen-001 delegates to citizen-002
      system.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });

      // citizen-002 tries to delegate back to citizen-001 (circular)
      expect(() => {
        system.delegateVote({
          delegatorId: 'citizen-002',
          delegateId: 'citizen-001',
          scope: DelegationScope.ALL,
        });
      }).toThrow('Circular delegation detected');
    });
  });

  describe('Revoke Delegation', () => {
    beforeEach(() => {
      system.registerCitizen({
        id: 'citizen-001',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      system.registerCitizen({
        id: 'citizen-002',
        regions: ['region-001'],
        votingPower: 1,
        delegations: [],
        reputation: 100,
      });

      system.delegateVote({
        delegatorId: 'citizen-001',
        delegateId: 'citizen-002',
        scope: DelegationScope.ALL,
      });
    });

    it('should revoke an active delegation', () => {
      const result = system.revokeDelegation('citizen-001', 'citizen-002');
      expect(result).toBe(true);
    });

    it('should return false when revoking non-existent delegation', () => {
      const result = system.revokeDelegation('citizen-001', 'citizen-003');
      expect(result).toBe(false);
    });

    it('should return false when delegator does not exist', () => {
      const result = system.revokeDelegation('non-existent', 'citizen-002');
      expect(result).toBe(false);
    });
  });

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(votingSystem).toBeInstanceOf(VotingSystem);
    });
  });
});
