/**
 * Voting System Implementation
 * Secure, transparent voting with liquid democracy support
 */

import {
  Vote,
  VoteChoice,
  VotingSession,
  VoteResults,
  Delegation,
  Citizen,
  QuorumRules,
  VotingStatus,
  DelegationScope,
} from './types';
import { generateProof, verifyIdentity } from '@constitutional-shrinkage/governance-utils';

export class VotingSystem {
  private votes: Map<string, Vote[]> = new Map();
  private sessions: Map<string, VotingSession> = new Map();
  private citizens: Map<string, Citizen> = new Map();

  /**
   * Cast a vote on a bill
   */
  castVote(params: {
    citizenId: string;
    billId: string;
    choice: VoteChoice;
    signature: any;
    isPublic?: boolean;
  }): Vote {
    // Verify citizen identity
    if (!verifyIdentity(params.citizenId, params.signature)) {
      throw new Error('Identity verification failed');
    }

    // Get citizen
    const citizen = this.citizens.get(params.citizenId);
    if (!citizen) {
      throw new Error('Citizen not found');
    }

    // Check if session is active
    const session = this.sessions.get(params.billId);
    if (!session || session.status !== VotingStatus.ACTIVE) {
      throw new Error('Voting session is not active');
    }

    // Check if already voted
    const existingVotes = this.votes.get(params.billId) || [];
    const hasVoted = existingVotes.some((v) => v.citizenId === params.citizenId);
    if (hasVoted) {
      throw new Error('Already voted on this bill');
    }

    // Calculate vote weight (including delegations)
    const weight = this.calculateVoteWeight(citizen, params.billId);

    // Create vote
    const vote: Vote = {
      voteId: this.generateVoteId(),
      citizenId: params.citizenId,
      billId: params.billId,
      choice: params.choice,
      weight,
      timestamp: new Date(),
      cryptographicProof: generateProof({
        action: 'vote',
        timestamp: new Date(),
        actorId: params.citizenId,
        metadata: { billId: params.billId },
      }),
      delegationChain: this.getDelegationChain(citizen, params.billId),
      isPublic: params.isPublic ?? true,
    };

    // Store vote
    const billVotes = this.votes.get(params.billId) || [];
    billVotes.push(vote);
    this.votes.set(params.billId, billVotes);

    // Update session results
    this.updateResults(params.billId);

    return vote;
  }

  /**
   * Delegate voting power to another citizen
   */
  delegateVote(params: {
    delegatorId: string;
    delegateId: string;
    scope: DelegationScope;
    category?: string;
    duration?: number; // days
  }): Delegation {
    const delegator = this.citizens.get(params.delegatorId);
    if (!delegator) {
      throw new Error('Delegator not found');
    }

    const delegate = this.citizens.get(params.delegateId);
    if (!delegate) {
      throw new Error('Delegate not found');
    }

    // Prevent circular delegations
    if (this.hasCircularDelegation(params.delegatorId, params.delegateId)) {
      throw new Error('Circular delegation detected');
    }

    const expiresAt = params.duration
      ? new Date(Date.now() + params.duration * 24 * 60 * 60 * 1000)
      : undefined;

    const delegation: Delegation = {
      delegatorId: params.delegatorId,
      delegateId: params.delegateId,
      scope: params.scope,
      category: params.category,
      createdAt: new Date(),
      expiresAt,
      active: true,
    };

    delegator.delegations.push(delegation);
    this.citizens.set(params.delegatorId, delegator);

    return delegation;
  }

  /**
   * Revoke a delegation
   */
  revokeDelegation(delegatorId: string, delegateId: string): boolean {
    const delegator = this.citizens.get(delegatorId);
    if (!delegator) {
      return false;
    }

    const delegationIndex = delegator.delegations.findIndex(
      (d) => d.delegateId === delegateId && d.active
    );

    if (delegationIndex === -1) {
      return false;
    }

    delegator.delegations[delegationIndex].active = false;
    this.citizens.set(delegatorId, delegator);

    return true;
  }

