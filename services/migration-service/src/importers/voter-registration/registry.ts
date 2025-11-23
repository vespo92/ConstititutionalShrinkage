import * as crypto from 'crypto';
import { SourceRecord, TargetRecord, ValidationResult } from '../../types/index.js';

export interface VoterImporterOptions {
  encryptionKey: string;
  region: string;
  validateAddresses: boolean;
  validateAge: boolean;
  minAge: number;
}

export interface VoterRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  registrationDate: string;
  party?: string;
  status: 'active' | 'inactive' | 'pending';
  precinct?: string;
  districtIds?: string[];
}

export interface AnonymizedVoter {
  id: string;
  hashedId: string;
  ageRange: string;
  region: string;
  registrationYear: number;
  party?: string;
  status: string;
}

export class VoterRegistryImporter {
  private options: VoterImporterOptions;
  private cipher: crypto.Cipher | null = null;

  constructor(options: VoterImporterOptions) {
    this.options = options;
  }

  async *extractFromCsv(csvContent: string): AsyncGenerator<SourceRecord> {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCsvLine(line);
      const record: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      yield {
        id: `voter_${i}`,
        data: record,
        metadata: {
          source: 'csv',
          region: this.options.region,
          lineNumber: i,
          extractedAt: new Date().toISOString(),
        },
      };
    }
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  }

  validate(source: SourceRecord): ValidationResult {
    const errors: Array<{ field: string; message: string; value?: unknown }> = [];
    const warnings: Array<{ field: string; message: string; value?: unknown }> = [];
    const data = source.data;

    // Required fields
    if (!data.firstName && !data.first_name) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!data.lastName && !data.last_name) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    // Age validation
    if (this.options.validateAge) {
      const dob = data.dateOfBirth || data.date_of_birth || data.dob;
      if (dob) {
        const age = this.calculateAge(String(dob));
        if (age < this.options.minAge) {
          errors.push({
            field: 'dateOfBirth',
            message: `Voter must be at least ${this.options.minAge} years old`,
            value: age,
          });
        }
      }
    }

    // Address validation
    if (this.options.validateAddresses) {
      const state = data.state || (data.address as Record<string, unknown>)?.state;
      if (state && typeof state === 'string' && state.length !== 2) {
        warnings.push({
          field: 'address.state',
          message: 'State should be a 2-letter code',
          value: state,
        });
      }

      const zip = data.zip || data.zipCode || (data.address as Record<string, unknown>)?.zip;
      if (zip && !/^\d{5}(-\d{4})?$/.test(String(zip))) {
        warnings.push({
          field: 'address.zip',
          message: 'Invalid ZIP code format',
          value: zip,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  transform(source: SourceRecord): TargetRecord {
    const data = source.data;

    const voter: VoterRecord = {
      id: this.generateVoterId(source),
      firstName: String(data.firstName || data.first_name || ''),
      lastName: String(data.lastName || data.last_name || ''),
      dateOfBirth: String(data.dateOfBirth || data.date_of_birth || data.dob || ''),
      address: {
        street: String(data.street || (data.address as Record<string, unknown>)?.street || ''),
        city: String(data.city || (data.address as Record<string, unknown>)?.city || ''),
        state: String(data.state || (data.address as Record<string, unknown>)?.state || ''),
        zip: String(data.zip || data.zipCode || (data.address as Record<string, unknown>)?.zip || ''),
      },
      registrationDate: String(data.registrationDate || data.registration_date || new Date().toISOString()),
      party: data.party ? String(data.party) : undefined,
      status: this.normalizeStatus(data.status),
      precinct: data.precinct ? String(data.precinct) : undefined,
    };

    // Encrypt sensitive data
    const encrypted = this.encryptSensitiveData(voter);

    return {
      id: voter.id,
      sourceId: source.id,
      data: encrypted as Record<string, unknown>,
    };
  }

  anonymize(voter: VoterRecord): AnonymizedVoter {
    const age = this.calculateAge(voter.dateOfBirth);

    return {
      id: voter.id,
      hashedId: this.hashData(voter.id),
      ageRange: this.getAgeRange(age),
      region: voter.address.state + '-' + voter.address.zip.substring(0, 3),
      registrationYear: new Date(voter.registrationDate).getFullYear(),
      party: voter.party,
      status: voter.status,
    };
  }

  private generateVoterId(source: SourceRecord): string {
    const data = source.data;
    const components = [
      data.firstName || data.first_name,
      data.lastName || data.last_name,
      data.dateOfBirth || data.date_of_birth || data.dob,
      data.state,
    ]
      .filter(Boolean)
      .join(':');

    return `voter_${this.hashData(components).substring(0, 16)}`;
  }

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  private getAgeRange(age: number): string {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }

  private normalizeStatus(status: unknown): 'active' | 'inactive' | 'pending' {
    if (!status) return 'active';

    const s = String(status).toLowerCase();
    if (s.includes('inactive') || s.includes('cancelled')) return 'inactive';
    if (s.includes('pending')) return 'pending';
    return 'active';
  }

  private encryptSensitiveData(voter: VoterRecord): VoterRecord & { encrypted: boolean } {
    // In production, would use proper encryption
    // Here we just hash sensitive fields for demonstration
    return {
      ...voter,
      firstName: this.hashData(voter.firstName).substring(0, 8),
      lastName: this.hashData(voter.lastName).substring(0, 8),
      dateOfBirth: `****-**-${voter.dateOfBirth.split('-').pop() || '**'}`,
      address: {
        ...voter.address,
        street: '***',
      },
      encrypted: true,
    };
  }
}

export function createVoterImporter(options: VoterImporterOptions): VoterRegistryImporter {
  return new VoterRegistryImporter(options);
}
