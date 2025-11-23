/**
 * AI Service - Main Entry Point
 *
 * AI/ML Analysis Services for Constitutional Shrinkage platform.
 * Provides bill analysis, summarization, compliance checking,
 * impact prediction, and conversational AI capabilities.
 */

import { buildApp } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    const server = await buildApp();

    await server.listen({ port: PORT, host: HOST });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║            AI/ML Analysis Service                         ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Status:     Running                                      ║
    ║  Port:       ${PORT}                                          ║
    ║  Docs:       http://localhost:${PORT}/docs                    ║
    ║  Health:     http://localhost:${PORT}/health                  ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Endpoints:                                               ║
    ║  - POST /ai/analyze/bill       Full bill analysis         ║
    ║  - POST /ai/summarize          Summarize text             ║
    ║  - POST /ai/compliance/check   Constitutional check       ║
    ║  - POST /ai/predict/impact     TBL impact prediction      ║
    ║  - POST /ai/chat               Conversational AI          ║
    ║  - POST /ai/search/semantic    Semantic search            ║
    ╚═══════════════════════════════════════════════════════════╝
    `);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        await server.close();
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to start AI service:', err);
    process.exit(1);
  }
}

start();

// Export for testing
export { buildApp };
