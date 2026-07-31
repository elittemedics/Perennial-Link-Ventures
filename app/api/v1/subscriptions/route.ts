import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from '@prisma/client';

export async function GET() {
  try {
    const user = await getSessionUser();
    const plans = await db.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });

    let currentSubscription = null;
    if (user) {
      currentSubscription = await db.subscription.findFirst({
        where: { ownerId: user.id, status: SubscriptionStatusEnum.ACTIVE },
        include: { planDetails: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      plans,
      currentSubscription,
    });
  } catch (error) {
    console.error('Get Subscriptions Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { plan } = await req.json(); // FREE, PRO, ENTERPRISE
    const planEnum = plan as SubscriptionPlanEnum;

    const planDetails = await db.subscriptionPlan.findUnique({
      where: { plan: planEnum },
    });

    if (!planDetails) {
      return NextResponse.json({ success: false, error: 'Invalid subscription plan.' }, { status: 400 });
    }

    // Deactivate prior active subscriptions
    await db.subscription.updateMany({
      where: { ownerId: user.id, status: SubscriptionStatusEnum.ACTIVE },
      data: { status: SubscriptionStatusEnum.CANCELLED },
    });

    const subscription = await db.subscription.create({
      data: {
        ownerId: user.id,
        planId: planDetails.id,
        plan: planEnum,
        price: planDetails.price,
        currency: planDetails.currency,
        status: SubscriptionStatusEnum.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error) {
    console.error('Subscribe Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update subscription' }, { status: 500 });
  }
}
