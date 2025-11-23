import { MigrationJob, Checkpoint } from '../types/index.js';

export interface RollbackOptions {
  preserveCheckpoints: boolean;
  cascadeDelete: boolean;
  dryRun: boolean;
}

export interface RollbackResult {
  success: boolean;
  recordsDeleted: number;
  checkpointsCleared: number;
  errors: string[];
  dryRun: boolean;
}

export interface RollbackRecord {
  id: string;
  jobId: string;
  recordId: string;
  tableName: string;
  operation: 'insert' | 'update' | 'delete';
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  createdAt: Date;
}

export class RollbackManager {
  private options: RollbackOptions;
  private rollbackLog: Map<string, RollbackRecord[]> = new Map();

  constructor(options: Partial<RollbackOptions> = {}) {
    this.options = {
      preserveCheckpoints: options.preserveCheckpoints ?? false,
      cascadeDelete: options.cascadeDelete ?? true,
      dryRun: options.dryRun ?? false,
    };
  }

  logOperation(
    jobId: string,
    recordId: string,
    tableName: string,
    operation: 'insert' | 'update' | 'delete',
    previousData?: Record<string, unknown>,
    newData?: Record<string, unknown>
  ): void {
    const record: RollbackRecord = {
      id: `rb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      jobId,
      recordId,
      tableName,
      operation,
      previousData,
      newData,
      createdAt: new Date(),
    };

    const jobLog = this.rollbackLog.get(jobId) ?? [];
    jobLog.push(record);
    this.rollbackLog.set(jobId, jobLog);
  }

  async rollback(
    job: MigrationJob,
    executeDelete: (tableName: string, recordIds: string[]) => Promise<number>,
    executeUpdate: (tableName: string, recordId: string, data: Record<string, unknown>) => Promise<void>
  ): Promise<RollbackResult> {
    const errors: string[] = [];
    let recordsDeleted = 0;
    let checkpointsCleared = 0;

    const operations = this.rollbackLog.get(job.id) ?? [];

    // Process in reverse order
    const reversed = [...operations].reverse();

    // Group by table for batch operations
    const insertsByTable = new Map<string, string[]>();
    const updates: RollbackRecord[] = [];

    for (const op of reversed) {
      if (op.operation === 'insert') {
        const existing = insertsByTable.get(op.tableName) ?? [];
        existing.push(op.recordId);
        insertsByTable.set(op.tableName, existing);
      } else if (op.operation === 'update' && op.previousData) {
        updates.push(op);
      }
    }

    // Execute deletes (rollback inserts)
    if (!this.options.dryRun) {
      for (const [tableName, recordIds] of insertsByTable) {
        try {
          const deleted = await executeDelete(tableName, recordIds);
          recordsDeleted += deleted;
        } catch (error) {
          errors.push(`Failed to delete from ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Execute updates (restore previous state)
      for (const update of updates) {
        try {
          await executeUpdate(update.tableName, update.recordId, update.previousData!);
        } catch (error) {
          errors.push(`Failed to restore ${update.recordId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } else {
      // Dry run - just count
      for (const recordIds of insertsByTable.values()) {
        recordsDeleted += recordIds.length;
      }
    }

    // Clear checkpoints
    if (!this.options.preserveCheckpoints) {
      checkpointsCleared = job.checkpoints.length;
      if (!this.options.dryRun) {
        job.checkpoints = [];
      }
    }

    // Clear rollback log for this job
    if (!this.options.dryRun) {
      this.rollbackLog.delete(job.id);
    }

    return {
      success: errors.length === 0,
      recordsDeleted,
      checkpointsCleared,
      errors,
      dryRun: this.options.dryRun,
    };
  }

  async rollbackToCheckpoint(
    job: MigrationJob,
    checkpoint: Checkpoint,
    executeDelete: (tableName: string, recordIds: string[]) => Promise<number>
  ): Promise<RollbackResult> {
    const operations = this.rollbackLog.get(job.id) ?? [];

    // Find operations after the checkpoint
    const operationsAfterCheckpoint = operations.filter(
      (op) => op.createdAt > checkpoint.createdAt
    );

    // Create a temporary job-like structure for rollback
    const tempJob = { ...job, checkpoints: [] };
    const tempLog = new Map([[job.id, operationsAfterCheckpoint]]);

    const originalLog = this.rollbackLog;
    this.rollbackLog = tempLog;

    const result = await this.rollback(
      tempJob,
      executeDelete,
      async () => {} // Skip updates for checkpoint rollback
    );

    this.rollbackLog = originalLog;

    // Remove operations after checkpoint from log
    this.rollbackLog.set(
      job.id,
      operations.filter((op) => op.createdAt <= checkpoint.createdAt)
    );

    return result;
  }

  getOperationCount(jobId: string): number {
    return this.rollbackLog.get(jobId)?.length ?? 0;
  }

  getOperations(jobId: string): RollbackRecord[] {
    return this.rollbackLog.get(jobId) ?? [];
  }

  clearLog(jobId: string): void {
    this.rollbackLog.delete(jobId);
  }
}

export function createRollbackManager(options?: Partial<RollbackOptions>): RollbackManager {
  return new RollbackManager(options);
}
