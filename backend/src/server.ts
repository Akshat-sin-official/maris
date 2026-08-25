import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeSocket } from './realtime/socket';

const server = http.createServer(app);

// Initialize WebSockets foundation
initializeSocket(server);

// Start server and initialize components
async function startServer() {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      logger.info('===========================================================');
      logger.info(`🌊 MARIS Marine Intelligence Platform [${env.NODE_ENV.toUpperCase()}]`);
      logger.info(`🌐 HTTP Server : http://localhost:${env.PORT}/api/v1`);
      logger.info('⚡ Socket.IO   : Realtime Engine Active');
      logger.info('🗄️  Database    : MongoDB Atlas Connected');
      logger.info('===========================================================');
    });
  } catch (error) {
    logger.error('CRITICAL: Failed to start MARIS backend server', error);
    process.exit(1);
  }
}

// Graceful Shutdown Handler
function gracefulShutdown(signal: string) {
  logger.info(`Received signal ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed successfully');
    try {
      await disconnectDatabase();
      logger.info('Database connections closed cleanly');
      process.exit(0);
    } catch (err) {
      logger.error('Failed to close database connections during shutdown', err);
      process.exit(1);
    }
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection detected at:', promise, 'reason:', reason);
});

startServer();
export { server };
