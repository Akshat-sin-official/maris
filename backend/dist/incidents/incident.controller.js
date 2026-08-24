"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIncidentSchema = exports.createIncidentSchema = void 0;
exports.createIncident = createIncident;
exports.getIncidents = getIncidents;
exports.getIncidentById = getIncidentById;
exports.updateIncident = updateIncident;
exports.getIncidentTimeline = getIncidentTimeline;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const Incident_model_1 = require("./Incident.model");
const errors_1 = require("../common/errors");
const AuditLog_model_1 = require("../audit/AuditLog.model");
const socket_1 = require("../realtime/socket");
// Validation Schemas
exports.createIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    items: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['vessel_detection', 'oil_slick', 'unauthorized_entry', 'marine_life_hazard']),
        location: zod_1.z.object({
            type: zod_1.z.enum(['Point', 'Polygon', 'MultiPolygon']),
            coordinates: zod_1.z.any(),
        }),
        detectedAt: zod_1.z.coerce.date(),
        details: zod_1.z.record(zod_1.z.any()).optional(),
    })).default([]),
});
exports.updateIncidentSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum([
        'RECEIVED',
        'SCREENING',
        'PRIORITIZED',
        'ASSIGNED',
        'UNDER_VERIFICATION',
        'VERIFIED',
        'ACTIONED',
        'CLOSED',
        'REJECTED',
        'DUPLICATE',
        'ON_HOLD',
        'ESCALATED',
    ]).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedTo: zod_1.z.string().nullable().optional(),
});
// Helper for audit logs
async function writeAuditLog(eventType, actorEmail, userId, req, details) {
    try {
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        await AuditLog_model_1.AuditLog.create({
            eventType,
            userId,
            actorEmail,
            ipAddress,
            userAgent,
            details,
        });
    }
    catch (error) {
        console.error('Failed to write audit log in incident controller:', error);
    }
}
async function createIncident(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { title, description, priority, items } = exports.createIncidentSchema.parse(req.body);
        const orgId = userContext.orgId ? new mongoose_1.default.Types.ObjectId(userContext.orgId) : null;
        const creatorId = new mongoose_1.default.Types.ObjectId(userContext.userId);
        const timeline = [
            {
                eventType: 'INCIDENT_CREATED',
                actorId: creatorId,
                message: `Incident created by user: ${userContext.email}`,
                timestamp: new Date(),
            },
        ];
        const incident = await Incident_model_1.Incident.create({
            orgId,
            creatorId,
            title,
            description,
            priority,
            items,
            status: 'RECEIVED',
            timeline,
        });
        // Real-time notification broadcast
        (0, socket_1.notifyNewIncident)(incident);
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'CREATE_INCIDENT',
            incidentId: incident._id.toString(),
        });
        res.status(201).json({
            status: 'success',
            data: {
                incident,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidents(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const query = {};
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        if (citizenRoles.includes(userContext.role)) {
            query.creatorId = new mongoose_1.default.Types.ObjectId(userContext.userId);
        }
        else {
            if (!userContext.orgId) {
                throw new errors_1.ForbiddenError('Access denied: staff must belong to an organization');
            }
            query.orgId = new mongoose_1.default.Types.ObjectId(userContext.orgId);
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.priority) {
            query.priority = req.query.priority;
        }
        if (req.query.assignedTo) {
            query.assignedTo = req.query.assignedTo === 'null'
                ? null
                : new mongoose_1.default.Types.ObjectId(req.query.assignedTo);
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
            ];
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sortParams = { [sortBy]: sortOrder };
        const total = await Incident_model_1.Incident.countDocuments(query);
        const incidents = await Incident_model_1.Incident.find(query)
            .sort(sortParams)
            .skip(skip)
            .limit(limit)
            .populate('creatorId', 'name email role')
            .populate('assignedTo', 'name email role');
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            status: 'success',
            results: incidents.length,
            metadata: {
                total,
                page,
                limit,
                pages,
            },
            data: {
                incidents,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidentById(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const incident = await Incident_model_1.Incident.findById(req.params.id)
            .populate('creatorId', 'name email role')
            .populate('assignedTo', 'name email role')
            .populate('orgId', 'name code');
        if (!incident) {
            throw new errors_1.NotFoundError('Incident not found');
        }
        const isCreator = incident.creatorId._id.toString() === userContext.userId;
        const sharesOrg = incident.orgId &&
            userContext.orgId &&
            incident.orgId._id.toString() === userContext.orgId.toString();
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        if (!isCreator && !(isStaff && sharesOrg)) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
                reason: 'Attempted to access incident details outside boundary',
                incidentId: req.params.id,
            });
            throw new errors_1.ForbiddenError('Access denied: resource belongs to a different organization boundary');
        }
        res.status(200).json({
            status: 'success',
            data: {
                incident,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateIncident(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const incident = await Incident_model_1.Incident.findById(req.params.id);
        if (!incident) {
            throw new errors_1.NotFoundError('Incident not found');
        }
        const isCreator = incident.creatorId.toString() === userContext.userId;
        const sharesOrg = incident.orgId &&
            userContext.orgId &&
            incident.orgId.toString() === userContext.orgId.toString();
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        if (!isCreator && !(isStaff && sharesOrg)) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
                reason: 'Attempted to edit incident outside boundary',
                incidentId: req.params.id,
            });
            throw new errors_1.ForbiddenError('Access denied: insufficient permissions to update this incident');
        }
        const updates = exports.updateIncidentSchema.parse(req.body);
        const actorId = new mongoose_1.default.Types.ObjectId(userContext.userId);
        if (!isStaff) {
            if (updates.status !== undefined ||
                updates.priority !== undefined ||
                updates.assignedTo !== undefined) {
                throw new errors_1.ForbiddenError('Access denied: citizens cannot update incident status, priority, or assignee');
            }
        }
        if (updates.title !== undefined)
            incident.title = updates.title;
        if (updates.description !== undefined)
            incident.description = updates.description;
        if (updates.priority !== undefined && updates.priority !== incident.priority) {
            incident.timeline.push({
                eventType: 'PRIORITY_ASSIGNED',
                actorId,
                message: `Priority updated from ${incident.priority} to ${updates.priority}`,
                timestamp: new Date(),
            });
            incident.priority = updates.priority;
            // Real-time notification broadcast
            (0, socket_1.notifyPriorityUpdated)(incident._id.toString(), incident.orgId ? incident.orgId.toString() : null, updates.priority);
        }
        if (updates.status !== undefined && updates.status !== incident.status) {
            const isClosing = updates.status === 'CLOSED';
            incident.timeline.push({
                eventType: isClosing ? 'CASE_CLOSED' : 'STATUS_CHANGED',
                actorId,
                message: `Status updated from ${incident.status} to ${updates.status}`,
                timestamp: new Date(),
            });
            if (updates.status === 'UNDER_VERIFICATION') {
                incident.timeline.push({
                    eventType: 'VERIFICATION_STARTED',
                    actorId,
                    message: 'Case verification process has been initialized',
                    timestamp: new Date(),
                });
            }
            else if (updates.status === 'VERIFIED') {
                incident.timeline.push({
                    eventType: 'VERIFICATION_COMPLETED',
                    actorId,
                    message: 'Case verification successfully completed',
                    timestamp: new Date(),
                });
            }
            incident.status = updates.status;
            // Real-time notification broadcast
            (0, socket_1.notifyStatusChanged)(incident._id.toString(), incident.orgId ? incident.orgId.toString() : null, updates.status);
        }
        if (updates.assignedTo !== undefined) {
            const newAssignee = updates.assignedTo
                ? new mongoose_1.default.Types.ObjectId(updates.assignedTo)
                : null;
            const oldAssigneeStr = incident.assignedTo ? incident.assignedTo.toString() : 'None';
            const newAssigneeStr = updates.assignedTo || 'None';
            if (oldAssigneeStr !== newAssigneeStr) {
                incident.timeline.push({
                    eventType: 'CASE_ASSIGNED',
                    actorId,
                    message: `Assignee changed from ${oldAssigneeStr} to ${newAssigneeStr}`,
                    timestamp: new Date(),
                });
                incident.assignedTo = newAssignee;
            }
        }
        await incident.save();
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'UPDATE_INCIDENT',
            incidentId: incident._id.toString(),
            updatedFields: Object.keys(updates),
        });
        res.status(200).json({
            status: 'success',
            data: {
                incident,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidentTimeline(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const incident = await Incident_model_1.Incident.findById(req.params.id);
        if (!incident) {
            throw new errors_1.NotFoundError('Incident not found');
        }
        const isCreator = incident.creatorId.toString() === userContext.userId;
        const sharesOrg = incident.orgId &&
            userContext.orgId &&
            incident.orgId.toString() === userContext.orgId.toString();
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        if (!isCreator && !(isStaff && sharesOrg)) {
            throw new errors_1.ForbiddenError('Access denied: insufficient permissions to view timeline for this incident');
        }
        res.status(200).json({
            status: 'success',
            results: incident.timeline.length,
            data: {
                timeline: incident.timeline,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
