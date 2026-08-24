"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmService = exports.historicalIntelligenceService = exports.fieldIntelligenceService = exports.geospatialService = exports.pfzService = exports.satelliteService = exports.alertService = exports.oceanService = exports.weatherService = void 0;
exports.setWeatherProvider = setWeatherProvider;
exports.setOceanProvider = setOceanProvider;
exports.setAlertProvider = setAlertProvider;
exports.setSatelliteProvider = setSatelliteProvider;
exports.setPFZProvider = setPFZProvider;
exports.setLLMProvider = setLLMProvider;
exports.setGeospatialProvider = setGeospatialProvider;
exports.clearCache = clearCache;
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const cache_1 = require("../cache");
const MockAdapters_1 = require("../adapters/MockAdapters");
const OpenWeatherMapProvider_1 = require("../adapters/OpenWeatherMapProvider");
const OpenMeteoMarineProvider_1 = require("../adapters/OpenMeteoMarineProvider");
const IMDProvider_1 = require("../adapters/IMDProvider");
const INCOISErddapProvider_1 = require("../adapters/INCOISErddapProvider");
const CopernicusMarineProvider_1 = require("../adapters/CopernicusMarineProvider");
const OverpassGeospatialProvider_1 = require("../adapters/OverpassGeospatialProvider");
const WDPAGeospatialProvider_1 = require("../adapters/WDPAGeospatialProvider");
const Observation_model_1 = require("../../observations/Observation.model");
const HistoricalMatch_model_1 = require("../../intelligence/HistoricalMatch.model");
const cache = new cache_1.SimpleCache();
// Providers registrations
const mockWeather = new MockAdapters_1.MockWeatherProvider();
const mockOcean = new MockAdapters_1.MockOceanProvider();
const mockAlert = new MockAdapters_1.MockAlertProvider();
const mockSatellite = new MockAdapters_1.MockSatelliteProvider();
const mockPFZ = new MockAdapters_1.MockPFZProvider();
const mockLLM = new MockAdapters_1.MockLLMProvider();
// ---------------------------------------------------------------
// Live adapter registration — conditional on keys / feature flags
// ---------------------------------------------------------------
// 1. Weather: OpenWeatherMap (key-gated)
let activeWeatherProvider = env_1.env.OPENWEATHER_API_KEY
    ? new OpenWeatherMapProvider_1.OpenWeatherMapProvider(env_1.env.OPENWEATHER_API_KEY)
    : mockWeather;
// 2. Ocean: Open-Meteo Marine (free by default) | Copernicus (key-gated)
let activeOceanProvider = env_1.env.ENABLE_LIVE_COPERNICUS && env_1.env.COPERNICUS_USERNAME && env_1.env.COPERNICUS_PASSWORD
    ? new CopernicusMarineProvider_1.CopernicusMarineProvider(env_1.env.COPERNICUS_USERNAME, env_1.env.COPERNICUS_PASSWORD)
    : new OpenMeteoMarineProvider_1.OpenMeteoMarineProvider();
// 3. Alerts: IMD (key-gated) | mock fallback
let activeAlertProvider = env_1.env.IMD_API_KEY && env_1.env.ENABLE_LIVE_IMD
    ? new IMDProvider_1.IMDProvider(env_1.env.IMD_API_KEY)
    : mockAlert;
// 4. Satellite: mock until Copernicus EO product is configured
let activeSatelliteProvider = mockSatellite;
// 5. PFZ: INCOIS ERDDAP (free, flag-gated) | mock fallback
let activePFZProvider = env_1.env.ENABLE_LIVE_INCOIS
    ? new INCOISErddapProvider_1.INCOISErddapProvider()
    : mockPFZ;
// 6. LLM: mock until provider is configured
let activeLLMProvider = mockLLM;
// 7. Geospatial: Overpass/OSM (free default) | WDPA (key-gated)
let activeGeospatialProvider = env_1.env.WDPA_API_KEY && env_1.env.ENABLE_LIVE_GEOSPATIAL
    ? new WDPAGeospatialProvider_1.WDPAGeospatialProvider(env_1.env.WDPA_API_KEY)
    : new OverpassGeospatialProvider_1.OverpassGeospatialProvider();
// Allow injecting live adapters for tests
function setWeatherProvider(provider) {
    activeWeatherProvider = provider;
}
function setOceanProvider(provider) {
    activeOceanProvider = provider;
}
function setAlertProvider(provider) {
    activeAlertProvider = provider;
}
function setSatelliteProvider(provider) {
    activeSatelliteProvider = provider;
}
function setPFZProvider(provider) {
    activePFZProvider = provider;
}
function setLLMProvider(provider) {
    activeLLMProvider = provider;
}
function setGeospatialProvider(provider) {
    activeGeospatialProvider = provider;
}
function clearCache() {
    cache.clear();
}
/**
 * 1. Weather Domain Service
 */
exports.weatherService = {
    getWeather: async (lat, lon) => {
        const key = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        const provider = env_1.env.ENABLE_LIVE_WEATHER ? activeWeatherProvider : mockWeather;
        try {
            const data = await provider.fetchWeather(lat, lon);
            cache.set(key, data, 1800000); // 30 minutes TTL
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`WeatherProvider ${provider.name} failed. Falling back to mock weather.`, error);
            return mockWeather.fetchWeather(lat, lon);
        }
    }
};
/**
 * 2. Marine/Ocean Conditions Service
 * Uses Open-Meteo Marine API by default (free, no key required).
 * Falls back to mockOcean only if the active provider throws.
 */
