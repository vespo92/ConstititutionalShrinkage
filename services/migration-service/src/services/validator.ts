import { z } from 'zod';
import { ValidationResult, ValidationError, ValidationWarning, TargetRecord } from '../types/index.js';

export interface ValidationRule {
  field: string;
  validator: (value: unknown, record: Record<string, unknown>) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidatorOptions {
  stopOnFirstError: boolean;
  validateNested: boolean;
  customValidators: Map<string, z.ZodType>;
}

export class DataValidator {
  private options: ValidatorOptions;
  private rules: ValidationRule[] = [];
  private schemas: Map<string, z.ZodType> = new Map();

  constructor(options: Partial<ValidatorOptions> = {}) {
    this.options = {
      stopOnFirstError: options.stopOnFirstError ?? false,
      validateNested: options.validateNested ?? true,
      customValidators: options.customValidators ?? new Map(),
    };

    this.registerDefaultSchemas();
  }

  private registerDefaultSchemas(): void {
    this.schemas.set('bill', z.object({
      externalId: z.string().min(1),
      title: z.string().min(1).max(1000),
      status: z.string().optional(),
      category: z.string().optional(),
      createdAt: z.date().or(z.string().datetime()).optional(),
    }));

    this.schemas.set('person', z.object({
      externalId: z.string().min(1),
      name: z.string().min(1).max(200),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      party: z.string().optional(),
      state: z.string().length(2).optional(),
    }));

    this.schemas.set('region', z.object({
      externalId: z.string().min(1),
      name: z.string().min(1),
      type: z.enum(['state', 'county', 'district', 'city', 'tract']),
    }));

    this.schemas.set('vote', z.object({
      externalId: z.string().min(1),
      question: z.string().min(1),
      result: z.enum(['passed', 'failed', 'unknown']),
      date: z.date().or(z.string().datetime()),
    }));
  }

  registerSchema(name: string, schema: z.ZodType): void {
    this.schemas.set(name, schema);
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  removeRule(field: string): void {
    this.rules = this.rules.filter((r) => r.field !== field);
  }

  validate(record: TargetRecord, schemaName?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Schema validation
    if (schemaName) {
      const schema = this.schemas.get(schemaName);
      if (schema) {
        const result = schema.safeParse(record.data);
        if (!result.success) {
          for (const issue of result.error.issues) {
            errors.push({
              field: issue.path.join('.'),
              message: issue.message,
              value: this.getNestedValue(record.data, issue.path.join('.')),
            });

            if (this.options.stopOnFirstError) {
              return { valid: false, errors, warnings };
            }
          }
        }
      }
    }

    // Custom rule validation
    for (const rule of this.rules) {
      const value = this.getNestedValue(record.data, rule.field);
      const isValid = rule.validator(value, record.data);

      if (!isValid) {
        const issue = {
          field: rule.field,
          message: rule.message,
          value,
        };

        if (rule.severity === 'error') {
          errors.push(issue);
          if (this.options.stopOnFirstError) {
            return { valid: false, errors, warnings };
          }
        } else {
          warnings.push(issue);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async *validateBatch(
    records: AsyncGenerator<TargetRecord>,
    schemaName?: string
  ): AsyncGenerator<{ record: TargetRecord; result: ValidationResult }> {
    for await (const record of records) {
      yield {
        record,
        result: this.validate(record, schemaName),
      };
    }
  }

  validateField(field: string, value: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const relevantRules = this.rules.filter((r) => r.field === field);

    for (const rule of relevantRules) {
      const isValid = rule.validator(value, { [field]: value });

      if (!isValid) {
        const issue = {
          field: rule.field,
          message: rule.message,
          value,
        };

        if (rule.severity === 'error') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
  }
}

export function createValidator(options?: Partial<ValidatorOptions>): DataValidator {
  return new DataValidator(options);
}

// Common validation rules
export const commonRules: ValidationRule[] = [
  {
    field: 'externalId',
    validator: (v) => typeof v === 'string' && v.length > 0,
    message: 'External ID is required',
    severity: 'error',
  },
  {
    field: 'title',
    validator: (v) => typeof v === 'string' && v.length <= 1000,
    message: 'Title must be 1000 characters or less',
    severity: 'error',
  },
  {
    field: 'email',
    validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)),
    message: 'Invalid email format',
    severity: 'error',
  },
  {
    field: 'state',
    validator: (v) => !v || (typeof v === 'string' && v.length === 2),
    message: 'State must be a 2-letter code',
    severity: 'warning',
  },
];
