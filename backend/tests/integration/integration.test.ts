import {
  weatherService,
  oceanService,
  setWeatherProvider,
  setOceanProvider,
  clearCache,
  llmService,
  setLLMProvider
} from '../../src/integration/services';
import { WeatherProvider, LLMProvider } from '../../src/integration/interfaces';
import { OpenWeatherMapProvider } from '../../src/integration/adapters/OpenWeatherMapProvider';
import { OpenMeteoMarineProvider } from '../../src/integration/adapters/OpenMeteoMarineProvider';
import { env } from '../../src/config/env';

// -----------------------------------------------------------------------
// Mock OWM API response fixture
// -----------------------------------------------------------------------
const OWM_MOCK_RESPONSE = {
  main: { temp: 31.2, humidity: 82, pressure: 1010 },
  wind: { speed: 5.6, deg: 220 },
  weather: [{ description: 'moderate rain' }],
  coord: { lon: 80.25, lat: 12.52 },
};

describe('External Data Integration Layer Tests', () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // OpenWeatherMap Provider Adapter (offline — fetch is stubbed)
  // -----------------------------------------------------------------------
  describe('OpenWeatherMapProvider - Normalization', () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => OWM_MOCK_RESPONSE,
      } as any);
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('should call the OWM API with correct url parameters', async () => {
      const provider = new OpenWeatherMapProvider('TEST_API_KEY');
      await provider.fetchWeather(12.52, 80.25);

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('lat=12.52');
      expect(calledUrl).toContain('lon=80.25');
      expect(calledUrl).toContain('appid=TEST_API_KEY');
      expect(calledUrl).toContain('units=metric');
    });

    it('should normalize the OWM response into a WeatherObservation', async () => {
      const provider = new OpenWeatherMapProvider('TEST_API_KEY');
      const obs = await provider.fetchWeather(12.52, 80.25);

      expect(obs.source).toBe('open_weather_map');
      expect(obs.temp).toBe(31.2);
      expect(obs.windSpeed).toBe(5.6);
      expect(obs.windDirection).toBe(220);
      expect(obs.humidity).toBe(82);
      expect(obs.pressure).toBe(1010);
      expect(obs.condition).toBe('moderate rain');
      expect(obs.coordinates).toEqual([80.25, 12.52]);
      expect(obs.retrievedAt).toBeInstanceOf(Date);
    });

    it('should throw an error if the OWM API returns a non-ok response', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as any);

      const provider = new OpenWeatherMapProvider('BAD_KEY');
      await expect(provider.fetchWeather(12.52, 80.25)).rejects.toThrow(
        'OpenWeatherMap API error: 401 Unauthorized'
      );
    });
  });

  // -----------------------------------------------------------------------
  // Weather Domain Service - Routing & Caching
  // -----------------------------------------------------------------------
  describe('Weather Domain Service - Provider Routing and Caching', () => {
    it('should successfully fetch weather and cache the normalized result', async () => {
      const start = Date.now();
      const obs1 = await weatherService.getWeather(12.52, 80.25);
      expect(obs1).toBeDefined();
      expect(typeof obs1.source).toBe('string');
      expect(obs1.temp).toBeDefined();
      expect(obs1.retrievedAt.getTime()).toBeGreaterThanOrEqual(start);

      // 2nd fetch within TTL — must come from cache (identical retrievedAt)
      const obs2 = await weatherService.getWeather(12.52, 80.25);
      expect(obs2.retrievedAt.getTime()).toBe(obs1.retrievedAt.getTime());
    });

    it('should fall back to Mock adapter if active provider throws (Graceful Fallback)', async () => {
      const failingProvider: WeatherProvider = {
        name: 'failing_live_weather_api',
        fetchWeather: jest.fn().mockRejectedValue(new Error('Connection timeout')),
      };

      setWeatherProvider(failingProvider);
      const originalFlag = env.ENABLE_LIVE_WEATHER;
      (env as any).ENABLE_LIVE_WEATHER = true;

      try {
        const obs = await weatherService.getWeather(12.52, 80.25);
        expect(failingProvider.fetchWeather).toHaveBeenCalledTimes(1);
        expect(obs.source).toBe('mock_weather_service');
        expect(obs.temp).toBe(28.5);
      } finally {
        (env as any).ENABLE_LIVE_WEATHER = originalFlag;
      }
    });
  });

  // -----------------------------------------------------------------------
  // OpenMeteoMarineProvider - Normalization (offline — fetch is stubbed)
  // -----------------------------------------------------------------------
  describe('OpenMeteoMarineProvider - Normalization', () => {
    const MARINE_MOCK_RESPONSE = {
      latitude: 12.52,
      longitude: 80.25,
      hourly: {
        time: ['2026-08-23T00:00'],
        wave_height: [2.3],
        wave_direction: [210],
        wave_period: [9.5],
        ocean_current_velocity: [0.55],
        ocean_current_direction: [185],
        sea_surface_temperature: [27.4],
      },
    };

    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => MARINE_MOCK_RESPONSE,
      } as any);
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('should call the Open-Meteo Marine API with correct URL params', async () => {
      const provider = new OpenMeteoMarineProvider();
      await provider.fetchOceanConditions(12.52, 80.25);

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toContain('marine-api.open-meteo.com');
      expect(calledUrl).toContain('latitude=12.52');
      expect(calledUrl).toContain('longitude=80.25');
      expect(calledUrl).toContain('wave_height');
      expect(calledUrl).toContain('wave_period');
    });

    it('should normalize the Open-Meteo Marine response into a MarineCondition', async () => {
      const provider = new OpenMeteoMarineProvider();
      const cond = await provider.fetchOceanConditions(12.52, 80.25);

      expect(cond.source).toBe('open_meteo_marine');
      expect(cond.waveHeight).toBe(2.3);
      expect(cond.waveDirection).toBe(210);
      expect(cond.wavePeriod).toBe(9.5);
      expect(cond.currentSpeed).toBe(0.55);
      expect(cond.currentDirection).toBe(185);
      expect(cond.waterTemp).toBe(27.4);
      expect(cond.coordinates).toEqual([80.25, 12.52]);
      expect(cond.retrievedAt).toBeInstanceOf(Date);
    });

    it('should throw an error if the Open-Meteo Marine API returns a non-ok response', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      } as any);

      const provider = new OpenMeteoMarineProvider();
      await expect(provider.fetchOceanConditions(12.52, 80.25)).rejects.toThrow(
        'Open-Meteo Marine API error: 503 Service Unavailable'
      );
    });
  });

  // -----------------------------------------------------------------------
  // Ocean Conditions Service (via domain service + caching)
  // -----------------------------------------------------------------------
  describe('Ocean Conditions Service', () => {
    it('should fetch marine condition observations via ocean service with normalized schemas', async () => {
      // Inject a controlled OceanProvider that returns a predictable MarineCondition
      setOceanProvider({
        name: 'open_meteo_marine',
        fetchOceanConditions: jest.fn().mockResolvedValue({
          source: 'open_meteo_marine',
          retrievedAt: new Date(),
          waveHeight: 1.5,
          waveDirection: 195,
          wavePeriod: 8.0,
          waterTemp: 26.1,
          salinity: 0,
          currentSpeed: 0.35,
          currentDirection: 170,
          coordinates: [80.25, 12.52] as [number, number],
        }),
      });

      const cond = await oceanService.getOceanConditions(12.52, 80.25);
      expect(cond).toBeDefined();
      expect(cond.source).toBe('open_meteo_marine');
      expect(cond.waveHeight).toBe(1.5);
      expect(cond.waterTemp).toBe(26.1);
      expect(cond.coordinates).toEqual([80.25, 12.52]);
    });

  });

  // -----------------------------------------------------------------------
  // LLM Service - Feature Flag Gating
  // -----------------------------------------------------------------------
  describe('LLM Service - Configuration Gating', () => {
    it('should route to mock LLM adapter when ENABLE_LLM is false', async () => {
      const customLLMProvider: LLMProvider = {
        name: 'custom_gemini_llm',
        generateText: jest.fn().mockResolvedValue('Live response'),
      };

      setLLMProvider(customLLMProvider);
      const originalFlag = env.ENABLE_LLM;
      (env as any).ENABLE_LLM = false;

      try {
        const response = await llmService.generateText('Analyze coordinates');
        expect(customLLMProvider.generateText).not.toHaveBeenCalled();
        expect(response).toContain('Mock LLM Response');
      } finally {
        (env as any).ENABLE_LLM = originalFlag;
      }
    });

    it('should route to live LLM adapter when ENABLE_LLM is true', async () => {
      const customLLMProvider: LLMProvider = {
        name: 'custom_gemini_llm',
        generateText: jest.fn().mockResolvedValue('Live response from Gemini'),
      };

      setLLMProvider(customLLMProvider);
      const originalFlag = env.ENABLE_LLM;
      (env as any).ENABLE_LLM = true;

      try {
        const response = await llmService.generateText('Analyze coordinates');
        expect(customLLMProvider.generateText).toHaveBeenCalledTimes(1);
        expect(response).toBe('Live response from Gemini');
      } finally {
        (env as any).ENABLE_LLM = originalFlag;
      }
    });
  });
});
