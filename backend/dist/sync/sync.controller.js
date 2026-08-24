"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncBatchSchema = exports.syncEvidenceSchema = exports.syncIncidentSchema = void 0;
exports.syncSingleIncident = syncSingleIncident;
exports.syncSingleEvidence = syncSingleEvidence;
exports.syncBatch = syncBatch;
exports.getSyncStatus = getSyncStatus;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const Incident_model_1 = require("../incidents/Incident.model");
const Evidence_model_1 = require("../evidence/Evidence.model");
const timeline_service_1 = require("../incidents/timeline.service");
const errors_1 = require("../common/errors");
const AuditLog_model_1 = require("../audit/AuditLog.model");
const socket_1 = require("../realtime/socket");
// Zod schemas for validation
exports.syncIncidentSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'clientId is required'),
    title: zod_1.z.string().min(1, 'title is required'),
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
    clientCreatedAt: zod_1.z.coerce.date(),
    deviceMetadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.syncEvidenceSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, 'clientId is required'),
    incidentId: zod_1.z.string().min(1, 'incidentId is required'), // Could be client-side ID or server ObjectId
    mediaType: zod_1.z.enum(['image', 'video', 'audio']),
    url: zod_1.z.string().url('Invalid URL format'),
    fileHash: zod_1.z.string().min(1, 'fileHash is required'),
    location: zod_1.z
        .object({
        type: zod_1.z.enum(['Point']),
        coordinates: zod_1.z.array(zod_1.z.number()).length(2),
    })
        .optional(),
    deviceMetadata: zod_1.z.record(zod_1.z.any()).optional(),
    capturedAt: zod_1.z.coerce.date(),
    clientCreatedAt: zod_1.z.coerce.date(),
    source: zod_1.z.string().optional(),
});
exports.syncBatchSchema = zod_1.z.object({
    incidents: zod_1.z.array(zod_1.z.any()).default([]),
    evidences: zod_1.z.array(zod_1.z.any()).default([]),
});
// Helper for audit logging
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
        console.error('Failed to write audit log in sync controller:', error);
    }
}
/**
 * Idempotently synchronizes a single offline-created incident
 */
async function syncSingleIncident(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const payload = exports.syncIncidentSchema.parse(req.body);
        const result = await processIncidentSync(payload, userContext.userId, userContext.orgId);
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'SYNC_INCIDENT',
            clientId: payload.clientId,
            status: result.status,
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Idempotently synchronizes a single offline-created evidence file
 */
async function syncSingleEvidence(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const payload = exports.syncEvidenceSchema.parse(req.body);
        const result = await processEvidenceSync(payload, userContext.userId, userContext.orgId);
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'SYNC_EVIDENCE',
            clientId: payload.clientId,
            status: result.status,
        });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Performs a batch sync of multiple incidents and evidence files with partial failure handling
 */
