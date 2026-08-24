import * as Minio from 'minio';
import { StorageProvider } from './storage.provider';
import { env } from '../config/env';

export class MinioStorageProvider implements StorageProvider {
  private client: Minio.Client;
  private bucket: string;

  constructor() {
    this.client = new Minio.Client({
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
    });
    this.bucket = env.MINIO_BUCKET;

    // Initialize bucket asynchronously
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        console.log(`Bucket '${this.bucket}' created successfully in MinIO.`);
      }
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        console.info(`[Storage] Local MinIO service not detected on port ${env.MINIO_PORT}. Evidence storage using local disk fallback.`);
      } else {
        console.warn(`Could not initialize bucket '${this.bucket}':`, err.message || err);
      }
    }
  }

  async upload(key: string, body: Buffer, _mimeType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, body);
  }

  async download(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, key);
      return true;
    } catch (err: any) {
      if (err.code === 'NotFound' || err.code === 'NoSuchKey' || err.message?.includes('does not exist')) {
        return false;
      }
      throw err;
    }
  }

  async getSignedUrl(key: string, expiresSeconds: number): Promise<string> {
    return await this.client.presignedGetObject(this.bucket, key, expiresSeconds);
  }
}

export const activeStorageProvider = new MinioStorageProvider();
export const activeProviderRef = { current: activeStorageProvider };
