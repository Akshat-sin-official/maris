export interface AlertItem {
  id: string;
  title: string;
  type: 'CYCLONE' | 'HIGH_WAVE' | 'OIL_SPILL' | 'SANCTUARY_BREACH' | 'LIGHTNING';
  severity: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  region: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
  validUntil: string;
  source: string;
  description: string;
  mitigationAdvice: string;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
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
  potentialScore: number; // 0 to 100
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
  verificationStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'UNVERIFIED';
  photoUrl?: string;
  confidenceScore: number;
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  category: string;
  priority: 'P0_CRITICAL' | 'P1_HIGH' | 'P2_MEDIUM' | 'P3_LOW';
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'VERIFIED' | 'CLOSED';
  assignedTo: string;
  location: string;
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

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-2026-001',
    title: 'Severe High Wave & Rough Sea Warning',
    type: 'HIGH_WAVE',
    severity: 'CRITICAL',
    region: 'Gulf of Mannar - Sector B4',
    coordinates: [8.92, 79.15],
    timestamp: '2026-08-24T10:30:00Z',
    validUntil: '2026-08-25T18:00:00Z',
    source: 'INCOIS Swell Surge Alert System',
    description: 'Swell waves of 3.8m to 4.5m expected due to low-pressure system in South Bay of Bengal. Small craft advisories issued.',
    mitigationAdvice: 'Fishermen and small vessel operators are advised not to venture into deep sea waters. Return to coastal shelters.',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-2026-002',
    title: 'Marine National Park Geofence Breach Signal',
    type: 'SANCTUARY_BREACH',
    severity: 'HIGH',
    region: 'Palk Bay Marine Conservation Zone',
    coordinates: [9.35, 79.28],
    timestamp: '2026-08-24T12:15:00Z',
    validUntil: '2026-08-24T23:59:00Z',
    source: 'MARIS Automated AIS Geofence Watcher',
    description: 'Multiple mechanized trawlers detected lingering within 1.2 nautical miles of protected Dugong seagrass beds.',
    mitigationAdvice: 'Coastal Security Guard Patrol Boat 04 notified for physical verification.',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-2026-003',
    title: 'Localized Lightning & Thermal Squall Advisory',
    type: 'LIGHTNING',
    severity: 'ADVISORY',
    region: 'Coromandel Coastal Offshore Grid 12',
    coordinates: [11.10, 79.85],
    timestamp: '2026-08-24T11:00:00Z',
    validUntil: '2026-08-24T17:00:00Z',
    source: 'IMD Coastal Radar Network',
    description: 'Isolated convective thunderstorm activity with cloud-to-sea lightning frequencies up to 14 strikes/min.',
    mitigationAdvice: 'Maintain radio contact on VHF Channel 16 and minimize tall metal antenna contact during squall window.',
    status: 'MONITORING',
  },
];

export const INITIAL_PFZ_BULLETINS: PfzBulletin[] = [
  {
    id: 'PFZ-2026-881',
    title: 'High Potential Tuna & Mackerel Front',
    zoneName: 'Rameswaram Outer Slope - Grid 04',
    coordinates: [9.15, 79.45],
    distFromCoastKm: 18.5,
    sstCelsius: 27.8,
    chlorophyllMgM3: 2.14,
    depthMeters: 45,
    targetSpecies: ['Yellowfin Tuna', 'Indian Mackerel', 'Sardines'],
    validityWindow: 'Valid until 2026-08-25 12:00 UTC',
    potentialScore: 92,
    recommendedCraft: 'Motorized Boat / Gillnetter',
    status: 'ACTIVE',
  },
  {
    id: 'PFZ-2026-882',
    title: 'Pelagic Convergence Zone',
    zoneName: 'Nagapattinam Deep Water Trench',
    coordinates: [10.76, 79.98],
    distFromCoastKm: 28.0,
    sstCelsius: 28.2,
    chlorophyllMgM3: 1.85,
    depthMeters: 120,
    targetSpecies: ['Skipjack Tuna', 'King Mackerel', 'Seer Fish'],
    validityWindow: 'Valid until 2026-08-25 18:00 UTC',
    potentialScore: 84,
    recommendedCraft: 'Longliner / Deep Sea Vessel',
    status: 'ACTIVE',
  },
  {
    id: 'PFZ-2026-883',
    title: 'Coastal Chlorophyll Front',
    zoneName: 'Tuticorin South Approach',
    coordinates: [8.72, 78.22],
    distFromCoastKm: 12.2,
    sstCelsius: 27.1,
    chlorophyllMgM3: 3.05,
    depthMeters: 28,
    targetSpecies: ['Anchovy', 'Ribbon Fish', 'Prawns'],
    validityWindow: 'Valid until 2026-08-24 22:00 UTC',
    potentialScore: 78,
    recommendedCraft: 'Traditional Craft / Trawler',
    status: 'EXPIRING_SOON',
  },
];

