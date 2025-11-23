import { FieldMapping, TransformResult, SourceRecord, TargetRecord } from '../types/index.js';

export type TransformFunction = (value: unknown, record: Record<string, unknown>) => unknown;

export interface TransformerOptions {
  strict: boolean;
  preserveUnmapped: boolean;
  defaultTransforms: Map<string, TransformFunction>;
}

export class DataTransformer {
  private options: TransformerOptions;
  private transforms: Map<string, TransformFunction> = new Map();

  constructor(options: Partial<TransformerOptions> = {}) {
    this.options = {
      strict: options.strict ?? true,
      preserveUnmapped: options.preserveUnmapped ?? false,
      defaultTransforms: options.defaultTransforms ?? new Map(),
    };

    this.registerDefaultTransforms();
  }

  private registerDefaultTransforms(): void {
    this.transforms.set('string', (v) => String(v ?? ''));
    this.transforms.set('number', (v) => Number(v) || 0);
    this.transforms.set('boolean', (v) => Boolean(v));
    this.transforms.set('date', (v) => (v ? new Date(v as string | number) : null));
    this.transforms.set('isoDate', (v) =>
      v ? new Date(v as string | number).toISOString() : null
    );
    this.transforms.set('trim', (v) => (typeof v === 'string' ? v.trim() : v));
    this.transforms.set('lowercase', (v) =>
      typeof v === 'string' ? v.toLowerCase() : v
    );
    this.transforms.set('uppercase', (v) =>
      typeof v === 'string' ? v.toUpperCase() : v
    );
    this.transforms.set('json', (v) =>
      typeof v === 'string' ? JSON.parse(v) : v
    );
    this.transforms.set('array', (v) => (Array.isArray(v) ? v : [v].filter(Boolean)));
  }

  registerTransform(name: string, fn: TransformFunction): void {
    this.transforms.set(name, fn);
  }

  transform(
    source: SourceRecord,
    mappings: FieldMapping[]
  ): TransformResult<TargetRecord> {
    try {
      const data: Record<string, unknown> = {};

      for (const mapping of mappings) {
        const value = this.getNestedValue(source.data, mapping.source);

        if (value === undefined) {
          if (mapping.required && mapping.default === undefined) {
            return {
              success: false,
              error: `Required field missing: ${mapping.source}`,
            };
          }
          if (mapping.default !== undefined) {
            this.setNestedValue(data, mapping.target, mapping.default);
          }
          continue;
        }

        let transformedValue = value;

        if (mapping.transform) {
          const transformFn = this.transforms.get(mapping.transform);
          if (transformFn) {
            transformedValue = transformFn(value, source.data);
          } else if (this.options.strict) {
            return {
              success: false,
              error: `Unknown transform: ${mapping.transform}`,
            };
          }
        }

        this.setNestedValue(data, mapping.target, transformedValue);
      }

      if (this.options.preserveUnmapped) {
        const mappedSources = new Set(mappings.map((m) => m.source.split('.')[0]));
        for (const [key, value] of Object.entries(source.data)) {
          if (!mappedSources.has(key) && !(key in data)) {
            data[key] = value;
          }
        }
      }

      return {
        success: true,
        data: {
          id: `target_${source.id}`,
          sourceId: source.id,
          data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async *transformBatch(
    records: AsyncGenerator<SourceRecord>,
    mappings: FieldMapping[]
  ): AsyncGenerator<TransformResult<TargetRecord>> {
    for await (const record of records) {
      yield this.transform(record, mappings);
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  compose(...transformNames: string[]): TransformFunction {
    return (value, record) => {
      let result = value;
      for (const name of transformNames) {
        const fn = this.transforms.get(name);
        if (fn) {
          result = fn(result, record);
        }
      }
      return result;
    };
  }
}

export function createTransformer(options?: Partial<TransformerOptions>): DataTransformer {
  return new DataTransformer(options);
}

export const defaultMappings = {
  congressBill: [
    { source: 'number', target: 'externalId' },
    { source: 'title', target: 'title', required: true },
    { source: 'introducedDate', target: 'createdAt', transform: 'date' },
    { source: 'originChamber', target: 'metadata.chamber' },
    { source: 'policyArea.name', target: 'category' },
    { source: 'latestAction.text', target: 'status' },
  ] as FieldMapping[],

  congressMember: [
    { source: 'bioguideId', target: 'externalId', required: true },
    { source: 'fullName', target: 'name' },
    { source: 'firstName', target: 'firstName' },
    { source: 'lastName', target: 'lastName' },
    { source: 'party', target: 'party' },
    { source: 'state', target: 'state' },
    { source: 'district', target: 'district', transform: 'number' },
  ] as FieldMapping[],

  censusGeography: [
    { source: 'geoId', target: 'externalId', required: true },
    { source: 'name', target: 'name', required: true },
    { source: 'type', target: 'type' },
    { source: 'stateCode', target: 'codes.state' },
    { source: 'countyCode', target: 'codes.county' },
    { source: 'population', target: 'demographics.population', transform: 'number' },
  ] as FieldMapping[],
};
