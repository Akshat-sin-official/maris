import { Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Incident } from '../incidents/Incident.model';
import { Evidence } from '../evidence/Evidence.model';
import { TimelineService } from '../incidents/timeline.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, ValidationError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';
import { notifyIncidentSynced } from '../realtime/socket';

// Zod schemas for validation
export const syncIncidentSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  title: z.string().min(1, 'title is required'),
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
  clientCreatedAt: z.coerce.date(),
  deviceMetadata: z.record(z.any()).optional(),
});

export const syncEvidenceSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  incidentId: z.string().min(1, 'incidentId is required'), // Could be client-side ID or server ObjectId
  mediaType: z.enum(['image', 'video', 'audio']),
  url: z.string().url('Invalid URL format'),
  fileHash: z.string().min(1, 'fileHash is required'),
  location: z
    .object({
      type: z.enum(['Point']),
      coordinates: z.array(z.number()).length(2),
    })
    .optional(),
  deviceMetadata: z.record(z.any()).optional(),
  capturedAt: z.coerce.date(),
  clientCreatedAt: z.coerce.date(),
  source: z.string().optional(),
});

export const syncBatchSchema = z.object({
  incidents: z.array(z.any()).default([]),
  evidences: z.array(z.any()).default([]),
});

// Helper for audit logging
async function writeAuditLog(
  eventType: 'USER_UPDATE',
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
    console.error('Failed to write audit log in sync controller:', error);
  }
}

/**
 * Idempotently synchronizes a single offline-created incident
 */
