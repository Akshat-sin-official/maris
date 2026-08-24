
import { Incident } from '../incidents/Incident.model';
import { Observation } from '../observations/Observation.model';
import { Evidence } from '../evidence/Evidence.model';
import { HistoricalMatch } from './HistoricalMatch.model';
import * as PrioritySignalModel from './PrioritySignal.model';
import { IntelligenceAnalysis } from './IntelligenceAnalysis.model';
import { logger } from '../config/logger';
import {
  alertService,
  geospatialService,
  pfzService,
  oceanService,
} from '../integration/services';

// Haversine formula to compute distance in km
function getHaversineDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class IntelligenceService {
  /**
   * Run the MARIS Intelligence Pipeline for a specific Incident
   */
  static async runAnalysis(incidentId: string): Promise<any> {
    logger.info(`Intelligence: Starting analysis for incident ${incidentId}`);

    const incident = await Incident.findById(incidentId).populate('creatorId');
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const orgId = incident.orgId;
    const locationPoint = incident.items[0]?.location;
    const incidentType = incident.items[0]?.type || 'general';

    // ---------------------------------------------------------
    // Step 1: Historical Incident Matching
    // ---------------------------------------------------------
    const matchQuery: Record<string, any> = {
      _id: { $ne: incident._id },
    };
    if (orgId) {
      matchQuery.orgId = orgId;
    }

    const otherIncidents = await Incident.find(matchQuery);
    const matchedIncidents: any[] = [];

    for (const other of otherIncidents) {
      let score = 0;
      const features: string[] = [];

      const otherType = other.items[0]?.type;
      if (otherType === incidentType) {
        score += 0.4;
        features.push('incident_type');
      }

      // Geospatial distance matching
      const otherLoc = other.items[0]?.location;
      if (
        locationPoint &&
        locationPoint.type === 'Point' &&
        otherLoc &&
        otherLoc.type === 'Point'
      ) {
        const baseCoords = locationPoint.coordinates as number[];
        const otherCoords = otherLoc.coordinates as number[];
        const dist = getHaversineDistance(
          baseCoords[0],
          baseCoords[1],
          otherCoords[0],
          otherCoords[1]
        );
        if (dist <= 50) {
          // within 50km
          score += 0.4;
          features.push('location');
        }
      }

      if (score >= 0.4) {
        matchedIncidents.push({
          id: other._id,
          similarityScore: score,
          matchingFeatures: features,
        });

        // Write to HistoricalMatch collection for traceability
        await HistoricalMatch.findOneAndUpdate(
          { sourceIncidentId: incident._id, matchedIncidentId: other._id },
          {
            sourceIncidentId: incident._id,
            matchedIncidentId: other._id,
            similarityScore: score,
            matchingFeatures: features,
          },
          { upsert: true }
        );
      }
    }

    // Sort matched incidents by similarity score descending
    matchedIncidents.sort((a, b) => b.similarityScore - a.similarityScore);

    // ---------------------------------------------------------
    // Step 2: Similar Observation Matching & Spatial Matching
    // ---------------------------------------------------------
    const allObservations = await Observation.find(orgId ? { orgId } : {});
    const matchedObservations: any[] = [];

    for (const obs of allObservations) {
      if (obs.location && obs.location.type === 'Point' && locationPoint && locationPoint.type === 'Point') {
        const baseCoords = locationPoint.coordinates as number[];
        const obsCoords = obs.location.coordinates as number[];
        const dist = getHaversineDistance(
          baseCoords[0],
          baseCoords[1],
          obsCoords[0],
          obsCoords[1]
        );

        const timeDiff = Math.abs(obs.timestamp.getTime() - incident.createdAt.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        // Distance within 100km and within 14 days time window
        if (dist <= 100 && daysDiff <= 14) {
          matchedObservations.push(obs);
        }
      }
    }

    // ---------------------------------------------------------
    // Step 3: Evidence/Source Retrieval
    // ---------------------------------------------------------
    const linkedEvidences = await Evidence.find({ incidentId: incident._id });
    const evidenceCount = linkedEvidences.length;

    let evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG' = 'WEAK';
    if (evidenceCount > 2) {
      evidenceStrength = 'STRONG';
    } else if (evidenceCount > 0) {
      evidenceStrength = 'MODERATE';
    }

    // ---------------------------------------------------------
    // Step 4: Priority Signal Calculations
    // ---------------------------------------------------------
    // Load rules or use standard default weights
    const activeRules = await PrioritySignalModel.PrioritySignal.find({ isActive: true });

    let basePriority = 15; // default LOW
    if (incident.priority === 'MEDIUM') basePriority = 35;
    else if (incident.priority === 'HIGH') basePriority = 65;
    else if (incident.priority === 'CRITICAL') basePriority = 85;

    const signalContributions: any[] = [];
    let priorityBonus = 0;

    // Rule 1: Historical matches found
    if (matchedIncidents.length > 0) {
      const dbRule = activeRules.find((r) => r.factor === 'historical_match');
      const w = dbRule ? dbRule.weight : 15;
      priorityBonus += w;
      signalContributions.push({
        ruleName: dbRule ? dbRule.ruleName : 'Recurring Historical Incident Sighting',
        factor: 'historical_match',
        weight: w,
        scoreContribution: w,
      });
    }

    // Rule 2: Related observations found in proximity
    if (matchedObservations.length > 0) {
      const dbRule = activeRules.find((r) => r.factor === 'observation_proximity');
      const w = dbRule ? dbRule.weight : 10;
      priorityBonus += w;
      signalContributions.push({
        ruleName: dbRule ? dbRule.ruleName : 'Related Historical Observations Sighted',
        factor: 'observation_proximity',
        weight: w,
        scoreContribution: w,
      });
    }

    // Rule 3: Supporting physical evidence strength
    if (evidenceStrength === 'STRONG' || evidenceStrength === 'MODERATE') {
      const dbRule = activeRules.find((r) => r.factor === 'evidence_strength');
      const w = dbRule ? dbRule.weight : 10;
      priorityBonus += w;
      signalContributions.push({
        ruleName: dbRule ? dbRule.ruleName : 'Strong Supporting Evidence Uploaded',
        factor: 'evidence_strength',
        weight: w,
        scoreContribution: w,
      });
    }

    const priorityScore = Math.min(100, Math.max(0, basePriority + priorityBonus));

    // Confidence index calculation
    let confidence = 0.5;
    const creatorUser = incident.creatorId as any;
    if (creatorUser && creatorUser.role !== 'CITIZEN' && creatorUser.role !== 'TIPSTER') {
      confidence += 0.2; // Staff reported cases get verification bump
    }
    const verifiedObs = matchedObservations.filter((o) => o.verification?.status === 'VERIFIED');
    confidence += verifiedObs.length * 0.1;
    confidence = Math.min(1.0, Math.max(0.0, confidence));

    // ---------------------------------------------------------
    // Step 5: Explainability Block (Ensures Non-Legal claims)
    // ---------------------------------------------------------
    const details: string[] = [
      `Base priority value mapped to ${incident.priority} (${basePriority} points).`,
    ];

    if (matchedIncidents.length > 0) {
      details.push(
        `Priority signal augmented by ${matchedIncidents.length} related historical observations matching category types.`
      );
    }
    if (matchedObservations.length > 0) {
      details.push(
        `Geographic matching identified a recurring relationship with ${matchedObservations.length} supporting records inside spatial boundaries.`
      );
    }
    details.push(
      `Evidence strength evaluated as ${evidenceStrength} based on ${evidenceCount} linked supporting records.`
    );

    const summary = `Priority signal calculated at ${priorityScore}% backed by recurring relationships and supporting records in the proximity window.`;

    // ---------------------------------------------------------
    // Step 6: Save Analysis Results
    // ---------------------------------------------------------
    const analysis = await IntelligenceAnalysis.findOneAndUpdate(
      { incidentId: incident._id },
      {
        incidentId: incident._id,
        orgId: incident.orgId,
        priorityScore,
        confidence,
        evidenceStrength,
        verificationStatus: 'UNVERIFIED',
        matchedIncidents: matchedIncidents.map((m) => m.id),
        matchedObservations: matchedObservations.map((o) => o._id),
        prioritySignals: signalContributions,
        explanation: {
          summary,
          details,
        },
      },
      { upsert: true, new: true }
    );

    logger.info(`Intelligence: Successfully completed pipeline for incident ${incidentId}`);
    return analysis;
  }

  /**
   * Standalone coordinates lookup API querying marine and intelligence services
   */
  static async lookupByCoordinates(lat: number, lng: number): Promise<any> {
    const results: any = {
      status: 'success',
      coordinates: [lng, lat], // GeoJSON order
      alerts: [],
      geofences: [],
      marineConditions: {
        source: 'mock_ocean_service',
        retrievedAt: new Date(),
        waveHeight: null,
        wavePeriod: null,
        waveDirection: null,
        waterTemp: null,
        salinity: null,
        currentSpeed: null,
        currentDirection: null,
      },
      pfz: [],
    };

    // 1. Fetch Alerts (with validation to only return currently valid alerts)
    try {
      const rawAlerts = await alertService.getAlerts(lat, lng);
      const now = new Date();
      results.alerts = (rawAlerts || [])
        .filter((alert: any) => {
          if (!alert) return false;
          const from = alert.validFrom ? new Date(alert.validFrom) : null;
          const to = alert.validTo ? new Date(alert.validTo) : null;
          if (from && from > now) return false;
          if (to && to < now) return false;
          return true;
        })
        .map((alert: any) => ({
          source: alert.source,
          retrievedAt: alert.retrievedAt,
          alertId: alert.alertId,
          type: alert.type,
          severity: alert.severity,
          description: alert.description,
          validFrom: alert.validFrom,
          validTo: alert.validTo,
        }));
    } catch (error) {
      logger.warn(`Coordinates Lookup: Alerts query failed for [${lat}, ${lng}]:`, error);
    }

    // 2. Fetch Geofences
    try {
      const rawFences = await geospatialService.getGeofences(lat, lng);
      results.geofences = (rawFences || []).map((fence: any) => ({
        source: fence.source,
        retrievedAt: fence.retrievedAt,
        fenceId: fence.fenceId,
        name: fence.name,
        polygon: fence.polygon,
        restricted: fence.restricted,
      }));
    } catch (error) {
      logger.warn(`Coordinates Lookup: Geofences query failed for [${lat}, ${lng}]:`, error);
    }

    // 3. Fetch Marine Conditions
    try {
      const condition = await oceanService.getOceanConditions(lat, lng);
      if (condition) {
        results.marineConditions = {
          source: condition.source,
          retrievedAt: condition.retrievedAt,
          waveHeight: condition.waveHeight ?? null,
          wavePeriod: condition.wavePeriod ?? null,
          waveDirection: condition.waveDirection ?? null,
          waterTemp: condition.waterTemp ?? null,
          salinity: condition.salinity ?? null,
          currentSpeed: condition.currentSpeed ?? null,
          currentDirection: condition.currentDirection ?? null,
        };
      }
    } catch (error) {
      logger.warn(`Coordinates Lookup: Marine conditions query failed for [${lat}, ${lng}]:`, error);
    }

    // 4. Fetch PFZ
    try {
      const rawPfzs = await pfzService.getPFZs(lat, lng);
      results.pfz = (rawPfzs || []).map((pfz: any) => ({
        source: pfz.source,
        retrievedAt: pfz.retrievedAt,
        zoneId: pfz.zoneId,
        area: pfz.area,
        chlorophyll: pfz.chlorophyll ?? null,
        sstGradient: pfz.sstGradient ?? null,
        confidence: pfz.confidence ?? null,
        validFrom: pfz.validFrom,
        validTo: pfz.validTo,
      }));
    } catch (error) {
      logger.warn(`Coordinates Lookup: PFZ query failed for [${lat}, ${lng}]:`, error);
    }

    return results;
  }
}
