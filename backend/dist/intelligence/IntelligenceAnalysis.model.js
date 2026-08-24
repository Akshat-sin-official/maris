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
exports.IntelligenceAnalysis = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const IntelligenceAnalysisSchema = new mongoose_1.Schema({
    incidentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true,
        unique: true,
        index: true,
    },
    orgId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        index: true,
    },
    priorityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    confidence: {
        type: Number,
        required: true,
        min: 0.0,
        max: 1.0,
    },
    evidenceStrength: {
        type: String,
        enum: ['WEAK', 'MODERATE', 'STRONG'],
        required: true,
    },
    verificationStatus: {
        type: String,
        enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
        default: 'UNVERIFIED',
        index: true,
    },
    matchedIncidents: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Incident',
        },
    ],
    matchedObservations: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Observation',
        },
    ],
    prioritySignals: [
        {
            ruleName: { type: String, required: true },
            factor: { type: String, required: true },
            weight: { type: Number, required: true },
            scoreContribution: { type: Number, required: true },
        },
    ],
    explanation: {
        summary: { type: String, required: true },
        details: { type: [String], default: [] },
    },
}, {
    timestamps: true,
});
exports.IntelligenceAnalysis = mongoose_1.default.model('IntelligenceAnalysis', IntelligenceAnalysisSchema);
