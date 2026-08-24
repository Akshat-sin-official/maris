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

// 100% EMPTY DATA ARRAYS - ALL APP DATA FETCHED DIRECTLY FROM LIVE BACKEND APIS
export const INITIAL_ALERTS: AlertItem[] = [];
export const INITIAL_PFZ_BULLETINS: PfzBulletin[] = [];
export const INITIAL_FIELD_OBSERVATIONS: FieldObservation[] = [];
export const INITIAL_INVESTIGATIONS: InvestigationCase[] = [];
export const PROVIDER_HEALTH_LIST: ProviderHealth[] = [];
export const AI_QUERY_PRESETS: string[] = [];
