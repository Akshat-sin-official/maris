import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { Incident } from '../../src/incidents/Incident.model';
import { Evidence } from '../../src/evidence/Evidence.model';

// Mock mongoose models
jest.mock('../../src/incidents/Incident.model');
jest.mock('../../src/evidence/Evidence.model');
jest.mock('../../src/audit/AuditLog.model');

describe('Offline Synchronization Integration Tests', () => {
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
  // 1. Single Incident Synchronization Tests
  // =========================================================================
  describe('POST /api/v1/sync/incident', () => {
    it('should create new incident when clientId does not exist (First Sync)', async () => {
      const mockIncidentPayload = {
        clientId: 'inc_client_1',
        title: 'Oil Slick Sighted',
        priority: 'HIGH',
        items: [],
        clientCreatedAt: new Date(),
      };

      const mockIncidentRecord = {
        _id: 'inc_server_1',
        clientId: 'inc_client_1',
        title: 'Oil Slick Sighted',
        syncState: 'SYNCED',
      };

      (Incident.findOne as jest.Mock).mockResolvedValue(null);
      (Incident.create as jest.Mock).mockResolvedValue(mockIncidentRecord);

      const response = await request(app)
        .post('/api/v1/sync/incident')
        .set('Authorization', `Bearer ${mockStaffToken}`)
        .send(mockIncidentPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        clientId: 'inc_client_1',
        serverId: 'inc_server_1',
        status: 'SYNCED',
      });
    });

    it('should return existing record when clientId matches (Idempotent Sync)', async () => {
      const mockIncidentPayload = {
        clientId: 'inc_client_1',
        title: 'Oil Slick Sighted',
        priority: 'HIGH',
        items: [],
        clientCreatedAt: new Date(),
      };

      const mockIncidentRecord = {
        _id: 'inc_server_1',
        clientId: 'inc_client_1',
        title: 'Oil Slick Sighted',
        syncState: 'SYNCED',
      };

      (Incident.findOne as jest.Mock).mockResolvedValue(mockIncidentRecord);

      const response = await request(app)
        .post('/api/v1/sync/incident')
        .set('Authorization', `Bearer ${mockStaffToken}`)
        .send(mockIncidentPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        clientId: 'inc_client_1',
        serverId: 'inc_server_1',
        status: 'SYNCED',
      });
      expect(Incident.create).not.toHaveBeenCalled();
    });

    it('should return CONFLICT status when clientId matches but data differs (Conflict Check)', async () => {
      const mockIncidentPayload = {
        clientId: 'inc_client_1',
        title: 'Oil Slick Modified',
        priority: 'HIGH',
        items: [],
        clientCreatedAt: new Date(),
      };

      const mockIncidentRecord = {
        _id: 'inc_server_1',
        clientId: 'inc_client_1',
        title: 'Oil Slick Sighted', // Different title
        syncState: 'SYNCED',
      };

      (Incident.findOne as jest.Mock).mockResolvedValue(mockIncidentRecord);

      const response = await request(app)
        .post('/api/v1/sync/incident')
        .set('Authorization', `Bearer ${mockStaffToken}`)
        .send(mockIncidentPayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CONFLICT');
      expect(response.body.error).toContain('data on server differs');
    });
  });

  // =========================================================================
  // 2. Single Evidence Synchronization Tests
  // =========================================================================
  describe('POST /api/v1/sync/evidence', () => {
    it('should prevent sync and return CONFLICT if evidence fileHash already exists', async () => {
      const mockEvidencePayload = {
        clientId: 'ev_client_1',
        incidentId: 'inc_server_1',
        mediaType: 'image',
        url: 'https://s3.com/img1.jpg',
        fileHash: 'sha_256_hash_1',
        capturedAt: new Date(),
        clientCreatedAt: new Date(),
      };

      (Evidence.findOne as jest.Mock).mockImplementation((query) => {
        if (query.clientId) return Promise.resolve(null);
        if (query.fileHash) return Promise.resolve({ _id: 'another_ev_record' }); // Matching fileHash
        return Promise.resolve(null);
      });

      const response = await request(app)
        .post('/api/v1/sync/evidence')
        .set('Authorization', `Bearer ${mockStaffToken}`)
        .send(mockEvidencePayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CONFLICT');
      expect(response.body.error).toContain('duplicate file hash detected');
    });
  });

  // =========================================================================
  // 3. Batch Synchronization & Partial Success Tests
  // =========================================================================
  describe('POST /api/v1/sync/batch', () => {
    it('should process sync batches successfully with partial success tracking', async () => {
      const batchPayload = {
        incidents: [
          {
            clientId: 'inc_client_1',
            title: 'Incident 1',
            priority: 'LOW',
            items: [],
            clientCreatedAt: new Date(),
          },
          {
            clientId: 'inc_client_invalid', // Will fail Zod parser (missing priority)
            title: 'Incident 2',
            items: [],
            clientCreatedAt: new Date(),
          } as any,
        ],
        evidences: [
          {
            clientId: 'ev_client_1',
            incidentId: 'inc_client_1',
            mediaType: 'image',
            url: 'https://s3.com/image.jpg',
            fileHash: 'unique_hash_val',
            capturedAt: new Date(),
            clientCreatedAt: new Date(),
          },
        ],
      };

      (Incident.findOne as jest.Mock).mockImplementation((query) => {
        if (query.clientId === 'inc_client_1') {
          return Promise.resolve({
            _id: 'inc_server_1',
            clientId: 'inc_client_1',
            title: 'Incident 1',
          });
        }
        return Promise.resolve(null);
      });
      (Incident.create as jest.Mock).mockResolvedValue({
        _id: 'inc_server_1',
        clientId: 'inc_client_1',
      });

      (Evidence.findOne as jest.Mock).mockResolvedValue(null);
      (Evidence.create as jest.Mock).mockResolvedValue({
        _id: 'ev_server_1',
        clientId: 'ev_client_1',
      });

      const response = await request(app)
        .post('/api/v1/sync/batch')
        .set('Authorization', `Bearer ${mockStaffToken}`)
        .send(batchPayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const { incidents, evidences } = response.body.results;

      // Incident 1: Success
      expect(incidents[0]).toEqual({
        clientId: 'inc_client_1',
        serverId: 'inc_server_1',
        status: 'SYNCED',
      });

      // Incident 2: Partial validation failure
      expect(incidents[1].status).toBe('FAILED');
      expect(incidents[1].error).toBeDefined();

      // Evidence: Success
      expect(evidences[0]).toEqual({
        clientId: 'ev_client_1',
        serverId: 'ev_server_1',
        status: 'SYNCED',
      });
    });
  });
});
