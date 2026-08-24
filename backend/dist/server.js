"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const socket_1 = require("./realtime/socket");
const server = http_1.default.createServer(app_1.app);
exports.server = server;
// Initialize WebSockets foundation
(0, socket_1.initializeSocket)(server);
async function startServer() {
    try {
        await (0, database_1.connectDatabase)();
        server.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`🚀 MARIS Server running on port ${env_1.env.PORT} in [${env_1.env.NODE_ENV}] mode`);
        });
    }
    catch (error) {
        logger_1.logger.error('CRITICAL: Failed to start MARIS backend server', error);
        process.exit(1);
    }
}
// Graceful Shutdown Handler
function gracefulShutdown(signal) {
    logger_1.logger.info(`Received signal ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
        logger_1.logger.info('HTTP server closed successfully');
        try {
            await (0, database_1.disconnectDatabase)();
            logger_1.logger.info('Database connections closed cleanly');
            process.exit(0);
        }
        catch (err) {
            logger_1.logger.error('Failed to close database connections during shutdown', err);
            process.exit(1);
        }
    });
    // Force exit after timeout
    setTimeout(() => {
        logger_1.logger.error('Graceful shutdown timed out. Forcing termination.');
        process.exit(1);
    }, 10000);
}
// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection detected at:', promise, 'reason:', reason);
});
startServer();
