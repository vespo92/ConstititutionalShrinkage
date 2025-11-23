/**
 * Basic usage examples for the Constitutional SDK
 */
import { Constitutional } from '../src';

async function main() {
  // Initialize the client
  const client = new Constitutional({
    apiKey: process.env.CONSTITUTIONAL_API_KEY || 'your-api-key',
    // Optional: use a regional endpoint for lower latency
    // region: 'us-west',
  });

  // ==========================================
  // Bills API
  // ==========================================

  // List bills with filtering
  console.log('\n--- Bills ---');
  const bills = await client.bills.list({
    status: 'voting',
    category: 'infrastructure',
    limit: 5,
  });
  console.log(`Found ${bills.data.length} voting bills`);

  // Get a specific bill
  if (bills.data.length > 0) {
    const bill = await client.bills.get(bills.data[0].id);
    console.log(`Bill: ${bill.title}`);
    console.log(`Status: ${bill.status}`);
    console.log(`Version: ${bill.version}`);
  }

  // Iterate through all bills (pagination handled automatically)
  console.log('\nIterating through all voting bills:');
  let count = 0;
  for await (const bill of client.bills.listAll({ status: 'voting' })) {
    console.log(`- ${bill.title}`);
    count++;
    if (count >= 3) break; // Limit for demo
  }

  // ==========================================
  // Votes API
  // ==========================================

  console.log('\n--- Votes ---');
  const sessions = await client.votes.listSessions({ status: 'active' });
  console.log(`Found ${sessions.data.length} active voting sessions`);

  if (sessions.data.length > 0) {
    const tally = await client.votes.getTally(sessions.data[0].id);
    console.log(`\nTally for session ${tally.sessionId}:`);
    console.log(`  Yes: ${tally.overall.yes}`);
    console.log(`  No: ${tally.overall.no}`);
    console.log(`  Abstain: ${tally.overall.abstain}`);
    console.log(`  Participation: ${tally.participationRate}%`);
  }

  // ==========================================
  // Regions API
  // ==========================================

  console.log('\n--- Regions ---');
  const regions = await client.regions.list({ type: 'state', limit: 5 });
  console.log(`Found ${regions.data.length} states`);

  if (regions.data.length > 0) {
    const metrics = await client.regions.getMetrics(regions.data[0].id, {
      period: 'last_30_days',
    });
    console.log(`\nMetrics for ${metrics.regionName}:`);
    console.log(`  TBL Score: ${metrics.tbl.overall}`);
    console.log(`  Participation: ${metrics.participation.rate}%`);
  }

  // ==========================================
  // Metrics API
  // ==========================================

  console.log('\n--- Platform Metrics ---');
  const overview = await client.metrics.getOverview();
  console.log(`Total Citizens: ${overview.platform.totalCitizens.toLocaleString()}`);
  console.log(`Active Bills: ${overview.platform.activeBills}`);
  console.log(`Average Participation: ${overview.participation.averageRate}%`);

  const tbl = await client.metrics.getTBL();
  console.log(`\nTBL Scores:`);
  console.log(`  Overall: ${tbl.scores.overall}`);
  console.log(`  People: ${tbl.scores.people.score}`);
  console.log(`  Planet: ${tbl.scores.planet.score}`);
  console.log(`  Profit: ${tbl.scores.profit.score}`);

  // ==========================================
  // Search API
  // ==========================================

  console.log('\n--- Search ---');
  const searchResults = await client.search.bills({
    query: 'renewable energy',
    limit: 3,
  });
  console.log(`Found ${searchResults.meta.totalResults} results in ${searchResults.meta.searchTime}s`);
  for (const result of searchResults.data) {
    console.log(`- ${result.title} (score: ${result.relevanceScore})`);
  }

  console.log('\nDone!');
}

// Run the example
main().catch(console.error);
