import request from 'supertest';
import { app } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/config/database';

describe('API Foundation Integration Tests', () => {
  beforeAll(async () => {
    // Attempt database connection for integration tests
    try {
      await connectDatabase();
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed during test startup. Database health will report down.');
    }
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 and verify services state', async () => {
      const response = await request(app).get('/api/v1/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.services.api).toHaveProperty('status', 'up');
      expect(response.body.services.database).toHaveProperty('status');
    });
  });

  describe('GET /api/v1/invalid-route-error', () => {
    it('should return 404 error response', async () => {
      const response = await request(app).get('/api/v1/invalid-route-error');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('does not exist');
    });
  });
});
