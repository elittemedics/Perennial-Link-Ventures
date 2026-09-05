import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// GET — return all messages for the current user (sent or received)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await db.productMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id },
          { product: { ownerId: user.id } },
          { product: { business: { ownerId: user.id } } },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true, email: true } },
        receiver: { select: { id: true, name: true, image: true } },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
            business: { select: { id: true, name: true, slug: true, ownerId: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      messages,
      currentUserId: user.id,
    });
  } catch (error) {
    console.error('Account Messages Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load messages' }, { status: 500 });
  }
}
