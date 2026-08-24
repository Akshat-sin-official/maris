"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverpassGeospatialProvider = void 0;
/**
 * OverpassGeospatialProvider
 * Adapter for the OpenStreetMap Overpass API.
 * Endpoint: https://overpass-api.de/api/interpreter
 * Access: FREE — No API key required.
 *
 * Data covered: Marine protected areas, restricted zones.
 * Tags queried:
 *   boundary=protected_area + protected_area=marine
 *   boundary=protected_area + marine=yes
 *
 * Normalizes OSM relations/ways into GeoFence polygons.
 * For large areas, results are cached via the domain service TTL.
 */
class OverpassGeospatialProvider {
    name = 'openstreetmap_overpass';
    endpoint = 'https://overpass-api.de/api/interpreter';
    async fetchGeofences(lat, lon, radiusKm = 200) {
        const radiusM = radiusKm * 1000;
        // Overpass QL: find marine protected areas within radiusM of point
        const query = `
[out:json][timeout:30];
(
  relation["boundary"="protected_area"]["protected_area"="marine"](around:${radiusM},${lat},${lon});
  relation["boundary"="protected_area"]["marine"="yes"](around:${radiusM},${lat},${lon});
  way["boundary"="protected_area"]["protected_area"="marine"](around:${radiusM},${lat},${lon});
);
out geom;
    `.trim();
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });
        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        const retrievedAt = new Date();
        const fences = [];
        for (const el of data.elements ?? []) {
            const coords = this.extractCoordinates(el);
            if (coords.length < 3)
                continue;
            // Close the polygon ring if needed
            const ring = [...coords];
            if (ring[0][0] !== ring[ring.length - 1][0] ||
                ring[0][1] !== ring[ring.length - 1][1]) {
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
    }
    extractCoordinates(el) {
        // Relations: use outer member geometry
        if (el.type === 'relation' && el.members) {
            const outer = el.members.find((m) => m.role === 'outer');
            if (outer?.geometry) {
                return outer.geometry.map((p) => [p.lon, p.lat]);
            }
        }
        // Ways: use direct geometry
        if (el.type === 'way' && el.geometry) {
            return el.geometry.map((p) => [p.lon, p.lat]);
        }
        return [];
    }
}
exports.OverpassGeospatialProvider = OverpassGeospatialProvider;
