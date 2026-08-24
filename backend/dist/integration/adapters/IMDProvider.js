"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMDProvider = void 0;
/**
 * IMDProvider
 * Adapter for the India Meteorological Department official API.
 * Access: https://api.imd.gov.in — Requires API key registration.
 * Documentation: https://api.imd.gov.in/portal
 *
 * Data covered: Marine warnings, cyclone tracks, district weather warnings.
 *
 * IMPORTANT: This adapter is STUB-MODE until an official API key is obtained.
 * Register at https://api.imd.gov.in/portal to request access.
 * Once a key is issued, set IMD_API_KEY in .env and ENABLE_LIVE_IMD=true.
 */
class IMDProvider {
    apiKey;
    name = 'imd_api';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async fetchAlerts(lat, lon) {
        // IMD Marine Warnings endpoint (key-gated)
        const url = `https://api.imd.gov.in/api/v1/marine/warnings` +
            `?lat=${lat}&lon=${lon}&range=500&apikey=${this.apiKey}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-Api-Key': this.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`IMD API error: ${response.status} ${response.statusText}`);
        }
        const body = (await response.json());
        const retrievedAt = new Date();
        return (body.data ?? []).map((item) => ({
            source: this.name,
            retrievedAt,
            alertId: item.id,
            type: item.warningType,
            severity: this.normalizeSeverity(item.severity),
            description: item.description,
            validFrom: new Date(item.validFrom || item.issuedAt),
            validTo: item.validUpto ? new Date(item.validUpto) : undefined,
            coordinates: item.latitude && item.longitude
                ? [item.longitude, item.latitude]
                : undefined,
        }));
    }
    normalizeSeverity(raw) {
        const s = (raw ?? '').toUpperCase();
        if (s.includes('RED') || s.includes('EXTREME') || s.includes('SEVERE'))
            return 'CRITICAL';
        if (s.includes('ORANGE') || s.includes('WARNING'))
            return 'WARNING';
        return 'INFO';
    }
}
exports.IMDProvider = IMDProvider;