async function syncBatch(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { incidents, evidences } = exports.syncBatchSchema.parse(req.body);
        const incidentResults = [];
        for (const inc of incidents) {
            try {
                const parsedInc = exports.syncIncidentSchema.parse(inc);
                const resObj = await processIncidentSync(parsedInc, userContext.userId, userContext.orgId);
                incidentResults.push(resObj);
            }
            catch (err) {
                let errMsg = err.message || 'Unknown validation failure';
                if (err instanceof zod_1.z.ZodError) {
                    errMsg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                }
                incidentResults.push({
                    clientId: inc?.clientId || 'unknown',
                    status: 'FAILED',
                    error: `Request validation failed: ${errMsg}`,
                });
            }
        }
        const evidenceResults = [];
        for (const ev of evidences) {
            try {
                const parsedEv = exports.syncEvidenceSchema.parse(ev);
                const resObj = await processEvidenceSync(parsedEv, userContext.userId, userContext.orgId);
                evidenceResults.push(resObj);
            }
            catch (err) {
                let errMsg = err.message || 'Unknown validation failure';
                if (err instanceof zod_1.z.ZodError) {
                    errMsg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                }
                evidenceResults.push({
                    clientId: ev?.clientId || 'unknown',
                    status: 'FAILED',
                    error: `Request validation failed: ${errMsg}`,
                });
            }
        }
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'SYNC_BATCH',
            incidentsCount: incidents.length,
            evidencesCount: evidences.length,
        });
        res.status(200).json({
            status: 'success',
            results: {
                incidents: incidentResults,
                evidences: evidenceResults,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Retrieves the sync status of a given clientId
 */
async function getSyncStatus(req, res, next) {
    try {
        const { clientId } = req.params;
        // Check incidents
        const incident = await Incident_model_1.Incident.findOne({ clientId });
        if (incident) {
            res.status(200).json({
                clientId,
                serverId: incident._id.toString(),
                status: incident.syncState,
            });
            return;
        }
        // Check evidence
        const evidence = await Evidence_model_1.Evidence.findOne({ clientId });
        if (evidence) {
            res.status(200).json({
                clientId,
                serverId: evidence._id.toString(),
                status: evidence.syncState,
            });
            return;
        }
        res.status(200).json({
            clientId,
            status: 'NOT_FOUND',
        });
    }
    catch (error) {
        next(error);
    }
}
// =========================================================================
// Process Helpers
// =========================================================================
async function processIncidentSync(payload, userId, userOrgId) {
    const { clientId, title, description, priority, items, clientCreatedAt } = payload;
    // 1. Idempotency Check: search by clientId
    const existingIncident = await Incident_model_1.Incident.findOne({ clientId });
    if (existingIncident) {
        // Check for conflicts: if the title has changed dramatically, let's log conflict
        if (existingIncident.title !== title) {
            return {
                clientId,
                serverId: existingIncident._id.toString(),
                status: 'CONFLICT',
                error: 'Conflict: data on server differs from incoming sync payload',
            };
        }
        return {
            clientId,
            serverId: existingIncident._id.toString(),
            status: 'SYNCED',
        };
    }
    const orgId = userOrgId ? new mongoose_1.default.Types.ObjectId(userOrgId) : null;
    const creatorId = new mongoose_1.default.Types.ObjectId(userId);
    // 2. Create new Incident
    const incident = await Incident_model_1.Incident.create({
        orgId,
        creatorId,
        title,
        description,
        priority,
        items,
        status: 'RECEIVED',
        clientId,
        clientCreatedAt,
        syncState: 'SYNCED',
        timeline: [
            {
                eventType: 'INCIDENT_CREATED',
                actorId: creatorId,
                message: 'Incident reported offline',
                timestamp: clientCreatedAt,
            },
            {
                eventType: 'SYNC_COMPLETED',
                actorId: creatorId,
                message: 'Incident successfully synced to the cloud server',
                timestamp: new Date(),
            },
        ],
    });
    // 3. Realtime sync notification
    (0, socket_1.notifyIncidentSynced)(incident);
    return {
        clientId,
        serverId: incident._id.toString(),
        status: 'SYNCED',
    };
}
async function processEvidenceSync(payload, userId, userOrgId) {
    const { clientId, incidentId, mediaType, url, fileHash, location, deviceMetadata, capturedAt, clientCreatedAt, source } = payload;
    // 1. Idempotency Check: search by clientId
    const existingEvidence = await Evidence_model_1.Evidence.findOne({ clientId });
    if (existingEvidence) {
        return {
            clientId,
            serverId: existingEvidence._id.toString(),
            status: 'SYNCED',
        };
    }
    // 2. File Hash check (prevents duplicate media uploads for different clients)
    const duplicateHash = await Evidence_model_1.Evidence.findOne({ fileHash });
    if (duplicateHash) {
        return {
            clientId,
            status: 'CONFLICT',
            error: 'Conflict: duplicate file hash detected on a different record',
        };
    }
    // 3. Match incidentId reference (if it is a client ID, resolve to serverObjectId)
    let serverIncidentId = null;
    if (mongoose_1.default.Types.ObjectId.isValid(incidentId)) {
        serverIncidentId = new mongoose_1.default.Types.ObjectId(incidentId);
    }
    else {
        const parentIncident = await Incident_model_1.Incident.findOne({ clientId: incidentId });
        if (parentIncident) {
            serverIncidentId = parentIncident._id;
        }
        else {
            throw new errors_1.ValidationError(`ValidationError: parent incident client ID "${incidentId}" not found on server`);
        }
    }
    const orgId = userOrgId ? new mongoose_1.default.Types.ObjectId(userOrgId) : null;
    const uploadedBy = new mongoose_1.default.Types.ObjectId(userId);
    // 4. Create Evidence
    const evidence = await Evidence_model_1.Evidence.create({
        orgId,
        uploadedBy,
        incidentId: serverIncidentId,
        mediaType,
        url,
        fileHash,
        location,
        deviceMetadata,
        capturedAt,
        source,
        clientId,
        clientCreatedAt,
        syncState: 'SYNCED',
    });
    // 5. Log Timeline Event
    await timeline_service_1.TimelineService.logEvent(serverIncidentId, 'EVIDENCE_CAPTURED', userId, `Offline evidence file [${mediaType}] synchronized`);
    return {
        clientId,
        serverId: evidence._id.toString(),
        status: 'SYNCED',
    };
}
