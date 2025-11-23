/**
 * Simulation Service Entry Point
 *
 * Policy simulation and modeling service for Constitutional Shrinkage.
 * Provides Monte Carlo analysis, sensitivity testing, and policy comparison.
 */

import { createApp } from './app';

const PORT = process.env.PORT || 3006;
const HOST = process.env.HOST || '0.0.0.0';

async function main(): Promise<void> {
  console.log('Starting Simulation Service...');

  const app = createApp();

  app.listen(Number(PORT), HOST, () => {
    console.log(`Simulation Service running at http://${HOST}:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /                          - API info');
    console.log('  GET  /health                    - Health check');
    console.log('  POST /simulations               - Create simulation');
    console.log('  GET  /simulations               - List simulations');
    console.log('  GET  /simulations/:id           - Get simulation');
    console.log('  POST /simulations/:id/run       - Run simulation');
    console.log('  GET  /simulations/:id/results   - Get results');
    console.log('  POST /scenarios                 - Create scenario');
    console.log('  GET  /scenarios                 - List scenarios');
    console.log('  GET  /scenarios/templates       - Get templates');
    console.log('  POST /analyze/sensitivity       - Sensitivity analysis');
    console.log('  POST /analyze/monte-carlo       - Monte Carlo analysis');
    console.log('  POST /analyze/compare           - Compare policies');
    console.log('  POST /sandbox/quick             - Quick simulation');
    console.log('  GET  /sandbox/presets           - Get presets');
  });
}

main().catch(error => {
  console.error('Failed to start Simulation Service:', error);
  process.exit(1);
});
