import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ReviewSchema } from '@/lib/validations';
import { getSessionUser } from '@/lib/auth/better-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || undefined;

    const reviews = await db.review.findMany({
      where: {
        ...(businessId ? { businessId } : {}),
        isApproved: true,
        deletedAt: null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        business: { select: { id: true, name: true, slug: true } },
        replies: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Please login to leave a review.' }, { status: 401 });
    }

    const body = await req.json();
    const validated = ReviewSchema.parse(body);

    const existing = await db.review.findFirst({
      where: { businessId: validated.businessId, userId: user.id, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already reviewed this business.' }, { status: 409 });
    }

    const review = await db.review.create({
      data: {
        businessId: validated.businessId,
        userId: user.id,
        rating: validated.rating,
        title: validated.title,
        comment: validated.comment,
        isApproved: true,
      },
    });

    // Re-calculate average rating for business
    const agg = await db.review.aggregate({
      where: { businessId: validated.businessId, isApproved: true, deletedAt: null },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await db.business.update({
      where: { id: validated.businessId },
      data: {
        avgRating: Math.round((agg._avg.rating || 0) * 10) / 10,
        totalReviews: agg._count.rating,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Create Review Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit review' },
      { status: 400 }
    );
  }
}
