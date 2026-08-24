"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const User_model_1 = require("../users/User.model");
const Organization_model_1 = require("../organizations/Organization.model");
const RefreshToken_model_1 = require("./RefreshToken.model");
const AuditLog_model_1 = require("../audit/AuditLog.model");
const jwt_utils_1 = require("./jwt.utils");
const errors_1 = require("../common/errors");
// Validation Schemas
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    name: zod_1.z.string().min(1, 'Name is required'),
    role: zod_1.z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']),
    orgCode: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string(),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
// Helper for generating audit logs without throwing
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
        // Fail silently on audit log writes to avoid blocking requests, but console log it
        console.error('Failed to write audit log:', error);
    }
}
async function register(req, res, next) {
    try {
        const { email, password, name, role, orgCode } = exports.registerSchema.parse(req.body);
        // 1. Check if user already exists
        const existingUser = await User_model_1.User.findOne({ email });
        if (existingUser) {
            throw new errors_1.ValidationError('Email is already registered');
        }
        // 2. Resolve organization if staff role
        let orgId = null;
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(role);
        if (isStaff) {
            if (!orgCode) {
                throw new errors_1.ValidationError(`Organization code (orgCode) is required for role: ${role}`);
            }
            const org = await Organization_model_1.Organization.findOne({ code: orgCode, isActive: true });
            if (!org) {
                throw new errors_1.ValidationError(`Active organization with code '${orgCode}' not found`);
            }
            orgId = org._id.toString();
        }
        else {
            if (orgCode) {
                throw new errors_1.ValidationError(`Citizens and tipsters cannot belong to an organization.`);
            }
        }
        // 3. Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        // 4. Create user
        const user = await User_model_1.User.create({
            email,
            passwordHash,
            name,
            role,
            orgId,
        });
        await writeAuditLog('USER_CREATE', email, user._id.toString(), req, { role });
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    orgId: user.orgId,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = exports.loginSchema.parse(req.body);
        // 1. Fetch user including passwordHash
        const user = await User_model_1.User.findOne({ email, isActive: true }).select('+passwordHash');
        if (!user) {
            await writeAuditLog('LOGIN_FAILURE', email, null, req, { reason: 'User not found or inactive' });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // 2. Verify password
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            await writeAuditLog('LOGIN_FAILURE', email, user._id.toString(), req, { reason: 'Incorrect password' });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // 3. Generate tokens
        const accessToken = (0, jwt_utils_1.generateToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            orgId: user.orgId ? user.orgId.toString() : null,
        });
        const rawRefreshToken = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days
        await RefreshToken_model_1.RefreshToken.create({
            token: rawRefreshToken,
            userId: user._id,
            expiresAt,
        });
        await writeAuditLog('LOGIN_SUCCESS', email, user._id.toString(), req);
        res.status(200).json({
            status: 'success',
            data: {
                accessToken,
                refreshToken: rawRefreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    orgId: user.orgId,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function refresh(req, res, next) {
    try {
        const { refreshToken } = exports.refreshSchema.parse(req.body);
        // 1. Find the refresh token record and user
        const tokenRecord = await RefreshToken_model_1.RefreshToken.findOne({ token: refreshToken });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        const user = await User_model_1.User.findById(tokenRecord.userId);
        if (!user || !user.isActive) {
            throw new errors_1.UnauthorizedError('Associated user not found or inactive');
        }
        // 2. Revoke / delete the used refresh token
        await RefreshToken_model_1.RefreshToken.deleteOne({ _id: tokenRecord._id });
        // 3. Generate new token pair
        const accessToken = (0, jwt_utils_1.generateToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            orgId: user.orgId ? user.orgId.toString() : null,
        });
        const newRawRefreshToken = crypto_1.default.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await RefreshToken_model_1.RefreshToken.create({
            token: newRawRefreshToken,
            userId: user._id,
            expiresAt,
        });
        await writeAuditLog('TOKEN_REFRESH', user.email, user._id.toString(), req);
        res.status(200).json({
            status: 'success',
            data: {
                accessToken,
                refreshToken: newRawRefreshToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        const { refreshToken } = exports.refreshSchema.parse(req.body);
        const tokenRecord = await RefreshToken_model_1.RefreshToken.findOne({ token: refreshToken });
        if (tokenRecord) {
            const user = await User_model_1.User.findById(tokenRecord.userId);
            await RefreshToken_model_1.RefreshToken.deleteOne({ _id: tokenRecord._id });
            if (user) {
                await writeAuditLog('LOGOUT', user.email, user._id.toString(), req);
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Unauthorized');
        }
        const user = await User_model_1.User.findById(req.user.userId).populate('orgId', 'name code');
        if (!user) {
            throw new errors_1.NotFoundError('User profile not found');
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
