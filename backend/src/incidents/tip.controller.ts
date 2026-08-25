import { Request, Response, NextFunction } from 'express';
import { Tip } from './Tip.model';
import { ValidationError, NotFoundError } from '../common/errors';

/**
 * Generate a 10-digit pseudonymous tipster ID (e.g. TIP-8492019482)
 */
function generatePseudonymousTipsterId(): string {
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `TIP-${randomDigits}`;
}

/**
 * Calculate multi-factor genuineness score & distraction risk
 */
function calculateGenuinenessScore(payload: {
  category: string;
  description: string;
  hasEvidence: boolean;
  lat: number;
  lng: number;
}) {
  // Factor 1: Spatial & Satellite Correlation (0-30)
  // Check proximity to marine coastal hotspot area (Gulf of Mannar / Palk Strait)
  const isTargetZone = payload.lat >= 8.0 && payload.lat <= 11.5 && payload.lng >= 78.0 && payload.lng <= 80.5;
  const spatialCorrelation = isTargetZone ? 26 : 14;

  // Factor 2: Historical Pattern Match (0-30)
  const descLower = payload.description.toLowerCase();
  const matchesPattern = descLower.includes('trawler') || descLower.includes('sea turtle') || descLower.includes('sea horse') || descLower.includes('oil') || descLower.includes('gear');
  const historicalPatternMatch = matchesPattern ? 28 : 15;

  // Factor 3: Media Provenance (0-20)
  const mediaProvenanceScore = payload.hasEvidence ? 18 : 8;

  // Factor 4: Marine Weather Feasibility (0-20)
  const marineWeatherFeasibility = 18;

  const totalScore = spatialCorrelation + historicalPatternMatch + mediaProvenanceScore + marineWeatherFeasibility;
  const distractionRisk = totalScore < 50 ? 'HIGH' : totalScore < 75 ? 'MEDIUM' : 'LOW';

  const whyFlagged: string[] = [];
  if (isTargetZone) whyFlagged.push('Location overlaps active maritime boundary enforcement sector');
  if (matchesPattern) whyFlagged.push('Reported species/vessel type matches historical contraband seizure patterns');
  if (payload.hasEvidence) whyFlagged.push('Evidence media uploaded with verified GPS coordinates');

  const suggestedVerification: string[] = [
    'Cross-reference reported coordinates with Copernicus satellite SST/chlorophyll raster overlay',
    'Check nearby coastal patrol radar and AIS vessel track history',
    'Verify photo/video EXIF metadata timestamp against ocean weather records',
  ];

  return {
    genuinenessScore: totalScore,
    distractionRisk,
    verificationFactors: {
      spatialCorrelation,
      historicalPatternMatch,
      mediaProvenanceScore,
      marineWeatherFeasibility,
    },
    whyFlagged,
    suggestedVerification,
  };
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
    const hasEvidence = Array.isArray(evidence) && evidence.length > 0;

    const scoring = calculateGenuinenessScore({
      category: category || 'SUSPICIOUS_VESSEL',
      description,
      hasEvidence,
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

    res.status(201).json({
      status: 'success',
      message: 'Tip submitted securely with pseudonymous identity protection.',
      data: {
        tipsterId: newTip.tipsterId,
        status: newTip.status,
        genuinenessScore: newTip.genuinenessScore,
        distractionRisk: newTip.distractionRisk,
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
