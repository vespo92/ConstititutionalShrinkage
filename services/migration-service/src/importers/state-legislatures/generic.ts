import {
  createOpenStatesClient,
  OpenStatesClient,
  StateBill,
  StateLegislator,
  createBillTransformer,
  createPersonTransformer,
} from '@constitutional-shrinkage/data-connectors';
import { SourceRecord, TargetRecord } from '../../types/index.js';

export interface StateImporterOptions {
  apiKey: string;
  state: string;
  session?: string;
  dataTypes: Array<'bills' | 'legislators'>;
  recentDays?: number;
}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

export class StateImporter {
  private client: OpenStatesClient;
  private billTransformer = createBillTransformer();
  private personTransformer = createPersonTransformer();
  private options: StateImporterOptions;
  private stateName: string;

  constructor(options: StateImporterOptions) {
    this.options = options;
    this.stateName = STATE_NAMES[options.state.toUpperCase()] ?? options.state;
    this.client = createOpenStatesClient({
      apiKey: options.apiKey,
      requestsPerSecond: 3,
    });
  }

  async *extractBills(): AsyncGenerator<SourceRecord> {
    const jurisdiction = `ocd-jurisdiction/country:us/state:${this.options.state.toLowerCase()}/government`;

    if (this.options.recentDays) {
      const bills = await this.client.getRecentBills(
        jurisdiction,
        this.options.recentDays
      );
      for (const bill of bills) {
        yield this.billToSourceRecord(bill);
      }
    } else {
      const iterator = this.client.iterateBills({
        jurisdiction,
        session: this.options.session,
      });
      for await (const bill of iterator) {
        yield this.billToSourceRecord(bill);
      }
    }
  }

  async *extractLegislators(): AsyncGenerator<SourceRecord> {
    const jurisdiction = `ocd-jurisdiction/country:us/state:${this.options.state.toLowerCase()}/government`;

    const iterator = this.client.iterateLegislators({ jurisdiction });
    for await (const legislator of iterator) {
      yield {
        id: legislator.id,
        data: legislator as unknown as Record<string, unknown>,
        metadata: {
          source: 'openstates',
          state: this.options.state,
          type: 'legislator',
          extractedAt: new Date().toISOString(),
        },
      };
    }
  }

  async *extract(): AsyncGenerator<SourceRecord> {
    if (this.options.dataTypes.includes('bills')) {
      yield* this.extractBills();
    }
    if (this.options.dataTypes.includes('legislators')) {
      yield* this.extractLegislators();
    }
  }

  private billToSourceRecord(bill: StateBill): SourceRecord {
    return {
      id: bill.id,
      data: bill as unknown as Record<string, unknown>,
      metadata: {
        source: 'openstates',
        state: this.options.state,
        type: 'bill',
        extractedAt: new Date().toISOString(),
      },
    };
  }

  transform(source: SourceRecord): TargetRecord {
    const type = source.metadata?.type as string;

    if (type === 'bill') {
      const bill = source.data as unknown as StateBill;
      const transformed = this.billTransformer.transformStateBill(
        bill,
        this.options.state,
        this.stateName
      );
      return {
        id: transformed.id,
        sourceId: source.id,
        data: transformed as unknown as Record<string, unknown>,
      };
    }

    if (type === 'legislator') {
      const legislator = source.data as unknown as StateLegislator;
      const transformed = this.personTransformer.transformStateLegislator(
        legislator,
        this.options.state,
        this.stateName
      );
      return {
        id: transformed.id,
        sourceId: source.id,
        data: transformed as unknown as Record<string, unknown>,
      };
    }

    throw new Error(`Unknown record type: ${type}`);
  }
}

export function createStateImporter(options: StateImporterOptions): StateImporter {
  return new StateImporter(options);
}
