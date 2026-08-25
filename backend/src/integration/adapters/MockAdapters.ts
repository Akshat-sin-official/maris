import {
  WeatherProvider,
  OceanProvider,
  AlertProvider,
  SatelliteProvider,
  PFZProvider,
  LLMProvider
} from '../interfaces';
import {
  WeatherObservation,
  MarineCondition,
  MarineAlert,
  SatelliteObservation,
  PFZZone
} from '../types';

export class MockWeatherProvider implements WeatherProvider {
  name = 'mock_weather_service';

  async fetchWeather(lat: number, lon: number): Promise<WeatherObservation> {
    return {
      source: this.name,
      retrievedAt: new Date(),
      temp: 28.5,
      windSpeed: 12.4,
      windDirection: 180,
      humidity: 78,
      pressure: 1008,
      condition: 'Sunny with moderate breeze',
      coordinates: [lon, lat],
    };
  }
}

export class MockOceanProvider implements OceanProvider {
  name = 'ocean_service';

  async fetchOceanConditions(lat: number, lon: number): Promise<MarineCondition> {
    return {
      source: this.name,
      retrievedAt: new Date(),
      waveHeight: 1.8,
      wavePeriod: 8.2,
      waveDirection: 190,
      waterTemp: 26.8,
      salinity: 34.5,
      currentSpeed: 0.45,
      currentDirection: 210,
      coordinates: [lon, lat],
    };
  }
}

export class MockAlertProvider implements AlertProvider {
  name = 'mock_alert_service';

  async fetchAlerts(lat: number, lon: number): Promise<MarineAlert[]> {
    return [
      {
        source: this.name,
        retrievedAt: new Date(),
        alertId: 'mock_alert_99',
        type: 'OIL_SPILL',
        severity: 'WARNING',
        description: 'Mock alert: minor surface oil sheen observed in vicinity.',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 86400000),
        coordinates: [lon, lat],
      },
    ];
  }
}

export class MockSatelliteProvider implements SatelliteProvider {
  name = 'mock_satellite_service';

  async fetchSatelliteData(lat: number, lon: number): Promise<SatelliteObservation[]> {
    return [
      {
        source: this.name,
        retrievedAt: new Date(),
        observationId: 'mock_sat_101',
        instrument: 'Sentinel-2 MSI',
        resolution: '10m',
        capturedAt: new Date(Date.now() - 3600000),
        imageUrl: 'https://api.maris.gov/sat/mock_sentinel2_latest.jpg',
        boundingBox: [
          [lon - 0.05, lat - 0.05],
          [lon + 0.05, lat + 0.05],
        ],
        rawReference: 'S2A_MSIL1C_20260823_Mock_Tile',
      },
    ];
  }
}

export class MockPFZProvider implements PFZProvider {
  name = 'pfz_service';

  async fetchPFZs(lat: number, lon: number): Promise<PFZZone[]> {
    return [
      {
        source: this.name,
        retrievedAt: new Date(),
        zoneId: 'pfz_zone_22',
        area: {
          type: 'Polygon',
          coordinates: [
            [
              [lon - 0.1, lat - 0.1],
              [lon + 0.1, lat - 0.1],
              [lon + 0.1, lat + 0.1],
              [lon - 0.1, lat + 0.1],
              [lon - 0.1, lat - 0.1],
            ],
          ],
        },
        chlorophyll: 0.75,
        sstGradient: 1.25,
        confidence: 0.88,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 172800000),
      },
    ];
  }
}

export class MockLLMProvider implements LLMProvider {
  name = 'mock_llm_service';

  async generateText(_prompt: string): Promise<string> {
    return `Mock LLM Response: Analyzed operational prompt matching parameters. Priority risk is computed at mock baseline thresholds. No criminal conclusions established.`;
  }
}
