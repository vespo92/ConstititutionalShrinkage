import { EventEmitter } from 'events';
import { MigrationJob } from '../types/index.js';

export interface ProgressUpdate {
  jobId: string;
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
  percentage: number;
  rate: number; // records per second
  eta: number; // estimated time remaining in ms
  currentRecord?: string;
  stage: 'extracting' | 'transforming' | 'validating' | 'loading';
}

export interface ProgressTrackerOptions {
  updateInterval: number;
  smoothingFactor: number;
}

export class ProgressTracker extends EventEmitter {
  private options: ProgressTrackerOptions;
  private jobProgress: Map<string, JobProgressState> = new Map();

  constructor(options: Partial<ProgressTrackerOptions> = {}) {
    super();
    this.options = {
      updateInterval: options.updateInterval ?? 1000,
      smoothingFactor: options.smoothingFactor ?? 0.3,
    };
  }

  startTracking(job: MigrationJob): void {
    const state: JobProgressState = {
      jobId: job.id,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      processed: 0,
      total: job.progress.total,
      succeeded: 0,
      failed: 0,
      rates: [],
      stage: 'extracting',
    };

    this.jobProgress.set(job.id, state);
  }

  updateProgress(
    jobId: string,
    processed: number,
    succeeded: number,
    failed: number,
    total?: number,
    stage?: ProgressUpdate['stage']
  ): void {
    const state = this.jobProgress.get(jobId);
    if (!state) return;

    const now = Date.now();
    const timeDelta = (now - state.lastUpdate) / 1000;
    const recordsDelta = processed - state.processed;

    if (total !== undefined) {
      state.total = total;
    }

    if (stage) {
      state.stage = stage;
    }

    // Calculate instantaneous rate
    const instantRate = timeDelta > 0 ? recordsDelta / timeDelta : 0;

    // Keep last 10 rates for smoothing
    state.rates.push(instantRate);
    if (state.rates.length > 10) {
      state.rates.shift();
    }

    // Calculate smoothed rate
    const smoothedRate = this.calculateSmoothedRate(state.rates);

    state.processed = processed;
    state.succeeded = succeeded;
    state.failed = failed;
    state.lastUpdate = now;

    const percentage = state.total > 0 ? (processed / state.total) * 100 : 0;
    const remaining = state.total - processed;
    const eta = smoothedRate > 0 ? (remaining / smoothedRate) * 1000 : 0;

    const update: ProgressUpdate = {
      jobId,
      processed,
      total: state.total,
      succeeded,
      failed,
      percentage,
      rate: smoothedRate,
      eta,
      stage: state.stage,
    };

    this.emit('progress', update);
  }

  getProgress(jobId: string): ProgressUpdate | null {
    const state = this.jobProgress.get(jobId);
    if (!state) return null;

    const smoothedRate = this.calculateSmoothedRate(state.rates);
    const percentage = state.total > 0 ? (state.processed / state.total) * 100 : 0;
    const remaining = state.total - state.processed;
    const eta = smoothedRate > 0 ? (remaining / smoothedRate) * 1000 : 0;

    return {
      jobId,
      processed: state.processed,
      total: state.total,
      succeeded: state.succeeded,
      failed: state.failed,
      percentage,
      rate: smoothedRate,
      eta,
      stage: state.stage,
    };
  }

  stopTracking(jobId: string): void {
    this.jobProgress.delete(jobId);
  }

  private calculateSmoothedRate(rates: number[]): number {
    if (rates.length === 0) return 0;

    let smoothed = rates[0];
    for (let i = 1; i < rates.length; i++) {
      smoothed = this.options.smoothingFactor * rates[i] + (1 - this.options.smoothingFactor) * smoothed;
    }
    return smoothed;
  }

  formatEta(ms: number): string {
    if (ms <= 0) return 'Unknown';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  formatProgress(update: ProgressUpdate): string {
    const bar = this.createProgressBar(update.percentage);
    const eta = this.formatEta(update.eta);

    return `${bar} ${update.percentage.toFixed(1)}% | ${update.processed}/${update.total} | ${update.rate.toFixed(1)}/s | ETA: ${eta}`;
  }

  private createProgressBar(percentage: number, width: number = 30): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }

  getStats(jobId: string): {
    duration: number;
    averageRate: number;
    successRate: number;
  } | null {
    const state = this.jobProgress.get(jobId);
    if (!state) return null;

    const duration = Date.now() - state.startTime;
    const averageRate = duration > 0 ? (state.processed / duration) * 1000 : 0;
    const successRate = state.processed > 0 ? (state.succeeded / state.processed) * 100 : 0;

    return {
      duration,
      averageRate,
      successRate,
    };
  }
}

interface JobProgressState {
  jobId: string;
  startTime: number;
  lastUpdate: number;
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
  rates: number[];
  stage: ProgressUpdate['stage'];
}

export function createProgressTracker(options?: Partial<ProgressTrackerOptions>): ProgressTracker {
  return new ProgressTracker(options);
}
