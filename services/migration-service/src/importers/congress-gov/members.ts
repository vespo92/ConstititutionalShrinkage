import {
  createCongressGovClient,
  CongressGovClient,
  CongressMember,
  createPersonTransformer,
} from '@constitutional-shrinkage/data-connectors';
import { SourceRecord, TargetRecord } from '../../types/index.js';

export interface MemberImporterOptions {
  apiKey: string;
  congress?: number;
  chamber?: 'house' | 'senate';
  currentOnly?: boolean;
}

export class CongressMemberImporter {
  private client: CongressGovClient;
  private transformer = createPersonTransformer();
  private options: MemberImporterOptions;

  constructor(options: MemberImporterOptions) {
    this.options = options;
    this.client = createCongressGovClient({
      apiKey: options.apiKey,
      requestsPerSecond: 5,
    });
  }

  async *extract(): AsyncGenerator<SourceRecord> {
    const iterator = this.client.iterateMembers({
      congress: this.options.congress,
      chamber: this.options.chamber,
      currentMember: this.options.currentOnly,
    });

    for await (const member of iterator) {
      yield {
        id: member.bioguideId,
        data: member as unknown as Record<string, unknown>,
        metadata: {
          source: 'congress.gov',
          extractedAt: new Date().toISOString(),
        },
      };
    }
  }

  transform(source: SourceRecord): TargetRecord {
    const member = source.data as unknown as CongressMember;
    const transformed = this.transformer.transformCongressMember(member);

    return {
      id: transformed.id,
      sourceId: source.id,
      data: transformed as unknown as Record<string, unknown>,
    };
  }

  async getEstimatedCount(): Promise<number> {
    const response = await this.client.getMembers({
      congress: this.options.congress,
      chamber: this.options.chamber,
      limit: 1,
    });
    return response.pagination.count;
  }
}

export function createCongressMemberImporter(options: MemberImporterOptions): CongressMemberImporter {
  return new CongressMemberImporter(options);
}
