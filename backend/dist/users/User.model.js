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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false, // Do not fetch password hash in standard queries
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN'],
    },
    orgId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
        validate: {
            validator: function (val) {
                // orgId is required for staff roles, and must be null for CITIZEN and TIPSTER
                const citizenRoles = ['CITIZEN', 'TIPSTER'];
                if (citizenRoles.includes(this.role)) {
                    return val === null;
                }
                return val !== null;
            },
            message: 'Organization ID is required for staff roles and must be null for CITIZEN/TIPSTER roles.',
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Ensure passwordHash is never returned in JSON conversions
UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
    },
});
exports.User = mongoose_1.default.model('User', UserSchema);
