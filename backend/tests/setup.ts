import dotenv from 'dotenv';

// Override environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maris_test';
process.env.JWT_SECRET = 'test_jwt_signing_secret_key_minimum_length';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error'; // Keep test outputs clean

dotenv.config();
