export interface AlertItem {
  id: string;
  title: string;
  type: 'CYCLONE' | 'HIGH_WAVE' | 'OIL_SPILL' | 'SANCTUARY_BREACH' | 'LIGHTNING';
  severity: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  region: string;
  coordinates: [number, number];
  timestamp: string;
  validUntil: string;
  source: string;
  description: string;
  mitigationAdvice: string;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
  isTip?: boolean;
  rawId?: string;
}

export interface PfzBulletin {
  id: string;
  title: string;
  zoneName: string;
  coordinates: [number, number];
  distFromCoastKm: number;
  sstCelsius: number;
  chlorophyllMgM3: number;
  depthMeters: number;
  targetSpecies: string[];
  validityWindow: string;
  potentialScore: number;
  recommendedCraft: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface FieldObservation {
  id: string;
  clientId: string;
  observerName: string;
  observerRole: string;
  category: 'SPECIES_SIGHTING' | 'HAZARD_REPORT' | 'ILLEGAL_GEAR' | 'VESSEL_ANOMALY' | 'POLLUTION';
  title: string;
  notes: string;
  coordinates: [number, number];
  locationName: string;
  timestamp: string;
  syncState: 'SYNCED' | 'PENDING' | 'SYNCING' | 'FAILED';
  verificationStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'UNVERIFIED' | 'REJECTED';
  photoUrl?: string;
  confidenceScore: number;
}

export interface InvestigationCase {
  id: string;
  _id?: string;
  caseNumber: string;
  title: string;
  category: string;
  priority: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'VERIFIED' | 'CLOSED';
  assignedTo: string;
  location: string;
  region?: string;
  description?: string;
  coordinates: [number, number];
  createdAt: string;
  updatedAt: string;
  aiMatchScore: number;
  evidenceTimeline: {
    id: string;
    timestamp: string;
    type: string;
    description: string;
    author: string;
  }[];
  riskAttribution: {
    factor: string;
    score: number;
  }[];
}

export interface ProviderHealth {
  name: string;
  type: 'SATELLITE' | 'WEATHER' | 'OCEANOGRAPHY' | 'FIELD' | 'AIS';
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastSync: string;
  coverage: string;
}

// ----------------------------------------------------------------------
// SIMULATED BASELINE DATASETS (ACTIVATED WHEN 'SIMULATED BASELINE' TOGGLED)
// ----------------------------------------------------------------------

export const SIMULATED_ALERTS: AlertItem[] = [
  {
    id: 'ALT-SIM-001',
    title: 'High Wave & Swell Advisory - Palk Strait Sector B',
    type: 'HIGH_WAVE',
    severity: 'CRITICAL',
    region: 'Palk Bay North Outer Reef',
    coordinates: [9.32, 79.35],
    timestamp: new Date().toISOString(),
    validUntil: new Date(Date.now() + 86400000).toISOString(),
    source: 'INCOIS Wave Watch III Model',
    description: 'Significant wave heights exceeding 3.4m detected near Pamban channel approaches.',
    mitigationAdvice: 'Issue warning to traditional motorized craft (<12m) to avoid deep water trawling.',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-SIM-002',
    title: 'Sanctuary Boundary Breach Alert',
    type: 'SANCTUARY_BREACH',
    severity: 'HIGH',
    region: 'Gulf of Mannar Marine National Park - Zone 4',
    coordinates: [9.15, 79.12],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    validUntil: new Date(Date.now() + 43200000).toISOString(),
    source: 'MARIS Satellite Optical Sentinel-2',
    description: 'Unregistered vessel entry detected inside coral reef core protection zone.',
    mitigationAdvice: 'Dispatch Patrol Vessel C-142 from Mandapam Station for physical interception.',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-SIM-003',
    title: 'Coastal SST Thermal Front Anomaly',
    type: 'CYCLONE',
    severity: 'ADVISORY',
    region: 'Rameswaram East Slope',
    coordinates: [9.28, 79.45],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    validUntil: new Date(Date.now() + 172800000).toISOString(),
    source: 'AVHRR Satellite SST Feed',
    description: 'Rapid SST thermal gradient +1.8°C shift indicating potential pelagic aggregation.',
    mitigationAdvice: 'Broadcast PFZ Bulletin #2026-88 to artisanal fishermen in Rameswaram cluster.',
    status: 'MONITORING',
  },
];

export const SIMULATED_PFZ_BULLETINS: PfzBulletin[] = [
  {
    id: 'PFZ-SIM-101',
    title: 'High Density Yellowfin Tuna Front',
    zoneName: 'Rameswaram Outer Slope Zone 3',
    coordinates: [9.28, 79.42],
    distFromCoastKm: 18.5,
    sstCelsius: 28.2,
    chlorophyllMgM3: 2.85,
    depthMeters: 145,
    targetSpecies: ['Yellowfin Tuna', 'Skipjack', 'King Mackerel'],
    validityWindow: '24 Hours',
    potentialScore: 94,
    recommendedCraft: 'Ring Seiner / Deep Sea Gillnetter',
    status: 'ACTIVE',
  },
  {
    id: 'PFZ-SIM-102',
    title: 'Pelagic Sardine & Squid Convergence',
    zoneName: 'Palk Bay Eastern Reef Channel',
    coordinates: [9.45, 79.28],
    distFromCoastKm: 12.2,
    sstCelsius: 27.6,
    chlorophyllMgM3: 3.40,
    depthMeters: 45,
    targetSpecies: ['Indian Oil Sardine', 'Calamari Squid', 'Anchovy'],
    validityWindow: '36 Hours',
    potentialScore: 89,
    recommendedCraft: 'Motorized Craft / Catamaran',
    status: 'ACTIVE',
  },
];

export const SIMULATED_FIELD_OBSERVATIONS: FieldObservation[] = [
  {
    id: 'OBS-SIM-301',
    clientId: 'CLI-992',
    observerName: 'Inspector K. Raman',
    observerRole: 'Coastal Field Officer',
    category: 'SPECIES_SIGHTING',
    title: 'Dugong Dugon Mother-Calf Pair Sighting',
    notes: 'Observed healthy Dugong pair grazing on seagrass beds near Manoli Island.',
    coordinates: [9.21, 79.22],
    locationName: 'Manoli Island Protected Lagoon',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    syncState: 'SYNCED',
    verificationStatus: 'VERIFIED',
    confidenceScore: 98,
  },
  {
    id: 'OBS-SIM-302',
    clientId: 'CLI-995',
    observerName: 'Ranger S. Murugan',
    observerRole: 'Marine Park Guard',
    category: 'ILLEGAL_GEAR',
    title: 'Confiscated Abandoned Pair Trawl Net',
    notes: 'Retrieved 400m banned monofilament gillnet drifting near coral patch reef.',
    coordinates: [9.18, 79.16],
    locationName: 'Hare Island Coral Patch',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    syncState: 'SYNCED',
    verificationStatus: 'VERIFIED',
    confidenceScore: 92,
  },
];

export const SIMULATED_INVESTIGATIONS: InvestigationCase[] = [
  {
    id: 'INV-SIM-801',
    _id: '65f1a1000000000000000801',
    caseNumber: 'MARIS-2026-801',
    title: 'Unidentified Foreign Trawler Incursion near Adam\'s Bridge',
    category: 'TERRITORIAL_INCURSION',
    priority: 'P0_CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedTo: 'Cmdr. Rajesh Verma',
    location: 'Adam\'s Bridge Sector 2',
    region: 'Gulf of Mannar EEZ',
    description: 'Suspicious 32m steel hull trawler operating with dark AIS telemetry inside territorial waters.',
    coordinates: [9.12, 79.52],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    aiMatchScore: 96,
    evidenceTimeline: [
      {
        id: 'EV-01',
        timestamp: new Date(Date.now() - 80000000).toISOString(),
        type: 'RADAR_TRACK',
        description: 'Primary coastal radar ping detected target at 14.2 knots.',
        author: 'Radar Station Mandapam',
      },
      {
        id: 'EV-02',
        timestamp: new Date(Date.now() - 40000000).toISOString(),
        type: 'OPTICAL_SATELLITE',
        description: 'Sentinel-2 RGB imagery confirmed vessel length 32m with twin outriggers.',
        author: 'MARIS AI Vision Engine',
      },
    ],
    riskAttribution: [
      { factor: 'AIS Dark Operation', score: 95 },
      { factor: 'Sanctuary Proximity', score: 88 },
      { factor: 'Speed Profile Anomaly', score: 91 },
    ],
  },
  {
    id: 'INV-SIM-802',
    _id: '65f1a1000000000000000802',
    caseNumber: 'MARIS-2026-802',
    title: 'Illegal Pair Trawling Incident near Pamban Bridge',
    category: 'ILLEGAL_FISHING',
    priority: 'P1_HIGH',
    status: 'OPEN',
    assignedTo: 'Officer S. Priya',
    location: 'Pamban Channel South',
    region: 'Palk Strait',
    description: 'Two motorized craft operating pair trawling nets during restricted nocturnal hours.',
    coordinates: [9.27, 79.21],
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString(),
    aiMatchScore: 88,
    evidenceTimeline: [
      {
        id: 'EV-03',
        timestamp: new Date(Date.now() - 40000000).toISOString(),
        type: 'CITIZEN_TIP',
        description: 'Pseudonymous tipster reported pair net deployment near beacon #4.',
        author: 'Tipster Receipt TIP-991204',
      },
    ],
    riskAttribution: [
      { factor: 'Banned Gear Signature', score: 92 },
      { factor: 'Nocturnal Activity', score: 84 },
    ],
  },
];

export const SIMULATED_TIPS = [
  {
    _id: '65f1b1000000000000000901',
    id: '65f1b1000000000000000901',
    tipsterId: 'TIP-8849201948',
    title: 'Banned Pair Trawl Deployment off Dhanushkodi Reef',
    description: 'Vessels TN-09-X-4410 and TN-09-X-4411 deploying weighted bottom pair trawls near protected coral patches.',
    category: 'ILLEGAL_GEAR',
    locationName: 'Dhanushkodi Outer Coral Patch',
    location: { type: 'Point', coordinates: [79.41, 9.17] },
    genuinenessScore: 92,
    distractionRiskScore: 8,
    status: 'SUBMITTED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '65f1b1000000000000000902',
    id: '65f1b1000000000000000902',
    tipsterId: 'TIP-4410293811',
    title: 'Chemical Effluent Discharge from Unmarked Barge',
    description: 'Dark brown oily plume discharging into tidal creek near Kilakarai coastal outlet.',
    category: 'POLLUTION',
    locationName: 'Kilakarai Estuarine Creek',
    location: { type: 'Point', coordinates: [78.78, 9.23] },
    genuinenessScore: 88,
    distractionRiskScore: 14,
    status: 'UNDER_REVIEW',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

export const SIMULATED_REPORTS = [
  {
    _id: '65f1c1000000000000000701',
    reportId: 'REP-2026-Q3-01',
    title: 'Gulf of Mannar Coral Reef Resilience & Marine Sanctuary Health Index',
    author: 'Dr. Vikram Sarabhai',
    region: 'Gulf of Mannar Sector B4',
    abstract: 'Comprehensive remote sensing and benthic transect evaluation across 21 islands in the Marine National Park.',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    _id: '65f1c1000000000000000702',
    reportId: 'REP-2026-Q3-02',
    title: 'Automated Vessel AIS Anomaly & Dark Track Identification Report',
    author: 'MARIS Operational AI',
    region: 'Palk Bay EEZ Corridor',
    abstract: 'Statistical pattern analysis of 450+ coastal vessel tracks using spatial DBSCAN clustering.',
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const SIMULATED_USERS = [
  {
    _id: '65f1d1000000000000000601',
    name: 'Cmdr. Rajesh Verma',
    email: 'operator@maris.gov.in',
    role: 'CONTROL_ROOM_OPERATOR',
    organization: 'MARIS Operational Command',
    badgeNumber: 'MARIS-8801',
    isActive: true,
  },
  {
    _id: '65f1d1000000000000000602',
    name: 'Dr. Vikram Sarabhai',
    email: 'researcher@maris.gov.in',
    role: 'RESEARCHER',
    organization: 'National Institute of Oceanography',
    badgeNumber: 'MARIS-9942',
    isActive: true,
  },
  {
    _id: '65f1d1000000000000000603',
    name: 'Inspector K. Raman',
    email: 'officer@maris.gov.in',
    role: 'COASTAL_OFFICER',
    organization: 'Tamil Nadu Marine Police Force',
    badgeNumber: 'MARIS-4412',
    isActive: true,
  },
];

export const SIMULATED_LIVE_LOCATIONS = [
  {
    id: 'vsl-sim-01',
    vesselId: 'TN-09-MM-4102',
    title: 'Patrol Vessel INS Chetlat (ICG)',
    locality: 'Mandapam Deep Anchorage',
    principalSubdivision: 'Tamil Nadu',
    latitude: 9.28,
    longitude: 79.31,
    status: 'PATROLLING',
    source: 'ICG Coastal AIS AIS-VHF',
    timestamp: new Date().toISOString(),
    metadata: {
      waterBody: 'Palk Strait',
      district: 'Ramanathapuram',
    },
  },
  {
    id: 'vsl-sim-02',
    vesselId: 'TN-09-X-9941',
    title: 'Trawler Sagar Kanya (Artisanal Craft)',
    locality: 'Rameswaram Slope',
    principalSubdivision: 'Tamil Nadu',
    latitude: 9.34,
    longitude: 79.42,
    status: 'FISHING',
    source: 'MARIS Vessel Transponder',
    timestamp: new Date().toISOString(),
    metadata: {
      waterBody: 'Gulf of Mannar',
      district: 'Ramanathapuram',
    },
  },
  {
    id: 'vsl-sim-03',
    vesselId: 'RESEARCH-01',
    title: 'Oceanographic Ship Sagar Nidhi',
    locality: 'Adam\'s Bridge Trench',
    principalSubdivision: 'Tamil Nadu',
    latitude: 9.14,
    longitude: 79.48,
    status: 'SURVEYING',
    source: 'INCOIS ERDDAP Satellite',
    timestamp: new Date().toISOString(),
    metadata: {
      waterBody: 'Indian Ocean EEZ',
      district: 'Coastal Sector B',
    },
  },
];

// Fallback compatibility exports
export const INITIAL_ALERTS: AlertItem[] = [];
export const INITIAL_PFZ_BULLETINS: PfzBulletin[] = [];
export const INITIAL_FIELD_OBSERVATIONS: FieldObservation[] = [];
export const INITIAL_INVESTIGATIONS: InvestigationCase[] = [];
export const PROVIDER_HEALTH_LIST: ProviderHealth[] = [
  {
    name: 'INCOIS ERDDAP Satellite Server',
    type: 'SATELLITE',
    status: 'OPERATIONAL',
    latencyMs: 142,
    lastSync: '2 mins ago',
    coverage: '100% Indian EEZ',
  },
  {
    name: 'OpenWeather Coastal Marine Api',
    type: 'WEATHER',
    status: 'OPERATIONAL',
    latencyMs: 98,
    lastSync: '1 min ago',
    coverage: 'Global Coastal',
  },
  {
    name: 'MARIS MongoDB Atlas Production Cluster',
    type: 'OCEANOGRAPHY',
    status: 'OPERATIONAL',
    latencyMs: 34,
    lastSync: 'Live Socket.IO',
    coverage: 'Full DB Schema',
  },
];

export const AI_QUERY_PRESETS: string[] = [
  'What are the active PFZ advisories near Rameswaram today?',
  'Show me unresolved vessel incursion incidents in the sanctuary zone.',
  'Analyze risk scores for recent pseudonymous tipster submissions.',
  'Summarize coastal SST thermal front anomalies in Sector B4.',
];
