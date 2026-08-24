"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const User_model_1 = require("./User.model");
const errors_1 = require("../common/errors");
const AuditLog_model_1 = require("../audit/AuditLog.model");
// Validation Schemas
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    name: zod_1.z.string().min(1, 'Name is required'),
    role: zod_1.z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']).optional(),
    isActive: zod_1.z.boolean().optional(),
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
        console.error('Failed to write audit log in user controller:', error);
    }
}
async function getUsers(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        if (citizenRoles.includes(userContext.role)) {
            throw new errors_1.ForbiddenError('Access denied: citizens/tipsters cannot list users');
        }
        if (!userContext.orgId) {
            throw new errors_1.ForbiddenError('Access denied: staff must belong to an organization to list users');
        }
        // Organization boundary isolation
        const users = await User_model_1.User.find({ orgId: userContext.orgId }).populate('orgId', 'name code');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getUserById(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const targetUser = await User_model_1.User.findById(req.params.id).populate('orgId', 'name code');
        if (!targetUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        const isOwnProfile = targetUser._id.toString() === userContext.userId;
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isStaff = !citizenRoles.includes(userContext.role);
        const sharesOrganization = targetUser.orgId &&
            userContext.orgId &&
            targetUser.orgId._id.toString() === userContext.orgId.toString();
        // Isolation rules check
        if (!isOwnProfile && !(isStaff && sharesOrganization)) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, targetUser._id.toString(), req, {
                reason: 'Attempted to access profile outside organization boundary',
            });
            throw new errors_1.ForbiddenError('Access denied: resource belongs to a different organization boundary');
        }
        res.status(200).json({
            status: 'success',
            data: {
                user: targetUser,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function createUser(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        // Only ORG_ADMIN or SUPERVISOR can create new staff or profiles inside organization
        const allowedCreators = ['ORG_ADMIN', 'SUPERVISOR'];
        if (!allowedCreators.includes(userContext.role)) {
            throw new errors_1.ForbiddenError('Access denied: insufficient permission to create users');
        }
        if (!userContext.orgId) {
            throw new errors_1.ForbiddenError('Access denied: administrator must belong to an organization');
        }
        const { email, password, name, role } = exports.createUserSchema.parse(req.body);
        const existingUser = await User_model_1.User.findOne({ email });
        if (existingUser) {
            throw new errors_1.ValidationError('Email is already registered');
        }
        // Force organization boundary matching creator's organization
        let orgId = null;
        const citizenRoles = ['CITIZEN', 'TIPSTER'];
        const isTargetStaff = !citizenRoles.includes(role);
        if (isTargetStaff) {
            orgId = userContext.orgId.toString();
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        const newUser = await User_model_1.User.create({
            email,
            passwordHash,
            name,
            role,
            orgId,
        });
        await writeAuditLog('USER_CREATE', userContext.email, newUser._id.toString(), req, {
            targetUserRole: role,
            targetUserOrg: orgId,
        });
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    orgId: newUser.orgId,
                    isActive: newUser.isActive,
                    createdAt: newUser.createdAt,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateUser(req, res, next) {
    try {
        const userContext = req.user;
        if (!userContext) {
            throw new errors_1.ForbiddenError('Access denied: authentication required');
        }
        const targetUser = await User_model_1.User.findById(req.params.id);
        if (!targetUser) {
            throw new errors_1.NotFoundError('User not found');
        }
        const isOwnProfile = targetUser._id.toString() === userContext.userId;
        const allowedAdministrators = ['ORG_ADMIN', 'SUPERVISOR'];
        const sharesOrganization = targetUser.orgId &&
            userContext.orgId &&
            targetUser.orgId.toString() === userContext.orgId.toString();
        const isAdminOfOrg = allowedAdministrators.includes(userContext.role) && sharesOrganization;
        if (!isOwnProfile && !isAdminOfOrg) {
            await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, targetUser._id.toString(), req, {
                reason: 'Attempted to edit profile outside authority boundary',
            });
            throw new errors_1.ForbiddenError('Access denied: insufficient permissions to edit this user');
        }
        const updates = exports.updateUserSchema.parse(req.body);
        // Strict boundary gates
        if (isOwnProfile && !isAdminOfOrg) {
            // Regular user updating their own profile
            if (updates.role !== undefined || updates.isActive !== undefined) {
                throw new errors_1.ForbiddenError('Access denied: users cannot change their own role or active status');
            }
        }
        // Process update changes
        if (updates.name !== undefined)
            targetUser.name = updates.name;
        if (updates.email !== undefined) {
            if (updates.email !== targetUser.email) {
                const emailTaken = await User_model_1.User.findOne({ email: updates.email });
                if (emailTaken) {
                    throw new errors_1.ValidationError('Email is already in use');
                }
                targetUser.email = updates.email;
            }
        }
        if (updates.role !== undefined) {
            const oldRole = targetUser.role;
            targetUser.role = updates.role;
            const citizenRoles = ['CITIZEN', 'TIPSTER'];
            const targetWasCitizen = citizenRoles.includes(oldRole);
            const targetIsNowCitizen = citizenRoles.includes(updates.role);
            if (targetIsNowCitizen) {
                // Remove org link if role drops to citizen/tipster
                targetUser.orgId = null;
            }
            else if (targetWasCitizen && !targetIsNowCitizen) {
                // Enforce boundary: assign to administrator's organization on upgrade
                if (!userContext.orgId) {
                    throw new errors_1.ForbiddenError('Cannot upgrade user to staff: administrator lacks organization context');
                }
                targetUser.orgId = userContext.orgId;
            }
        }
        if (updates.isActive !== undefined) {
            targetUser.isActive = updates.isActive;
        }
        await targetUser.save();
        await writeAuditLog('USER_UPDATE', userContext.email, targetUser._id.toString(), req, {
            updatedFields: Object.keys(updates),
        });
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: targetUser._id,
                    email: targetUser.email,
                    name: targetUser.name,
                    role: targetUser.role,
                    orgId: targetUser.orgId,
                    isActive: targetUser.isActive,
                    updatedAt: targetUser.updatedAt,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}