export const INITIAL_FIELD_OBSERVATIONS: FieldObservation[] = [
  {
    id: 'OBS-901',
    clientId: 'CLIENT-OFFLINE-78192',
    observerName: 'R. Koteswara Rao',
    observerRole: 'Marine Conservation Observer',
    category: 'SPECIES_SIGHTING',
    title: 'Olive Ridley Turtle Nesting Track',
    notes: 'Observed female Olive Ridley turtle nesting activity along northern sand dunes. 42 egg clutches marked.',
    coordinates: [11.85, 79.88],
    locationName: 'Pondicherry South Dune Sanctuary',
    timestamp: '2026-08-24T08:15:00Z',
    syncState: 'SYNCED',
    verificationStatus: 'VERIFIED',
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    confidenceScore: 0.96,
  },
  {
    id: 'OBS-902',
    clientId: 'CLIENT-OFFLINE-78193',
    observerName: 'M. Selvam',
    observerRole: 'Artisanal Fisherman Leader',
    category: 'HAZARD_REPORT',
    title: 'Submerged Ghost Net Debris',
    notes: 'Heavy discarded monofilament net snagged on natural coral knoll at 8m depth. Danger to small craft propellers.',
    coordinates: [9.28, 79.12],
    locationName: 'Mandapam Coral Pass',
    timestamp: '2026-08-24T11:40:00Z',
    syncState: 'SYNCED',
    verificationStatus: 'UNDER_REVIEW',
    photoUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
    confidenceScore: 0.88,
  },
  {
    id: 'OBS-903',
    clientId: 'CLIENT-OFFLINE-78194',
    observerName: 'K. Anitha',
    observerRole: 'Coastal Field Warden',
    category: 'ILLEGAL_GEAR',
    title: 'Unmarked Pair Trawl Net Observation',
    notes: 'Unregistered high-horsepower vessel operating non-compliant fine-mesh codend net during breeding prohibition window.',
    coordinates: [9.45, 79.35],
    locationName: 'Palk Strait Boundary',
    timestamp: '2026-08-24T13:05:00Z',
    syncState: 'PENDING',
    verificationStatus: 'UNVERIFIED',
    confidenceScore: 0.79,
  },
];

