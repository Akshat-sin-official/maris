import { GeospatialProvider } from '../interfaces';
import { GeoFence } from '../types';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
  members?: Array<{
    type: string;
    ref: number;
    role: string;
    geometry?: Array<{ lat: number; lon: number }>;
  }>;
  lat?: number;
  lon?: number;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export class OverpassGeospatialProvider implements GeospatialProvider {
  name = 'openstreetmap_overpass';

  private readonly endpoint = 'https://overpass-api.de/api/interpreter';

  async fetchGeofences(lat: number, lon: number, radiusKm = 200): Promise<GeoFence[]> {
    const radiusM = radiusKm * 1000;
    const query = `
[out:json][timeout:10];
(
  relation["boundary"="protected_area"]["protected_area"="marine"](around:${radiusM},${lat},${lon});
  relation["boundary"="protected_area"]["marine"="yes"](around:${radiusM},${lat},${lon});
  way["boundary"="protected_area"]["protected_area"="marine"](around:${radiusM},${lat},${lon});
);
out geom;
    `.trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MARIS-Marine-Platform/1.0 (sih-maris@gov.in)',
          'Accept': 'application/json',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OverpassResponse;
      const retrievedAt = new Date();
      const fences: GeoFence[] = [];

      for (const el of data.elements ?? []) {
        const coords = this.extractCoordinates(el);
        if (coords.length < 3) continue;

        const ring = [...coords];
        if (
          ring[0][0] !== ring[ring.length - 1][0] ||
          ring[0][1] !== ring[ring.length - 1][1]
        ) {
          ring.push(ring[0]);
        }

        fences.push({
          source: this.name,
          retrievedAt,
          fenceId: `osm_${el.type}_${el.id}`,
          name: el.tags?.['name'] ?? el.tags?.['name:en'] ?? `OSM ${el.type} ${el.id}`,
          polygon: { type: 'Polygon', coordinates: [ring] },
          restricted: true,
        });
      }

      return fences;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  private extractCoordinates(el: OverpassElement): [number, number][] {
    if (el.type === 'relation' && el.members) {
      const outer = el.members.find((m) => m.role === 'outer');
      if (outer?.geometry) {
        return outer.geometry.map((p) => [p.lon, p.lat]);
      }
    }
    if (el.type === 'way' && el.geometry) {
      return el.geometry.map((p) => [p.lon, p.lat]);
    }
    return [];
  }
}
