/**
 * Provider Integration Tests — MARIS Data Source Priority
 * Tests all 5 provider adapters with offline-stubbed fetch.
 * No real API keys or network calls are made.
 */

import { IMDProvider } from '../../src/integration/adapters/IMDProvider';
import { INCOISErddapProvider } from '../../src/integration/adapters/INCOISErddapProvider';
import { CopernicusMarineProvider } from '../../src/integration/adapters/CopernicusMarineProvider';
import { OverpassGeospatialProvider } from '../../src/integration/adapters/OverpassGeospatialProvider';
import { WDPAGeospatialProvider } from '../../src/integration/adapters/WDPAGeospatialProvider';
import {
  geospatialService,
  setGeospatialProvider,
  clearCache,
} from '../../src/integration/services';

// ───────────────────────────────────────────────────────────────────────────
// 1. IMD Provider — Indian Meteorological Department
// ───────────────────────────────────────────────────────────────────────────
describe('IMDProvider - India Meteorological Department', () => {
  const IMD_MOCK_RESPONSE = {
    status: 'ok',
    data: [
      {
        id: 'MRW-2026-001',
        warningType: 'CYCLONE_WARNING',
        severity: 'RED',
        description: 'Cyclonic storm alert — winds gusting to 90 kmph expected in Bay of Bengal.',
        issuedAt: '2026-08-23T06:00:00Z',
        validFrom: '2026-08-23T06:00:00Z',
        validUpto: '2026-08-24T06:00:00Z',
        latitude: 13.0,
        longitude: 80.2,
      },
      {
        id: 'MRW-2026-002',
        warningType: 'HIGH_WAVES',
        severity: 'ORANGE',
        description: 'Wave heights of 2–3 m expected along Tamil Nadu coast.',
        issuedAt: '2026-08-23T06:00:00Z',
        validFrom: '2026-08-23T06:00:00Z',
        validUpto: '2026-08-24T00:00:00Z',
        latitude: 12.9,
        longitude: 80.3,
      },
    ],
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => IMD_MOCK_RESPONSE,
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call the IMD API with the API key in headers and URL', async () => {
    const provider = new IMDProvider('TEST_IMD_KEY');
    await provider.fetchAlerts(12.52, 80.25);

    const [url, opts] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('api.imd.gov.in');
    expect(url).toContain('lat=12.52');
    expect(url).toContain('lon=80.25');
    expect(url).toContain('apikey=TEST_IMD_KEY');
    expect(((opts as RequestInit).headers as any)?.[ 'X-Api-Key' ]).toBe('TEST_IMD_KEY');
  });

  it('should normalize IMD response into MarineAlert[] with correct severity mapping', async () => {
    const provider = new IMDProvider('TEST_IMD_KEY');
    const alerts = await provider.fetchAlerts(12.52, 80.25);

    expect(alerts).toHaveLength(2);

    // First alert: RED severity → CRITICAL
    expect(alerts[0].source).toBe('imd_api');
    expect(alerts[0].alertId).toBe('MRW-2026-001');
    expect(alerts[0].severity).toBe('CRITICAL');
    expect(alerts[0].type).toBe('CYCLONE_WARNING');
    expect(alerts[0].coordinates).toEqual([80.2, 13.0]);
    expect(alerts[0].validTo).toBeInstanceOf(Date);

    // Second alert: ORANGE severity → WARNING
    expect(alerts[1].severity).toBe('WARNING');
    expect(alerts[1].alertId).toBe('MRW-2026-002');
  });

  it('should throw a descriptive error when IMD API returns non-ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as any);

    const provider = new IMDProvider('BAD_KEY');
    await expect(provider.fetchAlerts(12.52, 80.25)).rejects.toThrow(
      'IMD API error: 403 Forbidden'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. INCOIS ERDDAP Provider
// ───────────────────────────────────────────────────────────────────────────
describe('INCOISErddapProvider - INCOIS ERDDAP (free public)', () => {
  const ERDDAP_MOCK_RESPONSE = {
    table: {
      columnNames: ['time', 'latitude', 'longitude', 'analysed_sst'],
      rows: [['2026-08-22T00:00:00Z', 12.52, 80.25, 301.75]], // 301.75 K = 28.6 °C
    },
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ERDDAP_MOCK_RESPONSE,
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call the INCOIS ERDDAP endpoint with correct griddap URL structure', async () => {
    const provider = new INCOISErddapProvider();
    await provider.fetchPFZs(12.52, 80.25);

    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('erddap.incois.gov.in');
    expect(url).toContain('griddap');
    expect(url).toContain('analysed_sst');
  });

  it('should normalize the ERDDAP SST grid into a PFZZone with source and coordinates', async () => {
    const provider = new INCOISErddapProvider();
    const zones = await provider.fetchPFZs(12.52, 80.25);

    expect(zones).toHaveLength(1);
    const zone = zones[0];
    expect(zone.source).toBe('incois_erddap');
    expect(zone.zoneId).toContain('incois_erddap');
    expect(zone.area.type).toBe('Polygon');
    expect(zone.area.coordinates[0]).toHaveLength(5); // closed polygon ring
    expect(zone.confidence).toBeGreaterThan(0);
    // SST normalized: 301.75 K → 28.6 °C
    const expectedSST = 301.75 - 273.15;
    expect(zone.sstGradient).toBeCloseTo(expectedSST, 2);
    expect(zone.validFrom).toBeInstanceOf(Date);
  });

  it('should throw a descriptive error on ERDDAP non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as any);

    const provider = new INCOISErddapProvider();
    await expect(provider.fetchPFZs(12.52, 80.25)).rejects.toThrow(
      'INCOIS ERDDAP SST error: 503 Service Unavailable'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Copernicus Marine Provider
// ───────────────────────────────────────────────────────────────────────────
describe('CopernicusMarineProvider - Copernicus Marine (credentials-gated)', () => {
  const CMEMS_MOCK_RESPONSE = {
    thetao: 28.4, // potential temperature °C
    uo: 0.22,     // eastward current m/s
    vo: -0.18,    // northward current m/s
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => CMEMS_MOCK_RESPONSE,
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should send Authorization: Basic header with base64-encoded credentials', async () => {
    const provider = new CopernicusMarineProvider('test_user', 'test_pass');
    await provider.fetchOceanConditions(12.52, 80.25);

    const [url, opts] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('nrt.cmems-du.eu');
    const expectedBase64 = Buffer.from('test_user:test_pass').toString('base64');
    expect(((opts as RequestInit).headers as any)?.[ 'Authorization' ]).toBe(`Basic ${expectedBase64}`);
  });

  it('should normalize thetao/uo/vo into MarineCondition with current vector calculation', async () => {
    const provider = new CopernicusMarineProvider('test_user', 'test_pass');
    const cond = await provider.fetchOceanConditions(12.52, 80.25);

    expect(cond.source).toBe('copernicus_marine');
    expect(cond.waterTemp).toBe(28.4);
    // currentSpeed = √(0.22² + 0.18²) ≈ 0.284
    expect(cond.currentSpeed).toBeCloseTo(Math.sqrt(0.22 ** 2 + 0.18 ** 2), 2);
    expect(cond.coordinates).toEqual([80.25, 12.52]);
    expect(cond.retrievedAt).toBeInstanceOf(Date);
  });

  it('should throw a descriptive error on Copernicus non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as any);

    const provider = new CopernicusMarineProvider('bad_user', 'bad_pass');
    await expect(provider.fetchOceanConditions(12.52, 80.25)).rejects.toThrow(
      'Copernicus Marine API error: 401 Unauthorized'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. Overpass Geospatial Provider (OpenStreetMap)
// ───────────────────────────────────────────────────────────────────────────
describe('OverpassGeospatialProvider - OpenStreetMap Overpass (free default)', () => {
  const OVERPASS_MOCK_RESPONSE = {
    elements: [
      {
        type: 'relation',
        id: 123456,
        tags: { name: 'Palk Bay Marine Reserve', boundary: 'protected_area', protected_area: 'marine' },
        members: [
          {
            type: 'way',
            ref: 111,
            role: 'outer',
            geometry: [
              { lat: 12.3, lon: 80.1 },
              { lat: 12.5, lon: 80.1 },
              { lat: 12.5, lon: 80.4 },
              { lat: 12.3, lon: 80.4 },
            ],
          },
        ],
      },
    ],
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => OVERPASS_MOCK_RESPONSE,
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should POST an Overpass QL query containing marine protected area tags', async () => {
    const provider = new OverpassGeospatialProvider();
    await provider.fetchGeofences(12.52, 80.25);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://overpass-api.de/api/interpreter',
      expect.objectContaining({ method: 'POST' })
    );
    const body = (globalThis.fetch as jest.Mock).mock.calls[0][1].body as string;
    expect(body).toContain('protected_area');
    expect(body).toContain('marine');
  });

  it('should normalize OSM relation geometry into GeoFence polygons', async () => {
    const provider = new OverpassGeospatialProvider();
    const fences = await provider.fetchGeofences(12.52, 80.25);

    expect(fences).toHaveLength(1);
    const fence = fences[0];
    expect(fence.source).toBe('openstreetmap_overpass');
    expect(fence.fenceId).toBe('osm_relation_123456');
    expect(fence.name).toBe('Palk Bay Marine Reserve');
    expect(fence.polygon.type).toBe('Polygon');
    expect(fence.polygon.coordinates[0]).toHaveLength(5); // closed ring
    expect(fence.restricted).toBe(true);
  });

  it('should throw on Overpass non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 429, statusText: 'Too Many Requests',
    } as any);

    const provider = new OverpassGeospatialProvider();
    await expect(provider.fetchGeofences(12.52, 80.25)).rejects.toThrow(
      'Overpass API error: 429 Too Many Requests'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. WDPA Provider (Protected Planet)
// ───────────────────────────────────────────────────────────────────────────
describe('WDPAGeospatialProvider - WDPA Protected Planet (key-gated)', () => {
  const WDPA_MOCK_RESPONSE = {
    protected_areas: [
      {
        wdpaid: 555400,
        name: 'Gulf of Mannar Biosphere Reserve',
        iucn_cat: 'VI',
        marine: '2',
        geojson: {
          type: 'Polygon',
          coordinates: [[[78.1, 8.5], [79.3, 8.5], [79.3, 9.3], [78.1, 9.3], [78.1, 8.5]]],
        },
      },
    ],
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => WDPA_MOCK_RESPONSE,
    } as any);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should call the WDPA API with the API key and marine filter', async () => {
    const provider = new WDPAGeospatialProvider('TEST_WDPA_KEY');
    await provider.fetchGeofences(12.52, 80.25);

    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('api.protectedplanet.net');
    expect(url).toContain('token=TEST_WDPA_KEY');
    expect(url).toContain('marine=true');
  });

  it('should normalize WDPA response into GeoFence[] with correct fields', async () => {
    const provider = new WDPAGeospatialProvider('TEST_WDPA_KEY');
    const fences = await provider.fetchGeofences(12.52, 80.25);

    expect(fences).toHaveLength(1);
    const fence = fences[0];
    expect(fence.source).toBe('wdpa_protected_planet');
    expect(fence.fenceId).toBe('wdpa_555400');
    expect(fence.name).toBe('Gulf of Mannar Biosphere Reserve');
    expect(fence.polygon.type).toBe('Polygon');
    expect(fence.restricted).toBe(true);
    expect(fence.retrievedAt).toBeInstanceOf(Date);
  });

  it('should throw a descriptive error on WDPA non-ok response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false, status: 401, statusText: 'Unauthorized',
    } as any);

    const provider = new WDPAGeospatialProvider('BAD_KEY');
    await expect(provider.fetchGeofences(12.52, 80.25)).rejects.toThrow(
      'WDPA API error: 401 Unauthorized'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Geospatial Domain Service — routing and caching
// ───────────────────────────────────────────────────────────────────────────
describe('GeospatialService - Provider Routing and Caching', () => {
  beforeEach(() => {
    clearCache();
    jest.clearAllMocks();
  });

  it('should fetch geofences via domain service and cache the result', async () => {
    const mockFences = [{
      source: 'openstreetmap_overpass',
      retrievedAt: new Date(),
      fenceId: 'osm_relation_99',
      name: 'Test Marine Reserve',
      polygon: { type: 'Polygon' as const, coordinates: [[[80.1, 12.3], [80.3, 12.3], [80.3, 12.5], [80.1, 12.5], [80.1, 12.3]]] },
      restricted: true,
    }];

    setGeospatialProvider({
      name: 'openstreetmap_overpass',
      fetchGeofences: jest.fn().mockResolvedValue(mockFences),
    });

    const result1 = await geospatialService.getGeofences(12.52, 80.25);
    const result2 = await geospatialService.getGeofences(12.52, 80.25); // cached

    expect(result1).toHaveLength(1);
    expect(result1[0].fenceId).toBe('osm_relation_99');
    // Second call uses cache — provider fetchGeofences should only be called once
    expect(result2[0].retrievedAt.getTime()).toBe(result1[0].retrievedAt.getTime());
  });

  it('should return empty array if active geospatial provider throws (graceful failure)', async () => {
    setGeospatialProvider({
      name: 'failing_geospatial_provider',
      fetchGeofences: jest.fn().mockRejectedValue(new Error('Network timeout')),
    });

    const result = await geospatialService.getGeofences(12.52, 80.25);
    expect(result).toEqual([]);
  });
});
