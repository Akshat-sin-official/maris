import http from 'http';
import { AddressInfo } from 'net';
import { io as ioc } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { initializeSocket } from '../../src/realtime/socket';
import { Incident } from '../../src/incidents/Incident.model';

// Mock Incident model
jest.mock('../../src/incidents/Incident.model');

describe('Realtime Socket.IO Integration Tests', () => {
  let server: http.Server;
  let port: number;
  const mockSecret = 'test_jwt_signing_secret_key_minimum_length';

  beforeAll((done) => {
    server = http.createServer();
    initializeSocket(server);
    server.listen(() => {
      port = (server.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const createToken = (userId: string, role: string, orgId: string | null) => {
    return jwt.sign({ userId, role, orgId, email: 'test@email.com' }, mockSecret);
  };

  it('should reject connection when token is missing', (done) => {
    const socket = ioc(`http://localhost:${port}`, {
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect_error', (err) => {
      expect(err.message).toContain('Authentication error: Token is missing');
      socket.disconnect();
      done();
    });
  });

  it('should reject connection when token is invalid', (done) => {
    const socket = ioc(`http://localhost:${port}`, {
      auth: { token: 'invalid_token_signature' },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect_error', (err) => {
      expect(err.message).toContain('Authentication error: Invalid or expired token');
      socket.disconnect();
      done();
    });
  });

  it('should accept connection with valid token and establish session', (done) => {
    const userId = '660d3d5d787be21a48c56c33';
    const token = createToken(userId, 'FIELD_OFFICER', null);
    const socket = ioc(`http://localhost:${port}`, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      socket.disconnect();
      done();
    });
  });

  it('should allow joining incident room if user is creator', (done) => {
    const userId = 'creator_user_1';
    const incidentId = '660d3d5d787be21a48c56c22';
    const token = createToken(userId, 'CITIZEN', null);

    (Incident.findById as jest.Mock).mockResolvedValue({
      _id: incidentId,
      creatorId: userId,
      orgId: null,
    });

    const socket = ioc(`http://localhost:${port}`, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect', () => {
      socket.emit('join_incident', incidentId);
      socket.on('joined_incident', (data) => {
        expect(data.incidentId).toBe(incidentId);
        socket.disconnect();
        done();
      });
    });
  });

  it('should deny joining incident room if user is citizen but not creator', (done) => {
    const userId = 'citizen_user_2';
    const incidentId = '660d3d5d787be21a48c56c22';
    const token = createToken(userId, 'CITIZEN', null);

    (Incident.findById as jest.Mock).mockResolvedValue({
      _id: incidentId,
      creatorId: 'different_creator_id',
      orgId: null,
    });

    const socket = ioc(`http://localhost:${port}`, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect', () => {
      socket.emit('join_incident', incidentId);
      socket.on('error', (err) => {
        expect(err.message).toContain('Unauthorized access to incident room');
        socket.disconnect();
        done();
      });
    });
  });

  it('should allow joining incident room if user is staff inside the same organization', (done) => {
    const userId = 'staff_user_1';
    const orgId = '660d3d5d787be21a48c56c11';
    const incidentId = '660d3d5d787be21a48c56c22';
    const token = createToken(userId, 'FIELD_OFFICER', orgId);

    (Incident.findById as jest.Mock).mockResolvedValue({
      _id: incidentId,
      creatorId: 'citizen_creator',
      orgId: orgId,
    });

    const socket = ioc(`http://localhost:${port}`, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect', () => {
      socket.emit('join_incident', incidentId);
      socket.on('joined_incident', (data) => {
        expect(data.incidentId).toBe(incidentId);
        socket.disconnect();
        done();
      });
    });
  });

  it('should deny joining incident room if user is staff in a different organization', (done) => {
    const userId = 'staff_user_1';
    const orgId = '660d3d5d787be21a48c56c11';
    const incidentId = '660d3d5d787be21a48c56c22';
    const token = createToken(userId, 'FIELD_OFFICER', 'different_org_id');

    (Incident.findById as jest.Mock).mockResolvedValue({
      _id: incidentId,
      creatorId: 'citizen_creator',
      orgId: orgId,
    });

    const socket = ioc(`http://localhost:${port}`, {
      auth: { token },
      autoConnect: false,
    });

    socket.connect();
    socket.on('connect', () => {
      socket.emit('join_incident', incidentId);
      socket.on('error', (err) => {
        expect(err.message).toContain('Unauthorized access to incident room');
        socket.disconnect();
        done();
      });
    });
  });
});
