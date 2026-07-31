import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSessionUser } from '@/lib/auth/better-auth';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true, message: 'Logged out successfully.' });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
}
