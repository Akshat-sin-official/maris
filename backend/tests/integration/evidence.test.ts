import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { Evidence } from '../../src/evidence/Evidence.model';
import { Incident } from '../../src/incidents/Incident.model';
import { Observation } from '../../src/observations/Observation.model';
import { env } from '../../src/config/env';
import { activeProviderRef } from '../../src/storage/minio.provider';
jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        bucketExists: jest.fn().mockResolvedValue(true),
        makeBucket: jest.fn().mockResolvedValue(undefined),
        putObject: jest.fn().mockResolvedValue(undefined),
        getObject: jest.fn().mockResolvedValue(null),
        removeObject: jest.fn().mockResolvedValue(undefined),
        statObject: jest.fn().mockResolvedValue({}),
        presignedGetObject: jest.fn().mockImplementation((_bucket, _key, _expires, callback) => {
          if (callback) {
            callback(null, 'https://mock-signed-url.com/file');
            return;
          }
          return Promise.resolve('https://mock-signed-url.com/file');
        }),
      };
    })
  };
});

jest.mock('../../src/incidents/Incident.model');
jest.mock('../../src/observations/Observation.model');
jest.mock('../../src/evidence/Evidence.model');
jest.mock('../../src/audit/AuditLog.model');

describe('Evidence Attachment & Multi-part Upload API', () => {
  const mockOrgId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockToken = jwt.sign(
    { userId: mockUserId, role: 'FIELD_OFFICER', orgId: mockOrgId, email: 'officer@maris.gov.in' },
    env.JWT_SECRET
  );

  const mockIncidentId = new mongoose.Types.ObjectId().toString();
  const mockObservationId = new mongoose.Types.ObjectId().toString();

  beforeAll(() => {
    // Spies initialized in beforeEach
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(activeProviderRef.current, 'upload').mockResolvedValue(undefined);
    jest.spyOn(activeProviderRef.current, 'delete').mockResolvedValue(undefined);
    jest.spyOn(activeProviderRef.current, 'getSignedUrl').mockResolvedValue('https://mock-signed-url.com/file');
  });

  it('should upload image binary successfully to an incident', async () => {
    const mockIncident = {
      _id: mockIncidentId,
      creatorId: mockUserId,
      orgId: mockOrgId,
      title: 'Illegal Fishing',
    };

    const mockEvidence = {
      _id: 'ev1',
      mediaType: 'image',
      url: 'org/test/incidents/test/evidence/test.png',
      fileHash: 'sha256_mock_hash_png',
      incidentId: mockIncidentId,
    };

    (Incident.findById as jest.Mock).mockResolvedValue(mockIncident);
    (Evidence.findOne as jest.Mock).mockResolvedValue(null);
    (Evidence.create as jest.Mock).mockResolvedValue(mockEvidence);

    const response = await request(app)
      .post(`/api/v1/incidents/${mockIncidentId}/evidence`)
      .set('Authorization', `Bearer ${mockToken}`)
      .attach('file', Buffer.from('fake-image-binary-data'), 'photo.png');

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.evidence).toBeDefined();
    expect(activeProviderRef.current.upload).toHaveBeenCalled();
  });

  it('should upload video binary successfully to an observation', async () => {
    const mockObservation = {
      _id: mockObservationId,
      creatorId: mockUserId,
      orgId: mockOrgId,
      evidenceIds: [],
      save: jest.fn().mockResolvedValue(true),
    };

    const mockEvidence = {
      _id: 'ev2',
      mediaType: 'video',
      url: 'org/test/observations/test/evidence/test.mp4',
      fileHash: 'sha256_mock_hash_mp4',
      observationId: mockObservationId,
    };

    (Observation.findById as jest.Mock).mockResolvedValue(mockObservation);
    (Evidence.findOne as jest.Mock).mockResolvedValue(null);
    (Evidence.create as jest.Mock).mockResolvedValue(mockEvidence);

    const response = await request(app)
      .post(`/api/v1/observations/${mockObservationId}/evidence`)
      .set('Authorization', `Bearer ${mockToken}`)
      .attach('file', Buffer.from('fake-video-binary-data'), 'video.mp4');

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(activeProviderRef.current.upload).toHaveBeenCalled();
  });

  it('should reject invalid MIME types', async () => {
    const response = await request(app)
      .post(`/api/v1/incidents/${mockIncidentId}/evidence`)
      .set('Authorization', `Bearer ${mockToken}`)
      .attach('file', Buffer.from('some-text'), 'notes.txt');

    expect(response.status).toBe(400);
  });

  it('should delete evidence successfully and log it', async () => {
    const mockEvidence = {
      _id: 'ev1',
      orgId: mockOrgId,
      uploadedBy: mockUserId,
      mediaType: 'image',
      url: 'org/test/incidents/test/evidence/test.png',
      fileHash: 'sha256_mock_hash_png',
    };

    (Evidence.findById as jest.Mock).mockResolvedValue(mockEvidence);
    (Evidence.findByIdAndDelete as jest.Mock).mockResolvedValue(mockEvidence);

    const response = await request(app)
      .delete(`/api/v1/evidence/ev1`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(activeProviderRef.current.delete).toHaveBeenCalled();
  });

  it('should generate short-lived signed access URL', async () => {
    const mockEvidence = {
      _id: 'ev1',
      orgId: mockOrgId,
      uploadedBy: mockUserId,
      mediaType: 'image',
      url: 'org/test/incidents/test/evidence/test.png',
    };

    (Evidence.findById as jest.Mock).mockResolvedValue(mockEvidence);

    const response = await request(app)
      .get(`/api/v1/evidence/ev1/access`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.url).toBe('https://mock-signed-url.com/file');
  });
});
