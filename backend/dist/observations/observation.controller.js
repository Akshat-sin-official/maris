"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateObservationSchema = exports.createObservationSchema = void 0;
exports.createObservation = createObservation;
exports.getObservations = getObservations;
exports.getObservationById = getObservationById;
exports.updateObservation = updateObservation;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const Observation_model_1 = require("./Observation.model");
const errors_1 = require("../common/errors");
const AuditLog_model_1 = require("../audit/AuditLog.model");
const socket_1 = require("../realtime/socket");
// Validation Schemas
exports.createObservationSchema = zod_1.z.object({
    category: zod_1.z.enum(['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard']),
    value: zod_1.z.string().min(1, 'Value is required'),
    confidence: zod_1.z.number().min(0.0, 'Confidence cannot be less than 0.0').max(1.0, 'Confidence cannot be greater than 1.0'),
    location: zod_1.z.object({
        type: zod_1.z.enum(['Point']),
        coordinates: zod_1.z.array(zod_1.z.number()).length(2), // [lng, lat]
    }),
    timestamp: zod_1.z.coerce.date(),
    evidenceIds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateObservationSchema = zod_1.z.object({
    category: zod_1.z.enum(['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard']).optional(),
    value: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0.0).max(1.0).optional(),
    verification: zod_1.z
        .object({
        status: zod_1.z.enum(['UNVERIFIED', 'VERIFIED', 'REJECTED']),
        notes: zod_1.z.string().optional(),
    })
        .optional(),
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
        console.error('Failed to write audit log in observation controller:', error);
    }
}
async function createObservation(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const { category, value, confidence, location, timestamp, evidenceIds } = exports.createObservationSchema.parse(req.body);
        const orgId = userContext.orgId ? new mongoose_1.default.Types.ObjectId(userContext.orgId) : null;
        const observerId = new mongoose_1.default.Types.ObjectId(userContext.userId);
        const creatorId = observerId;
        const mappedEvidenceIds = evidenceIds
            ? evidenceIds.map((id) => new mongoose_1.default.Types.ObjectId(id))
            : [];
        const observation = await Observation_model_1.Observation.create({
            orgId,
            observerId,
            creatorId,
            category,
            value,
            confidence,
            location,
            evidenceIds: mappedEvidenceIds,
            timestamp,
            verification: { status: 'UNVERIFIED', verifiedBy: null, verifiedAt: null },
        });
        // Real-time observation notification broadcast
        (0, socket_1.notifyObservationReceived)(observation);
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'CREATE_OBSERVATION',
            observationId: observation._id.toString(),
        });
        res.status(201).json({
            status: 'success',
            data: {
                observation,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getObservations(req, res, next) {
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
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.verificationStatus) {
            query['verification.status'] = req.query.verificationStatus;
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.value = { $regex: searchRegex };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'timestamp';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sortParams = { [sortBy]: sortOrder };
        const total = await Observation_model_1.Observation.countDocuments(query);
        const observations = await Observation_model_1.Observation.find(query)
            .sort(sortParams)
            .skip(skip)
            .limit(limit)
            .populate('observerId', 'name email role')
            .populate('evidenceIds');
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            status: 'success',
            results: observations.length,
            metadata: {
                total,
                page,
                limit,
                pages,
            },
            data: {
                observations,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getObservationById(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const observation = await Observation_model_1.Observation.findById(req.params.id)
            .populate('observerId', 'name email role')
            .populate('evidenceIds')
            .populate('orgId', 'name code');
        if (!observation) {
            throw new errors_1.NotFoundError('Observation not found');
        }
        const isCreator = observation.creatorId.toString() === userContext.userId;
        const sharesOrg = observation.orgId &&
            userContext.orgId &&
            observation.orgId._id.toString() === userContext.orgId.toString();
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        if (!isCreator && !(isStaff && sharesOrg)) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
                reason: 'Attempted to access observation details outside boundary',
                observationId: req.params.id,
            });
            throw new errors_1.ForbiddenError('Access denied: resource belongs to a different organization boundary');
        }
        res.status(200).json({
            status: 'success',
            data: {
                observation,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateObservation(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const observation = await Observation_model_1.Observation.findById(req.params.id);
        if (!observation) {
            throw new errors_1.NotFoundError('Observation not found');
        }
        const isCreator = observation.creatorId.toString() === userContext.userId;
        const sharesOrg = observation.orgId &&
            userContext.orgId &&
            observation.orgId.toString() === userContext.orgId.toString();
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        if (!isCreator && !(isStaff && sharesOrg)) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
                reason: 'Attempted to edit observation outside boundary',
                observationId: req.params.id,
            });
            throw new errors_1.ForbiddenError('Access denied: insufficient permissions to update this observation');
        }
        const updates = exports.updateObservationSchema.parse(req.body);
        if (!isStaff) {
            if (updates.verification !== undefined) {
                throw new errors_1.ForbiddenError('Access denied: citizens cannot update observation verification status');
            }
        }
        if (updates.category !== undefined)
            observation.category = updates.category;
        if (updates.value !== undefined)
            observation.value = updates.value;
        if (updates.confidence !== undefined)
            observation.confidence = updates.confidence;
        if (updates.verification !== undefined) {
            observation.verification = {
                status: updates.verification.status,
                verifiedBy: new mongoose_1.default.Types.ObjectId(userContext.userId),
                verifiedAt: new Date(),
                notes: updates.verification.notes,
            };
            // Real-time verification completed notification broadcast
            (0, socket_1.notifyVerificationCompleted)(observation._id.toString(), observation.orgId ? observation.orgId.toString() : null, observation.verification);
        }
        await observation.save();
        await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
            action: 'UPDATE_OBSERVATION',
            observationId: observation._id.toString(),
            updatedFields: Object.keys(updates),
        });
        res.status(200).json({
            status: 'success',
            data: {
                observation,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
