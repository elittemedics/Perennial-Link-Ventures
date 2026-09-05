import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// GET — get all messages for a business where the logged-in user is the owner
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    // Verify ownership of the business, or all businesses owned by user
    const businesses = await db.business.findMany({
      where: businessId ? { id: businessId, ownerId: user.id } : { ownerId: user.id },
      select: { id: true, name: true, slug: true },
    });

    if (businesses.length === 0) {
      return NextResponse.json({ success: true, messages: [], isOwner: false });
    }

    const businessIds = businesses.map((b) => b.id);

    const messages = await db.productMessage.findMany({
      where: {
        OR: [
          { businessId: { in: businessIds } },
          { product: { businessId: { in: businessIds } } },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true, email: true } },
        receiver: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, title: true, price: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      messages,
      isOwner: true,
    });
  } catch (error) {
    console.error('Owner Messages Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load messages' }, { status: 500 });
  }
}

// POST — owner replies to a customer message
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, receiverId, productId, businessId, replyToId } = body;

    const trimmed = (message || '').toString().trim();
    if (!trimmed || trimmed.length < 2) {
      return NextResponse.json({ success: false, error: 'Message is too short' }, { status: 400 });
    }

    if (!receiverId) {
      return NextResponse.json({ success: false, error: 'Receiver ID required' }, { status: 400 });
    }

    // Verify ownership
    if (businessId) {
      const biz = await db.business.findFirst({
        where: { id: businessId, ownerId: user.id },
      });
      if (!biz) {
        return NextResponse.json({ success: false, error: 'Unauthorized business' }, { status: 403 });
      }
    }

    const reply = await db.productMessage.create({
      data: {
        productId,
        businessId: businessId || null,
        senderId: user.id,
        receiverId,
        replyToId: replyToId || null,
        message: trimmed,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, reply }, { status: 201 });
  } catch (error) {
    console.error('Owner Reply Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reply' }, { status: 500 });
  }
}
