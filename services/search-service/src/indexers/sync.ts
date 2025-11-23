/**
 * Database Sync Logic
 *
 * Synchronizes PostgreSQL data with Elasticsearch indexes.
 */

import { Client } from '@elastic/elasticsearch';
import { PrismaClient } from '@prisma/client';
import { BillIndexer, BillDocument } from './bills.js';
import { PeopleIndexer, PersonDocument } from './people.js';
import { OrganizationIndexer, OrganizationDocument } from './organizations.js';

export interface SyncOptions {
  batchSize?: number;
  fullSync?: boolean;
  since?: Date;
}

export interface SyncResult {
  type: string;
  indexed: number;
  deleted: number;
  errors: number;
  duration: number;
}

export class SearchSync {
  private billIndexer: BillIndexer;
  private peopleIndexer: PeopleIndexer;
  private orgIndexer: OrganizationIndexer;

  constructor(
    private esClient: Client,
    private prisma: PrismaClient
  ) {
    this.billIndexer = new BillIndexer(esClient);
    this.peopleIndexer = new PeopleIndexer(esClient);
    this.orgIndexer = new OrganizationIndexer(esClient);
  }

  /**
   * Sync all indexes
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    results.push(await this.syncBills(options));
    results.push(await this.syncPeople(options));
    results.push(await this.syncOrganizations(options));

    return results;
  }

  /**
   * Sync bills index
   */
  async syncBills(options: SyncOptions = {}): Promise<SyncResult> {
    const { batchSize = 100, fullSync = false, since } = options;
    const startTime = Date.now();
    let indexed = 0;
    let deleted = 0;
    let errors = 0;

    try {
      // Ensure index exists
      await this.billIndexer.ensureIndex();

      // Build query
      const where: any = {};
      if (!fullSync && since) {
        where.updatedAt = { gte: since };
      }

      // Get total count
      const total = await this.prisma.bill.count({ where });
      console.log(`Syncing ${total} bills`);

      // Process in batches
      let skip = 0;
      while (skip < total) {
        const bills = await this.prisma.bill.findMany({
          where,
          skip,
          take: batchSize,
          include: {
            sponsor: {
              select: { id: true, legalName: true },
            },
            region: {
              select: { id: true, name: true },
            },
            category: {
              select: { id: true, name: true },
            },
          },
        });

        const documents: BillDocument[] = bills.map((bill) => ({
          id: bill.id,
          title: bill.title,
          content: bill.content,
          status: bill.status,
          level: bill.level,
          category: bill.category?.id || '',
          categoryName: bill.category?.name || '',
          regionId: bill.region?.id,
          regionName: bill.region?.name,
          sponsorId: bill.sponsor?.id || '',
          sponsorName: bill.sponsor?.legalName || '',
          coSponsors: [],
          version: bill.version || '1.0',
          sunsetDate: bill.sunsetDate?.toISOString() || '',
          tags: bill.tags || [],
          votesFor: bill.votesFor || 0,
          votesAgainst: bill.votesAgainst || 0,
          participation: bill.participation || 0,
          impactPeople: bill.impactPeople || 0,
          impactPlanet: bill.impactPlanet || 0,
          impactProfit: bill.impactProfit || 0,
          createdAt: bill.createdAt.toISOString(),
          updatedAt: bill.updatedAt.toISOString(),
        }));

        try {
          await this.billIndexer.bulkIndex(documents);
          indexed += documents.length;
        } catch (err) {
          console.error('Error indexing bills batch:', err);
          errors += documents.length;
        }

        skip += batchSize;
      }

      // Handle deletions for full sync
      if (fullSync) {
        const deletedCount = await this.handleBillDeletions();
        deleted = deletedCount;
      }
    } catch (err) {
      console.error('Bill sync error:', err);
      errors++;
    }

    return {
      type: 'bills',
      indexed,
      deleted,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Sync people index
   */
  async syncPeople(options: SyncOptions = {}): Promise<SyncResult> {
    const { batchSize = 100, fullSync = false, since } = options;
    const startTime = Date.now();
    let indexed = 0;
    let deleted = 0;
    let errors = 0;

    try {
      // Ensure index exists
      await this.peopleIndexer.ensureIndex();

      // Build query
      const where: any = {};
      if (!fullSync && since) {
        where.updatedAt = { gte: since };
      }

      // Get total count
      const total = await this.prisma.person.count({ where });
      console.log(`Syncing ${total} people`);

      // Process in batches
      let skip = 0;
      while (skip < total) {
        const people = await this.prisma.person.findMany({
          where,
          skip,
          take: batchSize,
          include: {
            regions: {
              select: { id: true, name: true },
            },
          },
        });

        const documents: PersonDocument[] = people.map((person) => ({
          id: person.id,
          legalName: person.legalName,
          preferredName: person.preferredName || undefined,
          primaryRegionId: person.primaryRegionId || '',
          regionIds: person.regions?.map((r) => r.id) || [],
          regionNames: person.regions?.map((r) => r.name) || [],
          verificationLevel: person.verificationLevel || 'UNVERIFIED',
          status: person.status || 'ACTIVE',
          votingPower: person.votingPower || 1.0,
          reputation: person.reputation || 0,
          expertiseAreas: person.expertiseAreas || [],
          roles: person.roles || [],
          billsSponsored: person.billsSponsored || 0,
          votesCount: person.votesCount || 0,
          delegationsReceived: person.delegationsReceived || 0,
          createdAt: person.createdAt.toISOString(),
          lastActiveAt: person.lastActiveAt?.toISOString() || person.createdAt.toISOString(),
        }));

        try {
          await this.peopleIndexer.bulkIndex(documents);
          indexed += documents.length;
        } catch (err) {
          console.error('Error indexing people batch:', err);
          errors += documents.length;
        }

        skip += batchSize;
      }

      // Handle deletions for full sync
      if (fullSync) {
        const deletedCount = await this.handlePeopleDeletions();
        deleted = deletedCount;
      }
    } catch (err) {
      console.error('People sync error:', err);
      errors++;
    }

    return {
      type: 'people',
      indexed,
      deleted,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Sync organizations index
   */
  async syncOrganizations(options: SyncOptions = {}): Promise<SyncResult> {
    const { batchSize = 100, fullSync = false, since } = options;
    const startTime = Date.now();
    let indexed = 0;
    let deleted = 0;
    let errors = 0;

    try {
      // Ensure index exists
      await this.orgIndexer.ensureIndex();

      // Build query
      const where: any = {};
      if (!fullSync && since) {
        where.updatedAt = { gte: since };
      }

      // Get total count
      const total = await this.prisma.organization.count({ where });
      console.log(`Syncing ${total} organizations`);

      // Process in batches
      let skip = 0;
      while (skip < total) {
        const orgs = await this.prisma.organization.findMany({
          where,
          skip,
          take: batchSize,
          include: {
            region: {
              select: { id: true, name: true },
            },
          },
        });

        const documents: OrganizationDocument[] = orgs.map((org) => ({
          id: org.id,
          name: org.name,
          type: org.type,
          industry: org.industry || '',
          description: org.description || undefined,
          regionId: org.region?.id,
          regionName: org.region?.name,
          website: org.website || undefined,
          transparencyScore: org.transparencyScore || 0,
          lobbyingActivity: org.lobbyingActivity || 0,
          donationTotal: org.donationTotal || 0,
          billsSupported: org.billsSupported || 0,
          billsOpposed: org.billsOpposed || 0,
          verificationStatus: org.verificationStatus || 'UNVERIFIED',
          tags: org.tags || [],
          createdAt: org.createdAt.toISOString(),
          updatedAt: org.updatedAt.toISOString(),
        }));

        try {
          await this.orgIndexer.bulkIndex(documents);
          indexed += documents.length;
        } catch (err) {
          console.error('Error indexing organizations batch:', err);
          errors += documents.length;
        }

        skip += batchSize;
      }

      // Handle deletions for full sync
      if (fullSync) {
        const deletedCount = await this.handleOrgDeletions();
        deleted = deletedCount;
      }
    } catch (err) {
      console.error('Organizations sync error:', err);
      errors++;
    }

    return {
      type: 'organizations',
      indexed,
      deleted,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Handle deleted bills
   */
  private async handleBillDeletions(): Promise<number> {
    // Get all IDs from ES
    const esIds = await this.getAllIndexIds('bills');

    // Get all IDs from DB
    const dbIds = new Set(
      (await this.prisma.bill.findMany({ select: { id: true } })).map((b) => b.id)
    );

    // Find IDs to delete (in ES but not in DB)
    const toDelete = esIds.filter((id) => !dbIds.has(id));

    // Delete from ES
    for (const id of toDelete) {
      try {
        await this.billIndexer.delete(id);
      } catch (err) {
        console.error(`Failed to delete bill ${id} from index:`, err);
      }
    }

    return toDelete.length;
  }

  /**
   * Handle deleted people
   */
  private async handlePeopleDeletions(): Promise<number> {
    const esIds = await this.getAllIndexIds('people');
    const dbIds = new Set(
      (await this.prisma.person.findMany({ select: { id: true } })).map((p) => p.id)
    );

    const toDelete = esIds.filter((id) => !dbIds.has(id));

    for (const id of toDelete) {
      try {
        await this.peopleIndexer.delete(id);
      } catch (err) {
        console.error(`Failed to delete person ${id} from index:`, err);
      }
    }

    return toDelete.length;
  }

  /**
   * Handle deleted organizations
   */
  private async handleOrgDeletions(): Promise<number> {
    const esIds = await this.getAllIndexIds('organizations');
    const dbIds = new Set(
      (await this.prisma.organization.findMany({ select: { id: true } })).map((o) => o.id)
    );

    const toDelete = esIds.filter((id) => !dbIds.has(id));

    for (const id of toDelete) {
      try {
        await this.orgIndexer.delete(id);
      } catch (err) {
        console.error(`Failed to delete organization ${id} from index:`, err);
      }
    }

    return toDelete.length;
  }

  /**
   * Get all document IDs from an index
   */
  private async getAllIndexIds(index: string): Promise<string[]> {
    const ids: string[] = [];
    let searchAfter: any[] | undefined;

    while (true) {
      const response = await this.esClient.search({
        index,
        size: 1000,
        _source: false,
        sort: [{ _id: 'asc' }],
        search_after: searchAfter,
      });

      const hits = response.hits.hits;
      if (hits.length === 0) break;

      ids.push(...hits.map((h) => h._id!));
      searchAfter = hits[hits.length - 1].sort;
    }

    return ids;
  }

  /**
   * Index a single bill (for real-time updates)
   */
  async indexBill(billId: string): Promise<void> {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        sponsor: { select: { id: true, legalName: true } },
        region: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!bill) {
      await this.billIndexer.delete(billId);
      return;
    }

    const document: BillDocument = {
      id: bill.id,
      title: bill.title,
      content: bill.content,
      status: bill.status,
      level: bill.level,
      category: bill.category?.id || '',
      categoryName: bill.category?.name || '',
      regionId: bill.region?.id,
      regionName: bill.region?.name,
      sponsorId: bill.sponsor?.id || '',
      sponsorName: bill.sponsor?.legalName || '',
      coSponsors: [],
      version: bill.version || '1.0',
      sunsetDate: bill.sunsetDate?.toISOString() || '',
      tags: bill.tags || [],
      votesFor: bill.votesFor || 0,
      votesAgainst: bill.votesAgainst || 0,
      participation: bill.participation || 0,
      impactPeople: bill.impactPeople || 0,
      impactPlanet: bill.impactPlanet || 0,
      impactProfit: bill.impactProfit || 0,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString(),
    };

    await this.billIndexer.index(bill.id, document);
  }

  /**
   * Index a single person (for real-time updates)
   */
  async indexPerson(personId: string): Promise<void> {
    const person = await this.prisma.person.findUnique({
      where: { id: personId },
      include: {
        regions: { select: { id: true, name: true } },
      },
    });

    if (!person) {
      await this.peopleIndexer.delete(personId);
      return;
    }

    const document: PersonDocument = {
      id: person.id,
      legalName: person.legalName,
      preferredName: person.preferredName || undefined,
      primaryRegionId: person.primaryRegionId || '',
      regionIds: person.regions?.map((r) => r.id) || [],
      regionNames: person.regions?.map((r) => r.name) || [],
      verificationLevel: person.verificationLevel || 'UNVERIFIED',
      status: person.status || 'ACTIVE',
      votingPower: person.votingPower || 1.0,
      reputation: person.reputation || 0,
      expertiseAreas: person.expertiseAreas || [],
      roles: person.roles || [],
      billsSponsored: person.billsSponsored || 0,
      votesCount: person.votesCount || 0,
      delegationsReceived: person.delegationsReceived || 0,
      createdAt: person.createdAt.toISOString(),
      lastActiveAt: person.lastActiveAt?.toISOString() || person.createdAt.toISOString(),
    };

    await this.peopleIndexer.index(person.id, document);
  }

  /**
   * Index a single organization (for real-time updates)
   */
  async indexOrganization(orgId: string): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        region: { select: { id: true, name: true } },
      },
    });

    if (!org) {
      await this.orgIndexer.delete(orgId);
      return;
    }

    const document: OrganizationDocument = {
      id: org.id,
      name: org.name,
      type: org.type,
      industry: org.industry || '',
      description: org.description || undefined,
      regionId: org.region?.id,
      regionName: org.region?.name,
      website: org.website || undefined,
      transparencyScore: org.transparencyScore || 0,
      lobbyingActivity: org.lobbyingActivity || 0,
      donationTotal: org.donationTotal || 0,
      billsSupported: org.billsSupported || 0,
      billsOpposed: org.billsOpposed || 0,
      verificationStatus: org.verificationStatus || 'UNVERIFIED',
      tags: org.tags || [],
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
    };

    await this.orgIndexer.index(org.id, document);
  }
}
