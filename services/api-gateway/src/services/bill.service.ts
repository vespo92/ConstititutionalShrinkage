/**
 * Bill Service
 *
 * Business logic for bill operations.
 */

import { getDbClient, cache, cacheKeys } from '../lib/db.js';

export interface BillFilters {
  status?: string;
  category?: string;
  region?: string;
  sponsor?: string;
  search?: string;
  level?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateBillInput {
  title: string;
  content: string;
  level: 'IMMUTABLE' | 'FEDERAL' | 'REGIONAL' | 'LOCAL';
  regionId?: string;
  categoryId: string;
  sunsetYears?: number;
  sponsorId: string;
}

export interface UpdateBillInput {
  title?: string;
  content?: string;
}

export class BillService {
  private db = getDbClient();

  async findMany(filters: BillFilters, pagination: PaginationParams) {
    const cacheKey = cacheKeys.billList({ ...filters, ...pagination });
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // TODO: Replace with actual Prisma query
    const bills = await this.db.bills.findMany({
      where: {
        status: filters.status,
        categoryId: filters.category,
        regionId: filters.region,
        sponsorId: filters.sponsor,
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      orderBy: { [pagination.sort || 'createdAt']: pagination.order || 'desc' },
    });

    const total = 0; // TODO: Count query
    const result = {
      data: bills,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };

    await cache.set(cacheKey, result, 60); // Cache for 1 minute
    return result;
  }

  async findById(id: string) {
    const cacheKey = cacheKeys.bill(id);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const bill = await this.db.bills.findUnique({ where: { id } });
    if (bill) {
      await cache.set(cacheKey, bill, 300); // Cache for 5 minutes
    }
    return bill;
  }

  async create(input: CreateBillInput) {
    const bill = await this.db.bills.create({
      data: {
        ...input,
        status: 'DRAFT',
        version: 1,
        createdAt: new Date().toISOString(),
        sunsetDate: this.calculateSunsetDate(input.sunsetYears || 5),
      },
    });

    // Invalidate list caches
    await cache.invalidatePattern('bills:*');
    return bill;
  }

  async update(id: string, input: UpdateBillInput, userId: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Bill with id '${id}' not found`);
    }

    // TODO: Check ownership
    const bill = await this.db.bills.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date().toISOString(),
      },
    });

    await cache.del(cacheKeys.bill(id));
    await cache.invalidatePattern('bills:*');
    return bill;
  }

  async delete(id: string, userId: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Bill with id '${id}' not found`);
    }

    // Only allow deleting DRAFT bills
    // TODO: Check status and ownership

    await this.db.bills.delete({ where: { id } });
    await cache.del(cacheKeys.bill(id));
    await cache.invalidatePattern('bills:*');
  }

  async fork(id: string, userId: string) {
    const original = await this.findById(id);
    if (!original) {
      throw new Error(`Bill with id '${id}' not found`);
    }

    // TODO: Integrate with governance-utils package for forking
    return {
      originalId: id,
      forkedId: `fork-${Date.now()}`,
      message: 'Bill forked successfully',
    };
  }

  async getDiff(id: string, v1: string, v2: string) {
    // TODO: Integrate with governance-utils package for diffing
    return {
      billId: id,
      fromVersion: v1,
      toVersion: v2,
      diff: {
        additions: [],
        deletions: [],
        modifications: [],
      },
    };
  }

  async getHistory(id: string) {
    // TODO: Fetch version history from database
    return {
      billId: id,
      versions: [],
    };
  }

  async checkConstitutionalCompliance(id: string) {
    // TODO: Integrate with constitutional-framework package
    return {
      billId: id,
      valid: true,
      errors: [],
      warnings: [],
      rightsProtected: [],
    };
  }

  async submitForVoting(id: string, userId: string) {
    const bill = await this.findById(id);
    if (!bill) {
      throw new Error(`Bill with id '${id}' not found`);
    }

    // TODO: Validate bill can be submitted
    // TODO: Create voting session
    return {
      billId: id,
      sessionId: `session-${Date.now()}`,
      message: 'Bill submitted for voting',
    };
  }

  private calculateSunsetDate(years: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString();
  }
}

export const billService = new BillService();
