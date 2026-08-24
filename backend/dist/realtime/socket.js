"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getSocketServer = getSocketServer;
exports.notifyNewIncident = notifyNewIncident;
exports.notifyIncidentSynced = notifyIncidentSynced;
exports.notifyPriorityUpdated = notifyPriorityUpdated;
exports.notifyAlertCreated = notifyAlertCreated;
exports.notifyAssignmentCreated = notifyAssignmentCreated;
exports.notifyVerificationCompleted = notifyVerificationCompleted;
exports.notifyStatusChanged = notifyStatusChanged;
exports.notifyObservationReceived = notifyObservationReceived;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const Incident_model_1 = require("../incidents/Incident.model");
let io = null;
/**
 * Initializes the Socket.IO server, binds JWT auth middlewares,
 * joins users to their org rooms or personal rooms, and handles case room requests.
 */
function initializeSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    // JWT authentication middleware for connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication error: Token is missing'));
        }
        try {
            const secret = env_1.env.JWT_SECRET || 'test_jwt_signing_secret_key_minimum_length';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            socket.user = decoded;
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        if (!user) {
            socket.disconnect(true);
            return;
        }
        logger_1.logger.info(`Socket connected & authenticated: ${socket.id} (user: ${user.email}, role: ${user.role})`);
        // 1. Join personal room (for targeted user broadcasts like assignments)
        socket.join(`user:${user.userId}`);
        // 2. Join organization room if user is staff (has orgId)
        if (user.orgId) {
            socket.join(`org:${user.orgId}`);
            logger_1.logger.info(`Socket ${socket.id} joined room org:${user.orgId}`);
        }
        // 3. Dynamic Case Room Subscribing (requires boundary authorization check)
        socket.on('join_incident', async (incidentId) => {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(incidentId)) {
                    socket.emit('error', { message: 'Invalid incident ID format' });
                    return;
                }
                const incident = await Incident_model_1.Incident.findById(incidentId);
                if (!incident) {
                    socket.emit('error', { message: 'Incident not found' });
                    return;
                }
                // Boundary Check: User is creator OR staff sharing the organization
                const isCreator = incident.creatorId.toString() === user.userId;
                const sharesOrg = incident.orgId &&
                    user.orgId &&
                    incident.orgId.toString() === user.orgId.toString();
                const citizenRoles = ['CITIZEN', 'TIPSTER'];
                const isStaff = !citizenRoles.includes(user.role);
                if (isCreator || (isStaff && sharesOrg)) {
                    socket.join(`incident:${incidentId}`);
                    logger_1.logger.info(`Socket ${socket.id} joined room incident:${incidentId}`);
                    socket.emit('joined_incident', { incidentId });
                }
                else {
                    logger_1.logger.warn(`Unauthorized join incident room attempt to ${incidentId} by user ${user.userId}`);
                    socket.emit('error', { message: 'Unauthorized access to incident room' });
                }
            }
            catch (err) {
                logger_1.logger.error(`Error joining incident room ${incidentId}:`, err);
                socket.emit('error', { message: 'Server error joining incident room' });
            }
        });
        socket.on('disconnect', (reason) => {
            logger_1.logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
        });
    });
    logger_1.logger.info('Socket.IO server initialized successfully');
    return io;
}
class MockSocketServer {
    to(_room) {
        return this;
    }
    emit(_event, ..._args) {
        return true;
    }
}
/**
 * Retrieves the singleton instance of the Socket.IO server or a mock version
 */
function getSocketServer() {
    if (!io) {
        logger_1.logger.warn('Socket.IO is not initialized yet. Returning mock server instance.');
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
function notifyNewIncident(incident) {
    const server = getSocketServer();
    if (incident.orgId) {
        server.to(`org:${incident.orgId.toString()}`).emit('new_incident', incident);
    }
    if (incident.creatorId) {
        server.to(`user:${incident.creatorId.toString()}`).emit('new_incident', incident);
    }
    logger_1.logger.info(`Realtime: Broadcasted new_incident (${incident._id})`);
}
/**
 * Emits "incident_synced" event to creator and organization rooms
 */
function notifyIncidentSynced(incident) {
    const server = getSocketServer();
    if (incident.orgId) {
        server.to(`org:${incident.orgId.toString()}`).emit('incident_synced', incident);
    }
    if (incident.creatorId) {
        server.to(`user:${incident.creatorId.toString()}`).emit('incident_synced', incident);
    }
    logger_1.logger.info(`Realtime: Broadcasted incident_synced (${incident._id})`);
}
/**
 * Emits "priority_updated" event to organization and incident case rooms
 */
function notifyPriorityUpdated(incidentId, orgId, priority) {
    const server = getSocketServer();
    const payload = { incidentId, priority };
    server.to(`incident:${incidentId}`).emit('priority_updated', payload);
    if (orgId) {
        server.to(`org:${orgId}`).emit('priority_updated', payload);
    }
    logger_1.logger.info(`Realtime: Broadcasted priority_updated for incident ${incidentId}`);
}
/**
 * Emits "alert_created" event globally (for weather/global alerts) or to organization room
 */
function notifyAlertCreated(alert) {
    const server = getSocketServer();
    if (alert.orgId) {
        server.to(`org:${alert.orgId.toString()}`).emit('alert_created', alert);
    }
    else {
        server.emit('alert_created', alert); // Broadcast globally
    }
    logger_1.logger.info(`Realtime: Broadcasted alert_created (${alert._id})`);
}
/**
 * Emits "assignment_created" event to assignee personal room and organization room
 */
function notifyAssignmentCreated(assignment) {
    const server = getSocketServer();
    if (assignment.assigneeId) {
        server.to(`user:${assignment.assigneeId.toString()}`).emit('assignment_created', assignment);
    }
    if (assignment.orgId) {
        server.to(`org:${assignment.orgId.toString()}`).emit('assignment_created', assignment);
    }
    logger_1.logger.info(`Realtime: Broadcasted assignment_created (${assignment._id})`);
}
/**
 * Emits "verification_completed" event to organization and incident case rooms
 */
function notifyVerificationCompleted(incidentId, orgId, verification) {
    const server = getSocketServer();
    const payload = { incidentId, verification };
    server.to(`incident:${incidentId}`).emit('verification_completed', payload);
    if (orgId) {
        server.to(`org:${orgId}`).emit('verification_completed', payload);
    }
    logger_1.logger.info(`Realtime: Broadcasted verification_completed for incident ${incidentId}`);
}
/**
 * Emits "status_changed" event (maps status_changed/case_closed) to organization and case rooms
 */
function notifyStatusChanged(incidentId, orgId, status) {
    const server = getSocketServer();
    const eventName = status === 'CLOSED' ? 'case_closed' : 'status_changed';
    const payload = { incidentId, status };
    server.to(`incident:${incidentId}`).emit(eventName, payload);
    if (orgId) {
        server.to(`org:${orgId}`).emit(eventName, payload);
    }
    logger_1.logger.info(`Realtime: Broadcasted ${eventName} for incident ${incidentId}`);
}
/**
 * Emits "observation_received" event to creator and organization rooms
 */
function notifyObservationReceived(observation) {
    const server = getSocketServer();
    if (observation.orgId) {
        server.to(`org:${observation.orgId.toString()}`).emit('observation_received', observation);
    }
    if (observation.creatorId) {
        server.to(`user:${observation.creatorId.toString()}`).emit('observation_received', observation);
    }
    logger_1.logger.info(`Realtime: Broadcasted observation_received (${observation._id})`);
}
