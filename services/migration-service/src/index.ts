export * from './types/index.js';
export * from './services/orchestrator.js';
export * from './services/transformer.js';
export * from './services/validator.js';
export * from './services/reconciler.js';
export * from './services/rollback.js';
export * from './services/progress.js';
export * from './lib/rate-limiter.js';
export * from './lib/retry.js';
export * from './lib/checkpointing.js';
export * from './importers/congress-gov/bills.js';
export * from './importers/congress-gov/members.js';
export * from './importers/congress-gov/votes.js';
export * from './importers/census/geography.js';
export * from './importers/state-legislatures/generic.js';
export * from './importers/voter-registration/registry.js';
export { buildApp, startApp } from './app.js';

// Start server if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  import('./app.js').then(({ startApp }) => startApp());
}
