import { Request, Response, NextFunction } from 'express';
import { evaluateTipVerification } from '../agents/verification.service';
import { Tip } from './Tip.model';
import { Incident } from './Incident.model';
import { ValidationError, NotFoundError } from '../common/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { notifyNewTip, notifyTipUpdated, notifyNewIncident } from '../realtime/socket';

/**
 * Generate a 10-digit pseudonymous tipster ID (e.g. TIP-8492019482)
 */
function generatePseudonymousTipsterId(): string {
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `TIP-${randomDigits}`;
}



/**
 * Public Endpoint: Submit an Anonymous / Pseudonymous Tip
 */
export async function submitTip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, title, description, location, evidence, clientMetadata: bodyMeta } = req.body;

    if (!title || !description || !location || !location.coordinates) {
      throw new ValidationError('Title, description, and valid GeoJSON location coordinates are required.');
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tipsterId = generatePseudonymousTipsterId();
    const lat = location.coordinates[1];
    const lng = location.coordinates[0];

    const scoring = await evaluateTipVerification({
      category: category || 'SUSPICIOUS_VESSEL',
      title,
      description,
      evidence: evidence || [],
      lat,
      lng,
    });

    const newTip = await Tip.create({
      tipsterId,
      category: category || 'SUSPICIOUS_VESSEL',
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      evidence: evidence || [],
      genuinenessScore: scoring.genuinenessScore,
      distractionRisk: scoring.distractionRisk,
      verificationFactors: scoring.verificationFactors,
      evidenceSummary: scoring.evidenceSummary,
      signals: scoring.signals,
      dataAvailability: scoring.dataAvailability,
      agentTrace: scoring.agentTrace,
      whyFlagged: scoring.whyFlagged,
      suggestedVerification: scoring.suggestedVerification,
      clientMetadata: {
        ipAddress: clientIp,
        userAgent: userAgent,
        deviceType: bodyMeta?.deviceType || 'DESKTOP',
        browser: bodyMeta?.browser || 'Browser',
        os: bodyMeta?.os || 'OS',
        screenResolution: bodyMeta?.screenResolution || '1920x1080',
        language: bodyMeta?.language || 'en-US',
        timezone: bodyMeta?.timezone || 'Asia/Kolkata',
      },
      status: 'SUBMITTED',
    });

    // Realtime Broadcast: Notify Control Room socket room instantly
    try {
      notifyNewTip(newTip);
    } catch (e) {
      console.warn('Realtime socket emission warning:', e);
    }

    res.status(201).json({
      status: 'success',
      message: 'Tip submitted securely with pseudonymous identity protection.',
      data: {
        tipsterId: newTip.tipsterId,
        status: newTip.status,
        genuinenessScore: newTip.genuinenessScore,
        distractionRisk: newTip.distractionRisk,
        verificationFactors: newTip.verificationFactors,
        evidenceSummary: newTip.evidenceSummary,
        signals: newTip.signals,
        dataAvailability: newTip.dataAvailability,
        agentTrace: newTip.agentTrace,
        createdAt: newTip.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Endpoint: Track Public Status of Tip by Pseudonymous Tipster ID
 */
export async function trackTipStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tipsterId } = req.params;
    if (!tipsterId) {
      throw new ValidationError('Tipster ID parameter is required.');
    }

    const tip = await Tip.findOne({ tipsterId });
    if (!tip) {
      throw new NotFoundError('No tip record found matching the provided Tipster ID.');
    }

    // Public sanitized visibility (Privacy First: No internal intelligence details exposed to tipster)
    res.status(200).json({
      status: 'success',
      data: {
        tipsterId: tip.tipsterId,
        category: tip.category,
        title: tip.title,
        status: tip.status,
        reportedAt: tip.createdAt,
        updatedAt: tip.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Control Room Endpoint: List all tips with Genuineness Scores
 */
export async function listControlRoomTips(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({
      status: 'success',
      results: tips.length,
      data: tips,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Control Room Endpoint: Update Tip Verification Status (SUBMITTED -> UNDER_REVIEW -> VERIFIED / REJECTED -> ACTIONED)
 */
export async function updateTipStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const validStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ACTIONED'];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const tip = await Tip.findById(id);
    if (!tip) {
      throw new NotFoundError('Tip record not found.');
    }

    tip.status = status;
    if (reviewNotes) tip.reviewNotes = reviewNotes;
    if (req.user?.userId) tip.reviewedBy = req.user.userId as any;
    tip.reviewedAt = new Date();

    await tip.save();

    try {
      notifyTipUpdated(tip);
    } catch (e) {
      console.warn('Realtime socket emission warning:', e);
    }

    res.status(200).json({
      status: 'success',
      message: `Tip status updated to ${status}.`,
      data: tip,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Control Room Endpoint: Convert Verified Tip into Official Investigation Incident
 */
export async function convertTipToIncident(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const tip = await Tip.findById(id);
    if (!tip) {
      throw new NotFoundError('Tip record not found.');
    }

    const incidentId = `INC-${Date.now().toString().slice(-4)}`;
    const priority = tip.genuinenessScore >= 75 ? 'CRITICAL' : tip.genuinenessScore >= 50 ? 'HIGH' : 'MEDIUM';

    const newIncident = await Incident.create({
      incidentId,
      title: tip.title,
      type: tip.category === 'POLLUTION' ? 'OIL_SPILL' : 'SANCTUARY_BREACH',
      priority,
      region: 'Gulf of Mannar Sector B4',
      location: tip.location,
      status: 'RECEIVED',
      description: `[Converted from Tip ${tip.tipsterId}] Genuineness Score: ${tip.genuinenessScore}/100. ${tip.description}`,
      reportedBy: tip.tipsterId,
      creatorId: req.user?.userId || '000000000000000000000000',
    });

    tip.status = 'ACTIONED';
    tip.reviewNotes = `Converted into official Incident ${incidentId}`;
    tip.reviewedAt = new Date();
    await tip.save();

    try {
      notifyNewIncident(newIncident);
      notifyTipUpdated(tip);
    } catch (e) {
      console.warn('Realtime socket emission warning:', e);
    }

    res.status(201).json({
      status: 'success',
      message: `Tip ${tip.tipsterId} successfully converted into Incident ${incidentId}.`,
      data: {
        incident: newIncident,
        tip,
      },
    });
  } catch (err) {
    next(err);
  }
}
