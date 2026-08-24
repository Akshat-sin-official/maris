import {
  WeatherObservation,
  MarineCondition,
  MarineAlert,
  SatelliteObservation,
  PFZZone
} from './types';

export interface WeatherProvider {
  name: string;
  fetchWeather(lat: number, lon: number): Promise<WeatherObservation>;
}

export interface OceanProvider {
  name: string;
  fetchOceanConditions(lat: number, lon: number): Promise<MarineCondition>;
}

export interface AlertProvider {
  name: string;
  fetchAlerts(lat: number, lon: number): Promise<MarineAlert[]>;
}

export interface SatelliteProvider {
  name: string;
  fetchSatelliteData(lat: number, lon: number): Promise<SatelliteObservation[]>;
}

export interface PFZProvider {
  name: string;
  fetchPFZs(lat: number, lon: number): Promise<PFZZone[]>;
}

export interface LLMProvider {
  name: string;
  generateText(prompt: string): Promise<string>;
}

export interface GeospatialProvider {
  name: string;
  fetchGeofences(lat: number, lon: number, radiusKm?: number): Promise<import('./types').GeoFence[]>;
}
