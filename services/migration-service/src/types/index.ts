export interface MigrationJob {
  id: string;
  name: string;
  type: 'congress' | 'state' | 'census' | 'voter' | 'custom';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  config: MigrationConfig;
  progress: {
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    percentage: number;
  };
  checkpoints: Checkpoint[];
  errors: MigrationError[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MigrationConfig {
  source: DataSource;
  destination: DataDestination;
  mapping: FieldMapping[];
  options: MigrationOptions;
}

export interface DataSource {
  type: 'api' | 'database' | 'file' | 'ftp';
  name: string;
  config: Record<string, unknown>;
}

export interface DataDestination {
  type: 'database' | 'file';
  config: Record<string, unknown>;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;
  required?: boolean;
  default?: unknown;
}

export interface MigrationOptions {
  batchSize: number;
  concurrency: number;
  retryAttempts: number;
  retryDelay: number;
  validateBeforeLoad: boolean;
  skipDuplicates: boolean;
  dryRun: boolean;
  checkpoint: boolean;
}

export interface Checkpoint {
  id: string;
  jobId: string;
  offset: number;
  cursor?: string;
  state: Record<string, unknown>;
  createdAt: Date;
}

export interface MigrationError {
  id: string;
  jobId: string;
  recordId?: string;
  errorType: 'validation' | 'transform' | 'load' | 'connection' | 'unknown';
  message: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
}

export interface TransformResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoadResult {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ recordId: string; error: string }>;
}

export interface MigrationResult {
  jobId: string;
  status: 'completed' | 'failed' | 'partial';
  duration: number;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors: MigrationError[];
}

export interface SourceRecord {
  id: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface TargetRecord {
  id: string;
  data: Record<string, unknown>;
  sourceId: string;
}
