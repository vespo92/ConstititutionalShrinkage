import { createApp } from './app.js';
import { setupJobs } from './jobs/index.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = await createApp();

  // Setup scheduled jobs
  setupJobs();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Analytics service running at http://${HOST}:${PORT}`);
    console.log('WebSocket endpoint: ws://localhost:${PORT}/analytics/stream');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
