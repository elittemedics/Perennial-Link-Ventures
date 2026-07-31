import { imageProcessor, ProcessedImageResult } from './sharpProcessor';
import { del, put } from '@vercel/blob';

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

class UnconfiguredVercelStorageProvider implements IStorageProvider {
  async uploadImage(): Promise<ProcessedImageResult> {
    throw new Error('Uploads on Vercel require BLOB_READ_WRITE_TOKEN. Create a Vercel Blob store and add its token to the project environment variables.');
  }
  async deleteImage(): Promise<boolean> { return false; }
}

// Use Vercel Blob in serverless deployments and disk storage on a persistent host.
export const storageProvider: IStorageProvider = process.env.BLOB_READ_WRITE_TOKEN
  ? new VercelBlobStorageProvider()
  : process.env.VERCEL
    ? new UnconfiguredVercelStorageProvider()
    : new LocalStorageProvider();
