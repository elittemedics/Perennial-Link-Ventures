import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// GET — check follow status and get follower count
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    const [followerCount, follow] = await Promise.all([
      db.businessFollow.count({ where: { businessId: id } }),
      user
        ? db.businessFollow.findUnique({
            where: {
              userId_businessId: { userId: user.id, businessId: id },
            },
          })
        : null,
    ]);

    return NextResponse.json({
      success: true,
      isFollowing: !!follow,
      followerCount,
    });
  } catch (error) {
    console.error('Follow Status Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve follow status' },
      { status: 500 }
    );
  }
}

// POST — toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to follow this business.' },
        { status: 401 }
      );
    }

    const business = await db.business.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      );
    }

    const existing = await db.businessFollow.findUnique({
      where: {
        userId_businessId: { userId: user.id, businessId: id },
      },
    });

    let isFollowing = false;
    if (existing) {
      await db.businessFollow.delete({
        where: { id: existing.id },
      });
      isFollowing = false;
    } else {
      await db.businessFollow.create({
        data: {
          userId: user.id,
          businessId: id,
        },
      });
      isFollowing = true;
    }

    const followerCount = await db.businessFollow.count({
      where: { businessId: id },
    });

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount,
    });
  } catch (error) {
    console.error('Toggle Follow Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update follow status' },
      { status: 500 }
    );
  }
}