  /**
   * Get current voting results for a bill
   */
  getResults(billId: string): VoteResults {
    const votes = this.votes.get(billId) || [];
    const session = this.sessions.get(billId);

    let forCount = 0;
    let againstCount = 0;
    let abstainCount = 0;
    let weightedFor = 0;
    let weightedAgainst = 0;
    let weightedAbstain = 0;

    votes.forEach((vote) => {
      switch (vote.choice) {
        case VoteChoice.FOR:
          forCount++;
          weightedFor += vote.weight;
          break;
        case VoteChoice.AGAINST:
          againstCount++;
          weightedAgainst += vote.weight;
          break;
        case VoteChoice.ABSTAIN:
          abstainCount++;
          weightedAbstain += vote.weight;
          break;
      }
    });

    const total = forCount + againstCount + abstainCount;
    const quorum = session?.quorum;

    const quorumMet = quorum
      ? total / this.getTotalEligibleVoters(billId) >= quorum.minimumParticipation
      : false;

    const passed =
      quorumMet && quorum
        ? weightedFor / (weightedFor + weightedAgainst) >= quorum.approvalThreshold
        : false;

    return {
      for: forCount,
      against: againstCount,
      abstain: abstainCount,
      total,
      weightedFor,
      weightedAgainst,
      weightedAbstain,
      quorumMet,
      passed,
    };
  }

  /**
   * Create a new voting session
   */
  createSession(params: {
    billId: string;
    startDate: Date;
    endDate: Date;
    quorum: QuorumRules;
  }): VotingSession {
    const session: VotingSession = {
      billId: params.billId,
      startDate: params.startDate,
      endDate: params.endDate,
      quorum: params.quorum,
      currentResults: {
        for: 0,
        against: 0,
        abstain: 0,
        total: 0,
        weightedFor: 0,
        weightedAgainst: 0,
        weightedAbstain: 0,
        quorumMet: false,
        passed: false,
      },
      participationRate: 0,
      status: VotingStatus.PENDING,
    };

    this.sessions.set(params.billId, session);

    // Auto-activate when start date arrives
    if (params.startDate <= new Date()) {
      session.status = VotingStatus.ACTIVE;
    }

    return session;
  }

  /**
   * Register a new citizen
   */
  registerCitizen(citizen: Citizen): void {
    this.citizens.set(citizen.id, citizen);
  }

  // Private helper methods

  private calculateVoteWeight(citizen: Citizen, billId: string): number {
    // Base voting power
    let weight = citizen.votingPower;

    // Add delegated voting power
    const delegators = this.findDelegators(citizen.id, billId);
    delegators.forEach((delegator) => {
      weight += delegator.votingPower;
    });

    return weight;
  }

  private getDelegationChain(citizen: Citizen, billId: string): string[] {
    const delegators = this.findDelegators(citizen.id, billId);
    return delegators.map((d) => d.id);
  }

  private findDelegators(delegateId: string, billId: string): Citizen[] {
    const delegators: Citizen[] = [];

    this.citizens.forEach((citizen) => {
      const activeDelegation = citizen.delegations.find(
        (d) =>
          d.delegateId === delegateId &&
          d.active &&
          (!d.expiresAt || d.expiresAt > new Date()) &&
          (d.scope === DelegationScope.ALL ||
            (d.scope === DelegationScope.SINGLE_BILL && billId === billId))
      );

      if (activeDelegation) {
        delegators.push(citizen);
      }
    });

    return delegators;
  }

  private hasCircularDelegation(delegatorId: string, delegateId: string): boolean {
    // Check if delegate has delegated to delegator (direct or indirect)
    const visited = new Set<string>();

    const checkCircular = (currentId: string): boolean => {
      if (visited.has(currentId)) {
        return true;
      }

      if (currentId === delegatorId) {
        return true;
      }

      visited.add(currentId);

      const current = this.citizens.get(currentId);
      if (!current) {
        return false;
      }

      for (const delegation of current.delegations) {
        if (delegation.active && checkCircular(delegation.delegateId)) {
          return true;
        }
      }

      return false;
    };

    return checkCircular(delegateId);
  }

  private updateResults(billId: string): void {
    const session = this.sessions.get(billId);
    if (!session) {
      return;
    }

    const results = this.getResults(billId);
    session.currentResults = results;
    session.participationRate = results.total / this.getTotalEligibleVoters(billId);

    this.sessions.set(billId, session);
  }

  private getTotalEligibleVoters(billId: string): number {
    // Simplified - in production, would check regional eligibility
    return this.citizens.size;
  }

  private generateVoteId(): string {
    return `vote-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

// Export singleton instance
export const votingSystem = new VotingSystem();
