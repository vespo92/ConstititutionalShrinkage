// Main client
export { Constitutional, Constitutional as default } from './client';

// Types - Common
export type {
  ConstitutionalConfig,
  PaginatedResponse,
  SingleResponse,
  ListParams,
  ApiError,
} from './types/common.types';

// Types - Bills
export type {
  Bill,
  BillStatus,
  BillListParams,
  BillVersion,
  BillDiff,
  BillDiffParams,
  Amendment,
} from './types/bills.types';

// Types - Votes
export type {
  VoteSession,
  VoteSessionStatus,
  VoteTally,
  VoteSessionListParams,
  DetailedTally,
  VotingStatistics,
} from './types/votes.types';

// Types - Regions
export type {
  Region,
  RegionType,
  RegionMetrics,
  RegionListParams,
  DetailedRegionMetrics,
  RegionMetricsParams,
  Leaderboard,
} from './types/regions.types';

// Types - Metrics
export type {
  PlatformOverview,
  TBLMetrics,
  GovernanceMetrics,
  ComparisonResult,
} from './resources/metrics';

// Types - Search
export type {
  BillSearchResult,
  RegionSearchResult,
  SearchMeta,
  SearchResponse,
  Suggestion,
} from './resources/search';

// Types - Webhooks
export type {
  WebhookEvent,
  Webhook,
  WebhookDelivery,
  WebhookEventInfo,
} from './resources/webhooks';

// Error classes
export {
  ConstitutionalError,
  RateLimitError,
  AuthenticationError,
  NotFoundError,
} from './types/common.types';

// Error utilities
export {
  isConstitutionalError,
  isRateLimitError,
  isAuthenticationError,
  isNotFoundError,
  getErrorMessage,
  formatRateLimitMessage,
} from './utils/errors';

// Pagination utilities
export { paginate, collectAll, createPaginatedList } from './utils/pagination';

// Resources (for advanced use)
export { BillsResource } from './resources/bills';
export { VotesResource } from './resources/votes';
export { RegionsResource } from './resources/regions';
export { MetricsResource } from './resources/metrics';
export { SearchResource } from './resources/search';
export { WebhooksResource } from './resources/webhooks';
