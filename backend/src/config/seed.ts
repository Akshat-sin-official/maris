import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from './database';
import { User } from '../users/User.model';
import { Incident } from '../incidents/Incident.model';
import { Tip } from '../incidents/Tip.model';
import { logger } from './logger';

async function seedData() {
  try {
    logger.info('Starting MARIS Database Seeding...');
    await connectDatabase();

    // 1. Seed System Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const defaultUsers = [
      {
        name: 'Cmdr. Rajesh Verma',
        email: 'operator@maris.gov.in',
        passwordHash,
        role: 'CONTROL_ROOM',
        organization: 'Ministry of Ports, Shipping & Waterways',
        badgeNumber: 'MARIS-CR-001',
      },
      {
        name: 'Dr. Meera Swaminathan',
        email: 'researcher@maris.gov.in',
        passwordHash,
        role: 'SUPERVISOR',
        organization: 'National Institute of Oceanography (NIO)',
        badgeNumber: 'MARIS-RS-002',
      },
      {
        name: 'Inspector K. Sundaram',
        email: 'officer@maris.gov.in',
        passwordHash,
        role: 'FIELD_OFFICER',
        organization: 'Indian Coast Guard - Tamil Nadu Station',
        badgeNumber: 'MARIS-CG-003',
      },
      {
        name: 'System Administrator',
        email: 'admin@maris.gov.in',
        passwordHash,
        role: 'ORG_ADMIN',
        organization: 'MARIS Global Command Center',
        badgeNumber: 'MARIS-ADM-000',
      },
    ];

    for (const u of defaultUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    }
    logger.info('✅ Default seed users verified/created (password: password123)');

    const operatorUser = await User.findOne({ email: 'operator@maris.gov.in' });
    const creatorId = operatorUser ? operatorUser._id : new mongoose.Types.ObjectId();

    // 2. Seed Incidents
    const initialIncidents = [
      {
        clientId: 'seed-inc-001',
        title: 'Unflagged Trawler Operating Near Palk Strait Geofence',
        description: 'VMS tracking lost at 03:15 UTC. Suspected illegal trawling near marine sanctuary corridor.',
        category: 'vessel_sighting',
        priority: 'HIGH',
        status: 'UNDER_VERIFICATION',
        location: { type: 'Point', coordinates: [79.31, 9.28] },
        creatorId,
      },
      {
        clientId: 'seed-inc-002',
        title: 'Oil Slick Anomaly Detected via Copernicus Sentinel Sentinel-3',
        description: 'Spectral reflectance anomaly detected 14km off Mandapam coast. Estimated length 1.8km.',
        category: 'pollution',
        priority: 'CRITICAL',
        status: 'SCREENING',
        location: { type: 'Point', coordinates: [79.15, 9.12] },
        creatorId,
      },
      {
        clientId: 'seed-inc-003',
        title: 'Suspected Seized Seahorse & Pipefish Cache',
        description: 'Field officer reported unverified contraband shipment near Rameswaram South Jetty.',
        category: 'wildlife_trafficking',
        priority: 'CRITICAL',
        status: 'PRIORITIZED',
        location: { type: 'Point', coordinates: [79.38, 9.22] },
        creatorId,
      },
    ];

    for (const inc of initialIncidents) {
      await Incident.findOneAndUpdate({ title: inc.title }, inc, { upsert: true });
    }
    logger.info('✅ Initial seed incident cases created');

    // 3. Seed Confidential Tips
    const sampleTips = [
      {
        tipsterId: 'TIP-8492019482',
        category: 'WILDLIFE_TRAFFICKING',
        title: 'Unauthorized Mechanized Boat Loading Wooden Crates at Night',
        description: 'Unmarked blue hull vessel parked near Tuticorin coastal mangroves since 02:00 AM. Multiple barrels loaded.',
        location: { type: 'Point', coordinates: [78.14, 8.76] },
        genuinenessScore: 84,
        distractionRisk: 'LOW',
        verificationFactors: {
          spatialCorrelation: 28,
          historicalPatternMatch: 26,
          mediaProvenanceScore: 16,
          marineWeatherFeasibility: 14,
        },
        whyFlagged: [
          'Location overlaps historical sea cucumber trafficking corridor',
          'Vessel loading time matches moonless night tide cycles',
        ],
        suggestedVerification: [
          'Deploy coastal patrol vessel for visual inspection',
          'Query AIS satellite vessel history for area',
        ],
        status: 'SUBMITTED',
      },
    ];

    for (const tip of sampleTips) {
      await Tip.findOneAndUpdate({ tipsterId: tip.tipsterId }, tip, { upsert: true });
    }
    logger.info('✅ Sample confidential tips created');

    logger.info('🎉 Seeding completed successfully!');
    await disconnectDatabase();
    process.exit(0);
  } catch (err) {
    logger.error('CRITICAL Error during database seeding:', err);
    process.exit(1);
  }
}

seedData();
