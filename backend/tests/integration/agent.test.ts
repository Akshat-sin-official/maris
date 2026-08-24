// Mocks must be declared at the absolute top of the file to prevent circular hoisting issues
jest.mock('../../src/audit/AuditLog.model');
jest.mock('../../src/observations/Observation.model');
jest.mock('../../src/alerts/Alert.model');
jest.mock('../../src/pfz/PFZ.model');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { Observation } from '../../src/observations/Observation.model';
import { Alert } from '../../src/alerts/Alert.model';
import { PFZ } from '../../src/pfz/PFZ.model';

describe('Agentic AI System Integration Tests', () => {
  const mockOrgId = '660d3d5d787be21a48c56c22';
  const mockUserId = '660d3d5d787be21a48c56c33';
  const mockToken = jwt.sign(
    { userId: mockUserId, role: 'FIELD_OFFICER', orgId: mockOrgId, email: 'officer@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/ai/query', () => {
    it('should deny query request if unauthenticated (401)', async () => {
      const response = await request(app)
        .post('/api/v1/ai/query')
        .send({ query: 'Show active PFZ grids near coordinates' });

      expect(response.status).toBe(401);
    });

    it('should reject with 400 if query is missing or empty', async () => {
      const response = await request(app)
        .post('/api/v1/ai/query')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ query: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('query string is required');
    });

    it('should orchestrate query, run all 8 sub-agents, and return populated trace and data', async () => {
      // Mock Mongoose model methods to resolve to empty arrays so tools fall back gracefully
      (Observation.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      (Alert.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      (PFZ.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const response = await request(app)
        .post('/api/v1/ai/query')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          query: 'Are there any unauthorized vessels or storms near the boundary?',
          location: { type: 'Point', coordinates: [80.3, 12.4] },
          language: 'en',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const data = response.body.data;
      expect(data.answer).toBeDefined();
      expect(data.intent).toBe('VESSEL_SIGHTING_AND_SECURITY');
      expect(data.risk.level).toBeDefined();
      expect(data.risk.score).toBeDefined();
      expect(data.confidence).toBeGreaterThanOrEqual(0.0);
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(Array.isArray(data.explanation)).toBe(true);
      expect(Array.isArray(data.sources)).toBe(true);
      expect(data.mapContext.center).toEqual([80.3, 12.4]);

      // Assert agent execution trace contains exactly 8 sub-agent logs
      expect(data.agentTrace.length).toBe(8);
      const agentNames = [
        'Planner Agent',
        'Marine Data Agent',
        'Weather/Hazard Agent',
        'Ocean Intelligence Agent',
        'Geospatial Agent',
        'PFZ Agent',
        'Risk/Reasoning Agent',
        'Explanation Agent',
      ];
      
      agentNames.forEach((name) => {
        const trace = data.agentTrace.find((t: any) => t.agent === name);
        expect(trace).toBeDefined();
        expect(trace.status).toBe('COMPLETED');
      });

      // Verify that explanation and answer do NOT contain forensic/criminal jargon
      const forbiddenWords = ['criminal network', 'illegal activity proven', 'legal conclusion'];
      const combinedText = (data.answer + ' ' + data.explanation.join(' ')).toLowerCase();
      
      forbiddenWords.forEach((word) => {
        expect(combinedText).not.toContain(word);
      });
    });
  });
});
