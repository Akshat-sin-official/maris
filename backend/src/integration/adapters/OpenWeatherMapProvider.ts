import { WeatherProvider } from '../interfaces';
import { WeatherObservation } from '../types';

interface OWMApiResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{ description: string }>;
  coord: { lon: number; lat: number };
}

/**
 * OpenWeatherMapProvider
 * Live weather adapter using the OpenWeatherMap Current Weather API.
 * API Docs: https://openweathermap.org/current
 * Units: metric (°C, m/s)
 */
export class OpenWeatherMapProvider implements WeatherProvider {
  name = 'open_weather_map';

  constructor(private readonly apiKey: string) {}

  async fetchWeather(lat: number, lon: number): Promise<WeatherObservation> {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `OpenWeatherMap API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OWMApiResponse;

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
