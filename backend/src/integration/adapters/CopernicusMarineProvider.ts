import { OceanProvider } from '../interfaces';
import { MarineCondition } from '../types';

/**
 * CopernicusMarineProvider
 * Adapter for Copernicus Marine Service (CMEMS).
 * Endpoint: https://nrt.cmems-du.eu (OGC WCS REST endpoint)
 * Access: Requires a registered account at https://marine.copernicus.eu
 *
 * Data covered: SST, Chlorophyll, wave heights, ocean currents.
 * Primary toolbox is Python-based (copernicusmarine); this adapter
 * uses the CMEMS OGC WCS/WMS REST endpoint accessible via Basic Auth.
 *
 * Dataset used: Global Ocean Physics Analysis and Forecast
 *   Product: GLOBAL_ANALYSISFORECAST_PHY_001_024
 *   Variables: thetao (potential temperature), uo/vo (currents)
 *
 * IMPORTANT: This adapter is STUB-MODE until Copernicus credentials are set.
 * Register at https://marine.copernicus.eu and set:
 *   COPERNICUS_USERNAME=<your_username>
 *   COPERNICUS_PASSWORD=<your_password>
 *   ENABLE_LIVE_COPERNICUS=true
 */
export class CopernicusMarineProvider implements OceanProvider {
  name = 'copernicus_marine';

  constructor(
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchOceanConditions(lat: number, lon: number): Promise<MarineCondition> {
    // CMEMS WCS REST endpoint for Global Physics Analysis Product
    const dataset = 'GLOBAL_ANALYSISFORECAST_PHY_001_024';
    const url =
      `https://nrt.cmems-du.eu/thredds/dodsC/${dataset}` +
      `?thetao[0][0][0][0]&uo[0][0][0][0]&vo[0][0][0][0]` +
      `&latitude=${lat}&longitude=${lon}`;

    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Copernicus Marine API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json() as any;

    // Normalize CMEMS response into MarineCondition
    // Field names per CMEMS product definition:
    //   thetao = potential temperature (°C)
    //   uo = eastward sea water velocity (m/s)
    //   vo = northward sea water velocity (m/s)
    const thetao: number = data?.thetao ?? 0;
    const uo: number = data?.uo ?? 0;
    const vo: number = data?.vo ?? 0;
    const currentSpeed = Math.sqrt(uo * uo + vo * vo);
    const currentDirection = Math.atan2(uo, vo) * (180 / Math.PI);

    return {
      source: this.name,
      retrievedAt: new Date(),
      waveHeight: 0,           // wave data from separate CMEMS wave product
      wavePeriod: 0,
      waveDirection: 0,
      waterTemp: thetao,
      salinity: 0,             // salinity in separate CMEMS product variable
      currentSpeed: parseFloat(currentSpeed.toFixed(3)),
      currentDirection: parseFloat(currentDirection.toFixed(1)),
      coordinates: [lon, lat],
    };
  }
}
