export interface WeatherObservation {
  source: string;
  retrievedAt: Date;
  temp: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressure: number;
  condition: string;
  coordinates?: [number, number];
}

export interface MarineCondition {
  source: string;
  retrievedAt: Date;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  waterTemp: number;
  salinity: number;
  currentSpeed: number;
  currentDirection: number;
  coordinates?: [number, number];
}

export interface MarineAlert {
  source: string;
  retrievedAt: Date;
  alertId: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  validFrom: Date;
  validTo?: Date;
  coordinates?: [number, number];
  area?: { type: string; coordinates: any };
}

export interface SatelliteObservation {
  source: string;
  retrievedAt: Date;
  observationId: string;
  instrument: string;
  resolution: string;
  capturedAt: Date;
  imageUrl: string;
  boundingBox?: number[][];
  rawReference?: string;
}

export interface PFZZone {
  source: string;
  retrievedAt: Date;
  zoneId: string;
  area: { type: 'Polygon'; coordinates: number[][][] };
  chlorophyll: number;
  sstGradient: number;
  confidence: number;
  validFrom: Date;
  validTo: Date;
}

export interface GeoFence {
  source: string;
  retrievedAt: Date;
  fenceId: string;
  name: string;
  polygon: { type: 'Polygon'; coordinates: number[][][] };
  restricted: boolean;
}

export interface FieldObservation {
  source: string;
  retrievedAt: Date;
  observationId: string;
  observerId: string;
  category: string;
  value: string;
  coordinates?: [number, number];
  timestamp: Date;
}
