import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Observation } from './Observation.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';
import { notifyObservationReceived, notifyVerificationCompleted } from '../realtime/socket';

// Validation Schemas
export const createObservationSchema = z.object({
  category: z.enum(['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard']),
  value: z.string().min(1, 'Value is required'),
  confidence: z.number().min(0.0, 'Confidence cannot be less than 0.0').max(1.0, 'Confidence cannot be greater than 1.0'),
  location: z.object({
    type: z.enum(['Point']),
    coordinates: z.array(z.number()).length(2), // [lng, lat]
  }),
  timestamp: z.coerce.date(),
  evidenceIds: z.array(z.string()).optional(),
});

export const updateObservationSchema = z.object({
  category: z.enum(['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard']).optional(),
  value: z.string().optional(),
  confidence: z.number().min(0.0).max(1.0).optional(),
  verification: z
    .object({
      status: z.enum(['UNVERIFIED', 'VERIFIED', 'REJECTED']),
      notes: z.string().optional(),
    })
    .optional(),
});

// Helper for audit logs
async function writeAuditLog(
  eventType: 'USER_UPDATE' | 'UNAUTHORIZED_ACCESS',
  actorEmail: string,
  userId: string,
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
    console.error('Failed to write audit log in observation controller:', error);
  }
}

export async function createObservation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { category, value, confidence, location, timestamp, evidenceIds } = createObservationSchema.parse(req.body);

    const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
    const observerId = new mongoose.Types.ObjectId(userContext.userId);
    const creatorId = observerId;

    const mappedEvidenceIds = evidenceIds
      ? evidenceIds.map((id) => new mongoose.Types.ObjectId(id))
      : [];

    const observation = await Observation.create({
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
    notifyObservationReceived(observation);

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
  } catch (error) {
    next(error);
  }
}

export async function getObservations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const query: Record<string, any> = {};
    const citizenRoles = ['CITIZEN', 'TIPSTER'];

    if (citizenRoles.includes(userContext.role)) {
      query.creatorId = new mongoose.Types.ObjectId(userContext.userId);
    } else {
      if (!userContext.orgId) {
        throw new ForbiddenError('Access denied: staff must belong to an organization');
      }
      query.orgId = new mongoose.Types.ObjectId(userContext.orgId);
    }

    if (req.query.category) {
      query.category = req.query.category as string;
    }
    if (req.query.verificationStatus) {
      query['verification.status'] = req.query.verificationStatus as string;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.value = { $regex: searchRegex };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy as string) || 'timestamp';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortParams = { [sortBy]: sortOrder };

    const total = await Observation.countDocuments(query);
    const observations = await Observation.find(query)
      .sort(sortParams as any)
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
  } catch (error) {
    next(error);
  }
}

export async function getObservationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const observation = await Observation.findById(req.params.id)
      .populate('observerId', 'name email role')
      .populate('evidenceIds')
      .populate('orgId', 'name code');

    if (!observation) {
      throw new NotFoundError('Observation not found');
    }

    const isCreator = observation.creatorId.toString() === userContext.userId;
    const sharesOrg =
      observation.orgId &&
      userContext.orgId &&
      observation.orgId._id.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to access observation details outside boundary',
        observationId: req.params.id,
      });
      throw new ForbiddenError('Access denied: resource belongs to a different organization boundary');
    }

    res.status(200).json({
      status: 'success',
      data: {
        observation,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateObservation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const observation = await Observation.findById(req.params.id);
    if (!observation) {
      throw new NotFoundError('Observation not found');
    }

    const isCreator = observation.creatorId.toString() === userContext.userId;
    const sharesOrg =
      observation.orgId &&
      userContext.orgId &&
      observation.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to edit observation outside boundary',
        observationId: req.params.id,
      });
      throw new ForbiddenError('Access denied: insufficient permissions to update this observation');
    }

    const updates = updateObservationSchema.parse(req.body);

    if (!isStaff) {
      if (updates.verification !== undefined) {
        throw new ForbiddenError('Access denied: citizens cannot update observation verification status');
      }
    }

    if (updates.category !== undefined) observation.category = updates.category;
    if (updates.value !== undefined) observation.value = updates.value;
    if (updates.confidence !== undefined) observation.confidence = updates.confidence;

    if (updates.verification !== undefined) {
      observation.verification = {
        status: updates.verification.status,
        verifiedBy: new mongoose.Types.ObjectId(userContext.userId),
        verifiedAt: new Date(),
        notes: updates.verification.notes,
      };

      // Real-time verification completed notification broadcast
      notifyVerificationCompleted(
        observation._id.toString(),
        observation.orgId ? observation.orgId.toString() : null,
        observation.verification
      );
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
  } catch (error) {
    next(error);
  }
}
