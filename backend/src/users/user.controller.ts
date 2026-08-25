import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from './User.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError, ValidationError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';

// Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  role: z.string(),
  organization: z.string().optional(),
  badgeNumber: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  organization: z.string().optional(),
  badgeNumber: z.string().optional(),
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

    const allowedRoles = ['ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM', 'SUPERVISOR', 'RESEARCHER'];
    if (!allowedRoles.includes(userContext.role)) {
      throw new ForbiddenError('Access denied: insufficient administrative permissions');
    }

    // Retrieve all users from MongoDB Atlas
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

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

    const targetUser = await User.findById(req.params.id).select('-passwordHash');
    if (!targetUser) {
      throw new NotFoundError('User not found');
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

    const adminRoles = ['ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'];
    if (!adminRoles.includes(userContext.role)) {
      throw new ForbiddenError('Access denied: insufficient permission to create users');
    }

    const { email, password, name, role, organization, badgeNumber } = createUserSchema.parse(req.body);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      organization: organization || 'MARIS Command Center',
      badgeNumber: badgeNumber || `MARIS-${Date.now().toString().slice(-4)}`,
      isActive: true,
    });

    await writeAuditLog('USER_CREATE', userContext.email, newUser._id.toString(), req, {
      targetUserRole: role,
    });

    res.status(201).json({
      status: 'success',
      message: `User ${name} created successfully with role ${role}`,
      data: {
        user: newUser,
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

    const adminRoles = ['ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'];
    if (!adminRoles.includes(userContext.role)) {
      throw new ForbiddenError('Access denied: insufficient permission to modify users');
    }

    const { id } = req.params;
    const updateData = updateUserSchema.parse(req.body);

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      throw new NotFoundError('User not found');
    }

    if (updateData.name !== undefined) userToUpdate.name = updateData.name;
    if (updateData.email !== undefined) userToUpdate.email = updateData.email.toLowerCase();
    if (updateData.role !== undefined) userToUpdate.role = updateData.role as any;
    if (updateData.organization !== undefined) userToUpdate.organization = updateData.organization;
    if (updateData.badgeNumber !== undefined) userToUpdate.badgeNumber = updateData.badgeNumber;
    if (updateData.isActive !== undefined) userToUpdate.isActive = updateData.isActive;

    await userToUpdate.save();

    await writeAuditLog('USER_UPDATE', userContext.email, userToUpdate._id.toString(), req, {
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      status: 'success',
      message: `User ${userToUpdate.name} updated successfully`,
      data: {
        user: userToUpdate,
      },
    });
  } catch (error) {
    next(error);
  }
}
