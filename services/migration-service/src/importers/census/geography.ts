import {
  createCensusClient,
  CensusClient,
  CensusGeography,
  createRegionTransformer,
} from '@constitutional-shrinkage/data-connectors';
import { SourceRecord, TargetRecord } from '../../types/index.js';

export interface GeoImporterOptions {
  apiKey: string;
  types: Array<'states' | 'counties' | 'districts' | 'tracts'>;
  stateFilter?: string[];
}

export class CensusGeoImporter {
  private client: CensusClient;
  private transformer = createRegionTransformer();
  private options: GeoImporterOptions;

  constructor(options: GeoImporterOptions) {
    this.options = options;
    this.client = createCensusClient({
      apiKey: options.apiKey,
      requestsPerSecond: 5,
    });
  }

  async *extract(): AsyncGenerator<SourceRecord> {
    if (this.options.types.includes('states')) {
      const states = await this.client.getStates();
      for (const state of states) {
        yield this.toSourceRecord(state);
      }
    }

    if (this.options.types.includes('counties')) {
      for await (const county of this.client.iterateAllCounties()) {
        if (this.shouldIncludeState(county.stateCode)) {
          yield this.toSourceRecord(county);
        }
      }
    }

    if (this.options.types.includes('districts')) {
      const currentCongress = 118; // Would be configurable
      const districts = await this.client.getCongressionalDistricts(currentCongress);
      for (const district of districts) {
        yield {
          id: district.districtId,
          data: district as unknown as Record<string, unknown>,
          metadata: {
            source: 'census',
            type: 'congressional_district',
            extractedAt: new Date().toISOString(),
          },
        };
      }
    }
  }

  private toSourceRecord(geo: CensusGeography): SourceRecord {
    return {
      id: geo.geoId,
      data: geo as unknown as Record<string, unknown>,
      metadata: {
        source: 'census',
        type: geo.type,
        extractedAt: new Date().toISOString(),
      },
    };
  }

  private shouldIncludeState(stateCode?: string): boolean {
    if (!this.options.stateFilter || this.options.stateFilter.length === 0) {
      return true;
    }
    return stateCode ? this.options.stateFilter.includes(stateCode) : false;
  }

  transform(source: SourceRecord): TargetRecord {
    const geo = source.data as unknown as CensusGeography;
    const transformed = this.transformer.transformCensusGeography(geo);

    return {
      id: transformed.id,
      sourceId: source.id,
      data: transformed as unknown as Record<string, unknown>,
    };
  }

  async getEstimatedCount(): Promise<number> {
    let count = 0;

    if (this.options.types.includes('states')) {
      count += 56; // 50 states + territories
    }
    if (this.options.types.includes('counties')) {
      count += 3143; // ~3143 counties
    }
    if (this.options.types.includes('districts')) {
      count += 435; // Congressional districts
    }

    return count;
  }
}

export function createCensusGeoImporter(options: GeoImporterOptions): CensusGeoImporter {
  return new CensusGeoImporter(options);
}
