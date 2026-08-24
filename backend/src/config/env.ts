import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  ENABLE_LIVE_WEATHER: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENABLE_LIVE_OCEAN: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENABLE_LIVE_ALERTS: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENABLE_LIVE_SATELLITE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENABLE_LIVE_PFZ: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  ENABLE_LLM: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  // OpenWeatherMap
  OPENWEATHER_API_KEY: z.string().optional(),
  // IMD — register at api.imd.gov.in
  IMD_API_KEY: z.string().optional(),
  ENABLE_LIVE_IMD: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  // INCOIS ERDDAP — no key required for public datasets
  ENABLE_LIVE_INCOIS: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  // Copernicus Marine Service — register at marine.copernicus.eu
  COPERNICUS_USERNAME: z.string().optional(),
  COPERNICUS_PASSWORD: z.string().optional(),
  ENABLE_LIVE_COPERNICUS: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  // WDPA Protected Planet — register at api.protectedplanet.net
  WDPA_API_KEY: z.string().optional(),
  ENABLE_LIVE_GEOSPATIAL: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  // Storage Configurations
  STORAGE_PROVIDER: z.enum(['minio', 'local']).default('minio'),
  MINIO_ENDPOINT: z.string().default('127.0.0.1'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('maris-evidence'),
  MINIO_USE_SSL: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(10),
  MAX_VIDEO_SIZE_MB: z.coerce.number().default(50),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type EnvType = z.infer<typeof envSchema>;
