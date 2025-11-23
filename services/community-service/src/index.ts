import { createApp } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3004;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = await createApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Community Service running at http://${HOST}:${PORT}`);
    console.log(`📚 API Documentation at http://${HOST}:${PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
