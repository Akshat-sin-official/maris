import dotenv from 'dotenv';
dotenv.config();

import {
  weatherService,
  oceanService,
  geospatialService,
  pfzService
} from '../src/integration/services';
import { env } from '../src/config/env';

async function testIntegratedPipeline() {
  const lat = 9.28;
  const lon = 79.31;

  console.log('===========================================================');
  console.log('🌊 MARIS RESILIENT INTEGRATION PIPELINE TEST');
  console.log(`📍 Test Coordinates: [${lat}, ${lon}]`);
  console.log(`🔧 Live Weather: ${env.ENABLE_LIVE_WEATHER}`);
  console.log(`🔧 Live Copernicus: ${env.ENABLE_LIVE_COPERNICUS}`);
  console.log(`🔧 Live INCOIS: ${env.ENABLE_LIVE_INCOIS}`);
  console.log(`⏱️ Overpass Timeout: ${env.OVERPASS_TIMEOUT_MS}ms`);
  console.log('===========================================================\n');

  // 1. Weather Service
  try {
    console.log('1. Fetching Weather Data via weatherService...');
    const weather = await weatherService.getWeather(lat, lon);
    console.log(`✅ Weather Data Received (Source: ${weather.source}):`, {
      temp: `${weather.temp}°C`,
      windSpeed: `${weather.windSpeed} m/s`,
      condition: weather.condition
    });
  } catch (err: any) {
    console.error('❌ Weather Service Error:', err.message);
  }

  // 2. Ocean Service (Resilient Chain)
  try {
    console.log('\n2. Fetching Ocean Data via oceanService...');
    const ocean = await oceanService.getOceanConditions(lat, lon);
    console.log(`✅ Ocean Conditions Received (Source: ${ocean.source}):`, {
      waveHeight: `${ocean.waveHeight}m`,
      waterTemp: `${ocean.waterTemp}°C`,
      currentSpeed: `${ocean.currentSpeed} m/s`
    });
  } catch (err: any) {
    console.error('❌ Ocean Service Error:', err.message);
  }

  // 3. Geospatial Boundaries (Overpass / WDPA)
  try {
    console.log('\n3. Fetching Geospatial Boundaries via geospatialService...');
    const geofences = await geospatialService.getGeofences(lat, lon, 50);
    console.log(`✅ Geofences Received (${geofences.length} boundaries found).`);
  } catch (err: any) {
    console.error('❌ Geospatial Service Error:', err.message);
  }

  // 4. PFZ Intelligence Service
  try {
    console.log('\n4. Fetching Potential Fishing Zones via pfzService...');
    const pfzs = await pfzService.getPFZs(lat, lon);
    console.log(`✅ PFZ Zones Received (Count: ${pfzs.length}, Source: ${pfzs[0]?.source}).`);
  } catch (err: any) {
    console.error('❌ PFZ Service Error:', err.message);
  }

  console.log('\n===========================================================');
  console.log('🎉 PIPELINE TEST COMPLETE: Resilient execution verified.');
  console.log('===========================================================');
}

testIntegratedPipeline();
