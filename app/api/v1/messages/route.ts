import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { InquirySchema } from '@/lib/validations';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { getSessionUser } from '@/lib/auth/better-auth';
import { Role } from '@prisma/client';
import { isRateLimited } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    let whereClause: any = {};

    if (user.role === Role.ADMINISTRATOR) {
      whereClause = businessId ? { businessId } : {};
    } else {
      // Find businesses owned by user
      const userBusinesses = await db.business.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });
      const ids = userBusinesses.map((b) => b.id);
      whereClause = { businessId: { in: ids } };
    }

    const messages = await db.inquiryMessage.findMany({
      where: whereClause,
      include: {
        business: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'inquiry', 10, 60 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: 'Too many messages. Please try again later.' }, { status: 429 });
    }
    const body = await req.json();
    const validated = InquirySchema.parse(body);

    const business = await db.business.findUnique({
      where: { id: validated.businessId },
      include: { owner: true },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Target business listing not found.' }, { status: 404 });
    }

    const inquiry = await db.inquiryMessage.create({
      data: {
        businessId: validated.businessId,
        senderName: validated.senderName,
        senderEmail: validated.senderEmail,
        senderPhone: validated.senderPhone || null,
        subject: validated.subject,
        message: validated.message,
      },
    });

    // Notify Business Owner via Email
    if (business.owner && business.owner.email) {
      sendEmail({
        to: business.owner.email,
        subject: `[New Inquiry] ${validated.subject} - ${business.name}`,
        html: EmailTemplates.visitorInquiry(
          business.name,
          validated.senderName,
          validated.senderEmail,
          validated.subject,
          validated.message
        ),
      }).catch(() => null);
    }

    return NextResponse.json(
      { success: true, message: 'Your message has been delivered to the business owner.', inquiry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Message Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send inquiry message' },
      { status: 400 }
    );
  }
}
