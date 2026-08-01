import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ForgotPasswordSchema, ResetPasswordSchema } from '@/lib/validations';
import { createPasswordResetToken } from '@/lib/auth/better-auth';
import { hashPassword } from '@/lib/auth/argon2';
import { sendEmail, EmailTemplates } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ForgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (user && user.status === 'ACTIVE' && user.deletedAt === null) {
      const token = await createPasswordResetToken(user.email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

      const delivered = await sendEmail({
        to: user.email,
        subject: 'Reset Your Perennial Link Ventures Password',
        html: EmailTemplates.passwordReset(resetUrl),
      });

      if (!delivered) {
        throw new Error('We could not send the password reset email. Please try again later.');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an active account exists for that email, a password reset link has been dispatched.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process password reset request.' },
      { status: 400 }
    );
  }
}
