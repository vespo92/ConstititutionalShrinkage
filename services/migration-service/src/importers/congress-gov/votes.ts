import {
  createCongressGovClient,
  CongressGovClient,
  CongressVote,
  createVoteTransformer,
} from '@constitutional-shrinkage/data-connectors';
import { SourceRecord, TargetRecord } from '../../types/index.js';

export interface VoteImporterOptions {
  apiKey: string;
  congress?: number;
  chamber?: 'house' | 'senate';
  limit?: number;
}

export class CongressVoteImporter {
  private client: CongressGovClient;
  private transformer = createVoteTransformer();
  private options: VoteImporterOptions;

  constructor(options: VoteImporterOptions) {
    this.options = options;
    this.client = createCongressGovClient({
      apiKey: options.apiKey,
      requestsPerSecond: 5,
    });
  }

  async *extract(): AsyncGenerator<SourceRecord> {
    let offset = 0;
    let hasMore = true;
    const limit = this.options.limit ?? 100;

    while (hasMore) {
      const response = await this.client.getVotes({
        congress: this.options.congress,
        chamber: this.options.chamber,
        limit,
        offset,
      });

      for (const vote of response.data) {
        yield {
          id: `${vote.congress}-${vote.chamber}-${vote.session}-${vote.rollNumber}`,
          data: vote as unknown as Record<string, unknown>,
          metadata: {
            source: 'congress.gov',
            extractedAt: new Date().toISOString(),
          },
        };
      }

      if (response.data.length < limit || !response.pagination.next) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }
  }

  transform(source: SourceRecord): TargetRecord {
    const vote = source.data as unknown as CongressVote;
    const transformed = this.transformer.transformCongressVote(vote);

    return {
      id: transformed.id,
      sourceId: source.id,
      data: transformed as unknown as Record<string, unknown>,
    };
  }

  async getEstimatedCount(): Promise<number> {
    const response = await this.client.getVotes({
      congress: this.options.congress,
      chamber: this.options.chamber,
      limit: 1,
    });
    return response.pagination.count;
  }
}

export function createCongressVoteImporter(options: VoteImporterOptions): CongressVoteImporter {
  return new CongressVoteImporter(options);
}
