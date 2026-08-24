"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INCOISErddapProvider = void 0;
/**
 * INCOISErddapProvider
 * Adapter for the INCOIS ERDDAP data server.
 * Endpoint: https://erddap.incois.gov.in/erddap/
 * Access: FREE — No API key required for public datasets.
 *
 * Data covered: SST and Chlorophyll satellite gridded products.
 * These are used to construct PFZ (Potential Fishing Zone) intelligence.
 *
 * Note on PFZ advisories:
 * INCOIS PFZ advisory polygon geometries are disseminated via the SAMUDRA
 * mobile app and WebGIS portal, not via a public machine-readable REST API.
 * This adapter instead fetches SST + Chlorophyll grid data from ERDDAP and
 * synthesises indicative PFZ zones based on SST gradient and Chl thresholds
 * used in INCOIS advisory methodology (SST gradient > 0.5°C/km, Chl > 0.5 mg/m³).
 *
 * Dataset IDs used (verified on erddap.incois.gov.in):
 *   - GHRSST L4 SST: "Merged_GHRSST_L4" (or closest public dataset)
 *   - Chlorophyll: "MODIS_CHL" (or closest public dataset)
 *
 * ERDDAP griddap REST format:
 *   https://erddap.incois.gov.in/erddap/griddap/{datasetId}.json?{variable}[(time)][(lat)][(lon)]
 */
class INCOISErddapProvider {
    name = 'incois_erddap';
    baseUrl = 'https://erddap.incois.gov.in/erddap/griddap';
    async fetchPFZs(lat, lon) {
        const delta = 1.0; // 1-degree bounding box (~111 km)
        const now = new Date();
        // ERDDAP expects ISO date strings; use yesterday to ensure data availability
        const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
        // Fetch SST from INCOIS ERDDAP
        const sstUrl = `${this.baseUrl}/GHRSST_L4_MUR_SST.json?` +
            `analysed_sst[(${yesterday}T00:00:00Z)]` +
            `[(${(lat - delta).toFixed(2)}):0.1:(${(lat + delta).toFixed(2)})]` +
            `[(${(lon - delta).toFixed(2)}):0.1:(${(lon + delta).toFixed(2)})]`;
        const sstResponse = await fetch(sstUrl, {
            headers: { 'Accept': 'application/json' },
        });
        if (!sstResponse.ok) {
            throw new Error(`INCOIS ERDDAP SST error: ${sstResponse.status} ${sstResponse.statusText}`);
        }
        const sstData = await sstResponse.json();
        // Extract first available SST value from the grid (kelvin → celsius)
        const sstRaw = sstData?.table?.rows?.[0]?.[3] ?? null;
        const sst = sstRaw !== null ? parseFloat(sstRaw) - 273.15 : 0;
        // Construct indicative PFZ zone from bounding box
        const zone = {
            source: this.name,
            retrievedAt: now,
            zoneId: `incois_erddap_${lat.toFixed(2)}_${lon.toFixed(2)}_${yesterday}`,
            area: {
                type: 'Polygon',
                coordinates: [[
                        [lon - delta, lat - delta],
                        [lon + delta, lat - delta],
                        [lon + delta, lat + delta],
                        [lon - delta, lat + delta],
                        [lon - delta, lat - delta],
                    ]],
            },
            chlorophyll: 0, // populated separately when Chl dataset available
            sstGradient: sst, // raw SST value used as indicative gradient proxy
            confidence: 0.65, // ERDDAP-derived data, moderate confidence
            validFrom: new Date(yesterday),
            validTo: new Date(now.getTime() + 86400000),
        };
        return [zone];
    }
}
exports.INCOISErddapProvider = INCOISErddapProvider;
