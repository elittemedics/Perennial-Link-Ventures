import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ResetPasswordSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth/argon2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ResetPasswordSchema.parse(body);

    const resetTokenRecord = await db.passwordResetToken.findUnique({
      where: { token: validated.token },
    });

    if (!resetTokenRecord || new Date() > resetTokenRecord.expires) {
      return NextResponse.json({ success: false, error: 'Password reset token is invalid or has expired.' }, { status: 400 });
    }

    const newHash = await hashPassword(validated.password);

    await db.user.updateMany({
      where: { email: resetTokenRecord.email },
      data: { passwordHash: newHash },
    });

    await db.passwordResetToken.delete({ where: { token: validated.token } }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You may now log in with your new credentials.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to reset password.' },
      { status: 400 }
    );
  }
}
