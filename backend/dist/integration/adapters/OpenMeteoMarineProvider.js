"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenMeteoMarineProvider = void 0;
/**
 * OpenMeteoMarineProvider
 * Live ocean/wave data adapter using the Open-Meteo Marine Weather API.
 * API Docs: https://open-meteo.com/en/docs/marine-weather-api
 *
 * Free to use — no API key required.
 * Endpoint: https://marine-api.open-meteo.com/v1/marine
 * Resolution: 5 km, hourly, 7-day forecast
 * Parameters used:
 *   - wave_height (m)
 *   - wave_direction (degrees)
 *   - wave_period (seconds)
 *   - ocean_current_velocity (m/s)
 *   - ocean_current_direction (degrees)
 *   - sea_surface_temperature (°C)
 */
class OpenMeteoMarineProvider {
    name = 'open_meteo_marine';
    baseUrl = 'https://marine-api.open-meteo.com/v1/marine';
    async fetchOceanConditions(lat, lon) {
        const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lon.toString(),
            hourly: [
                'wave_height',
                'wave_direction',
                'wave_period',
                'ocean_current_velocity',
                'ocean_current_direction',
                'sea_surface_temperature',
            ].join(','),
            forecast_days: '1',
            timezone: 'UTC',
        });
        const url = `${this.baseUrl}?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Open-Meteo Marine API error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        const h = data.hourly;
        // Use the most recent available hour (index 0 = current hour UTC)
        const idx = 0;
        return {
            source: this.name,
            retrievedAt: new Date(),
            waveHeight: h.wave_height?.[idx] ?? 0,
            waveDirection: h.wave_direction?.[idx] ?? 0,
            wavePeriod: h.wave_period?.[idx] ?? 0,
            waterTemp: h.sea_surface_temperature?.[idx] ?? 0,
            // Open-Meteo Marine does not provide salinity — use 0 as placeholder
            salinity: 0,
            currentSpeed: h.ocean_current_velocity?.[idx] ?? 0,
            currentDirection: h.ocean_current_direction?.[idx] ?? 0,
            coordinates: [data.longitude, data.latitude],
        };
    }
}
exports.OpenMeteoMarineProvider = OpenMeteoMarineProvider;
