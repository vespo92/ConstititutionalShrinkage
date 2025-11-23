/**
 * Background job scheduler for simulations
 */

import { simulationRunner } from './runner';

interface ScheduledJob {
  id: string;
  simulationId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  priority: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

class SimulationScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private queue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrent: number = 3;
  private runningCount: number = 0;

  /**
   * Schedule a simulation to run
   */
  schedule(simulationId: string, priority: number = 5): ScheduledJob {
    const job: ScheduledJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      simulationId,
      status: 'queued',
      priority,
      scheduledAt: new Date()
    };

    this.jobs.set(job.id, job);

    // Insert into queue based on priority
    this.insertIntoQueue(job.id, priority);

    // Start processing if not already
    this.processQueue();

    return job;
  }

  /**
   * Insert job into priority queue
   */
  private insertIntoQueue(jobId: string, priority: number): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Find insertion point (higher priority = earlier in queue)
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingJob = this.jobs.get(this.queue[i]);
      if (existingJob && existingJob.priority < priority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, jobId);
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
      const jobId = this.queue.shift();
      if (!jobId) continue;

      const job = this.jobs.get(jobId);
      if (!job) continue;

      this.runningCount++;
      this.runJob(job).finally(() => {
        this.runningCount--;
        this.processQueue();
      });
    }

    this.isProcessing = false;
  }

  /**
   * Run a single job
   */
  private async runJob(job: ScheduledJob): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();
    this.jobs.set(job.id, job);

    try {
      await simulationRunner.run(job.simulationId);
      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
    }

    this.jobs.set(job.id, job);
  }

  /**
   * Get job status
   */
  getJob(jobId: string): ScheduledJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs for a simulation
   */
  getJobsForSimulation(simulationId: string): ScheduledJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.simulationId === simulationId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }

  /**
   * Cancel a queued job
   */
  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'queued') return false;

    const queueIndex = this.queue.indexOf(jobId);
    if (queueIndex >= 0) {
      this.queue.splice(queueIndex, 1);
    }

    this.jobs.delete(jobId);
    return true;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    queued: number;
    running: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      queued: jobs.filter(j => j.status === 'queued').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }

  /**
   * Clear completed and failed jobs older than specified age
   */
  cleanup(maxAgeMs: number = 3600000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;

    for (const [id, job] of this.jobs) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        removed++;
      }
    }

    return removed;
  }
}

export const scheduler = new SimulationScheduler();
