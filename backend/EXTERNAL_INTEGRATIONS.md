# MARIS External Integrations layer

This document outlines the provider-agnostic external integration architecture, data normalization rules, caching, rate limiting, and failure fallbacks for **MARIS**.

---

## 1. Required External Integrations

To support complete oceanographic situational awareness, the platform integrates with the following datasets:
1. **Weather**: Atmospheric observations (wind speed, temp, pressure) near incident/warning bounds.
2. **Marine/Ocean Conditions**: Wave heights, periods, directions, current telemetry, and water temperatures.
3. **Marine Alerts/Advisories**: Tropical cyclones, weather warnings, and local marine advisories.
4. **Satellite Imagery/Earth Observation**: Spatial bounds mapping latest Sentinel/Landsat tile observations.
5. **Potential Fishing Zones (PFZs)**: SST gradient contours and Chlorophyll Concentration maps.
6. **Geospatial Boundaries (Geofences)**: Protected marine sanctuary polygons and restricted enclaves.
7. **LLM/AI Engine**: Reasoning and contextual explanation generation.

---

## 2. Provider Abstraction Model

Internal services and agents **never** call third-party APIs directly. They only request data from MARIS Domain Services. The Domain Services load the active provider adapter dynamically based on environment feature flags:

```
  Agent / Internal Tool
           │
           v
  [ MARIS Domain Services ] (e.g. weatherService)
           │
           ├────────────────────────────┐
           ▼                            ▼
  [ Active Live Adapter ]     [ Mock Adapter (Fallback) ]
```

### Supported Provider Interfaces
All adapters must implement their designated interface defined in [interfaces.ts](file:///Users/riteshmishra/Developer/SIH-Project/backend/src/integration/interfaces.ts):
* `WeatherProvider`
* `OceanProvider`
* `AlertProvider`
* `SatelliteProvider`
* `PFZProvider`
* `LLMProvider`

---

## 3. Data Normalization Schemas

Every provider adapter response is parsed and mapped into a structured MARIS internal type defined in [types.ts](file:///Users/riteshmishra/Developer/SIH-Project/backend/src/integration/types.ts). All normalized records preserve:
- `source`: Identifier string (e.g. `mock_weather_service`, `copernicus_marine_service`).
- `retrievedAt`: Timestamp when the query resolved.
- `validFrom`/`validTo`: Operational window bounds.
- `coordinates`: GeoJSON array `[lon, lat]` where appropriate.
- `rawReference`: Original raw provider payload (retained for audit tracing).
- `confidence`/`data quality`: Reliability scoring float.

---

## 4. Caching & Rate-Limiting Strategy

### Caching Layer (`SimpleCache`)
All geospatial queries are cached by coordinates (rounded to 4 decimal places, ~11m resolution accuracy) to prevent hitting third-party API limits on consecutive agent pipeline loops:
- **Weather / Ocean Conditions**: 30 minutes TTL (`1800000ms`).
- **Alerts / Advisories**: 15 minutes TTL (`900000ms`).
- **Potential Fishing Zones (PFZs)**: 12 hours TTL (`43200000ms`).
- **Satellite Observation References**: 24 hours TTL (`86400000ms`).

### Rate-Limiting Strategy
* Direct API routes hitting internal services are throttled at the Express routing middleware level.
* Provider adapters implement retry policies with exponential backoff and request queues to protect downstream third-party APIs from bursting.

---

## 5. Failure Behavior & Fallbacks

* **Fault Isolation**: If a live provider adapter throws an error (e.g. network timeout, rate limit exceeded, invalid key), the domain service catches it, logs a warning with details, and immediately invokes the matching mock adapter to return standard mock sensor values.
* This guarantees that a sub-agent pipeline run or user request completes with fallback readings rather than returning a raw 500 error, sustaining high system availability.

---

## 6. Live vs. Mock Integrations State

| Integration Capability | Mock Provider Adapter | Live Provider Adapter (Target API) |
| :--- | :--- | :--- |
| **Weather** | `MockWeatherProvider` (Active) | OpenWeatherMap API |
| **Ocean Conditions** | `MockOceanProvider` (Active) | Copernicus Marine Ocean Physics |
| **Marine Alerts** | `MockAlertProvider` (Active) | NOAA Marine Alerts RSS / IMD |
| **Satellite/EO** | `MockSatelliteProvider` (Active) | Sentinel Hub API / EarthData |
| **PFZ Maps** | `MockPFZProvider` (Active) | INCOIS PFZ Advisories API / Custom Chlorophyll grids |
| **LLM Reasoning** | `MockLLMProvider` (Active) | OpenAI GPT-4 / Google Gemini API |
