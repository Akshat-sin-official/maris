import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { Incident } from '../../src/incidents/Incident.model';
import { Evidence } from '../../src/evidence/Evidence.model';

// Mock mongoose models
jest.mock('../../src/incidents/Incident.model');
jest.mock('../../src/evidence/Evidence.model');
jest.mock('../../src/audit/AuditLog.model');

describe('Evidence & Timeline Integration Tests', () => {
  const mockOrgId = '660d3d5d787be21a48c56c22';
  const mockUserId = '660d3d5d787be21a48c56c33';
  const mockStaffToken = jwt.sign(
    { userId: mockUserId, role: 'FIELD_OFFICER', orgId: mockOrgId, email: 'officer@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );
  


  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. Evidence Management Tests
  // =========================================================================
  describe('Evidence APIs', () => {
    describe('POST /api/v1/incidents/:id/evidence', () => {
      it('should upload evidence and append EVIDENCE_CAPTURED timeline event', async () => {
        const mockIncident = {
          _id: new mongoose.Types.ObjectId(),
          creatorId: mockUserId,
          orgId: mockOrgId,
          title: 'Illegal Sighting',
        };

        const mockCreatedEvidence = {
          _id: 'ev1',
          mediaType: 'image',
          url: 'https://maris.s3.amazonaws.com/evidence1.jpg',
          fileHash: 'sha_256_mock_hash_value',
          incidentId: mockIncident._id,
        };

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);
        (Evidence.findOne as jest.Mock).mockResolvedValue(null);
        (Evidence.create as jest.Mock).mockResolvedValue(mockCreatedEvidence);

        const response = await request(app)
          .post(`/api/v1/incidents/${mockIncident._id}/evidence`)
          .set('Authorization', `Bearer ${mockStaffToken}`)
          .send({
            mediaType: 'image',
            url: 'https://maris.s3.amazonaws.com/evidence1.jpg',
            fileHash: 'sha_256_mock_hash_value',
            capturedAt: new Date(),
          });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.evidence._id).toBe('ev1');
        
        // Verifies that logEvent pushed a timeline update
        expect(Incident.findByIdAndUpdate).toHaveBeenCalledWith(
          mockIncident._id,
          expect.objectContaining({
            $push: {
              timeline: expect.objectContaining({
                eventType: 'EVIDENCE_CAPTURED',
              }),
            },
          }),
          expect.any(Object)
        );
      });

      it('should prevent duplicate uploads matching fileHash', async () => {
        const mockIncident = {
          _id: new mongoose.Types.ObjectId(),
          creatorId: mockUserId,
          orgId: mockOrgId,
        };

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);
        // Simulate duplicate found
        (Evidence.findOne as jest.Mock).mockResolvedValue({ _id: 'existing_ev' });

        const response = await request(app)
          .post(`/api/v1/incidents/${mockIncident._id}/evidence`)
          .set('Authorization', `Bearer ${mockStaffToken}`)
          .send({
            mediaType: 'image',
            url: 'https://maris.s3.amazonaws.com/evidence2.jpg',
            fileHash: 'existing_sha_hash',
            capturedAt: new Date(),
          });

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('duplicate file hash detected');
      });
    });

    describe('GET /api/v1/incidents/:id/evidence', () => {
      it('should list all evidence linked to the incident', async () => {
        const mockIncident = {
          _id: new mongoose.Types.ObjectId(),
          creatorId: mockUserId,
          orgId: mockOrgId,
        };

        const mockEvidenceList = [
          { _id: 'ev1', mediaType: 'image', incidentId: mockIncident._id },
          { _id: 'ev2', mediaType: 'video', incidentId: mockIncident._id },
        ];

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);
        (Evidence.find as jest.Mock).mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockEvidenceList),
          }),
        });

        const response = await request(app)
          .get(`/api/v1/incidents/${mockIncident._id}/evidence`)
          .set('Authorization', `Bearer ${mockStaffToken}`);

        expect(response.status).toBe(200);
        expect(response.body.results).toBe(2);
        expect(response.body.data.evidence).toHaveLength(2);
      });
    });

    describe('GET /api/v1/evidence/:id', () => {
      it('should fetch standalone evidence details and enforce uploader/organization boundary limits', async () => {
        const mockEvidence = {
          _id: 'ev1',
          mediaType: 'audio',
          orgId: 'different_org_id',
          uploadedBy: {
            _id: 'different_user_id',
          },
        };

        (Evidence.findById as jest.Mock).mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEvidence),
        });

        // Querying with staff token of mockOrgId (which doesn't match 'different_org_id')
        const response = await request(app)
          .get('/api/v1/evidence/ev1')
          .set('Authorization', `Bearer ${mockStaffToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('insufficient permissions');
      });
    });
  });

  // =========================================================================
  // 2. Timeline APIs & Auto-logs Tests
  // =========================================================================
  describe('Timeline APIs', () => {
    describe('GET /api/v1/incidents/:id/timeline', () => {
      it('should return chronological incident timeline events list', async () => {
        const mockIncident = {
          _id: new mongoose.Types.ObjectId(),
          creatorId: mockUserId,
          orgId: mockOrgId,
          timeline: [
            { eventType: 'INCIDENT_CREATED', message: 'Reported', timestamp: new Date() },
            { eventType: 'PRIORITY_ASSIGNED', message: 'Assigned Priority', timestamp: new Date() },
          ],
        };

        (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);

        const response = await request(app)
          .get(`/api/v1/incidents/${mockIncident._id}/timeline`)
          .set('Authorization', `Bearer ${mockStaffToken}`);

        expect(response.status).toBe(200);
        expect(response.body.results).toBe(2);
        expect(response.body.data.timeline).toHaveLength(2);
        expect(response.body.data.timeline[0].eventType).toBe('INCIDENT_CREATED');
      });
    });
  });
});
