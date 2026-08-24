"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeProviderRef = exports.activeStorageProvider = exports.MinioStorageProvider = void 0;
const Minio = __importStar(require("minio"));
const env_1 = require("../config/env");
class MinioStorageProvider {
    client;
    bucket;
    constructor() {
        this.client = new Minio.Client({
            endPoint: env_1.env.MINIO_ENDPOINT,
            port: env_1.env.MINIO_PORT,
            useSSL: env_1.env.MINIO_USE_SSL,
            accessKey: env_1.env.MINIO_ACCESS_KEY,
            secretKey: env_1.env.MINIO_SECRET_KEY,
        });
        this.bucket = env_1.env.MINIO_BUCKET;
        // Initialize bucket asynchronously
        this.initializeBucket();
    }
    async initializeBucket() {
        try {
            const exists = await this.client.bucketExists(this.bucket);
            if (!exists) {
                await this.client.makeBucket(this.bucket);
                console.log(`Bucket '${this.bucket}' created successfully in MinIO.`);
            }
        }
        catch (err) {
            console.warn(`Could not initialize bucket '${this.bucket}' automatically:`, err);
        }
    }
    async upload(key, body, _mimeType) {
        await this.client.putObject(this.bucket, key, body);
    }
    async download(key) {
        const stream = await this.client.getObject(this.bucket, key);
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', (err) => reject(err));
        });
    }
    async delete(key) {
        await this.client.removeObject(this.bucket, key);
    }
    async exists(key) {
        try {
            await this.client.statObject(this.bucket, key);
            return true;
        }
        catch (err) {
            if (err.code === 'NotFound' || err.code === 'NoSuchKey' || err.message?.includes('does not exist')) {
                return false;
            }
            throw err;
        }
    }
    async getSignedUrl(key, expiresSeconds) {
        return await this.client.presignedGetObject(this.bucket, key, expiresSeconds);
    }
}
exports.MinioStorageProvider = MinioStorageProvider;
exports.activeStorageProvider = new MinioStorageProvider();
exports.activeProviderRef = { current: exports.activeStorageProvider };
