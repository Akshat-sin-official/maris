import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { Incident } from '../../src/incidents/Incident.model';


// Mock mongoose models
jest.mock('../../src/incidents/Incident.model');
jest.mock('../../src/observations/Observation.model');
jest.mock('../../src/audit/AuditLog.model');

describe('Incident & Observation API Integration Tests', () => {
  const mockOrgId = '660d3d5d787be21a48c56c22';
  const mockUserId = '660d3d5d787be21a48c56c33';
  const mockStaffToken = jwt.sign(
    { userId: mockUserId, role: 'FIELD_OFFICER', orgId: mockOrgId, email: 'officer@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );
  
  const mockCitizenUserId = '660d3d5d787be21a48c56c44';
  const mockCitizenToken = jwt.sign(
    { userId: mockCitizenUserId, role: 'CITIZEN', orgId: null, email: 'citizen@email.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. Incident CRUD Tests
  // =========================================================================
  describe('Incident Endpoints', () => {
    describe('POST /api/v1/incidents', () => {
      it('should create a valid incident with RECEIVED status and CREATED timeline event', async () => {
        const mockCreatedIncident = {
          _id: 'mock_incident_id',
          title: 'Vessel Trespass',
          priority: 'HIGH',
          status: 'RECEIVED',
          creatorId: mockUserId,
          orgId: mockOrgId,
          items: [],
          timeline: [
            {
              eventType: 'INCIDENT_CREATED',
              actorId: mockUserId,
              message: 'Incident created by user: officer@org.com',
              timestamp: new Date(),
            },
          ],
        };

        (Incident.create as jest.Mock).mockResolvedValue(mockCreatedIncident);

        const response = await request(app)
          .post('/api/v1/incidents')
          .set('Authorization', `Bearer ${mockStaffToken}`)
          .send({
            title: 'Vessel Trespass',
            priority: 'HIGH',
            items: [],
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.incident.status).toBe('RECEIVED');
        expect(response.body.data.incident.timeline[0].eventType).toBe('INCIDENT_CREATED');
      });
    });

    describe('GET /api/v1/incidents', () => {
      it('should support pagination metadata and isolate queries to the users organization', async () => {
        const mockIncidents = [
          { _id: 'inc1', title: 'Case 1', orgId: mockOrgId },
          { _id: 'inc2', title: 'Case 2', orgId: mockOrgId },
        ];

        (Incident.countDocuments as jest.Mock).mockResolvedValue(2);
        (Incident.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue(mockIncidents),
                }),
              }),
            }),
          }),
        });

        const response = await request(app)
          .get('/api/v1/incidents?page=1&limit=5')
          .set('Authorization', `Bearer ${mockStaffToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.results).toBe(2);
        expect(response.body.metadata).toEqual({
          total: 2,
          page: 1,
          limit: 5,
          pages: 1,
        });
        
        // Enforce boundary filter: query must filter by orgId matching staff token orgId
        expect(Incident.find).toHaveBeenCalledWith(
          expect.objectContaining({
            orgId: new mongoose.Types.ObjectId(mockOrgId),
          })
        );
      });

      it('should isolate queries to creatorId for CITIZEN roles', async () => {
        (Incident.countDocuments as jest.Mock).mockResolvedValue(0);
        (Incident.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        });

        const response = await request(app)
          .get('/api/v1/incidents')
          .set('Authorization', `Bearer ${mockCitizenToken}`);

        expect(response.status).toBe(200);
        // Enforce boundary filter: citizen query must filter by creatorId matching citizen userId
        expect(Incident.find).toHaveBeenCalledWith(
          expect.objectContaining({
            creatorId: new mongoose.Types.ObjectId(mockCitizenUserId),
          })
        );
      });
    });

    describe('PATCH /api/v1/incidents/:id', () => {
      it('should append a STATUS_CHANGE timeline log when changing status', async () => {
        const mockSave = jest.fn().mockResolvedValue(true);
        const mockIncident = {
          _id: 'mock_incident_id',
          title: 'Oil Spill',
          status: 'RECEIVED',
          priority: 'MEDIUM',
          timeline: [] as any[],
          creatorId: mockUserId,
          orgId: mockOrgId,
          save: mockSave,
        };

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);

        const response = await request(app)
          .patch('/api/v1/incidents/mock_incident_id')
          .set('Authorization', `Bearer ${mockStaffToken}`)
          .send({ status: 'SCREENING' });

        expect(response.status).toBe(200);
        expect(mockSave).toHaveBeenCalled();
        expect(mockIncident.status).toBe('SCREENING');
        expect(mockIncident.timeline).toHaveLength(1);
        expect(mockIncident.timeline[0].eventType).toBe('STATUS_CHANGED');
      });

      it('should block citizens from changing status or assignee', async () => {
        const mockIncident = {
          _id: 'mock_incident_id',
          title: 'Oil Sighting',
          status: 'RECEIVED',
          creatorId: mockCitizenUserId,
          orgId: null,
        };

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);

        const response = await request(app)
          .patch('/api/v1/incidents/mock_incident_id')
          .set('Authorization', `Bearer ${mockCitizenToken}`)
          .send({ status: 'SCREENING' });

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('citizens cannot update incident status');
      });
    });
  });

  // =========================================================================
  // 2. Observation CRUD Tests
  // =========================================================================
  describe('Observation Endpoints', () => {
    describe('POST /api/v1/observations', () => {
      it('should reject creation when confidence is invalid', async () => {
        const response = await request(app)
          .post('/api/v1/observations')
          .set('Authorization', `Bearer ${mockCitizenToken}`)
          .send({
            category: 'sst',
            value: '29.1C',
            confidence: -0.5, // Invalid: must be between 0.0 and 1.0
            location: { type: 'Point', coordinates: [80.5, 12.8] },
            timestamp: new Date(),
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('validation failed');
      });
    });
  });
});
