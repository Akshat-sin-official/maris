"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("./logger");
async function connectDatabase() {
    const options = {
        autoIndex: true,
        serverSelectionTimeoutMS: env_1.env.NODE_ENV === 'test' ? 1000 : 5000,
    };
    mongoose_1.default.connection.on('connected', () => {
        logger_1.logger.info(`Database connected successfully to ${env_1.env.MONGO_URI}`);
    });
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.logger.error(`Database connection error: ${err}`);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.logger.warn('Database connection lost');
    });
    try {
        await mongoose_1.default.connect(env_1.env.MONGO_URI, options);
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database', error);
        throw error;
    }
}
async function disconnectDatabase() {
    try {
        await mongoose_1.default.disconnect();
        logger_1.logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Error during database disconnection', error);
        throw error;
    }
}
