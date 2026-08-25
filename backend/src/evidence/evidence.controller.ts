import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Evidence } from './Evidence.model';
import { Incident } from '../incidents/Incident.model';
import { Observation } from '../observations/Observation.model';
import { TimelineService } from '../incidents/timeline.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError, ValidationError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';
import { activeProviderRef } from '../storage/minio.provider';
import { env } from '../config/env';

export const createEvidenceSchema = z.object({
  mediaType: z.enum(['image', 'video', 'audio']),
  url: z.string().url('Invalid URL format'),
  fileHash: z.string().min(1, 'File hash is required'),
  location: z
    .object({
      type: z.enum(['Point']),
      coordinates: z.array(z.number()).length(2), // [lng, lat]
    })
    .optional(),
  deviceMetadata: z.record(z.any()).optional(),
  capturedAt: z.coerce.date(),
  source: z.string().optional(),
  syncState: z.enum(['PENDING', 'SYNCED', 'FAILED']).optional(),
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
    console.error('Failed to write audit log in evidence controller:', error);
  }
}

// Compute SHA-256 hash of buffer
function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Helper to determine mediaType from mimetype
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  throw new ValidationError(`Unsupported MIME type: ${mimeType}`);
}

export async function createEvidenceForIncident(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id: incidentId } = req.params;
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      throw new NotFoundError('Incident not found');
    }

    // Boundary check
    const isCreator = incident.creatorId.toString() === userContext.userId;
    const sharesOrg =
      incident.orgId &&
      userContext.orgId &&
      incident.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to upload evidence to incident outside boundary',
        incidentId,
      });
      throw new ForbiddenError('Access denied: insufficient permissions for this incident boundary');
    }

    if (!req.file) {
      // Fallback to JSON payload mapping (for backward compatibility and offline synchronization)
      const { mediaType, url, fileHash, location, deviceMetadata, capturedAt, source, syncState } =
        createEvidenceSchema.parse(req.body);

      const existingEvidence = await Evidence.findOne({ fileHash });
      if (existingEvidence) {
        throw new ForbiddenError('Evidence verification failed: duplicate file hash detected');
      }

      const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
      const uploadedBy = new mongoose.Types.ObjectId(userContext.userId);

      const evidence = await Evidence.create({
        orgId,
        uploadedBy,
        incidentId: incident._id,
        mediaType,
        url,
        fileHash,
        location,
        deviceMetadata,
        capturedAt,
        source,
        syncState,
      });

      await TimelineService.logEvent(
        incident._id,
        'EVIDENCE_CAPTURED',
        userContext.userId,
        `Evidence [${mediaType}] uploaded: ${url}`
      );

      res.status(201).json({
        status: 'success',
        data: {
          evidence,
        },
      });
      return;
    }

    const file = req.file;
    const mediaType = getMediaType(file.mimetype);

    // Dynamic size validation
    const maxMb = mediaType === 'video' ? env.MAX_VIDEO_SIZE_MB : env.MAX_IMAGE_SIZE_MB;
    if (file.size > maxMb * 1024 * 1024) {
      throw new ValidationError(`File size exceeds allowed limit of ${maxMb} MB for ${mediaType} types.`);
    }

    const fileHash = computeSha256(file.buffer);

    // Duplicate Check
    const existingEvidence = await Evidence.findOne({ fileHash });
    if (existingEvidence) {
      throw new ForbiddenError('Evidence verification failed: duplicate file hash detected');
    }

    const evidenceId = new mongoose.Types.ObjectId();
    const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
    const uploadedBy = new mongoose.Types.ObjectId(userContext.userId);

    // Secure Storage Key structure
    const extension = file.originalname.split('.').pop() || '';
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, '');
    const storageKey = `org/${orgId || 'public'}/incidents/${incidentId}/evidence/${evidenceId}${safeExt ? `.${safeExt}` : ''}`;

    // Upload to Object Storage
    try {
      await activeProviderRef.current.upload(storageKey, file.buffer, file.mimetype);
    } catch (err) {
      console.error('Failed to upload file to storage bucket:', err);
      throw new ValidationError('Failed to store file in object storage.');
    }

    // Save in DB
    const evidence = await Evidence.create({
      _id: evidenceId,
      orgId,
      uploadedBy,
      incidentId: incident._id,
      mediaType,
      url: storageKey,
      fileHash,
      capturedAt: req.body.capturedAt ? new Date(req.body.capturedAt) : new Date(),
      location: req.body.location ? (typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location) : null,
      deviceMetadata: req.body.deviceMetadata ? (typeof req.body.deviceMetadata === 'string' ? JSON.parse(req.body.deviceMetadata) : req.body.deviceMetadata) : {},
      source: req.body.source || 'web_portal',
      syncState: 'SYNCED',
    });

    // Log timeline event
    await TimelineService.logEvent(
      incident._id,
      'EVIDENCE_CAPTURED',
      userContext.userId,
      `Evidence [${mediaType}] successfully captured and linked to incident.`
    );

    // Write audit log
    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'UPLOAD_EVIDENCE',
      evidenceId: evidence._id.toString(),
      incidentId: incident._id.toString(),
    });

    res.status(201).json({
      status: 'success',
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createEvidenceForObservation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id: observationId } = req.params;
    const observation = await Observation.findById(observationId);
    if (!observation) {
      throw new NotFoundError('Observation not found');
    }

    // Boundary check
    const isCreator = observation.creatorId.toString() === userContext.userId;
    const sharesOrg =
      observation.orgId &&
      userContext.orgId &&
      observation.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isCreator && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to upload evidence to observation outside boundary',
        observationId,
      });
      throw new ForbiddenError('Access denied: insufficient permissions for this observation boundary');
    }

    if (!req.file) {
      // Fallback to JSON payload mapping
      const { mediaType, url, fileHash, location, deviceMetadata, capturedAt, source, syncState } =
        createEvidenceSchema.parse(req.body);

      const existingEvidence = await Evidence.findOne({ fileHash });
      if (existingEvidence) {
        throw new ForbiddenError('Evidence verification failed: duplicate file hash detected');
      }

      const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
      const uploadedBy = new mongoose.Types.ObjectId(userContext.userId);

      const evidence = await Evidence.create({
        orgId,
        uploadedBy,
        observationId: observation._id,
        mediaType,
        url,
        fileHash,
        location,
        deviceMetadata,
        capturedAt,
        source,
        syncState,
      });

      observation.evidenceIds.push(evidence._id as any);
      await observation.save();

      res.status(201).json({
        status: 'success',
        data: {
          evidence,
        },
      });
      return;
    }

    const file = req.file;
    const mediaType = getMediaType(file.mimetype);

    // Validate size limit
    const maxMb = mediaType === 'video' ? env.MAX_VIDEO_SIZE_MB : env.MAX_IMAGE_SIZE_MB;
    if (file.size > maxMb * 1024 * 1024) {
      throw new ValidationError(`File size exceeds allowed limit of ${maxMb} MB.`);
    }

    const fileHash = computeSha256(file.buffer);

    const existingEvidence = await Evidence.findOne({ fileHash });
    if (existingEvidence) {
      throw new ForbiddenError('Evidence verification failed: duplicate file hash detected');
    }

    const evidenceId = new mongoose.Types.ObjectId();
    const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;
    const uploadedBy = new mongoose.Types.ObjectId(userContext.userId);

    const extension = file.originalname.split('.').pop() || '';
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, '');
    const storageKey = `org/${orgId || 'public'}/observations/${observationId}/evidence/${evidenceId}${safeExt ? `.${safeExt}` : ''}`;

    await activeProviderRef.current.upload(storageKey, file.buffer, file.mimetype);

    const evidence = await Evidence.create({
      _id: evidenceId,
      orgId,
      uploadedBy,
      observationId: observation._id,
      mediaType,
      url: storageKey,
      fileHash,
      capturedAt: req.body.capturedAt ? new Date(req.body.capturedAt) : new Date(),
      location: req.body.location ? JSON.parse(req.body.location) : null,
      deviceMetadata: req.body.deviceMetadata ? JSON.parse(req.body.deviceMetadata) : {},
      source: req.body.source || 'web_portal',
      syncState: 'SYNCED',
    });

    // Link evidence inside observation
    observation.evidenceIds.push(evidenceId);
    await observation.save();

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'UPLOAD_EVIDENCE_OBSERVATION',
      evidenceId: evidence._id.toString(),
      observationId: observation._id.toString(),
    });

    res.status(201).json({
      status: 'success',
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceForIncident(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id: incidentId } = req.params;
    const incident = await Incident.findById(incidentId);
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
      throw new ForbiddenError('Access denied: insufficient permissions to view evidence for this incident');
    }

    const evidence = await Evidence.find({ incidentId: incident._id })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: evidence.length,
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceForObservation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id: observationId } = req.params;
    const observation = await Observation.findById(observationId);
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
      throw new ForbiddenError('Access denied: insufficient permissions to view evidence for this observation');
    }

    const evidence = await Evidence.find({ observationId: observation._id })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: evidence.length,
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id } = req.params;
    const evidence = await Evidence.findById(id).populate('uploadedBy', 'name email role');
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    const isUploader = evidence.uploadedBy._id.toString() === userContext.userId;
    const sharesOrg =
      evidence.orgId &&
      userContext.orgId &&
      evidence.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isUploader && !(isStaff && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to access evidence details outside boundary',
        evidenceId: id,
      });
      throw new ForbiddenError('Access denied: insufficient permissions for this evidence boundary');
    }

    res.status(200).json({
      status: 'success',
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceAccessUrl(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id } = req.params;
    const evidence = await Evidence.findById(id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    const isUploader = evidence.uploadedBy.toString() === userContext.userId;
    const sharesOrg =
      evidence.orgId &&
      userContext.orgId &&
      evidence.orgId.toString() === userContext.orgId.toString();

    const citizenRoles = ['CITIZEN', 'TIPSTER'];
    const isStaff = !citizenRoles.includes(userContext.role);

    if (!isUploader && !(isStaff && sharesOrg)) {
      throw new ForbiddenError('Access denied: insufficient permissions for this evidence boundary');
    }

    // Generate 1 hour short-lived signed URL
    const url = await activeProviderRef.current.getSignedUrl(evidence.url, 3600);
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    res.status(200).json({
      status: 'success',
      url,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvidence(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { id } = req.params;
    const evidence = await Evidence.findById(id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    // Delete checks: only uploader or organizational administrator can delete
    const isUploader = evidence.uploadedBy.toString() === userContext.userId;
    const isAdmin = userContext.role === 'ORG_ADMIN';
    const sharesOrg =
      evidence.orgId &&
      userContext.orgId &&
      evidence.orgId.toString() === userContext.orgId.toString();

    if (!isUploader && !(isAdmin && sharesOrg)) {
      await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
        reason: 'Attempted to delete evidence without authorization',
        evidenceId: id,
      });
      throw new ForbiddenError('Access denied: you are not authorized to delete this evidence');
    }

    // Delete from MinIO storage
    try {
      await activeProviderRef.current.delete(evidence.url);
    } catch (err) {
      console.warn('Failed to delete file from MinIO storage bucket, it may have already been removed:', err);
    }

    // Delete record from DB
    await Evidence.findByIdAndDelete(id);

    // If attached to an incident, append deletion event log to timeline
    if (evidence.incidentId) {
      await TimelineService.logEvent(
        evidence.incidentId,
        'RESPONSE_UPDATED',
        userContext.userId,
        `Evidence file [${evidence.mediaType}] removed from incident.`
      );
    }

    // Audit log
    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'DELETE_EVIDENCE',
      evidenceId: id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Evidence successfully deleted.',
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadStandaloneEvidence(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const file = req.file;
    if (!file) {
      throw new ValidationError('File attachment is required');
    }

    const mediaType = getMediaType(file.mimetype);
    const fileHash = computeSha256(file.buffer);
    const storageKey = `evidence-${Date.now()}-${file.originalname}`;

    await activeProviderRef.current.upload(storageKey, file.buffer, file.mimetype);

    const uploadedBy = new mongoose.Types.ObjectId(userContext.userId);
    const orgId = userContext.orgId ? new mongoose.Types.ObjectId(userContext.orgId) : null;

    const evidence = await Evidence.create({
      orgId,
      incidentId: null,
      mediaType,
      url: storageKey,
      fileHash,
      capturedAt: new Date(),
      source: 'DIRECT_UPLOAD',
      uploadedBy,
      syncState: 'SYNCED',
    });

    res.status(201).json({
      status: 'success',
      data: {
        evidence,
      },
    });
  } catch (error) {
    next(error);
  }
}