export const INITIAL_INVESTIGATIONS: InvestigationCase[] = [
  {
    id: 'CAS-2026-042',
    caseNumber: 'MARIS-INV-2026-042',
    title: 'Coral Reef Habitat Disturbance & Encroachment',
    category: 'HABITAT_PROTECTION',
    priority: 'P0_CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedTo: 'Dr. A. Ramanathan (Lead Inspector)',
    location: 'Gulf of Mannar Reef Island 07',
    coordinates: [9.02, 79.22],
    createdAt: '2026-08-22T09:00:00Z',
    updatedAt: '2026-08-24T12:00:00Z',
    aiMatchScore: 0.91,
    evidenceTimeline: [
      {
        id: 'EV-1',
        timestamp: '2026-08-22T09:00:00Z',
        type: 'SATELLITE_ANOMALY',
        description: 'Sentinel-2 RGB anomaly detected elevated turbidity plume near Island 07 reef flat.',
        author: 'MARIS Geo-Agent',
      },
      {
        id: 'EV-2',
        timestamp: '2026-08-23T14:30:00Z',
        type: 'FIELD_REPORT',
        description: 'Field Warden submitted underwater photos of crushed branching Acropora corals.',
        author: 'Warden K. Anitha',
      },
      {
        id: 'EV-3',
        timestamp: '2026-08-24T11:15:00Z',
        type: 'AI_REASONING',
        description: 'Correlated turbidity plume with AIS track of dredging barge IND-7712 operating out of bounds.',
        author: 'MARIS Planner Agent',
      },
    ],
    riskAttribution: [
      { factor: 'Sanctuary Proximity (<500m)', score: 95 },
      { factor: 'Physical Habitat Damage', score: 88 },
      { factor: 'Repeat Offender Vessel Track', score: 76 },
      { factor: 'Turbidity Threshold Exceeded', score: 84 },
    ],
  },
  {
    id: 'CAS-2026-039',
    caseNumber: 'MARIS-INV-2026-039',
    title: 'Coastal Fuel Slick & Bilge Discharge',
    category: 'MARINE_POLLUTION',
    priority: 'P1_HIGH',
    status: 'OPEN',
    assignedTo: 'Inspector S. Prabakar',
    location: 'Chennai Port Outer Anchorage',
    coordinates: [13.12, 80.32],
    createdAt: '2026-08-23T18:20:00Z',
    updatedAt: '2026-08-24T09:45:00Z',
    aiMatchScore: 0.84,
    evidenceTimeline: [
      {
        id: 'EV-10',
        timestamp: '2026-08-23T18:20:00Z',
        type: 'SAR_SATELLITE',
        description: 'Sentinel-1 C-band SAR image flagged 4.2 km thin dark slick feature aligned with south-flowing surface currents.',
        author: 'Copernicus Sentinel Agent',
      },
    ],
    riskAttribution: [
      { factor: 'Slick Area (>3 sq km)', score: 82 },
      { factor: 'Proximity to Beach Shoreline', score: 70 },
      { factor: 'Commercial Vessel Traffic Density', score: 90 },
    ],
  },
];

export const PROVIDER_HEALTH_LIST: ProviderHealth[] = [
  {
    name: 'Copernicus Marine Service (CMEMS)',
    type: 'SATELLITE',
    status: 'OPERATIONAL',
    latencyMs: 145,
    lastSync: '2 mins ago',
    coverage: 'Global / Indian Ocean (0.05° grid)',
  },
  {
    name: 'IMD Coastal Radar & Weather API',
    type: 'WEATHER',
    status: 'OPERATIONAL',
    latencyMs: 98,
    lastSync: '5 mins ago',
    coverage: 'East & West Coast India Radars',
  },
  {
    name: 'INCOIS Marine Advisory System',
    type: 'OCEANOGRAPHY',
    status: 'OPERATIONAL',
    latencyMs: 112,
    lastSync: '12 mins ago',
    coverage: 'EEZ & Coastal High-Resolution',
  },
  {
    name: 'Global Fishing Watch (GFW) AIS',
    type: 'AIS',
    status: 'OPERATIONAL',
    latencyMs: 210,
    lastSync: '1 min ago',
    coverage: 'Vessel Tracking Feed',
  },
  {
    name: 'MARIS Field Sync Buffer (SQLite/Cloud)',
    type: 'FIELD',
    status: 'OPERATIONAL',
    latencyMs: 34,
    lastSync: 'Live WebSocket',
    coverage: 'Offline-First Field Mobile Sync',
  },
];

export const AI_QUERY_PRESETS = [
  {
    id: 'q1',
    label: 'Safety Assessment',
    query: 'Is it safe for small motor craft to launch from Rameswaram for fishing tomorrow morning?',
  },
  {
    id: 'q2',
    label: 'PFZ Recommendation',
    query: 'Where are the highest probability PFZ locations near Palk Bay within 25 km of coast?',
  },
  {
    id: 'q3',
    label: 'Geofence Violation Check',
    query: 'Analyze recent vessel traffic anomalies around the Gulf of Mannar Biosphere Reserve.',
  },
  {
    id: 'q4',
    label: 'Cyclone & Weather Alert',
    query: 'What are the current wind vector and swell wave conditions along Tamil Nadu coast?',
  },
];
