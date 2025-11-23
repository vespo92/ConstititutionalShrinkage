import { TargetRecord, LoadResult } from '../types/index.js';

export interface ReconciliationOptions {
  matchFields: string[];
  conflictResolution: 'source' | 'destination' | 'newest' | 'manual';
  updateExisting: boolean;
  preserveHistory: boolean;
}

export interface ReconciliationResult {
  matched: number;
  unmatched: number;
  conflicts: ConflictRecord[];
  resolved: number;
}

export interface ConflictRecord {
  sourceRecord: TargetRecord;
  destinationRecord: Record<string, unknown>;
  conflictingFields: string[];
  resolution?: 'source' | 'destination' | 'merged' | 'skipped';
}

export class DataReconciler {
  private options: ReconciliationOptions;

  constructor(options: Partial<ReconciliationOptions> = {}) {
    this.options = {
      matchFields: options.matchFields ?? ['externalId'],
      conflictResolution: options.conflictResolution ?? 'source',
      updateExisting: options.updateExisting ?? true,
      preserveHistory: options.preserveHistory ?? true,
    };
  }

  async reconcile(
    sourceRecords: TargetRecord[],
    getExisting: (matchKey: string) => Promise<Record<string, unknown> | null>
  ): Promise<ReconciliationResult> {
    const conflicts: ConflictRecord[] = [];
    let matched = 0;
    let unmatched = 0;
    let resolved = 0;

    for (const record of sourceRecords) {
      const matchKey = this.buildMatchKey(record);
      const existing = await getExisting(matchKey);

      if (!existing) {
        unmatched++;
        continue;
      }

      matched++;

      const conflictingFields = this.findConflicts(record.data, existing);

      if (conflictingFields.length > 0) {
        const conflict: ConflictRecord = {
          sourceRecord: record,
          destinationRecord: existing,
          conflictingFields,
        };

        conflict.resolution = this.resolveConflict(conflict);
        conflicts.push(conflict);

        if (conflict.resolution !== 'skipped') {
          resolved++;
        }
      }
    }

    return {
      matched,
      unmatched,
      conflicts,
      resolved,
    };
  }

  private buildMatchKey(record: TargetRecord): string {
    return this.options.matchFields
      .map((field) => this.getNestedValue(record.data, field))
      .filter(Boolean)
      .join(':');
  }

  private findConflicts(
    source: Record<string, unknown>,
    destination: Record<string, unknown>
  ): string[] {
    const conflicts: string[] = [];
    const allKeys = new Set([...Object.keys(source), ...Object.keys(destination)]);

    for (const key of allKeys) {
      const sourceValue = source[key];
      const destValue = destination[key];

      if (!this.areEqual(sourceValue, destValue)) {
        conflicts.push(key);
      }
    }

    return conflicts;
  }

  private areEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (typeof a === 'object' && typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    return false;
  }

  resolveConflict(conflict: ConflictRecord): 'source' | 'destination' | 'merged' | 'skipped' {
    switch (this.options.conflictResolution) {
      case 'source':
        return 'source';
      case 'destination':
        return 'destination';
      case 'newest':
        return this.resolveByTimestamp(conflict);
      case 'manual':
        return 'skipped';
      default:
        return 'source';
    }
  }

  private resolveByTimestamp(conflict: ConflictRecord): 'source' | 'destination' {
    const sourceUpdated = this.getTimestamp(conflict.sourceRecord.data);
    const destUpdated = this.getTimestamp(conflict.destinationRecord);

    return sourceUpdated >= destUpdated ? 'source' : 'destination';
  }

  private getTimestamp(record: Record<string, unknown>): number {
    const updatedAt = record.updatedAt || record.updated_at || record.modifiedAt;
    if (updatedAt instanceof Date) {
      return updatedAt.getTime();
    }
    if (typeof updatedAt === 'string' || typeof updatedAt === 'number') {
      return new Date(updatedAt).getTime();
    }
    return 0;
  }

  merge(
    source: Record<string, unknown>,
    destination: Record<string, unknown>,
    preferSource: string[] = []
  ): Record<string, unknown> {
    const merged = { ...destination };

    for (const [key, value] of Object.entries(source)) {
      if (preferSource.includes(key) || !(key in destination)) {
        merged[key] = value;
      }
    }

    return merged;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
  }

  generateDiff(
    source: Record<string, unknown>,
    destination: Record<string, unknown>
  ): Array<{ field: string; sourceValue: unknown; destValue: unknown }> {
    const diff: Array<{ field: string; sourceValue: unknown; destValue: unknown }> = [];
    const allKeys = new Set([...Object.keys(source), ...Object.keys(destination)]);

    for (const field of allKeys) {
      const sourceValue = source[field];
      const destValue = destination[field];

      if (!this.areEqual(sourceValue, destValue)) {
        diff.push({ field, sourceValue, destValue });
      }
    }

    return diff;
  }
}

export function createReconciler(options?: Partial<ReconciliationOptions>): DataReconciler {
  return new DataReconciler(options);
}
