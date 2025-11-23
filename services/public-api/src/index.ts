import app from './app';

const PORT = process.env.PORT || 3100;

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`
========================================
  Constitutional Public API Gateway
========================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  Health: http://localhost:${PORT}/health
  API: http://localhost:${PORT}/api
  Docs: http://localhost:${PORT}/api/v1
========================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

start();
