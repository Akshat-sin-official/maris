import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceAnalysis } from './IntelligenceAnalysis.model';
import { Incident } from '../incidents/Incident.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ForbiddenError, NotFoundError } from '../common/errors';
import { AuditLog } from '../audit/AuditLog.model';

// Helper for audit logging
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
    console.error('Failed to write audit log in intelligence controller:', error);
  }
}

/**
 * Enforces organization boundary isolation checks on the parent incident
 */
async function checkIncidentBoundary(
  incidentId: string,
  userContext: any,
  req: AuthenticatedRequest
): Promise<any> {
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
    await writeAuditLog('UNAUTHORIZED_ACCESS', userContext.email, userContext.userId, req, {
      reason: 'Attempted to access intelligence data outside organization boundary',
      incidentId,
    });
    throw new ForbiddenError('Access denied: resource belongs to a different organization boundary');
  }

  return incident;
}

/**
 * Triggers the intelligence matching and scoring pipeline for a case
 */
export async function analyzeIncident(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { incidentId } = req.params;
    // Verify boundary permissions
    await checkIncidentBoundary(incidentId, userContext, req);

    // Run pipeline
    const analysis = await IntelligenceService.runAnalysis(incidentId);

    await writeAuditLog('USER_UPDATE', userContext.email, userContext.userId, req, {
      action: 'RUN_INTELLIGENCE_PIPELINE',
      incidentId,
      priorityScore: analysis.priorityScore,
    });

    res.status(200).json({
      status: 'success',
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches basic intelligence metrics (score, confidence, evidence strength, verification state)
 */
export async function getAnalysis(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { incidentId } = req.params;
    await checkIncidentBoundary(incidentId, userContext, req);

    const analysis = await IntelligenceAnalysis.findOne({ incidentId });
    if (!analysis) {
      throw new NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        priorityScore: analysis.priorityScore,
        confidence: analysis.confidence,
        evidenceStrength: analysis.evidenceStrength,
        verificationStatus: analysis.verificationStatus,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches historical incident and observation matches
 */
export async function getMatches(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { incidentId } = req.params;
    await checkIncidentBoundary(incidentId, userContext, req);

    const analysis = await IntelligenceAnalysis.findOne({ incidentId })
      .populate('matchedIncidents', 'title priority status items.location')
      .populate({
        path: 'matchedObservations',
        select: 'category value confidence location timestamp verification',
        populate: { path: 'observerId', select: 'name email role' },
      });

    if (!analysis) {
      throw new NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        matchedIncidents: analysis.matchedIncidents,
        matchedObservations: analysis.matchedObservations,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches explainable justifications for the calculated metrics
 */
export async function getExplanation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const { incidentId } = req.params;
    await checkIncidentBoundary(incidentId, userContext, req);

    const analysis = await IntelligenceAnalysis.findOne({ incidentId });
    if (!analysis) {
      throw new NotFoundError('Intelligence analysis record not found. Trigger /analyze first.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        explanation: analysis.explanation,
      },
    });
  } catch (error) {
    next(error);
  }
}

const coordinateLookupSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

/**
 * Handles lookup queries for arbitrary coordinates
 */
export async function lookupByCoordinates(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const parsed = coordinateLookupSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        code: 'INVALID_COORDINATES',
        message: 'Valid latitude and longitude are required.',
      });
      return;
    }

    const { lat, lng } = parsed.data;
    const lookupData = await IntelligenceService.lookupByCoordinates(lat, lng);

    res.status(200).json(lookupData);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves live telemetry locations via BigData API
 */
export async function getLiveLocations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userContext = req.user;
    if (!userContext) {
      throw new ForbiddenError('Access denied: authentication required');
    }

    const liveLocationsData = await IntelligenceService.getLiveLocations();
    res.status(200).json(liveLocationsData);
  } catch (error) {
    next(error);
  }
}


