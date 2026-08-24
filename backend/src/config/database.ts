import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  const options = {
    autoIndex: true,
    serverSelectionTimeoutMS: env.NODE_ENV === 'test' ? 1000 : 5000,
  };

  mongoose.connection.on('connected', () => {
    logger.info(`Database connected successfully to ${env.MONGO_URI}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Database connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Database connection lost');
  });

  try {
    await mongoose.connect(env.MONGO_URI, options);
  } catch (error) {
    logger.error('Failed to connect to database', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error during database disconnection', error);
    throw error;
  }
}