export async function syncSingleIncident(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const payload = syncIncidentSchema.parse(req.body);
    const result = await processIncidentSync(payload, userContext.userId, userContext.orgId);

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'SYNC_INCIDENT',
      clientId: payload.clientId,
      status: result.status,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Idempotently synchronizes a single offline-created evidence file
 */
export async function syncSingleEvidence(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const payload = syncEvidenceSchema.parse(req.body);
    const result = await processEvidenceSync(payload, userContext.userId, userContext.orgId);

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'SYNC_EVIDENCE',
      clientId: payload.clientId,
      status: result.status,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Performs a batch sync of multiple incidents and evidence files with partial failure handling
 */
export async function syncBatch(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { incidents, evidences } = syncBatchSchema.parse(req.body);

    const incidentResults = [];
    for (const inc of incidents) {
      try {
        const parsedInc = syncIncidentSchema.parse(inc);
        const resObj = await processIncidentSync(parsedInc, userContext.userId, userContext.orgId);
        incidentResults.push(resObj);
      } catch (err: any) {
        let errMsg = err.message || 'Unknown validation failure';
        if (err instanceof z.ZodError) {
          errMsg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        }
        incidentResults.push({
          clientId: inc?.clientId || 'unknown',
          status: 'FAILED',
          error: `Request validation failed: ${errMsg}`,
        });
      }
    }

    const evidenceResults = [];
    for (const ev of evidences) {
      try {
        const parsedEv = syncEvidenceSchema.parse(ev);
        const resObj = await processEvidenceSync(parsedEv, userContext.userId, userContext.orgId);
        evidenceResults.push(resObj);
      } catch (err: any) {
        let errMsg = err.message || 'Unknown validation failure';
        if (err instanceof z.ZodError) {
          errMsg = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        }
        evidenceResults.push({
          clientId: ev?.clientId || 'unknown',
          status: 'FAILED',
          error: `Request validation failed: ${errMsg}`,
        });
      }
    }

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'SYNC_BATCH',
      incidentsCount: incidents.length,
      evidencesCount: evidences.length,
    });

    res.status(200).json({
      status: 'success',
      results: {
        incidents: incidentResults,
        evidences: evidenceResults,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the sync status of a given clientId
 */
export async function getSyncStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { clientId } = req.params;

    // Check incidents
    const incident = await Incident.findOne({ clientId });
    if (incident) {
      res.status(200).json({
        clientId,
        serverId: incident._id.toString(),
        status: incident.syncState,
      });
      return;
    }

    // Check evidence
    const evidence = await Evidence.findOne({ clientId });
    if (evidence) {
      res.status(200).json({
        clientId,
        serverId: evidence._id.toString(),
        status: evidence.syncState,
      });
      return;
    }

    res.status(200).json({
      clientId,
      status: 'NOT_FOUND',
    });
  } catch (error) {
    next(error);
  }
}

// =========================================================================
// Process Helpers
// =========================================================================

async function processIncidentSync(
  payload: z.infer<typeof syncIncidentSchema>,
  userId: string,
  userOrgId: string | null | undefined
): Promise<{ clientId: string; serverId?: string; status: string; error?: string }> {
  const { clientId, title, description, priority, items, clientCreatedAt } = payload;

  // 1. Idempotency Check: search by clientId
  const existingIncident = await Incident.findOne({ clientId });
  if (existingIncident) {
    // Check for conflicts: if the title has changed dramatically, let's log conflict
    if (existingIncident.title !== title) {
      return {
        clientId,
        serverId: existingIncident._id.toString(),
        status: 'CONFLICT',
        error: 'Conflict: data on server differs from incoming sync payload',
      };
    }
    return {
      clientId,
      serverId: existingIncident._id.toString(),
      status: 'SYNCED',
    };
  }

  const orgId = userOrgId ? new mongoose.Types.ObjectId(userOrgId) : null;
  const creatorId = new mongoose.Types.ObjectId(userId);

  // 2. Create new Incident
  const incident = await Incident.create({
    orgId,
    creatorId,
    title,
    description,
    priority,
    items,
    status: 'RECEIVED',
    clientId,
    clientCreatedAt,
    syncState: 'SYNCED',
    timeline: [
      {
        eventType: 'INCIDENT_CREATED',
        actorId: creatorId,
        message: 'Incident reported offline',
        timestamp: clientCreatedAt,
      },
      {
        eventType: 'SYNC_COMPLETED',
        actorId: creatorId,
        message: 'Incident successfully synced to the cloud server',
        timestamp: new Date(),
      },
    ],
  });

  // 3. Realtime sync notification
  notifyIncidentSynced(incident);

  return {
    clientId,
    serverId: incident._id.toString(),
    status: 'SYNCED',
  };
}

async function processEvidenceSync(
  payload: z.infer<typeof syncEvidenceSchema>,
  userId: string,
  userOrgId: string | null | undefined
): Promise<{ clientId: string; serverId?: string; status: string; error?: string }> {
  const { clientId, incidentId, mediaType, url, fileHash, location, deviceMetadata, capturedAt, clientCreatedAt, source } =
    payload;

  // 1. Idempotency Check: search by clientId
  const existingEvidence = await Evidence.findOne({ clientId });
  if (existingEvidence) {
    return {
      clientId,
      serverId: existingEvidence._id.toString(),
      status: 'SYNCED',
    };
  }

  // 2. File Hash check (prevents duplicate media uploads for different clients)
  const duplicateHash = await Evidence.findOne({ fileHash });
  if (duplicateHash) {
    return {
      clientId,
      status: 'CONFLICT',
      error: 'Conflict: duplicate file hash detected on a different record',
    };
  }

  // 3. Match incidentId reference (if it is a client ID, resolve to serverObjectId)
  let serverIncidentId: mongoose.Types.ObjectId | null = null;
  if (mongoose.Types.ObjectId.isValid(incidentId)) {
    serverIncidentId = new mongoose.Types.ObjectId(incidentId);
  } else {
    const parentIncident = await Incident.findOne({ clientId: incidentId });
    if (parentIncident) {
      serverIncidentId = parentIncident._id as mongoose.Types.ObjectId;
    } else {
      throw new ValidationError(`ValidationError: parent incident client ID "${incidentId}" not found on server`);
    }
  }

  const orgId = userOrgId ? new mongoose.Types.ObjectId(userOrgId) : null;
  const uploadedBy = new mongoose.Types.ObjectId(userId);

  // 4. Create Evidence
  const evidence = await Evidence.create({
    orgId,
    uploadedBy,
    incidentId: serverIncidentId,
    mediaType,
    url,
    fileHash,
    location,
    deviceMetadata,
    capturedAt,
    source,
    clientId,
    clientCreatedAt,
    syncState: 'SYNCED',
  });

  // 5. Log Timeline Event
  await TimelineService.logEvent(
    serverIncidentId,
    'EVIDENCE_CAPTURED',
    userId,
    `Offline evidence file [${mediaType}] synchronized`
  );

  return {
    clientId,
    serverId: evidence._id.toString(),
    status: 'SYNCED',
  };
}
