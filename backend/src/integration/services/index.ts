import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { SimpleCache } from '../cache';
import {
  WeatherObservation,
  MarineCondition,
  MarineAlert,
  SatelliteObservation,
  PFZZone,
  GeoFence,
  FieldObservation
} from '../types';
import {
  WeatherProvider,
  OceanProvider,
  AlertProvider,
  SatelliteProvider,
  PFZProvider,
  LLMProvider,
  GeospatialProvider
} from '../interfaces';
import {
  MockWeatherProvider,
  MockOceanProvider,
  MockAlertProvider,
  MockSatelliteProvider,
  MockPFZProvider,
  MockLLMProvider
} from '../adapters/MockAdapters';
import { OpenWeatherMapProvider } from '../adapters/OpenWeatherMapProvider';
import { OpenMeteoMarineProvider } from '../adapters/OpenMeteoMarineProvider';
import { IMDProvider } from '../adapters/IMDProvider';
import { INCOISErddapProvider } from '../adapters/INCOISErddapProvider';
import { CopernicusMarineProvider } from '../adapters/CopernicusMarineProvider';
import { OverpassGeospatialProvider } from '../adapters/OverpassGeospatialProvider';
import { WDPAGeospatialProvider } from '../adapters/WDPAGeospatialProvider';
import { Observation } from '../../observations/Observation.model';

import { HistoricalMatch } from '../../intelligence/HistoricalMatch.model';

const cache = new SimpleCache();

// Providers registrations
const mockWeather = new MockWeatherProvider();
const mockOcean = new MockOceanProvider();
const mockAlert = new MockAlertProvider();
const mockSatellite = new MockSatelliteProvider();
const mockPFZ = new MockPFZProvider();
const mockLLM = new MockLLMProvider();

// ---------------------------------------------------------------
// Live adapter registration — conditional on keys / feature flags
// ---------------------------------------------------------------

// 1. Weather: OpenWeatherMap (key-gated)
let activeWeatherProvider: WeatherProvider =
  env.OPENWEATHER_API_KEY
    ? new OpenWeatherMapProvider(env.OPENWEATHER_API_KEY)
    : mockWeather;

// 2. Ocean: Open-Meteo Marine (free by default) | Copernicus (key-gated)
let activeOceanProvider: OceanProvider =
  env.ENABLE_LIVE_COPERNICUS && env.COPERNICUS_USERNAME && env.COPERNICUS_PASSWORD
    ? new CopernicusMarineProvider(env.COPERNICUS_USERNAME, env.COPERNICUS_PASSWORD)
    : new OpenMeteoMarineProvider();

// 3. Alerts: IMD (key-gated) | mock fallback
let activeAlertProvider: AlertProvider =
  env.IMD_API_KEY && env.ENABLE_LIVE_IMD
    ? new IMDProvider(env.IMD_API_KEY)
    : mockAlert;

// 4. Satellite: mock until Copernicus EO product is configured
let activeSatelliteProvider: SatelliteProvider = mockSatellite;

// 5. PFZ: INCOIS ERDDAP (free, flag-gated) | mock fallback
let activePFZProvider: PFZProvider =
  env.ENABLE_LIVE_INCOIS
    ? new INCOISErddapProvider()
    : mockPFZ;

// 6. LLM: mock until provider is configured
let activeLLMProvider: LLMProvider = mockLLM;

// 7. Geospatial: Overpass/OSM (free default) | WDPA (key-gated)
let activeGeospatialProvider: GeospatialProvider =
  env.WDPA_API_KEY && env.ENABLE_LIVE_GEOSPATIAL
    ? new WDPAGeospatialProvider(env.WDPA_API_KEY)
    : new OverpassGeospatialProvider();

// Allow injecting live adapters for tests
export function setWeatherProvider(provider: WeatherProvider) {
  activeWeatherProvider = provider;
}
export function setOceanProvider(provider: OceanProvider) {
  activeOceanProvider = provider;
}
export function setAlertProvider(provider: AlertProvider) {
  activeAlertProvider = provider;
}
export function setSatelliteProvider(provider: SatelliteProvider) {
  activeSatelliteProvider = provider;
}
export function setPFZProvider(provider: PFZProvider) {
  activePFZProvider = provider;
}
export function setLLMProvider(provider: LLMProvider) {
  activeLLMProvider = provider;
}
export function setGeospatialProvider(provider: GeospatialProvider) {
  activeGeospatialProvider = provider;
}

export function clearCache() {
  cache.clear();
}

/**
 * 1. Weather Domain Service
 */
export const weatherService = {
  getWeather: async (lat: number, lon: number): Promise<WeatherObservation> => {
    const key = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const provider = env.ENABLE_LIVE_WEATHER ? activeWeatherProvider : mockWeather;
    try {
      const data = await provider.fetchWeather(lat, lon);
      cache.set(key, data, 1800000); // 30 minutes TTL
      return data;
    } catch (error) {
      logger.warn(`WeatherProvider ${provider.name} failed. Falling back to mock weather.`, error);
      return mockWeather.fetchWeather(lat, lon);
    }
  }
};

/**
 * 2. Marine/Ocean Conditions Service
 * Uses Open-Meteo Marine API by default (free, no key required).
 * Falls back to mockOcean only if the active provider throws.
 */
