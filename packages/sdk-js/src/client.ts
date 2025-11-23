import { ConstitutionalConfig } from './types/common.types';
import { HttpClient } from './utils/request';
import { BillsResource } from './resources/bills';
import { VotesResource } from './resources/votes';
import { RegionsResource } from './resources/regions';
import { MetricsResource } from './resources/metrics';
import { SearchResource } from './resources/search';
import { WebhooksResource } from './resources/webhooks';

/**
 * Constitutional Platform SDK Client
 *
 * @example
 * ```typescript
 * import { Constitutional } from '@constitutional/sdk';
 *
 * const client = new Constitutional({
 *   apiKey: process.env.CONSTITUTIONAL_API_KEY,
 * });
 *
 * // List bills
 * const bills = await client.bills.list({ status: 'voting' });
 *
 * // Get a specific bill
 * const bill = await client.bills.get('bill_abc123');
 *
 * // Iterate through all bills
 * for await (const bill of client.bills.listAll({ status: 'voting' })) {
 *   console.log(bill.title);
 * }
 * ```
 */
export class Constitutional {
  /**
   * Bills API - Access legislation data
   */
  readonly bills: BillsResource;

  /**
   * Votes API - Access voting sessions and results
   */
  readonly votes: VotesResource;

  /**
   * Regions API - Access regional data and metrics
   */
  readonly regions: RegionsResource;

  /**
   * Metrics API - Access platform-wide metrics and TBL scores
   */
  readonly metrics: MetricsResource;

  /**
   * Search API - Full-text search across bills and regions
   */
  readonly search: SearchResource;

  /**
   * Webhooks API - Manage webhook subscriptions
   */
  readonly webhooks: WebhooksResource;

  private readonly client: HttpClient;

  /**
   * Create a new Constitutional SDK client
   *
   * @param config - Client configuration
   * @param config.apiKey - Your API key (required)
   * @param config.baseUrl - Custom API base URL (optional)
   * @param config.region - Regional endpoint to use (optional)
   * @param config.timeout - Request timeout in milliseconds (default: 30000)
   * @param config.maxRetries - Maximum number of retries (default: 3)
   */
  constructor(config: ConstitutionalConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get one at https://developers.constitutional.io');
    }

    this.client = new HttpClient(config);

    // Initialize resources
    this.bills = new BillsResource(this.client);
    this.votes = new VotesResource(this.client);
    this.regions = new RegionsResource(this.client);
    this.metrics = new MetricsResource(this.client);
    this.search = new SearchResource(this.client);
    this.webhooks = new WebhooksResource(this.client);
  }
}

export default Constitutional;
