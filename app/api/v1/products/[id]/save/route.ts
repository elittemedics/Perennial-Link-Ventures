import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// GET — check if current user saved this product
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: true, saved: false });

    const existing = await db.savedProduct.findUnique({
      where: { userId_productId: { userId: user.id, productId: id } },
    });

    return NextResponse.json({ success: true, saved: Boolean(existing) });
  } catch (error) {
    console.error('Check Save Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check save status.' }, { status: 500 });
  }
}

// POST — toggle save / unsave a product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Sign in to save products.' }, { status: 401 });

    const existing = await db.savedProduct.findUnique({
      where: { userId_productId: { userId: user.id, productId: id } },
    });

    if (existing) {
      await db.savedProduct.delete({
        where: { userId_productId: { userId: user.id, productId: id } },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      await db.savedProduct.create({
        data: { userId: user.id, productId: id },
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error('Toggle Save Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save product.' }, { status: 500 });
  }
}
