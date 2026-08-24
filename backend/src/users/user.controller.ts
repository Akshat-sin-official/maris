import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User, UserRole } from './User.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError, ValidationError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';

// Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

// Helper for audit logs
async function writeAuditLog(
  eventType: 'USER_CREATE' | 'USER_UPDATE' | 'UNAUTHORIZED_ACCESS',
  actorEmail: string,
  userId: string | null,
  req: AuthenticatedRequest,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    await AuditLog.create({
      eventType,
      userId,
      actorEmail,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error('Failed to write audit log in user controller:', error);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
    if (citizenRoles.includes(userContext.role as UserRole)) {
      throw new ForbiddenError('Access denied: citizens/tipsters cannot list users');
    }

    if (!userContext.orgId) {
      throw new ForbiddenError('Access denied: staff must belong to an organization to list users');
    }

    // Organization boundary isolation
    const users = await User.find({ orgId: userContext.orgId }).populate('orgId', 'name code');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const targetUser = await User.findById(req.params.id).populate('orgId', 'name code');
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isOwnProfile = targetUser._id.toString() === userContext.userId;
    const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role as UserRole);
    const sharesOrganization =
      targetUser.orgId &&
      userContext.orgId &&
      targetUser.orgId._id.toString() === userContext.orgId.toString();

    // Isolation rules check
    if (!isOwnProfile && !(isStaff && sharesOrganization)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, targetUser._id.toString(), req, {
        reason: 'Attempted to access profile outside organization boundary',
      });
      throw new ForbiddenError('Access denied: resource belongs to a different organization boundary');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: targetUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    // Only ORG_ADMIN or SUPERVISOR can create new staff or profiles inside organization
    const allowedCreators: UserRole[] = ['ORG_ADMIN', 'SUPERVISOR'];
    if (!allowedCreators.includes(userContext.role as UserRole)) {
      throw new ForbiddenError('Access denied: insufficient permission to create users');
    }

    if (!userContext.orgId) {
      throw new ForbiddenError('Access denied: administrator must belong to an organization');
    }

    const { email, password, name, role } = createUserSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    // Force organization boundary matching creator's organization
    let orgId: string | null = null;
    const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
    const isTargetStaff = !citizenRoles.includes(role);

    if (isTargetStaff) {
      orgId = userContext.orgId.toString();
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
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
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isOwnProfile = targetUser._id.toString() === userContext.userId;
    const allowedAdministrators: UserRole[] = ['ORG_ADMIN', 'SUPERVISOR'];
    const sharesOrganization =
      targetUser.orgId &&
      userContext.orgId &&
      targetUser.orgId.toString() === userContext.orgId.toString();
    const isAdminOfOrg = allowedAdministrators.includes(userContext.role as UserRole) && sharesOrganization;

    if (!isOwnProfile && !isAdminOfOrg) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, targetUser._id.toString(), req, {
        reason: 'Attempted to edit profile outside authority boundary',
      });
      throw new ForbiddenError('Access denied: insufficient permissions to edit this user');
    }

    const updates = updateUserSchema.parse(req.body);

    // Strict boundary gates
    if (isOwnProfile && !isAdminOfOrg) {
      // Regular user updating their own profile
      if (updates.role !== undefined || updates.isActive !== undefined) {
        throw new ForbiddenError('Access denied: users cannot change their own role or active status');
      }
    }

    // Process update changes
    if (updates.name !== undefined) targetUser.name = updates.name;
    if (updates.email !== undefined) {
      if (updates.email !== targetUser.email) {
        const emailTaken = await User.findOne({ email: updates.email });
        if (emailTaken) {
          throw new ValidationError('Email is already in use');
        }
        targetUser.email = updates.email;
      }
    }

    if (updates.role !== undefined) {
      const oldRole = targetUser.role;
      targetUser.role = updates.role;
      
      const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
      const targetWasCitizen = citizenRoles.includes(oldRole);
      const targetIsNowCitizen = citizenRoles.includes(updates.role);

      if (targetIsNowCitizen) {
        // Remove org link if role drops to citizen/tipster
        targetUser.orgId = null;
      } else if (targetWasCitizen && !targetIsNowCitizen) {
        // Enforce boundary: assign to administrator's organization on upgrade
        if (!userContext.orgId) {
          throw new ForbiddenError('Cannot upgrade user to staff: administrator lacks organization context');
        }
        targetUser.orgId = userContext.orgId as any;
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
  } catch (error) {
    next(error);
  }
}
