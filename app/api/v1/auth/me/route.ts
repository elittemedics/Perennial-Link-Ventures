import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/better-auth';

/**
 * GET /api/v1/auth/me
 * Returns the current session user without a 401 for unauthenticated visitors.
 * Using 200 + { user: null } instead of 401 prevents console errors on every page load.
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ success: true, user: user ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ success: true, user: null }, { status: 200 });
  }
}
