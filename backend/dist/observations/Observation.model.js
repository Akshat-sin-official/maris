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
exports.Observation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Location_schema_1 = require("../locations/Location.schema");
const VerificationSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
        required: true,
        default: 'UNVERIFIED',
    },
    verifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
    notes: {
        type: String,
    },
}, { _id: false });
const ObservationSchema = new mongoose_1.Schema({
    orgId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true,
    },
    observerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    location: {
        type: Location_schema_1.LocationSchema,
        required: true,
    },
    category: {
        type: String,
        enum: ['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard'],
        required: true,
        index: true,
    },
    value: {
        type: String,
        required: true,
    },
    confidence: {
        type: Number,
        required: true,
        min: [0.0, 'Confidence cannot be less than 0.0'],
        max: [1.0, 'Confidence cannot be greater than 1.0'],
    },
    evidenceIds: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Evidence' }],
        default: [],
    },
    verification: {
        type: VerificationSchema,
        default: () => ({ status: 'UNVERIFIED', verifiedBy: null, verifiedAt: null }),
    },
    timestamp: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Enable geospatial queries on observation point coordinates
ObservationSchema.index({ location: '2dsphere' });
exports.Observation = mongoose_1.default.model('Observation', ObservationSchema);
