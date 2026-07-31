import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { InquirySchema } from '@/lib/validations';
import { sendEmail, getInquiryNotificationTemplate } from '@/lib/email';
import { isRateLimited } from '@/lib/rate-limit';

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
        senderPhone: validated.senderPhone,
        subject: validated.subject,
        message: validated.message,
      },
    });

    // Send Email notification to Business Owner
    if (business.email || business.owner?.email) {
      const recipient = business.email || business.owner.email;
      await sendEmail({
        to: recipient,
        subject: `[New Inquiry] ${validated.subject} - Perennial Link`,
        html: getInquiryNotificationTemplate(
          business.name,
          validated.senderName,
          validated.senderEmail,
          validated.senderPhone || '',
          validated.subject,
          validated.message
        ),
      });
    }

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('Inquiry Submission Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send inquiry message' },
      { status: 400 }
    );
  }
}
