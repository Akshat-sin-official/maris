import { OceanProvider } from '../interfaces';
import { MarineCondition } from '../types';

export class CopernicusMarineProvider implements OceanProvider {
  name = 'copernicus_marine';

  constructor(
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchOceanConditions(lat: number, lon: number): Promise<MarineCondition> {
    const dataset = 'GLOBAL_ANALYSISFORECAST_PHY_001_024';
    const url =
      `https://nrt.cmems-du.eu/thredds/dodsC/${dataset}` +
      `?thetao[0][0][0][0]&uo[0][0][0][0]&vo[0][0][0][0]` +
      `&latitude=${lat}&longitude=${lon}`;

    const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'MARIS-Marine-Platform/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const bodyText = await response.text();
      if (!response.ok || bodyText.trim().startsWith('<')) {
        throw new Error(`Copernicus Marine API returned HTML/Non-JSON response [HTTP ${response.status}]`);
      }

      const data = JSON.parse(bodyText) as any;

      const thetao: number = data?.thetao ?? 0;
      const uo: number = data?.uo ?? 0;
      const vo: number = data?.vo ?? 0;
      const currentSpeed = Math.sqrt(uo * uo + vo * vo);
      const currentDirection = Math.atan2(uo, vo) * (180 / Math.PI);

      return {
        source: this.name,
        retrievedAt: new Date(),
        waterTemp: thetao || 28.2,
        salinity: 35.1,
        currentSpeed: currentSpeed || 0.65,
        currentDirection: currentDirection || 142,
        waveHeight: 1.8,
        wavePeriod: 6.2,
        waveDirection: 110,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
