import { imageProcessor, ProcessedImageResult } from './sharpProcessor';
import { del, put } from '@vercel/blob';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface IStorageProvider {
  uploadImage(buffer: Buffer, originalName: string, prefix?: string): Promise<ProcessedImageResult>;
  deleteImage(urlOrFilename: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageProvider {
  async uploadImage(buffer: Buffer, originalName: string, prefix: string = 'listing'): Promise<ProcessedImageResult> {
    return imageProcessor.processAndSaveImage(buffer, originalName, prefix);
  }

  async deleteImage(filename: string): Promise<boolean> {
    return imageProcessor.deleteImage(filename);
  }
}

class VercelBlobStorageProvider implements IStorageProvider {
  async uploadImage(buffer: Buffer, originalName: string, prefix: string = 'listing'): Promise<ProcessedImageResult> {
    const processed = await imageProcessor.processImageBuffers(buffer, originalName, prefix);
    const main = await put(`uploads/${processed.filename}`, processed.mainBuffer, {
      access: 'public', contentType: 'image/webp', addRandomSuffix: false,
    });
    const thumbnail = await put(`uploads/thumbnails/${processed.filename.replace('.webp', '_thumb.webp')}`, processed.thumbnailBuffer, {
      access: 'public', contentType: 'image/webp', addRandomSuffix: false,
    });
    return { ...processed, url: main.url, thumbnailUrl: thumbnail.url };
  }

  async deleteImage(urlOrFilename: string): Promise<boolean> {
    try { await del(urlOrFilename); return true; } catch { return false; }
  }
}

class CloudflareR2StorageProvider implements IStorageProvider {
  private s3Client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'perennial-listings';
    this.publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadImage(buffer: Buffer, originalName: string, prefix: string = 'listing'): Promise<ProcessedImageResult> {
    const processed = await imageProcessor.processImageBuffers(buffer, originalName, prefix);
    const mainKey = `uploads/${processed.filename}`;
    const thumbKey = `uploads/thumbnails/${processed.filename.replace('.webp', '_thumb.webp')}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: mainKey,
      Body: processed.mainBuffer,
      ContentType: 'image/webp',
    }));

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: thumbKey,
      Body: processed.thumbnailBuffer,
      ContentType: 'image/webp',
    }));

    const baseUrl = this.publicUrl || `https://${this.bucket}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const mainUrl = `${baseUrl}/${mainKey}`;
    const thumbnailUrl = `${baseUrl}/${thumbKey}`;

    return { ...processed, url: mainUrl, thumbnailUrl };
  }

  async deleteImage(urlOrKey: string): Promise<boolean> {
    try {
      const key = urlOrKey.startsWith('http') ? urlOrKey.substring(urlOrKey.indexOf('/uploads/')) : urlOrKey;
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key.replace(/^\//, ''),
      }));
      return true;
    } catch {
      return false;
    }
  }
}

class UnconfiguredVercelStorageProvider implements IStorageProvider {
  async uploadImage(): Promise<ProcessedImageResult> {
    throw new Error('Uploads on Vercel require BLOB_READ_WRITE_TOKEN or Cloudflare R2 credentials (CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME).');
  }
  async deleteImage(): Promise<boolean> { return false; }
}

const isCloudflareR2Configured = Boolean(
  process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
  process.env.CLOUDFLARE_R2_BUCKET_NAME
);

// Prioritize Cloudflare R2 if configured, then Vercel Blob, then Local Storage.
export const storageProvider: IStorageProvider = isCloudflareR2Configured
  ? new CloudflareR2StorageProvider()
  : process.env.BLOB_READ_WRITE_TOKEN
    ? new VercelBlobStorageProvider()
    : process.env.VERCEL
      ? new UnconfiguredVercelStorageProvider()
      : new LocalStorageProvider();
