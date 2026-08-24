"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenWeatherMapProvider = void 0;
/**
 * OpenWeatherMapProvider
 * Live weather adapter using the OpenWeatherMap Current Weather API.
 * API Docs: https://openweathermap.org/current
 * Units: metric (°C, m/s)
 */
class OpenWeatherMapProvider {
    apiKey;
    name = 'open_weather_map';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async fetchWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather` +
            `?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        return {
            source: this.name,
            retrievedAt: new Date(),
            temp: data.main.temp,
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg ?? 0,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            condition: data.weather[0]?.description ?? 'unknown',
            coordinates: [data.coord.lon, data.coord.lat],
        };
    }
}
exports.OpenWeatherMapProvider = OpenWeatherMapProvider;
