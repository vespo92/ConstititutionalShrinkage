/**
 * Prisma Client Singleton
 *
 * Database connection management using Prisma ORM.
 */

// NOTE: This file provides the Prisma client singleton pattern.
// In production, uncomment the Prisma imports once the schema is generated.

// import { PrismaClient } from '@prisma/client';

// Declare global type for prisma in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: unknown | undefined;
}

/**
 * Placeholder PrismaClient for development before schema generation
 */
class PrismaClientPlaceholder {
  private connected = false;

  // Placeholder model accessors
  bill = this.createModelProxy('bill');
  vote = this.createModelProxy('vote');
  delegation = this.createModelProxy('delegation');
  user = this.createModelProxy('user');
  region = this.createModelProxy('region');
  organization = this.createModelProxy('organization');
  person = this.createModelProxy('person');
  votingSession = this.createModelProxy('votingSession');
  amendment = this.createModelProxy('amendment');
  comment = this.createModelProxy('comment');
  category = this.createModelProxy('category');

  private createModelProxy(modelName: string) {
    return {
      findMany: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.findMany`, args);
        return [];
      },
      findUnique: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.findUnique`, args);
        return null;
      },
      findFirst: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.findFirst`, args);
        return null;
      },
      create: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.create`, args);
        return { id: `placeholder-${Date.now()}`, ...(args as any)?.data };
      },
      createMany: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.createMany`, args);
        return { count: 0 };
      },
      update: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.update`, args);
        return { id: 'placeholder', ...(args as any)?.data };
      },
      updateMany: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.updateMany`, args);
        return { count: 0 };
      },
      delete: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.delete`, args);
        return {};
      },
      deleteMany: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.deleteMany`, args);
        return { count: 0 };
      },
      count: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.count`, args);
        return 0;
      },
      aggregate: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.aggregate`, args);
        return {};
      },
      upsert: async (args?: unknown) => {
        console.log(`[Prisma Placeholder] ${modelName}.upsert`, args);
        return { id: 'placeholder' };
      },
    };
  }

  async $connect(): Promise<void> {
    console.log('[Prisma Placeholder] Connecting...');
    this.connected = true;
  }

  async $disconnect(): Promise<void> {
    console.log('[Prisma Placeholder] Disconnecting...');
    this.connected = false;
  }

  async $executeRaw(query: string, ...values: unknown[]): Promise<number> {
    console.log('[Prisma Placeholder] $executeRaw', query, values);
    return 0;
  }

  async $queryRaw<T = unknown>(query: string, ...values: unknown[]): Promise<T> {
    console.log('[Prisma Placeholder] $queryRaw', query, values);
    return [] as T;
  }

  async $transaction<T>(fn: (prisma: this) => Promise<T>): Promise<T> {
    console.log('[Prisma Placeholder] $transaction');
    return fn(this);
  }
}

// Use placeholder until real Prisma client is generated
type PrismaClient = PrismaClientPlaceholder;

/**
 * Create Prisma client with optimized settings
 */
function createPrismaClient(): PrismaClient {
  // In production with real Prisma:
  // return new PrismaClient({
  //   log: process.env.NODE_ENV === 'development'
  //     ? ['query', 'info', 'warn', 'error']
  //     : ['error'],
  //   errorFormat: 'pretty',
  // });

  return new PrismaClientPlaceholder();
}

/**
 * Singleton pattern - reuse existing client in development to prevent connection issues
 */
const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };
export type { PrismaClient };

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
