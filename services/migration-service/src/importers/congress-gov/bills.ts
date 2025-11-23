import {
  createCongressGovClient,
  CongressGovClient,
  CongressBill,
  createBillTransformer,
} from '@constitutional-shrinkage/data-connectors';
import { SourceRecord, TargetRecord } from '../../types/index.js';

export interface BillImporterOptions {
  apiKey: string;
  congress?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export class CongressBillImporter {
  private client: CongressGovClient;
  private transformer = createBillTransformer();
  private options: BillImporterOptions;

  constructor(options: BillImporterOptions) {
    this.options = options;
    this.client = createCongressGovClient({
      apiKey: options.apiKey,
      requestsPerSecond: 5,
    });
  }

  async *extract(): AsyncGenerator<SourceRecord> {
    const iterator = this.client.iterateBills({
      congress: this.options.congress,
      type: this.options.type as 'hr' | 's' | undefined,
      fromDateTime: this.options.fromDate,
      toDateTime: this.options.toDate,
      limit: this.options.limit,
    });

    for await (const bill of iterator) {
      yield {
        id: `${bill.congress}-${bill.type}-${bill.number}`,
        data: bill as unknown as Record<string, unknown>,
        metadata: {
          source: 'congress.gov',
          extractedAt: new Date().toISOString(),
        },
      };
    }
  }

  transform(source: SourceRecord): TargetRecord {
    const bill = source.data as unknown as CongressBill;
    const transformed = this.transformer.transformCongressBill(bill);

    return {
      id: transformed.id,
      sourceId: source.id,
      data: transformed as unknown as Record<string, unknown>,
    };
  }

  async getEstimatedCount(): Promise<number> {
    const response = await this.client.getBills({
      congress: this.options.congress,
      type: this.options.type as 'hr' | 's' | undefined,
      limit: 1,
    });
    return response.pagination.count;
  }
}

export function createCongressBillImporter(options: BillImporterOptions): CongressBillImporter {
  return new CongressBillImporter(options);
}
