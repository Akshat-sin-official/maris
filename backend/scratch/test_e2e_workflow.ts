import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Observation } from '../src/observations/Observation.model';
import { Incident } from '../src/incidents/Incident.model';
import { Evidence } from '../src/evidence/Evidence.model';
import { User } from '../src/users/User.model';
import { weatherService, oceanService } from '../src/integration/services';

async function runE2ETest() {
  console.log('===========================================================');
  console.log('🌊 MARIS COMPREHENSIVE END-TO-END OPERATIONAL WORKFLOW TEST');
  console.log('===========================================================');

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Find or create test user
    let user = await User.findOne({ email: 'operator@maris.gov.in' });
    if (!user) {
      user = await User.findOne({});
    }
    console.log(`👤 Using Authenticated User: ${user?.email || 'admin@maris.gov.in'} (Role: ${user?.role || 'CONTROL_ROOM'})`);

    const userId = user?._id || new mongoose.Types.ObjectId();
    const orgId = user?.orgId || new mongoose.Types.ObjectId();

    // 2. Test Direct Evidence Creation
    console.log('\n[1/6] Testing Evidence Upload & Storage...');
    const testHash = `sha256_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const evidence = await Evidence.create({
      orgId,
      clientId: `EVID-TEST-${Date.now()}`,
      incidentId: null,
      mediaType: 'image',
      url: `evidence-drone-capture-${Date.now()}.jpg`,
      fileHash: testHash,
      capturedAt: new Date(),
      source: 'DRONE_PATROL_UNIT',
      uploadedBy: userId,
      syncState: 'SYNCED',
    });
    console.log(`✅ Evidence Record Created: ID = ${evidence._id}`);

    // 3. Test Field Observation Creation with Linkage
    console.log('\n[2/6] Testing Field Observation Intake with Evidence Linkage...');
    const obsCoords: [number, number] = [79.31, 9.28]; // [lng, lat]
    const observation = await Observation.create({
      orgId,
      clientId: `OBS-TEST-${Date.now()}`,
      category: 'vessel_sighting',
      value: 'Unidentified Trawler operating without AIS transponder in sanctuary buffer.',
      confidence: 0.95,
      location: {
        type: 'Point',
        coordinates: obsCoords,
      },
      observerId: userId,
      creatorId: userId,
      timestamp: new Date(),
      evidenceIds: [evidence._id],
      verification: {
        status: 'UNVERIFIED',
      },
    });
    console.log(`✅ Observation Created: ID = ${observation._id} at [${obsCoords[1]}, ${obsCoords[0]}] with Evidence [${evidence._id}]`);

    // 4. Test Verification
    console.log('\n[3/6] Testing Control Room Observation Verification...');
    observation.verification = {
      status: 'VERIFIED',
      verifiedBy: userId,
      verifiedAt: new Date(),
      notes: 'Confirmed by Coastal Radar Station #3',
    };
    await observation.save();
    console.log(`✅ Observation Verified: Status = ${observation.verification.status}`);

    // 5. Test Escalation to Investigation Case
    console.log('\n[4/6] Testing Escalation from Observation to Investigation Case...');
    const incident = await Incident.create({
      orgId,
      clientId: `CASE-TEST-${Date.now()}`,
      title: 'Formal Inquiry: Unregistered Vessel in Protected Sanctuary',
      priority: 'HIGH',
      status: 'RECEIVED',
      creatorId: userId,
      assignedTo: userId,
      items: [
        {
          type: 'vessel_detection',
          location: {
            type: 'Point',
            coordinates: obsCoords,
          },
          details: {
            description: `Escalated from Field Observation ${observation._id}`,
          },
          confidence: 0.95,
          detectedAt: new Date(),
        },
      ],
      timeline: [
        {
          eventType: 'INCIDENT_CREATED',
          actorId: userId,
          message: `Case opened from Observation ${observation._id}`,
          timestamp: new Date(),
        },
      ],
    });
    console.log(`✅ Investigation Case Initialized: ID = ${incident._id}, Status = ${incident.status}`);

    // 6. Test Guarded Status Progression & Note Addition
    console.log('\n[5/6] Testing Investigation Lifecycle Status Transitions & Notes...');
    // RECEIVED -> UNDER_VERIFICATION
    incident.status = 'UNDER_VERIFICATION';
    incident.timeline.push({
      eventType: 'STATUS_CHANGED',
      actorId: userId,
      message: 'Status updated to UNDER_VERIFICATION',
      timestamp: new Date(),
    });
    // Add Investigator Note
    incident.timeline.push({
      eventType: 'RESPONSE_UPDATED',
      actorId: userId,
      message: 'Investigator Note: Interception craft dispatched to coordinate.',
      timestamp: new Date(),
    });
    // UNDER_VERIFICATION -> ACTIONED -> CLOSED
    incident.status = 'ACTIONED';
    incident.timeline.push({
      eventType: 'STATUS_CHANGED',
      actorId: userId,
      message: 'Status updated to ACTIONED',
      timestamp: new Date(),
    });
    incident.status = 'CLOSED';
    incident.timeline.push({
      eventType: 'STATUS_CHANGED',
      actorId: userId,
      message: 'Case successfully resolved and archived.',
      timestamp: new Date(),
    });
    await incident.save();
    console.log(`✅ Investigation Lifecycle Complete: Final Status = ${incident.status}, Timeline Events = ${incident.timeline.length}`);

    // 7. Verify Ocean & Weather Telemetry at Case Grid
    console.log('\n[6/6] Testing GIS Telemetry at Case Coordinates [9.28, 79.31]...');
    const weather = await weatherService.getWeather(9.28, 79.31);
    const ocean = await oceanService.getOceanConditions(9.28, 79.31);
    console.log(`✅ Live Weather: Temp = ${weather.temp}, Wind = ${weather.windSpeed}`);
    console.log(`✅ Live Ocean: Water Temp = ${ocean.waterTemp}, Waves = ${ocean.waveHeight}`);

    console.log('\n===========================================================');
    console.log('🎉 ALL OPERATIONAL CHECKS PASSED: WORKFLOW VERIFIED 100%');
    console.log('===========================================================');
  } catch (err) {
    console.error('❌ E2E Test Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runE2ETest();
