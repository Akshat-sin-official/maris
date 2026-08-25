import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { User, UserRole } from '../users/User.model';
import { Organization } from '../organizations/Organization.model';
import { RefreshToken } from './RefreshToken.model';
import { AuditLog } from '../audit/AuditLog.model';
import { generateToken } from './jwt.utils';
import { UnauthorizedError, ValidationError, NotFoundError } from '../common/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN']),
  orgCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Helper for generating audit logs without throwing
async function writeAuditLog(
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'TOKEN_REFRESH' | 'USER_CREATE' | 'USER_UPDATE' | 'UNAUTHORIZED_ACCESS',
  actorEmail: string,
  userId: string | null,
  req: Request,
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
    // Fail silently on audit log writes to avoid blocking requests, but console log it
    console.error('Failed to write audit log:', error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, role, orgCode } = registerSchema.parse(req.body);

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    // 2. Resolve organization if staff role
    let orgId: string | null = null;
    const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(role);

    if (isStaff) {
      if (!orgCode) {
        throw new ValidationError(`Organization code (orgCode) is required for role: ${role}`);
      }
      const org = await Organization.findOne({ code: orgCode, isActive: true });
      if (!org) {
        throw new ValidationError(`Active organization with code '${orgCode}' not found`);
      }
      orgId = org._id.toString();
    } else {
      if (orgCode) {
        throw new ValidationError(`Citizens and tipsters cannot belong to an organization.`);
      }
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
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
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 1. Fetch user including passwordHash
    const user = await User.findOne({ email, isActive: true }).select('+passwordHash');
    if (!user) {
      await writeAuditLog('LOGIN_FAILURE', email, null, req, { reason: 'User not found or inactive' });
      throw new UnauthorizedError('Invalid credentials');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await writeAuditLog('LOGIN_FAILURE', email, user._id.toString(), req, { reason: 'Incorrect password' });
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Generate tokens
    const accessToken = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      orgId: user.orgId ? user.orgId.toString() : null,
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    await RefreshToken.create({
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
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    // 1. Find the refresh token record and user
    const tokenRecord = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(tokenRecord.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Associated user not found or inactive');
    }

    // 2. Revoke / delete the used refresh token
    await RefreshToken.deleteOne({ _id: tokenRecord._id });

    // 3. Generate new token pair
    const accessToken = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      orgId: user.orgId ? user.orgId.toString() : null,
    });

    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
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
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    const tokenRecord = await RefreshToken.findOne({ token: refreshToken });
    if (tokenRecord) {
      const user = await User.findById(tokenRecord.userId);
      await RefreshToken.deleteOne({ _id: tokenRecord._id });
      if (user) {
        await writeAuditLog('LOGOUT', user.email, user._id.toString(), req);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await User.findById(req.user.userId).populate('orgId', 'name code');
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}
