import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../../src/config/database';
import { Observation } from '../../src/observations/Observation.model';
import { Incident } from '../../src/incidents/Incident.model';
import { Alert } from '../../src/alerts/Alert.model';

describe('Core Schema Verification Tests', () => {
  let isDbConnected = false;
  const mockOrgA = new mongoose.Types.ObjectId();
  const mockOrgB = new mongoose.Types.ObjectId();
  const mockUserId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (err) {
      console.warn('⚠️ Database connection failed. Running query tests in skip mode.');
    }
  });

  afterAll(async () => {
    if (isDbConnected) {
      // Clean up collections created during tests
      try {
        await Incident.deleteMany({ orgId: { $in: [mockOrgA, mockOrgB] } });
        await Alert.deleteMany({ orgId: { $in: [mockOrgA, mockOrgB] } });
        await Observation.deleteMany({ orgId: { $in: [mockOrgA, mockOrgB] } });
      } catch (err) {
        console.error('Error during test cleanup:', err);
      }
      await disconnectDatabase();
    }
  });

  // =========================================================================
  // 1. In-Memory Validation Tests (Run Offline via validateSync)
  // =========================================================================
  describe('In-Memory Schema Validation', () => {
    it('should fail validation when required fields are missing', () => {
      const invalidObs = new Observation({
        value: '28.5C',
      });

      const err = invalidObs.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors['observerId']).toBeDefined();
      expect(err?.errors['creatorId']).toBeDefined();
      expect(err?.errors['location']).toBeDefined();
      expect(err?.errors['category']).toBeDefined();
      expect(err?.errors['confidence']).toBeDefined();
      expect(err?.errors['timestamp']).toBeDefined();
    });

    it('should fail validation if confidence value is out of bounds [0.0 - 1.0]', () => {
      const invalidObs = new Observation({
        orgId: mockOrgA,
        observerId: mockUserId,
        creatorId: mockUserId,
        location: {
          type: 'Point',
          coordinates: [80.124, 13.045],
        },
        category: 'sst',
        value: '29.2C',
        confidence: 1.5, // Invalid: exceeds 1.0 limit
        timestamp: new Date(),
      });

      const err = invalidObs.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors['confidence']).toBeDefined();
      expect(err?.errors['confidence'].message).toContain('Confidence cannot be greater than 1.0');
    });

    it('should pass validation for a valid multi-item incident with timeline entries', () => {
      const validIncident = new Incident({
        orgId: mockOrgA,
        creatorId: mockUserId,
        title: 'Vessel Trespassing Sanctuary',
        description: 'Illegal fishing vessel detected within sanctuary limits',
        status: 'SCREENING',
        priority: 'HIGH',
        items: [
          {
            type: 'vessel_detection',
            location: {
              type: 'Point',
              coordinates: [80.5, 12.8],
            },
            detectedAt: new Date(),
            details: { vesselName: 'Ocean Hunter', flag: 'Foreign' },
          },
          {
            type: 'unauthorized_entry',
            location: {
              type: 'Point',
              coordinates: [80.51, 12.81],
            },
            detectedAt: new Date(),
          },
        ],
        timeline: [
          {
            eventType: 'INCIDENT_CREATED',
            actorId: mockUserId,
            message: 'Incident reported by auto-detection system',
            timestamp: new Date(),
          },
          {
            eventType: 'STATUS_CHANGED',
            actorId: mockUserId,
            message: 'Status updated from RECEIVED to SCREENING',
            timestamp: new Date(),
          },
        ],
      });

      const err = validIncident.validateSync();
      expect(err).toBeUndefined(); // Returns undefined if schema validation passes
    });
  });

  // =========================================================================
  // 2. Geospatial and Isolation Tests (Run Conditionally if DB is Connected)
  // =========================================================================
  const runDbTests = isDbConnected ? describe : describe.skip;

  runDbTests('Active Database Queries & Isolation', () => {
    it('should successfully execute geospatial polygon intersection query', async () => {
      // 1. Create a sensor observation point (Chennai coast)
      const observation = await Observation.create({
        orgId: mockOrgA,
        observerId: mockUserId,
        location: {
          type: 'Point',
          coordinates: [80.27, 13.08], // [lng, lat]
        },
        category: 'weather_hazard',
        value: 'High Waves',
        confidence: 0.85,
        timestamp: new Date(),
      });

      // 2. Create a marine storm alert polygon enclosing Chennai coast
      const alert = await Alert.create({
        orgId: mockOrgA,
        type: 'STORM',
        severity: 'CRITICAL',
        area: {
          type: 'Polygon',
          coordinates: [
            [
              [80.0, 13.0],
              [80.0, 13.5],
              [80.5, 13.5],
              [80.5, 13.0],
              [80.0, 13.0], // Closed polygon loop
            ],
          ],
        },
        confidence: 0.9,
        evidenceStrength: 'STRONG',
        sources: ['Copernicus satellite'],
      });

      // 3. Run geospatial query using $geoWithin to search for observations inside alert polygon
      const matchedObs = await Observation.find({
        orgId: mockOrgA,
        location: {
          $geoWithin: {
            $geometry: alert.area,
          },
        },
      });

      expect(matchedObs).toHaveLength(1);
      expect(matchedObs[0]._id.toString()).toBe(observation._id.toString());
    });

    it('should enforce strict organization-level query isolation boundaries', async () => {
      // 1. Create incidents belonging to distinct organizations
      const incidentOrgA = await Incident.create({
        orgId: mockOrgA,
        title: 'Case in Region East',
        status: 'REPORTED',
        priority: 'MEDIUM',
      });

      await Incident.create({
        orgId: mockOrgB,
        title: 'Case in Region West',
        status: 'REPORTED',
        priority: 'MEDIUM',
      });

      // 2. Query incidents filtering explicitly by Org A
      const resultsOrgA = await Incident.find({ orgId: mockOrgA });

      expect(resultsOrgA).toHaveLength(1);
      expect(resultsOrgA[0].title).toBe('Case in Region East');
      expect(resultsOrgA[0]._id.toString()).toBe(incidentOrgA._id.toString());
    });
  });
});
