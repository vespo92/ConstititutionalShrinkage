/**
 * Delegation Service
 *
 * Business logic for liquid democracy delegation operations.
 */

import { getDbClient, cache, cacheKeys } from '../lib/db.js';

export type DelegationScope = 'ALL' | 'CATEGORY' | 'SINGLE_BILL';

export interface CreateDelegationInput {
  delegatorId: string;
  delegateId: string;
  scope: DelegationScope;
  category?: string;
  billId?: string;
  expiresAt?: string;
}

export interface DelegationFilters {
  scope?: DelegationScope;
  active?: boolean;
  direction?: 'outgoing' | 'incoming' | 'both';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export class DelegationService {
  private db = getDbClient();

  async findUserDelegations(userId: string, filters: DelegationFilters, pagination: PaginationParams) {
    // TODO: Query based on direction
    const outgoing = await this.db.delegations.findMany({
      where: {
        delegatorId: userId,
        scope: filters.scope,
        active: filters.active,
      },
    });

    const incoming = await this.db.delegations.findMany({
      where: {
        delegateId: userId,
        scope: filters.scope,
        active: filters.active,
      },
    });

    // Calculate effective voting power
    const effectiveVotingPower = 1 + incoming.length; // Simplified calculation

    return {
      userId,
      outgoing: filters.direction !== 'incoming' ? outgoing : [],
      incoming: filters.direction !== 'outgoing' ? incoming : [],
      summary: {
        totalOutgoing: outgoing.length,
        totalIncoming: incoming.length,
        effectiveVotingPower,
      },
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: outgoing.length + incoming.length,
        totalPages: 1,
      },
    };
  }

  async create(input: CreateDelegationInput) {
    // Validate scope-specific requirements
    if (input.scope === 'CATEGORY' && !input.category) {
      throw new Error('Category is required for CATEGORY scope');
    }
    if (input.scope === 'SINGLE_BILL' && !input.billId) {
      throw new Error('Bill ID is required for SINGLE_BILL scope');
    }

    // Check for self-delegation
    if (input.delegatorId === input.delegateId) {
      throw new Error('Cannot delegate to yourself');
    }

    // Check for circular delegation
    const wouldCreateCycle = await this.checkCircularDelegation(
      input.delegatorId,
      input.delegateId,
      input.scope,
      input.category
    );
    if (wouldCreateCycle) {
      throw new Error('This delegation would create a circular chain');
    }

    // Check for duplicate delegation
    const existing = await this.findExistingDelegation(input);
    if (existing) {
      throw new Error('A similar delegation already exists');
    }

    const delegation = await this.db.delegations.create({
      data: {
        id: `delegation-${Date.now()}`,
        ...input,
        active: true,
        createdAt: new Date().toISOString(),
      },
    });

    await cache.del(cacheKeys.delegation(input.delegatorId));
    await cache.del(cacheKeys.delegation(input.delegateId));

    return {
      id: delegation.id,
      delegatorId: input.delegatorId,
      delegateId: input.delegateId,
      scope: input.scope,
      category: input.category,
      billId: input.billId,
      active: true,
      createdAt: delegation.createdAt,
      expiresAt: input.expiresAt,
      message: 'Delegation created successfully',
    };
  }

  async findById(id: string) {
    return this.db.delegations.findUnique({ where: { id } });
  }

  async update(id: string, userId: string, updates: { expiresAt?: string }) {
    const delegation = await this.findById(id);
    if (!delegation) {
      throw new Error(`Delegation with id '${id}' not found`);
    }

    // TODO: Verify ownership (delegation.delegatorId === userId)

    const updated = await this.db.delegations.update({
      where: { id },
      data: updates,
    });

    return {
      id,
      message: 'Delegation updated successfully',
    };
  }

  async revoke(id: string, userId: string) {
    const delegation = await this.findById(id);
    if (!delegation) {
      throw new Error(`Delegation with id '${id}' not found`);
    }

    // TODO: Verify ownership

    await this.db.delegations.delete({ where: { id } });
    await cache.invalidatePattern('delegation:*');
  }

  async getDelegationChain(delegationId: string) {
    // TODO: Build full delegation chain (A → B → C → ...)
    // This is important for liquid democracy
    return {
      delegationId,
      chain: [],
      totalWeight: 1,
      depth: 0,
    };
  }

  async getEffectiveVotingPower(userId: string, billId?: string, category?: string) {
    // TODO: Calculate total voting power including all incoming delegations
    // Account for scope-specific delegations
    return {
      userId,
      baseVotingPower: 1,
      delegatedPower: 0,
      totalPower: 1,
      breakdown: [],
    };
  }

  async checkCircularDelegation(
    delegatorId: string,
    delegateId: string,
    scope: DelegationScope,
    category?: string
  ): Promise<boolean> {
    // TODO: Implement graph traversal to detect cycles
    // For now, simple check
    const delegatesDelegations = await this.db.delegations.findMany({
      where: {
        delegatorId: delegateId,
        active: true,
        scope,
      },
    });

    // Check if delegate has delegated back to delegator
    return delegatesDelegations.some((d: any) => d.delegateId === delegatorId);
  }

  async getSuggestions(userId: string, category?: string, region?: string) {
    // TODO: Suggest delegates based on expertise, reputation, alignment
    return {
      suggestions: [],
      basedOn: {
        category,
        region,
        userExpertise: [],
      },
    };
  }

  private async findExistingDelegation(input: CreateDelegationInput) {
    const existing = await this.db.delegations.findMany({
      where: {
        delegatorId: input.delegatorId,
        delegateId: input.delegateId,
        scope: input.scope,
        category: input.category,
        billId: input.billId,
        active: true,
      },
    });
    return existing[0] || null;
  }
}

export const delegationService = new DelegationService();
