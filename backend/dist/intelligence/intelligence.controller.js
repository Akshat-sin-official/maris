"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIncident = analyzeIncident;
exports.getAnalysis = getAnalysis;
exports.getMatches = getMatches;
exports.getExplanation = getExplanation;
exports.lookupByCoordinates = lookupByCoordinates;
const zod_1 = require("zod");
const intelligence_service_1 = require("./intelligence.service");
const IntelligenceAnalysis_model_1 = require("./IntelligenceAnalysis.model");
const Incident_model_1 = require("../incidents/Incident.model");
const errors_1 = require("../common/errors");
const AuditLog_model_1 = require("../audit/AuditLog.model");
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
        console.error('Failed to write audit log in intelligence controller:', error);
    }
}
/**
 * Enforces organization boundary isolation checks on the parent incident
 */
async function checkIncidentBoundary(incidentId, userContext, req) {
    const incident = await Incident_model_1.Incident.findById(incidentId);
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
            reason: 'Attempted to access intelligence data outside organization boundary',
            incidentId,
        });
        throw new errors_1.ForbiddenError('Access denied: resource belongs to a different organization boundary');
    }
    return incident;
}
/**
 * Triggers the intelligence matching and scoring pipeline for a case
 */
async function analyzeIncident(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { incidentId } = req.params;
        // Verify boundary permissions
        await checkIncidentBoundary(incidentId, userContext, req);
        // Run pipeline
        const analysis = await intelligence_service_1.IntelligenceService.runAnalysis(incidentId);
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'RUN_INTELLIGENCE_PIPELINE',
            incidentId,
            priorityScore: analysis.priorityScore,
        });
        res.status(200).json({
            status: 'success',
            data: {
                analysis,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Fetches basic intelligence metrics (score, confidence, evidence strength, verification state)
 */
async function getAnalysis(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { incidentId } = req.params;
        await checkIncidentBoundary(incidentId, userContext, req);
        const analysis = await IntelligenceAnalysis_model_1.IntelligenceAnalysis.findOne({ incidentId });
        if (!analysis) {
            throw new errors_1.NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
        }
        res.status(200).json({
            status: 'success',
            data: {
                priorityScore: analysis.priorityScore,
                confidence: analysis.confidence,
                evidenceStrength: analysis.evidenceStrength,
                verificationStatus: analysis.verificationStatus,
                createdAt: analysis.createdAt,
                updatedAt: analysis.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Fetches historical incident and observation matches
 */
async function getMatches(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { incidentId } = req.params;
        await checkIncidentBoundary(incidentId, userContext, req);
        const analysis = await IntelligenceAnalysis_model_1.IntelligenceAnalysis.findOne({ incidentId })
            .populate('matchedIncidents', 'title priority status items.location')
            .populate({
            path: 'matchedObservations',
            select: 'category value confidence location timestamp verification',
            populate: { path: 'observerId', select: 'name email role' },
        });
        if (!analysis) {
            throw new errors_1.NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
        }
        res.status(200).json({
            status: 'success',
            data: {
                matchedIncidents: analysis.matchedIncidents,
                matchedObservations: analysis.matchedObservations,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Fetches explainable justifications for the calculated metrics
 */
async function getExplanation(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { incidentId } = req.params;
        await checkIncidentBoundary(incidentId, userContext, req);
        const analysis = await IntelligenceAnalysis_model_1.IntelligenceAnalysis.findOne({ incidentId });
        if (!analysis) {
            throw new errors_1.NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
        }
        res.status(200).json({
            status: 'success',
            data: {
                explanation: analysis.explanation,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
const coordinateLookupSchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
});
/**
 * Handles lookup queries for arbitrary coordinates
 */
async function lookupByCoordinates(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const parsed = coordinateLookupSchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({
                status: 'error',
                code: 'INVALID_COORDINATES',
                message: 'Valid latitude and longitude are required.',
            });
            return;
        }
        const { lat, lng } = parsed.data;
        const lookupData = await intelligence_service_1.IntelligenceService.lookupByCoordinates(lat, lng);
        res.status(200).json(lookupData);
    }
    catch (error) {
        next(error);
    }
}
