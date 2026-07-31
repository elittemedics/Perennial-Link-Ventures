import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: {
        business: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, favorites });
  } catch (error) {
    console.error('Get Favorites Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ success: false, error: 'Business ID is required.' }, { status: 400 });
    }

    const existing = await db.favorite.findUnique({
      where: { userId_businessId: { userId: user.id, businessId } },
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, favorited: false, message: 'Removed from favorites.' });
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.id,
        businessId,
      },
    });

    return NextResponse.json({ success: true, favorited: true, favorite }, { status: 201 });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update favorite status.' }, { status: 500 });
  }
}
