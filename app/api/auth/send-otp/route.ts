import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendEmail, getLoginOTPTemplate } from '@/lib/email';
import { verifyPassword } from '@/lib/auth/argon2';
import crypto from 'crypto';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'send-otp', 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Return a generic error — never confirm whether email exists (security)
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Limit email sends for an account to one per minute and use CSPRNG output.
    if (user.twoFactorExpires && user.twoFactorExpires.getTime() > Date.now() + 9 * 60 * 1000) {
      return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const wasDelivered = await sendEmail({
      to: user.email,
      subject: `${otp} – Your Perennial Link Login Code`,
      html: getLoginOTPTemplate(user.name || '', otp),
    });

    if (!wasDelivered) {
      return NextResponse.json(
        { error: 'We could not deliver a verification code. Please contact support or try again later.' },
        { status: 503 }
      );
    }

    // Persist a code only after the email provider accepts the message.
    await db.user.update({
      where: { id: user.id },
      data: { twoFactorToken: otp, twoFactorExpires: expires },
    });

    return NextResponse.json({ success: true, message: 'Verification code sent to your email address.' });
  } catch (err) {
    console.error('[SEND_OTP_ERROR]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
