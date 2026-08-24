export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'ORG_ADMIN' | 'ANALYST';
  orgId?: string | null;
}

export interface Organization {
  id: string;
  _id?: string;
  name: string;
  code: string;
}

export interface Incident {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  creatorId: string;
  orgId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  id: string;
  _id?: string;
  observerId: string;
  creatorId: string;
  category: 'sst' | 'chlorophyll' | 'vessel_sighting' | 'wildlife' | 'weather_hazard';
  value: string;
  confidence: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  evidenceIds: string[];
  verification: {
    status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
    verifiedBy?: string | null;
    verifiedAt?: string | null;
  };
  timestamp: string;
}

export interface Evidence {
  id: string;
  _id?: string;
  orgId?: string | null;
  uploadedBy: string;
  incidentId?: string | null;
  observationId?: string | null;
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  fileHash: string;
  capturedAt: string;
  source: string;
  syncState: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
}

export interface TimelineEvent {
  eventType: string;
  actorId: string;
  message: string;
  timestamp: string;
}

export interface Alert {
  alertId: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  validFrom: string;
  validTo: string;
}

export interface PFZZone {
  zoneId: string;
  source: string;
  validFrom: string;
  validTo: string;
  coordinates: number[][][];
}

export interface GeoFence {
  fenceId: string;
  name: string;
  type: string;
  coordinates: number[][][];
}

export interface MarineConditions {
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
  waterTemperature?: number;
  salinity?: number;
  currentSpeed?: number;
  currentDirection?: number;
}

export interface IntelligenceLookupResponse {
  status: string;
  coordinates: [number, number];
  alerts: Alert[];
  geofences: GeoFence[];
  marineConditions: MarineConditions;
  pfz?: PFZZone[];
}

export interface AIQueryRequest {
  query: string;
}

export interface AIQueryResponse {
  status: string;
  answer: string;
  citations: string[];
}
