import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/better-auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (typeof token !== 'string' || !token) {
      return NextResponse.json({ success: false, error: 'Invalid verification link.' }, { status: 400 });
    }

    const verified = await verifyEmailToken(token);
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
