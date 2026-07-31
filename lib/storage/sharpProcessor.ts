import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ProcessedImageResult {
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
}

export interface ProcessedImageBuffers extends ProcessedImageResult {
  mainBuffer: Buffer;
  thumbnailBuffer: Buffer;
}

export class ImageProcessor {
  private uploadDir: string;

  constructor(uploadDir: string = process.env.UPLOAD_DIR || './public/uploads') {
    this.uploadDir = uploadDir;
  }

  private async ensureUploadDirExists() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  /**
   * Optimizes an uploaded file buffer to WebP format and generates a thumbnail.
   */
  async processAndSaveImage(
    buffer: Buffer,
    originalName: string,
    prefix: string = 'img'
  ): Promise<ProcessedImageResult> {
    const processed = await this.processImageBuffers(buffer, originalName, prefix);
    await this.ensureUploadDirExists();
    await fs.writeFile(path.join(this.uploadDir, processed.filename), processed.mainBuffer);
    await fs.writeFile(
      path.join(this.uploadDir, 'thumbnails', processed.filename.replace('.webp', '_thumb.webp')),
      processed.thumbnailBuffer
    );
    return processed;
  }

  /** Process an image without writing to disk, for object-storage providers. */
  async processImageBuffers(
    buffer: Buffer,
    originalName: string,
    prefix: string = 'img'
  ): Promise<ProcessedImageBuffers> {
    const timestamp = Date.now();
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const baseFilename = `${prefix}_${timestamp}_${cleanName.slice(0, 15)}`;
    
    const mainFilename = `${baseFilename}.webp`;
    const thumbFilename = `${baseFilename}_thumb.webp`;

    const source = sharp(buffer, { limitInputPixels: 25_000_000 });
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > 25_000_000) {
      throw new Error('Image dimensions exceed the 25 megapixel limit.');
    }
    const mainBuffer = await source
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    const thumbnailBuffer = await sharp(buffer, { limitInputPixels: 25_000_000 })
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 75 })
      .toBuffer();

    return {
      filename: mainFilename,
      url: `/uploads/${mainFilename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
      size: mainBuffer.length,
      width: metadata.width || 0,
      height: metadata.height || 0,
      mainBuffer,
      thumbnailBuffer,
    };
  }

  /**
   * Delete an uploaded image and its thumbnail
   */
  async deleteImage(filename: string): Promise<boolean> {
    try {
      const mainFilePath = path.join(this.uploadDir, filename);
      const thumbFilePath = path.join(this.uploadDir, 'thumbnails', filename.replace('.webp', '_thumb.webp'));

      await fs.unlink(mainFilePath).catch(() => null);
      await fs.unlink(thumbFilePath).catch(() => null);
      return true;
    } catch {
      return false;
    }
  }
}

export const imageProcessor = new ImageProcessor();
