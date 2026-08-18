import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { LoginSchema } from '@/lib/validations';
import { verifyPassword } from '@/lib/auth/argon2';
import { createSession } from '@/lib/auth/better-auth';
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

    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password credentials.' }, { status: 401 });
    }

    // Normal logins use password only. The welcome choice is shown once per account.
    const showOnboarding = user.role === 'BUSINESS_OWNER' && !user.onboardingSeenAt;
    await db.user.update({
      where: { id: user.id },
      data: { twoFactorToken: null, twoFactorExpires: null, ...(showOnboarding ? { onboardingSeenAt: new Date() } : {}) },
    });
    await createSession(user.id, req.headers.get('user-agent') || undefined);

    return NextResponse.json({
      success: true,
      showOnboarding,
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
