import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.businessProduct.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 404 });
  }
}