export const oceanService = {
  getOceanConditions: async (lat: number, lon: number): Promise<MarineCondition> => {
    const key = `ocean:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    try {
      const data = await activeOceanProvider.fetchOceanConditions(lat, lon);
      cache.set(key, data, 1800000); // 30 minutes TTL
      return data;
    } catch (error) {
      logger.warn(`OceanProvider ${activeOceanProvider.name} failed. Falling back to mock ocean conditions.`, error);
      return mockOcean.fetchOceanConditions(lat, lon);
    }
  }
};

/**
 * 3. Marine Alerts Service
 */
export const alertService = {
  getAlerts: async (lat: number, lon: number): Promise<MarineAlert[]> => {
    const key = `alerts:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const provider = env.ENABLE_LIVE_ALERTS ? activeAlertProvider : mockAlert;
    try {
      const data = await provider.fetchAlerts(lat, lon);
      cache.set(key, data, 900000); // 15 minutes TTL
      return data;
    } catch (error) {
      logger.warn(`AlertProvider ${provider.name} failed. Falling back to mock alerts.`, error);
      return mockAlert.fetchAlerts(lat, lon);
    }
  }
};

/**
 * 4. Satellite Observation Service
 */
export const satelliteService = {
  getSatelliteData: async (lat: number, lon: number): Promise<SatelliteObservation[]> => {
    const key = `satellite:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const provider = env.ENABLE_LIVE_SATELLITE ? activeSatelliteProvider : mockSatellite;
    try {
      const data = await provider.fetchSatelliteData(lat, lon);
      cache.set(key, data, 86400000); // 24 hours TTL for satellite imagery
      return data;
    } catch (error) {
      logger.warn(`SatelliteProvider ${provider.name} failed. Falling back to mock satellite data.`, error);
      return mockSatellite.fetchSatelliteData(lat, lon);
    }
  }
};

/**
 * 5. PFZ Intelligence Service
 */
export const pfzService = {
  getPFZs: async (lat: number, lon: number): Promise<PFZZone[]> => {
    const key = `pfz:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const provider = env.ENABLE_LIVE_PFZ ? activePFZProvider : mockPFZ;
    try {
      const data = await provider.fetchPFZs(lat, lon);
      cache.set(key, data, 43200000); // 12 hours TTL for PFZ maps
      return data;
    } catch (error) {
      logger.warn(`PFZProvider ${provider.name} failed. Falling back to mock PFZ zones.`, error);
      return mockPFZ.fetchPFZs(lat, lon);
    }
  }
};

/**
 * 6. Geospatial Boundary / Geofence Service
 * Default: OpenStreetMap Overpass (free, no key).
 * Live upgrade: WDPA Protected Planet (key-gated).
 */
export const geospatialService = {
  getGeofences: async (lat: number, lon: number, radiusKm = 200): Promise<GeoFence[]> => {
    const key = `geofences:${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusKm}`;
    const cached = cache.get(key);
    if (cached) return cached;

    try {
      const data = await activeGeospatialProvider.fetchGeofences(lat, lon, radiusKm);
      cache.set(key, data, 86400000); // 24 h TTL — boundaries change rarely
      return data;
    } catch (error) {
      logger.warn(
        `GeospatialProvider ${activeGeospatialProvider.name} failed. Returning empty fence set.`,
        error
      );
      return [];
    }
  }
};

/**
 * 7. Field Intelligence Service
 * Normalizes field observer recordings from local DB
 */
export const fieldIntelligenceService = {
  getFieldObservations: async (_lat: number, _lon: number): Promise<FieldObservation[]> => {
    try {
      const dbObs = await Observation.find({}).limit(5).populate('observerId').exec();
      return dbObs.map((d: any) => ({
        source: 'maris_field_observations_db',
        retrievedAt: new Date(),
        observationId: d._id.toString(),
        observerId: d.observerId?._id?.toString() || 'unknown',
        category: d.category,
        value: d.value,
        coordinates: d.location?.coordinates as [number, number],
        timestamp: d.timestamp,
      }));
    } catch (error) {
      logger.warn('Failed to query local field observations, returning empty set.', error);
      return [];
    }
  }
};

/**
 * 8. Historical Intelligence Service
 * Normalizes historical incidents and similarity links from local DB
 */
export const historicalIntelligenceService = {
  getHistoricalMatches: async (incidentId: string): Promise<any[]> => {
    try {
      const matches = await HistoricalMatch.find({ sourceIncidentId: incidentId })
        .populate('matchedIncidentId')
        .exec();
      return matches.map((m: any) => ({
        source: 'maris_historical_intelligence_db',
        retrievedAt: new Date(),
        similarityScore: m.similarityScore,
        matchingFeatures: m.matchingFeatures,
        matchedIncident: {
          id: m.matchedIncidentId?._id?.toString(),
          title: m.matchedIncidentId?.title,
          priority: m.matchedIncidentId?.priority,
          status: m.matchedIncidentId?.status,
        },
      }));
    } catch (error) {
      logger.warn('Failed to query local historical matches, returning empty set.', error);
      return [];
    }
  }
};

/**
 * 9. LLM Service
 */
export const llmService = {
  generateText: async (prompt: string): Promise<string> => {
    const provider = env.ENABLE_LLM ? activeLLMProvider : mockLLM;
    try {
      return await provider.generateText(prompt);
    } catch (error) {
      logger.warn(`LLMProvider ${provider.name} failed. Falling back to mock LLM responses.`, error);
      return mockLLM.generateText(prompt);
    }
  }
};
