import { EventEmitter } from 'events';
import {
  MigrationJob,
  MigrationConfig,
  MigrationResult,
  MigrationError,
  SourceRecord,
  TargetRecord,
} from '../types/index.js';
import { CheckpointManager, createCheckpointManager } from '../lib/checkpointing.js';
import { RateLimiter, createRateLimiter } from '../lib/rate-limiter.js';

export interface OrchestratorEvents {
  'job:started': (job: MigrationJob) => void;
  'job:progress': (job: MigrationJob, record: SourceRecord) => void;
  'job:completed': (job: MigrationJob, result: MigrationResult) => void;
  'job:failed': (job: MigrationJob, error: Error) => void;
  'job:paused': (job: MigrationJob) => void;
  'job:resumed': (job: MigrationJob) => void;
  'record:processed': (record: TargetRecord) => void;
  'record:failed': (record: SourceRecord, error: Error) => void;
}

export class MigrationOrchestrator extends EventEmitter {
  private jobs: Map<string, MigrationJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private checkpointManager: CheckpointManager;
  private rateLimiter: RateLimiter;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    super();
    this.checkpointManager = createCheckpointManager();
    this.rateLimiter = createRateLimiter();
  }

  async createJob(name: string, config: MigrationConfig): Promise<MigrationJob> {
    const job: MigrationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      type: this.inferJobType(config),
      status: 'pending',
      config,
      progress: {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        percentage: 0,
      },
      checkpoints: [],
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  async startJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (this.activeJobs.has(jobId)) {
      throw new Error(`Job already running: ${jobId}`);
    }

    const abortController = new AbortController();
    this.abortControllers.set(jobId, abortController);

    job.status = 'running';
    job.startedAt = new Date();
    job.updatedAt = new Date();
    this.activeJobs.add(jobId);

    this.emit('job:started', job);

    try {
      const result = await this.executeJob(job, abortController.signal);
      job.status = 'completed';
      job.completedAt = new Date();
      job.updatedAt = new Date();
      this.emit('job:completed', job, result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        job.status = 'cancelled';
      } else {
        job.status = 'failed';
        this.emit('job:failed', job, error as Error);
      }
      job.updatedAt = new Date();
    } finally {
      this.activeJobs.delete(jobId);
      this.abortControllers.delete(jobId);
    }
  }

  async pauseJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const controller = this.abortControllers.get(jobId);
    if (controller) {
      controller.abort();
    }

    job.status = 'paused';
    job.updatedAt = new Date();
    this.emit('job:paused', job);
  }

  async resumeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    if (job.status !== 'paused') {
      throw new Error(`Job is not paused: ${jobId}`);
    }

    const resumePoint = await this.checkpointManager.getResumePoint(jobId);
    if (resumePoint) {
      job.progress.processed = resumePoint.offset;
    }

    this.emit('job:resumed', job);
    await this.startJob(jobId);
  }

  async cancelJob(jobId: string): Promise<void> {
    const controller = this.abortControllers.get(jobId);
    if (controller) {
      controller.abort();
    }

    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'cancelled';
      job.updatedAt = new Date();
    }
  }

  async rollbackJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Implementation would depend on destination type
    // For database: DELETE records with migration_job_id = jobId
    await this.checkpointManager.clearCheckpoints(jobId);
  }

  getJob(jobId: string): MigrationJob | undefined {
    return this.jobs.get(jobId);
  }

  listJobs(): MigrationJob[] {
    return Array.from(this.jobs.values());
  }

  private async executeJob(job: MigrationJob, signal: AbortSignal): Promise<MigrationResult> {
    const startTime = Date.now();
    const errors: MigrationError[] = [];

    const resumePoint = await this.checkpointManager.getResumePoint(job.id);
    let offset = resumePoint?.offset ?? 0;

    // Simulated processing - in real implementation, this would:
    // 1. Connect to source
    // 2. Extract records
    // 3. Transform records
    // 4. Load into destination

    const batchSize = job.config.options.batchSize;
    const totalEstimate = 1000; // Would be determined from source

    job.progress.total = totalEstimate;

    while (offset < totalEstimate) {
      if (signal.aborted) {
        throw new Error('Job aborted');
      }

      // Process batch
      const batchEnd = Math.min(offset + batchSize, totalEstimate);

      for (let i = offset; i < batchEnd; i++) {
        try {
          // Simulate record processing
          job.progress.processed++;
          job.progress.succeeded++;
          job.progress.percentage = (job.progress.processed / job.progress.total) * 100;

          if (this.checkpointManager.shouldCheckpoint(job.progress.processed)) {
            await this.checkpointManager.createCheckpoint(job.id, job.progress.processed);
          }
        } catch (error) {
          job.progress.failed++;
          const migrationError: MigrationError = {
            id: `err_${Date.now()}`,
            jobId: job.id,
            recordId: String(i),
            errorType: 'transform',
            message: error instanceof Error ? error.message : String(error),
            createdAt: new Date(),
          };
          errors.push(migrationError);
          job.errors.push(migrationError);
        }
      }

      offset = batchEnd;
      job.updatedAt = new Date();
    }

    return {
      jobId: job.id,
      status: errors.length === 0 ? 'completed' : job.progress.failed === job.progress.total ? 'failed' : 'partial',
      duration: Date.now() - startTime,
      recordsProcessed: job.progress.processed,
      recordsSucceeded: job.progress.succeeded,
      recordsFailed: job.progress.failed,
      errors,
    };
  }

  private inferJobType(config: MigrationConfig): MigrationJob['type'] {
    const sourceName = config.source.name.toLowerCase();
    if (sourceName.includes('congress')) return 'congress';
    if (sourceName.includes('census')) return 'census';
    if (sourceName.includes('voter')) return 'voter';
    if (sourceName.includes('state')) return 'state';
    return 'custom';
  }
}

export function createOrchestrator(): MigrationOrchestrator {
  return new MigrationOrchestrator();
}
