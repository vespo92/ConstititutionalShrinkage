import { Checkpoint } from '../types/index.js';

export interface CheckpointStore {
  save(checkpoint: Checkpoint): Promise<void>;
  load(jobId: string): Promise<Checkpoint | null>;
  loadLatest(jobId: string): Promise<Checkpoint | null>;
  list(jobId: string): Promise<Checkpoint[]>;
  delete(checkpointId: string): Promise<void>;
  deleteAll(jobId: string): Promise<void>;
}

export class InMemoryCheckpointStore implements CheckpointStore {
  private checkpoints: Map<string, Checkpoint[]> = new Map();

  async save(checkpoint: Checkpoint): Promise<void> {
    const existing = this.checkpoints.get(checkpoint.jobId) ?? [];
    existing.push(checkpoint);
    this.checkpoints.set(checkpoint.jobId, existing);
  }

  async load(jobId: string): Promise<Checkpoint | null> {
    return this.loadLatest(jobId);
  }

  async loadLatest(jobId: string): Promise<Checkpoint | null> {
    const checkpoints = this.checkpoints.get(jobId);
    if (!checkpoints || checkpoints.length === 0) {
      return null;
    }
    return checkpoints[checkpoints.length - 1];
  }

  async list(jobId: string): Promise<Checkpoint[]> {
    return this.checkpoints.get(jobId) ?? [];
  }

  async delete(checkpointId: string): Promise<void> {
    for (const [jobId, checkpoints] of this.checkpoints.entries()) {
      const filtered = checkpoints.filter((c) => c.id !== checkpointId);
      if (filtered.length !== checkpoints.length) {
        this.checkpoints.set(jobId, filtered);
        break;
      }
    }
  }

  async deleteAll(jobId: string): Promise<void> {
    this.checkpoints.delete(jobId);
  }
}

export class CheckpointManager {
  private store: CheckpointStore;
  private checkpointInterval: number;
  private lastCheckpoint: number = 0;

  constructor(store: CheckpointStore, checkpointInterval: number = 1000) {
    this.store = store;
    this.checkpointInterval = checkpointInterval;
  }

  async createCheckpoint(
    jobId: string,
    offset: number,
    state: Record<string, unknown> = {},
    cursor?: string
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      jobId,
      offset,
      cursor,
      state,
      createdAt: new Date(),
    };

    await this.store.save(checkpoint);
    this.lastCheckpoint = Date.now();
    return checkpoint;
  }

  shouldCheckpoint(recordsProcessed: number): boolean {
    return recordsProcessed % this.checkpointInterval === 0;
  }

  async getResumePoint(jobId: string): Promise<{
    offset: number;
    cursor?: string;
    state: Record<string, unknown>;
  } | null> {
    const checkpoint = await this.store.loadLatest(jobId);
    if (!checkpoint) {
      return null;
    }

    return {
      offset: checkpoint.offset,
      cursor: checkpoint.cursor,
      state: checkpoint.state,
    };
  }

  async cleanupOldCheckpoints(jobId: string, keepLast: number = 5): Promise<void> {
    const checkpoints = await this.store.list(jobId);

    if (checkpoints.length <= keepLast) {
      return;
    }

    const toDelete = checkpoints.slice(0, checkpoints.length - keepLast);
    for (const checkpoint of toDelete) {
      await this.store.delete(checkpoint.id);
    }
  }

  async clearCheckpoints(jobId: string): Promise<void> {
    await this.store.deleteAll(jobId);
  }
}

export function createCheckpointManager(
  store?: CheckpointStore,
  interval?: number
): CheckpointManager {
  return new CheckpointManager(store ?? new InMemoryCheckpointStore(), interval);
}
