"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WDPAGeospatialProvider = void 0;
/**
 * WDPAGeospatialProvider
 * Adapter for the World Database on Protected Areas (WDPA) via Protected Planet API.
 * Endpoint: https://api.protectedplanet.net/v3
 * Access: Requires API key — Register at https://api.protectedplanet.net/request
 *
 * Data covered: Officially recognized marine protected areas with IUCN classification.
 * This is the most authoritative global dataset for MPA boundaries.
 *
 * IMPORTANT: This adapter is STUB-MODE until a WDPA API key is obtained.
 * Register at https://api.protectedplanet.net and set:
 *   WDPA_API_KEY=<your_key>
 *   ENABLE_LIVE_GEOSPATIAL=true
 * The Overpass adapter (OSM) serves as the free fallback when no key is set.
 */
class WDPAGeospatialProvider {
    apiKey;
    name = 'wdpa_protected_planet';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async fetchGeofences(lat, lon, radiusKm = 200) {
        // WDPA search by coordinates with marine filter
        const url = `https://api.protectedplanet.net/v3/protected_areas/search` +
            `?token=${this.apiKey}&marine=true&latitude=${lat}&longitude=${lon}&radius=${radiusKm}&with_geometry=true`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`WDPA API error: ${response.status} ${response.statusText}`);
        }
        const body = (await response.json());
        const retrievedAt = new Date();
        return (body.protected_areas ?? [])
            .filter((site) => site.geojson && site.geojson.type === 'Polygon')
            .map((site) => ({
            source: this.name,
            retrievedAt,
            fenceId: `wdpa_${site.wdpaid}`,
            name: site.name,
            polygon: {
                type: 'Polygon',
                coordinates: site.geojson.coordinates,
            },
            restricted: true,
        }));
    }
}
exports.WDPAGeospatialProvider = WDPAGeospatialProvider;
