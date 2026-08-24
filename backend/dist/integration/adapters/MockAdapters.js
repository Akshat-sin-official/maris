"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLLMProvider = exports.MockPFZProvider = exports.MockSatelliteProvider = exports.MockAlertProvider = exports.MockOceanProvider = exports.MockWeatherProvider = void 0;
class MockWeatherProvider {
    name = 'mock_weather_service';
    async fetchWeather(lat, lon) {
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
exports.MockWeatherProvider = MockWeatherProvider;
class MockOceanProvider {
    name = 'mock_ocean_service';
    async fetchOceanConditions(lat, lon) {
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
exports.MockOceanProvider = MockOceanProvider;
class MockAlertProvider {
    name = 'mock_alert_service';
    async fetchAlerts(lat, lon) {
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
exports.MockAlertProvider = MockAlertProvider;
class MockSatelliteProvider {
    name = 'mock_satellite_service';
    async fetchSatelliteData(lat, lon) {
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
exports.MockSatelliteProvider = MockSatelliteProvider;
class MockPFZProvider {
    name = 'mock_pfz_service';
    async fetchPFZs(lat, lon) {
        return [
            {
                source: this.name,
                retrievedAt: new Date(),
                zoneId: 'mock_pfz_zone_22',
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
exports.MockPFZProvider = MockPFZProvider;
class MockLLMProvider {
    name = 'mock_llm_service';
    async generateText(_prompt) {
        return `Mock LLM Response: Analyzed operational prompt matching parameters. Priority risk is computed at mock baseline thresholds. No criminal conclusions established.`;
    }
}
exports.MockLLMProvider = MockLLMProvider;
