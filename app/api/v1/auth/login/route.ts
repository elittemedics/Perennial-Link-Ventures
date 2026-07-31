import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { LoginSchema } from '@/lib/validations';
import { verifyPassword } from '@/lib/auth/argon2';
import { createSession, generateNumericOTP } from '@/lib/auth/better-auth';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { UserStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash || user.deletedAt !== null) {
      return NextResponse.json({ success: false, error: 'Invalid email or password credentials.' }, { status: 401 });
    }

    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended or deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Step 2: OTP verification if OTP was sent
    if (validated.otp) {
      if (!user.twoFactorToken || !user.twoFactorExpires) {
        return NextResponse.json({ success: false, error: 'No OTP code requested. Please start login again.' }, { status: 400 });
      }

      if (new Date() > user.twoFactorExpires) {
        await db.user.update({
          where: { id: user.id },
          data: { twoFactorToken: null, twoFactorExpires: null },
        });
        return NextResponse.json({ success: false, error: 'Verification code expired. Please sign in again.' }, { status: 400 });
      }

      if (validated.otp.trim() !== user.twoFactorToken) {
        return NextResponse.json({ success: false, error: 'Invalid verification code.' }, { status: 400 });
      }

      // OTP correct -> clear & issue session
      await db.user.update({
        where: { id: user.id },
        data: { twoFactorToken: null, twoFactorExpires: null },
      });

      await createSession(user.id, req.headers.get('user-agent') || undefined);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      });
    }

    // Step 1: Verify Password with Argon2
    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password credentials.' }, { status: 401 });
    }

    // Check if user has 2FA / OTP requirement
    if (user.twoFactorToken) {
      // Return 2FA requirement prompt
      return NextResponse.json({
        success: true,
        requiresOTP: true,
        message: 'Two-factor verification code required.',
      });
    }

    // Successful Login -> Create Session Cookie
    await createSession(user.id, req.headers.get('user-agent') || undefined);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Authentication failed.' },
      { status: 400 }
    );
  }
}
