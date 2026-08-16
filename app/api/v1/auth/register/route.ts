import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RegisterSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth/argon2';
import { createEmailVerificationToken } from '@/lib/auth/better-auth';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { Role } from '@prisma/client';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'register', 5, 60 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone,
        passwordHash,
        role: validated.role === 'BUSINESS_OWNER' ? Role.BUSINESS_OWNER : Role.VISITOR,
      },
    });

    const token = await createEmailVerificationToken(user.email);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const delivered = await sendEmail({
      to: user.email,
      subject: 'Verify your Perennial Link Ventures account',
      html: EmailTemplates.emailVerification(verificationUrl),
    });

    if (!delivered) {
      return NextResponse.json(
        { success: false, error: 'Your account was created, but we could not send the verification email. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Registration failed.' },
      { status: 400 }
    );
  }
}
