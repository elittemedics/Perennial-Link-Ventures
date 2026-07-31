import { NextRequest, NextResponse } from 'next/server';
import { imageProcessor } from '@/lib/storage/sharpProcessor';
import { getSessionUser } from '@/lib/auth/better-auth';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login to upload files.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const prefix = (formData.get('prefix') as string) || 'listing';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No upload file provided.' }, { status: 400 });
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only PNG, JPEG, and WebP images are allowed.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Allowed formats: JPEG, PNG, WEBP, GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds maximum 10MB threshold.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image through Sharp WebP optimization pipeline
    const processed = await imageProcessor.processAndSaveImage(buffer, file.name, prefix);

    return NextResponse.json({
      success: true,
      url: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      width: processed.width,
      height: processed.height,
      size: processed.size,
    });
  } catch (error) {
    console.error('Image Upload Handler Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server file processing failed.' },
      { status: 500 }
    );
  }
}
