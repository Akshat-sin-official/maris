"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    MONGO_URI: zod_1.z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
    JWT_EXPIRES_IN: zod_1.z.string().default('1d'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    ENABLE_LIVE_WEATHER: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    ENABLE_LIVE_OCEAN: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    ENABLE_LIVE_ALERTS: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    ENABLE_LIVE_SATELLITE: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    ENABLE_LIVE_PFZ: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    ENABLE_LLM: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    // OpenWeatherMap
    OPENWEATHER_API_KEY: zod_1.z.string().optional(),
    // IMD — register at api.imd.gov.in
    IMD_API_KEY: zod_1.z.string().optional(),
    ENABLE_LIVE_IMD: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    // INCOIS ERDDAP — no key required for public datasets
    ENABLE_LIVE_INCOIS: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    // Copernicus Marine Service — register at marine.copernicus.eu
    COPERNICUS_USERNAME: zod_1.z.string().optional(),
    COPERNICUS_PASSWORD: zod_1.z.string().optional(),
    ENABLE_LIVE_COPERNICUS: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    // WDPA Protected Planet — register at api.protectedplanet.net
    WDPA_API_KEY: zod_1.z.string().optional(),
    ENABLE_LIVE_GEOSPATIAL: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    // Storage Configurations
    STORAGE_PROVIDER: zod_1.z.enum(['minio', 'local']).default('minio'),
    MINIO_ENDPOINT: zod_1.z.string().default('127.0.0.1'),
    MINIO_PORT: zod_1.z.coerce.number().default(9000),
    MINIO_ACCESS_KEY: zod_1.z.string().default('minioadmin'),
    MINIO_SECRET_KEY: zod_1.z.string().default('minioadmin'),
    MINIO_BUCKET: zod_1.z.string().default('maris-evidence'),
    MINIO_USE_SSL: zod_1.z.preprocess((val) => val === 'true' || val === true, zod_1.z.boolean()).default(false),
    MAX_IMAGE_SIZE_MB: zod_1.z.coerce.number().default(10),
    MAX_VIDEO_SIZE_MB: zod_1.z.coerce.number().default(50),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