exports.oceanService = {
    getOceanConditions: async (lat, lon) => {
        const key = `ocean:${lat.toFixed(4)}:${lon.toFixed(4)}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        try {
            const data = await activeOceanProvider.fetchOceanConditions(lat, lon);
            cache.set(key, data, 1800000); // 30 minutes TTL
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`OceanProvider ${activeOceanProvider.name} failed. Falling back to mock ocean conditions.`, error);
            return mockOcean.fetchOceanConditions(lat, lon);
        }
    }
};
/**
 * 3. Marine Alerts Service
 */
exports.alertService = {
    getAlerts: async (lat, lon) => {
        const key = `alerts:${lat.toFixed(4)}:${lon.toFixed(4)}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        const provider = env_1.env.ENABLE_LIVE_ALERTS ? activeAlertProvider : mockAlert;
        try {
            const data = await provider.fetchAlerts(lat, lon);
            cache.set(key, data, 900000); // 15 minutes TTL
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`AlertProvider ${provider.name} failed. Falling back to mock alerts.`, error);
            return mockAlert.fetchAlerts(lat, lon);
        }
    }
};
/**
 * 4. Satellite Observation Service
 */
exports.satelliteService = {
    getSatelliteData: async (lat, lon) => {
        const key = `satellite:${lat.toFixed(4)}:${lon.toFixed(4)}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        const provider = env_1.env.ENABLE_LIVE_SATELLITE ? activeSatelliteProvider : mockSatellite;
        try {
            const data = await provider.fetchSatelliteData(lat, lon);
            cache.set(key, data, 86400000); // 24 hours TTL for satellite imagery
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`SatelliteProvider ${provider.name} failed. Falling back to mock satellite data.`, error);
            return mockSatellite.fetchSatelliteData(lat, lon);
        }
    }
};
/**
 * 5. PFZ Intelligence Service
 */
exports.pfzService = {
    getPFZs: async (lat, lon) => {
        const key = `pfz:${lat.toFixed(4)}:${lon.toFixed(4)}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        const provider = env_1.env.ENABLE_LIVE_PFZ ? activePFZProvider : mockPFZ;
        try {
            const data = await provider.fetchPFZs(lat, lon);
            cache.set(key, data, 43200000); // 12 hours TTL for PFZ maps
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`PFZProvider ${provider.name} failed. Falling back to mock PFZ zones.`, error);
            return mockPFZ.fetchPFZs(lat, lon);
        }
    }
};
/**
 * 6. Geospatial Boundary / Geofence Service
 * Default: OpenStreetMap Overpass (free, no key).
 * Live upgrade: WDPA Protected Planet (key-gated).
 */
exports.geospatialService = {
    getGeofences: async (lat, lon, radiusKm = 200) => {
        const key = `geofences:${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusKm}`;
        const cached = cache.get(key);
        if (cached)
            return cached;
        try {
            const data = await activeGeospatialProvider.fetchGeofences(lat, lon, radiusKm);
            cache.set(key, data, 86400000); // 24 h TTL — boundaries change rarely
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`GeospatialProvider ${activeGeospatialProvider.name} failed. Returning empty fence set.`, error);
            return [];
        }
    }
};
/**
 * 7. Field Intelligence Service
 * Normalizes field observer recordings from local DB
 */
exports.fieldIntelligenceService = {
    getFieldObservations: async (_lat, _lon) => {
        try {
            const dbObs = await Observation_model_1.Observation.find({}).limit(5).populate('observerId').exec();
            return dbObs.map((d) => ({
                source: 'maris_field_observations_db',
                retrievedAt: new Date(),
                observationId: d._id.toString(),
                observerId: d.observerId?._id?.toString() || 'unknown',
                category: d.category,
                value: d.value,
                coordinates: d.location?.coordinates,
                timestamp: d.timestamp,
            }));
        }
        catch (error) {
            logger_1.logger.warn('Failed to query local field observations, returning empty set.', error);
            return [];
        }
    }
};
/**
 * 8. Historical Intelligence Service
 * Normalizes historical incidents and similarity links from local DB
 */
exports.historicalIntelligenceService = {
    getHistoricalMatches: async (incidentId) => {
        try {
            const matches = await HistoricalMatch_model_1.HistoricalMatch.find({ sourceIncidentId: incidentId })
                .populate('matchedIncidentId')
                .exec();
            return matches.map((m) => ({
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
        }
        catch (error) {
            logger_1.logger.warn('Failed to query local historical matches, returning empty set.', error);
            return [];
        }
    }
};
/**
 * 9. LLM Service
 */
exports.llmService = {
    generateText: async (prompt) => {
        const provider = env_1.env.ENABLE_LLM ? activeLLMProvider : mockLLM;
        try {
            return await provider.generateText(prompt);
        }
        catch (error) {
            logger_1.logger.warn(`LLMProvider ${provider.name} failed. Falling back to mock LLM responses.`, error);
            return mockLLM.generateText(prompt);
        }
    }
};
