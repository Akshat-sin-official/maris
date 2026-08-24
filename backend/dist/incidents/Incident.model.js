"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Incident = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Location_schema_1 = require("../locations/Location.schema");
const IncidentItemSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['vessel_detection', 'oil_slick', 'unauthorized_entry', 'marine_life_hazard'],
        required: true,
    },
    location: {
        type: Location_schema_1.LocationSchema,
        required: true,
    },
    detectedAt: {
        type: Date,
        required: true,
    },
    details: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, { _id: false });
const TimelineEventSchema = new mongoose_1.Schema({
    eventType: {
        type: String,
        enum: [
            'EVIDENCE_CAPTURED',
            'LOCATION_RECORDED',
            'INCIDENT_CREATED',
            'SAVED_OFFLINE',
            'SYNC_STARTED',
            'SYNC_COMPLETED',
            'SYNC_FAILED',
            'AI_ANALYSIS_STARTED',
            'AI_ANALYSIS_COMPLETED',
            'MATCHES_FOUND',
            'PRIORITY_ASSIGNED',
            'CASE_ASSIGNED',
            'VERIFICATION_STARTED',
            'VERIFICATION_COMPLETED',
            'STATUS_CHANGED',
            'RESPONSE_UPDATED',
            'CASE_CLOSED',
        ],
        required: true,
    },
    actorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const IncidentSchema = new mongoose_1.Schema({
    orgId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true,
    },
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: [
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
        ],
        required: true,
        default: 'RECEIVED',
        index: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true,
        default: 'LOW',
        index: true,
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    items: {
        type: [IncidentItemSchema],
        default: [],
    },
    timeline: {
        type: [TimelineEventSchema],
        default: [],
    },
    // Offline sync definitions
    clientId: {
        type: String,
        default: null,
        index: {
            unique: true,
            sparse: true, // Prevents unique clashes on null values
        },
    },
    clientCreatedAt: {
        type: Date,
        default: null,
    },
    syncState: {
        type: String,
        enum: ['PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT'],
        default: 'SYNCED',
        index: true,
    },
}, {
    timestamps: true,
});
IncidentSchema.index({ 'items.location': '2dsphere' });
exports.Incident = mongoose_1.default.model('Incident', IncidentSchema);
