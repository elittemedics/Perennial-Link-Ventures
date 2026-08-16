import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/better-auth';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'verify-email', 8, 15 * 60 * 1000)) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    const { token, email } = await req.json();
    if (typeof token !== 'string' || !/^\d{6}$/.test(token) || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid verification link.' }, { status: 400 });
    }

    const verified = await verifyEmailToken(token, email);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'This verification link is invalid or has expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email address verified successfully.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ success: false, error: 'We could not verify this email address.' }, { status: 500 });
  }
}
