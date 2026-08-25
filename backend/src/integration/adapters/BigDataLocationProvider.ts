import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface LiveLocationBeacon {
  id: string;
  source: string;
  latitude: number;
  longitude: number;
  title: string;
  locality: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
  category: 'LIVE_BEACON' | 'COASTAL_SECTOR' | 'INCIDENT_TELEMETRY' | 'TELEMETRY_NODE';
  status: 'ACTIVE' | 'FRESH' | 'STALE';
  timestamp: string;
  freshnessSeconds: number;
  validUntil: string;
  confidence?: string | number;
  metadata: {
    plusCode?: string;
    waterBody?: string;
    district?: string;
    continent?: string;
    lookupSource?: string;
  };
}

export interface LocationGeocodeResult {
  latitude: number;
  longitude: number;
  locality: string;
  city: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
  waterBody?: string;
  district?: string;
  plusCode?: string;
  retrievedAt: Date;
  source: string;
}

export class BigDataLocationProvider {
  public readonly name = 'bigdata_location_service';
  private readonly apiKey?: string;
  private readonly baseUrl = 'https://api.bigdatacloud.net/data';

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      env.BIGDATA_API_KEY ||
      env.BIGDATACLOUD_API_KEY ||
      env.BIG_DATA_API_KEY ||
      env.BDC_API_KEY ||
      process.env.BIGDATA_API_KEY ||
      process.env.BIGDATACLOUD_API_KEY ||
      process.env.BIG_DATA_API_KEY ||
      process.env.BDC_API_KEY;
  }

  /**
   * Returns true if a live API key is configured
   */
  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Reverse geocodes coordinates via BigData API
   */
  public async reverseGeocode(lat: number, lon: number): Promise<LocationGeocodeResult | null> {
    try {
      const url = new URL(
        this.apiKey ? `${this.baseUrl}/reverse-geocode` : `${this.baseUrl}/reverse-geocode-client`
      );
      url.searchParams.set('latitude', lat.toString());
      url.searchParams.set('longitude', lon.toString());
      url.searchParams.set('localityLanguage', 'en');
      if (this.apiKey) {
        url.searchParams.set('key', this.apiKey);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MARIS-Marine-Platform/1.0',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logger.warn(`BigData API: Authentication/Authorization failed with HTTP ${response.status}`);
        } else if (response.status === 429) {
          logger.warn('BigData API: Rate limit reached');
        } else {
          logger.warn(`BigData API: Request returned HTTP status ${response.status}`);
        }
        return null;
      }

      const data: any = await response.json();
      if (!data || typeof data !== 'object') {
        return null;
      }

      // Extract informative geographic tags (water bodies, straits, islands)
      let waterBody: string | undefined;
      let district: string | undefined;

      if (data.localityInfo && Array.isArray(data.localityInfo.informative)) {
        const waterObj = data.localityInfo.informative.find((item: any) =>
          /strait|bay|sea|ocean|gulf|channel|island|reef/i.test(item.name || item.description || '')
        );
        if (waterObj) {
          waterBody = waterObj.name;
        }
      }

      if (data.localityInfo && Array.isArray(data.localityInfo.administrative)) {
        const distObj = data.localityInfo.administrative.find((item: any) =>
          /district|county|province/i.test(item.description || '') || item.order === 9
        );
        if (distObj) {
          district = distObj.name;
        }
      }

      return {
        latitude: typeof data.latitude === 'number' ? data.latitude : lat,
        longitude: typeof data.longitude === 'number' ? data.longitude : lon,
        locality: data.locality || data.city || data.principalSubdivision || 'Coastal Sector',
        city: data.city || data.locality || '',
        principalSubdivision: data.principalSubdivision || '',
        countryName: data.countryName || 'India',
        countryCode: data.countryCode || 'IN',
        waterBody,
        district,
        plusCode: data.plusCode,
        retrievedAt: new Date(),
        source: 'BigData Location Intelligence',
      };
    } catch (error) {
      logger.warn('BigData API: Error during reverse geocoding request:', error);
      return null;
    }
  }

  /**
   * Queries BigData API to generate live location telemetry beacons for genuine target coordinates
   */
  public async fetchLiveLocationBeacons(
    targetCoordinates?: Array<{ id: string; lat: number; lng: number; title?: string; category?: string }>
  ): Promise<LiveLocationBeacon[]> {
    if (!targetCoordinates || targetCoordinates.length === 0) {
      return [];
    }

    const pointsToQuery = targetCoordinates;
    const results: LiveLocationBeacon[] = [];
    const now = new Date();

    for (const pt of pointsToQuery) {
      try {
        const geo = await this.reverseGeocode(pt.lat, pt.lng);
        if (geo) {
          const timestamp = now.toISOString();
          const validUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

          results.push({
            id: pt.id,
            source: 'BigData Location Intelligence',
            latitude: geo.latitude,
            longitude: geo.longitude,
            title: pt.title || `${geo.locality} Live Node`,
            locality: geo.locality,
            principalSubdivision: geo.principalSubdivision,
            countryName: geo.countryName,
            countryCode: geo.countryCode,
            category: (pt.category as any) || 'LIVE_BEACON',
            status: 'ACTIVE',
            timestamp,
            freshnessSeconds: 0,
            validUntil,
            confidence: 0.98,
            metadata: {
              plusCode: geo.plusCode,
              waterBody: geo.waterBody,
              district: geo.district,
            },
          });
        }
      } catch (err) {
        logger.warn(`BigData API: Failed beacon resolution for [${pt.lat}, ${pt.lng}]:`, err);
      }
    }

    return results;
  }
}
