import request from 'supertest';
import { app } from '../../src/app';
import { clearCache } from '../../src/integration/services';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('Coordinate Intelligence Lookup API', () => {
  let testToken: string;

  beforeAll(() => {
    // Generate valid test token
    testToken = jwt.sign(
      { userId: 'usr-test-123', email: 'officer@maris.gov.in', role: 'CONTROL_ROOM', orgId: 'org-test-456' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    clearCache();
  });

  it('should deny coordinate lookup if unauthenticated (401)', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .query({ lat: 13.0827, lng: 80.2707 });

    expect(res.status).toBe(401);
  });

  it('should reject missing coordinates (400)', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_COORDINATES');
  });

  it('should reject non-numeric coordinates (400)', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .query({ lat: 'abc', lng: 'xyz' })
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_COORDINATES');
  });

  it('should reject out-of-bounds latitude (400)', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .query({ lat: 95.0, lng: 80.2707 })
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_COORDINATES');
  });

  it('should reject out-of-bounds longitude (400)', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .query({ lat: 13.0827, lng: -190.0 })
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_COORDINATES');
  });

  it('should successfully return intelligence and marine layers for valid coordinates', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/lookup')
      .query({ lat: 13.0827, lng: 80.2707 })
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.coordinates).toEqual([80.2707, 13.0827]); // GeoJSON order [lng, lat]
    expect(Array.isArray(res.body.alerts)).toBe(true);
    expect(Array.isArray(res.body.geofences)).toBe(true);
    expect(res.body.marineConditions).toBeDefined();
    expect(res.body.marineConditions.source).toBeDefined();
    expect(Array.isArray(res.body.pfz)).toBe(true);
  });
});
