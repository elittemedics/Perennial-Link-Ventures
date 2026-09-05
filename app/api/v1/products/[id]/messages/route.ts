import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// GET — fetch messages for a product (sender sees own thread; business owner sees all)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Sign in to view messages.' }, { status: 401 });

    const product = await db.businessProduct.findUnique({
      where: { id },
      select: { businessId: true, ownerId: true, business: { select: { ownerId: true } } },
    });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });

    const isOwner =
      product.ownerId === user.id ||
      (product.business?.ownerId === user.id);

    const messages = await db.productMessage.findMany({
      where: isOwner
        ? { productId: id }
        : {
            productId: id,
            OR: [
              { senderId: user.id },
              { receiverId: user.id },
            ],
          },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, messages, isOwner });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load messages.' }, { status: 500 });
  }
}

// POST — send a message for a product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Sign in to send messages.' }, { status: 401 });

    const body = await req.json();
    const message = (body.message || '').toString().trim();
    if (!message || message.length < 2) {
      return NextResponse.json({ success: false, error: 'Message is too short.' }, { status: 400 });
    }

    const product = await db.businessProduct.findUnique({
      where: { id },
      select: { businessId: true, ownerId: true, business: { select: { ownerId: true } } },
    });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });

    const isOwner =
      product.ownerId === user.id ||
      (product.business?.ownerId === user.id);

    const receiverId = isOwner
      ? body.receiverId || null
      : product.ownerId || product.business?.ownerId || null;

    const created = await db.productMessage.create({
      data: {
        productId: id,
        businessId: product.businessId ?? null,
        senderId: user.id,
        receiverId,
        replyToId: body.replyToId || null,
        message,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, message: created }, { status: 201 });
  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
}
