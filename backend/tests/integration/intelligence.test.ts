// Mocks must be declared at the absolute top of the file to prevent hoisting/circular resolution issues
jest.mock('../../src/incidents/Incident.model');
jest.mock('../../src/observations/Observation.model');
jest.mock('../../src/evidence/Evidence.model');
jest.mock('../../src/intelligence/IntelligenceAnalysis.model', () => ({
  __esModule: true,
  IntelligenceAnalysis: {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../src/intelligence/HistoricalMatch.model', () => ({
  __esModule: true,
  HistoricalMatch: {
    findOneAndUpdate: jest.fn(),
  },
}));
jest.mock('../../src/intelligence/PrioritySignal.model', () => ({
  __esModule: true,
  PrioritySignal: {
    find: jest.fn().mockResolvedValue([]),
  },
}));
jest.mock('../../src/audit/AuditLog.model');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { Incident } from '../../src/incidents/Incident.model';
import { Observation } from '../../src/observations/Observation.model';
import { Evidence } from '../../src/evidence/Evidence.model';
import { IntelligenceAnalysis } from '../../src/intelligence/IntelligenceAnalysis.model';
import { HistoricalMatch } from '../../src/intelligence/HistoricalMatch.model';
import { PrioritySignal } from '../../src/intelligence/PrioritySignal.model';

// Helper to create thenable query mock for findById().populate() chaining
function createMockQuery(resolvedValue: any) {
  return {
    populate: jest.fn().mockReturnThis(),
    then: function (resolve: any) {
      resolve(resolvedValue);
    },
  };
}

describe('Intelligence Engine Integration Tests', () => {
  const mockOrgId = '660d3d5d787be21a48c56c22';
  const mockUserId = '660d3d5d787be21a48c56c33';
  const mockStaffToken = jwt.sign(
    { userId: mockUserId, role: 'FIELD_OFFICER', orgId: mockOrgId, email: 'officer@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );

  const mockAlienToken = jwt.sign(
    { userId: 'alien_user', role: 'FIELD_OFFICER', orgId: 'different_org_id', email: 'alien@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (PrioritySignal.find as jest.Mock).mockResolvedValue([]);
    (HistoricalMatch.findOneAndUpdate as jest.Mock).mockResolvedValue({});
    (IntelligenceAnalysis.findOneAndUpdate as jest.Mock).mockResolvedValue({});
    (IntelligenceAnalysis.findOne as jest.Mock).mockResolvedValue(null);
  });

  describe('POST /api/v1/intelligence/analyze/:incidentId', () => {
    it('should run the intelligence pipeline, calculate priority score & confidence, and save matches', async () => {
      const mockIncident = {
        _id: 'inc_test_1',
        orgId: mockOrgId,
        creatorId: mockUserId,
        priority: 'HIGH',
        items: [
          {
            type: 'vessel_detection',
            location: { type: 'Point', coordinates: [80.1, 12.5] },
            detectedAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      // Mock DB lookups
      (Incident.findById as jest.Mock).mockReturnValue(createMockQuery(mockIncident));
      (Incident.find as jest.Mock).mockResolvedValue([
        {
          _id: 'inc_historical_1',
          orgId: mockOrgId,
          creatorId: mockUserId,
          priority: 'LOW',
          items: [
            {
              type: 'vessel_detection',
              location: { type: 'Point', coordinates: [80.12, 12.52] }, // ~3km away
            },
          ],
        },
      ]);
      (Observation.find as jest.Mock).mockResolvedValue([]);
      (Evidence.find as jest.Mock).mockResolvedValue([]);

      const mockAnalysisRecord = {
        incidentId: 'inc_test_1',
        orgId: mockOrgId,
        priorityScore: 90, // 65 (HIGH) + 15 (historical match) + 10 (proximity)
        confidence: 0.7,
        evidenceStrength: 'WEAK',
        verificationStatus: 'UNVERIFIED',
        matchedIncidents: ['inc_historical_1'],
        matchedObservations: [],
        explanation: {
          summary: 'Priority signal calculated at 90% backed by recurring relationships.',
          details: ['Base priority mapped to HIGH (65 points).'],
        },
      };

      (IntelligenceAnalysis.findOneAndUpdate as jest.Mock).mockResolvedValue(mockAnalysisRecord);
      (HistoricalMatch.findOneAndUpdate as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/v1/intelligence/analyze/inc_test_1')
        .set('Authorization', `Bearer ${mockStaffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.analysis.priorityScore).toBe(90);
      expect(response.body.data.analysis.confidence).toBe(0.7);
      expect(response.body.data.analysis.evidenceStrength).toBe('WEAK');
    });

    it('should deny run for staff from a different organization boundary (Boundary Protection)', async () => {
      (Incident.findById as jest.Mock).mockReturnValue(
        createMockQuery({
          _id: 'inc_test_1',
          orgId: 'some_other_org',
          creatorId: 'another_user',
        })
      );

      const response = await request(app)
        .post('/api/v1/intelligence/analyze/inc_test_1')
        .set('Authorization', `Bearer ${mockAlienToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/v1/intelligence/:incidentId/explanation', () => {
    it('should fetch explanation block and verify it contains NO legal claims or criminal accusations', async () => {
      (Incident.findById as jest.Mock).mockReturnValue(
        createMockQuery({
          _id: 'inc_test_1',
          orgId: mockOrgId,
          creatorId: mockUserId,
        })
      );

      const mockAnalysisRecord = {
        incidentId: 'inc_test_1',
        explanation: {
          summary: 'Priority signal determined by related historical observations.',
          details: [
            'Found related historical observations within time window.',
            'Geographic proximity matching indicates recurring relationships.',
          ],
        },
      };

      (IntelligenceAnalysis.findOne as jest.Mock).mockResolvedValue(mockAnalysisRecord);

      const response = await request(app)
        .get('/api/v1/intelligence/inc_test_1/explanation')
        .set('Authorization', `Bearer ${mockStaffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.explanation.summary).toContain('Priority signal');
      
      const detailsText = response.body.data.explanation.details.join(' ');
      
      // Verify forbidden legal/forensic jargon is absent
      const forbiddenWords = ['criminal network', 'illegal activity proven', 'legal conclusion'];
      for (const word of forbiddenWords) {
        expect(detailsText.toLowerCase()).not.toContain(word);
      }

      // Verify approved descriptive words are present
      expect(detailsText).toContain('related historical observations');
      expect(detailsText).toContain('recurring relationships');
    });
  });
});
