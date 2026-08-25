import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app';
import { User } from '../../src/users/User.model';
import { RefreshToken } from '../../src/auth/RefreshToken.model';
import bcrypt from 'bcryptjs';

// Mock mongoose models and bcrypt
jest.mock('../../src/users/User.model');
jest.mock('../../src/organizations/Organization.model');
jest.mock('../../src/auth/RefreshToken.model');
jest.mock('../../src/audit/AuditLog.model');
jest.mock('bcryptjs');

describe('Auth & Authorization Integration Tests', () => {
  const mockOrgId = '660d3d5d787be21a48c56c22';
  const mockUserId = '660d3d5d787be21a48c56c33';
  const mockToken = jwt.sign(
    { userId: mockUserId, role: 'ORG_ADMIN', orgId: mockOrgId, email: 'admin@org.com' },
    process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and tokens for valid login credentials', async () => {
      const mockUser = {
        _id: mockUserId,
        email: 'admin@org.com',
        name: 'Admin User',
        role: 'ORG_ADMIN',
        orgId: mockOrgId,
        passwordHash: 'hashed_password',
        isActive: true,
      };

      // Mock user lookup chain select('+passwordHash')
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (RefreshToken.create as jest.Mock).mockResolvedValue({ token: 'mock_refresh_token' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@org.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('admin@org.com');
    });

    it('should return 401 for incorrect credentials', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@org.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 for missing token headers', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Access token is missing or invalid');
    });

    it('should return 401 for an expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUserId, role: 'ORG_ADMIN', orgId: mockOrgId, email: 'admin@org.com' },
        process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length',
        { expiresIn: '-10s' }
      );

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid or expired authentication token');
    });
  });

  describe('GET /api/v1/users (RBAC Gating)', () => {
    it('should deny access (403) for CITIZEN role', async () => {
      const citizenToken = jwt.sign(
        { userId: mockUserId, role: 'CITIZEN', orgId: null, email: 'citizen@email.com' },
        process.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length'
      );

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('cannot list users');
    });

    it('should allow access (200) for ORG_ADMIN role and list users in same org', async () => {
      const mockUsers = [
        { _id: mockUserId, name: 'Admin User', role: 'ORG_ADMIN', orgId: mockOrgId },
        { _id: 'officer_id', name: 'Officer User', role: 'FIELD_OFFICER', orgId: mockOrgId },
      ];

      (User.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUsers),
      });

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toHaveLength(2);
      expect(User.find).toHaveBeenCalledWith({ orgId: mockOrgId });
    });
  });

  describe('Organization Isolation Gating', () => {
    it('should allow profile access inside the same organization', async () => {
      const targetUserId = '660d3d5d787be21a48c56c44';
      const mockTargetUser = {
        _id: targetUserId,
        name: 'Field Officer',
        role: 'FIELD_OFFICER',
        orgId: {
          _id: mockOrgId,
          toString: () => mockOrgId,
        },
      };

      (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTargetUser),
      });

      const response = await request(app)
        .get(`/api/v1/users/${targetUserId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user._id).toBe(targetUserId);
    });

    it('should deny profile access (403) for users in other organizations', async () => {
      const otherOrgId = '660d3d5d787be21a48c56c99';
      const targetUserId = '660d3d5d787be21a48c56c44';
      const mockTargetUser = {
        _id: targetUserId,
        name: 'Other Org Officer',
        role: 'FIELD_OFFICER',
        orgId: {
          _id: otherOrgId,
          toString: () => otherOrgId,
        },
      };

      (User.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTargetUser),
      });

      const response = await request(app)
        .get(`/api/v1/users/${targetUserId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('resource belongs to a different organization boundary');
    });
  });
});
