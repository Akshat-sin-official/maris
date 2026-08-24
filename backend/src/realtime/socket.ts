import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { UserTokenPayload } from '../auth/jwt.utils';
import { Incident } from '../incidents/Incident.model';

let io: SocketIOServer | null = null;

export interface AuthenticatedSocket extends Socket {
  user?: UserTokenPayload;
}

/**
 * Initializes the Socket.IO server, binds JWT auth middlewares, 
 * joins users to their org rooms or personal rooms, and handles case room requests.
 */
export function initializeSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // JWT authentication middleware for connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token is missing'));
    }

    try {
      const secret = env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length';
      const decoded = jwt.verify(token, secret) as UserTokenPayload;
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    logger.info(`Socket connected & authenticated: ${socket.id} (user: ${user.email}, role: ${user.role})`);

    // 1. Join personal room (for targeted user broadcasts like assignments)
    socket.join(`user:${user.userId}`);

    // 2. Join organization room if user is staff (has orgId)
    if (user.orgId) {
      socket.join(`org:${user.orgId}`);
      logger.info(`Socket ${socket.id} joined room org:${user.orgId}`);
    }

    // 3. Dynamic Case Room Subscribing (requires boundary authorization check)
    socket.on('join_incident', async (incidentId: string) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(incidentId)) {
          socket.emit('error', { message: 'Invalid incident ID format' });
          return;
        }

        const incident = await Incident.findById(incidentId);
        if (!incident) {
          socket.emit('error', { message: 'Incident not found' });
          return;
        }

        // Boundary Check: User is creator OR staff sharing the organization
        const isCreator = incident.creatorId.toString() === user.userId;
        const sharesOrg =
          incident.orgId &&
          user.orgId &&
          incident.orgId.toString() === user.orgId.toString();

        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(user.role);

        if (isCreator || (isStaff && sharesOrg)) {
          socket.join(`incident:${incidentId}`);
          logger.info(`Socket ${socket.id} joined room incident:${incidentId}`);
          socket.emit('joined_incident', { incidentId });
        } else {
          logger.warn(`Unauthorized join incident room attempt to ${incidentId} by user ${user.userId}`);
          socket.emit('error', { message: 'Unauthorized access to incident room' });
        }
      } catch (err: any) {
        logger.error(`Error joining incident room ${incidentId}:`, err);
        socket.emit('error', { message: 'Server error joining incident room' });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  logger.info('Socket.IO server initialized successfully');
  return io;
}

class MockSocketServer {
  to(_room: string) {
    return this;
  }
  emit(_event: string, ..._args: any[]) {
    return true;
  }
}

/**
 * Retrieves the singleton instance of the Socket.IO server or a mock version
 */
export function getSocketServer(): any {
  if (!io) {
    logger.warn('Socket.IO is not initialized yet. Returning mock server instance.');
    return new MockSocketServer();
  }
  return io;
}

// =========================================================================
// Real-time Event Broadcaster Helpers
// =========================================================================

/**
 * Emits "new_incident" event safely to authorized listeners
 */
export function notifyNewIncident(incident: any): void {
  const server = getSocketServer();
  if (incident.orgId) {
    server.to(`org:${incident.orgId.toString()}`).emit('new_incident', incident);
  }
  if (incident.creatorId) {
    server.to(`user:${incident.creatorId.toString()}`).emit('new_incident', incident);
  }
  logger.info(`Realtime: Broadcasted new_incident (${incident._id})`);
}

/**
 * Emits "incident_synced" event to creator and organization rooms
 */
export function notifyIncidentSynced(incident: any): void {
  const server = getSocketServer();
  if (incident.orgId) {
    server.to(`org:${incident.orgId.toString()}`).emit('incident_synced', incident);
  }
  if (incident.creatorId) {
    server.to(`user:${incident.creatorId.toString()}`).emit('incident_synced', incident);
  }
  logger.info(`Realtime: Broadcasted incident_synced (${incident._id})`);
}

/**
 * Emits "priority_updated" event to organization and incident case rooms
 */
export function notifyPriorityUpdated(incidentId: string, orgId: string | null, priority: string): void {
  const server = getSocketServer();
  const payload = { incidentId, priority };
  server.to(`incident:${incidentId}`).emit('priority_updated', payload);
  if (orgId) {
    server.to(`org:${orgId}`).emit('priority_updated', payload);
  }
  logger.info(`Realtime: Broadcasted priority_updated for incident ${incidentId}`);
}

/**
 * Emits "alert_created" event globally (for weather/global alerts) or to organization room
 */
export function notifyAlertCreated(alert: any): void {
  const server = getSocketServer();
  if (alert.orgId) {
    server.to(`org:${alert.orgId.toString()}`).emit('alert_created', alert);
  } else {
    server.emit('alert_created', alert); // Broadcast globally
  }
  logger.info(`Realtime: Broadcasted alert_created (${alert._id})`);
}

/**
 * Emits "assignment_created" event to assignee personal room and organization room
 */
export function notifyAssignmentCreated(assignment: any): void {
  const server = getSocketServer();
  if (assignment.assigneeId) {
    server.to(`user:${assignment.assigneeId.toString()}`).emit('assignment_created', assignment);
  }
  if (assignment.orgId) {
    server.to(`org:${assignment.orgId.toString()}`).emit('assignment_created', assignment);
  }
  logger.info(`Realtime: Broadcasted assignment_created (${assignment._id})`);
}

/**
 * Emits "verification_completed" event to organization and incident case rooms
 */
export function notifyVerificationCompleted(incidentId: string, orgId: string | null, verification: any): void {
  const server = getSocketServer();
  const payload = { incidentId, verification };
  server.to(`incident:${incidentId}`).emit('verification_completed', payload);
  if (orgId) {
    server.to(`org:${orgId}`).emit('verification_completed', payload);
  }
  logger.info(`Realtime: Broadcasted verification_completed for incident ${incidentId}`);
}

/**
 * Emits "status_changed" event (maps status_changed/case_closed) to organization and case rooms
 */
export function notifyStatusChanged(incidentId: string, orgId: string | null, status: string): void {
  const server = getSocketServer();
  const eventName = status === 'CLOSED' ? 'case_closed' : 'status_changed';
  const payload = { incidentId, status };
  server.to(`incident:${incidentId}`).emit(eventName, payload);
  if (orgId) {
    server.to(`org:${orgId}`).emit(eventName, payload);
  }
  logger.info(`Realtime: Broadcasted ${eventName} for incident ${incidentId}`);
}

/**
 * Emits "observation_received" event to creator and organization rooms
 */
export function notifyObservationReceived(observation: any): void {
  const server = getSocketServer();
  if (observation.orgId) {
    server.to(`org:${observation.orgId.toString()}`).emit('observation_received', observation);
  }
  if (observation.creatorId) {
    server.to(`user:${observation.creatorId.toString()}`).emit('observation_received', observation);
  }
  logger.info(`Realtime: Broadcasted observation_received (${observation._id})`);
}
