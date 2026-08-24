import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Incident, IncidentStatus, IncidentPriority, ITimelineEvent } from './Incident.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';
import { notifyNewIncident, notifyPriorityUpdated, notifyStatusChanged } from '../realtime/socket';

// Validation Schemas
export const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  items: z.array(
    z.object({
      type: z.enum(['vessel_detection', 'oil_slick', 'unauthorized_entry', 'marine_life_hazard']),
      location: z.object({
        type: z.enum(['Point', 'Polygon', 'MultiPolygon']),
        coordinates: z.any(),
      }),
      detectedAt: z.coerce.date(),
      details: z.record(z.any()).optional(),
    })
  ).default([]),
});

export const updateIncidentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum([
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
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().nullable().optional(),
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
    console.error('Failed to write audit log in incident controller:', error);
  }
}

export async function createIncident(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { title, description, priority, items } = createIncidentSchema.parse(req.body);

    const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
    const creatorId = new mongoose.Types.ObjectId(userContext.userId);

    const timeline: ITimelineEvent[] = [
      {
        eventType: 'INCIDENT_CREATED',
        actorId: creatorId,
        message: `Incident created by user: ${userContext.email}`,
        timestamp: new Date(),
      },
    ];

    const incident = await Incident.create({
      orgId,
      creatorId,
      title,
      description,
      priority,
      items,
      status: 'RECEIVED',
      timeline,
    });

    // Real-time notification broadcast
    notifyNewIncident(incident);

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'CREATE_INCIDENT',
      incidentId: incident._id.toString(),
    });

    res.status(201).json({
      status: 'success',
      data: {
        incident,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncidents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

    if (req.query.status) {
      query.status = req.query.status as string;
    }
    if (req.query.priority) {
      query.priority = req.query.priority as string;
    }
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo === 'null' 
        ? null 
        : new mongoose.Types.ObjectId(req.query.assignedTo as string);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sortParams = { [sortBy]: sortOrder };

    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .sort(sortParams as any)
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'name email role')
      .populate('assignedTo', 'name email role');

    const pages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      results: incidents.length,
      metadata: {
        total,
        page,
        limit,
        pages,
      },
      data: {
        incidents,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const incident = await Incident.findById(req.params.id)
      .populate('creatorId', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('orgId', 'name code');

    if (!incident) {
      throw new NotFoundError('Incident not found');
    }

    const isCreator = incident.creatorId._id.toString() === userContext.userId;
    const sharesOrg =
      incident.orgId &&
      userContext.orgId &&
      incident.orgId._id.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to access incident details outside boundary',
        incidentId: req.params.id,
      });
      throw new ForbiddenError('Access denied: resource belongs to a different organization boundary');
    }

    res.status(200).json({
      status: 'success',
      data: {
        incident,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIncident(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      throw new NotFoundError('Incident not found');
    }

    const isCreator = incident.creatorId.toString() === userContext.userId;
    const sharesOrg =
      incident.orgId &&
      userContext.orgId &&
      incident.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to edit incident outside boundary',
        incidentId: req.params.id,
      });
      throw new ForbiddenError('Access denied: insufficient permissions to update this incident');
    }

    const updates = updateIncidentSchema.parse(req.body);
    const actorId = new mongoose.Types.ObjectId(userContext.userId);

    if (!isStaff) {
      if (
        updates.status !== undefined ||
        updates.priority !== undefined ||
        updates.assignedTo !== undefined
      ) {
        throw new ForbiddenError('Access denied: citizens cannot update incident status, priority, or assignee');
      }
    }

    if (updates.title !== undefined) incident.title = updates.title;
    if (updates.description !== undefined) incident.description = updates.description;

    if (updates.priority !== undefined && updates.priority !== incident.priority) {
      incident.timeline.push({
        eventType: 'PRIORITY_ASSIGNED',
        actorId,
        message: `Priority updated from ${incident.priority} to ${updates.priority}`,
        timestamp: new Date(),
      });
      incident.priority = updates.priority as IncidentPriority;

      // Real-time notification broadcast
      notifyPriorityUpdated(
        incident._id.toString(),
        incident.orgId ? incident.orgId.toString() : null,
        updates.priority
      );
    }

    if (updates.status !== undefined && updates.status !== incident.status) {
      const isClosing = updates.status === 'CLOSED';
      incident.timeline.push({
        eventType: isClosing ? 'CASE_CLOSED' : 'STATUS_CHANGED',
        actorId,
        message: `Status updated from ${incident.status} to ${updates.status}`,
        timestamp: new Date(),
      });

      if (updates.status === 'UNDER_VERIFICATION') {
        incident.timeline.push({
          eventType: 'VERIFICATION_STARTED',
          actorId,
          message: 'Case verification process has been initialized',
          timestamp: new Date(),
        });
      } else if (updates.status === 'VERIFIED') {
        incident.timeline.push({
          eventType: 'VERIFICATION_COMPLETED',
          actorId,
          message: 'Case verification successfully completed',
          timestamp: new Date(),
        });
      }

      incident.status = updates.status as IncidentStatus;

      // Real-time notification broadcast
      notifyStatusChanged(
        incident._id.toString(),
        incident.orgId ? incident.orgId.toString() : null,
        updates.status
      );
    }

    if (updates.assignedTo !== undefined) {
      const newAssignee = updates.assignedTo 
        ? new mongoose.Types.ObjectId(updates.assignedTo) 
        : null;
        
      const oldAssigneeStr = incident.assignedTo ? incident.assignedTo.toString() : 'None';
      const newAssigneeStr = updates.assignedTo || 'None';

      if (oldAssigneeStr !== newAssigneeStr) {
        incident.timeline.push({
          eventType: 'CASE_ASSIGNED',
          actorId,
          message: `Assignee changed from ${oldAssigneeStr} to ${newAssigneeStr}`,
          timestamp: new Date(),
        });
        incident.assignedTo = newAssignee;
      }
    }

    await incident.save();

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'UPDATE_INCIDENT',
      incidentId: incident._id.toString(),
      updatedFields: Object.keys(updates),
    });

    res.status(200).json({
      status: 'success',
      data: {
        incident,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      throw new NotFoundError('Incident not found');
    }

    const isCreator = incident.creatorId.toString() === userContext.userId;
    const sharesOrg =
      incident.orgId &&
      userContext.orgId &&
      incident.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      throw new ForbiddenError('Access denied: insufficient permissions to view timeline for this incident');
    }

    res.status(200).json({
      status: 'success',
      results: incident.timeline.length,
      data: {
        timeline: incident.timeline,
      },
    });
  } catch (error) {
    next(error);
  }
}
