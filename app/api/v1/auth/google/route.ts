import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isGoogleConfigured, generateState, generateCodeVerifier, getGoogleAuthUrl } from '@/lib/auth/google-oauth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/auth/google
 * Starts the OAuth flow: sets short-lived PKCE + state cookies, then
 * redirects the browser to Google's consent screen.
 */
export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    const message = encodeURIComponent('Google sign-in is not configured on this server yet.');
    return NextResponse.redirect(new URL(`/login?error=${message}`, req.nextUrl));
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authUrl = getGoogleAuthUrl(state, codeVerifier);

  const cookieStore = await cookies();
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 300, // 5 minutes — long enough to complete Google's consent screen
  };

  cookieStore.set('plv_oauth_state', state, base);
  cookieStore.set('plv_oauth_verifier', codeVerifier, base);

  return NextResponse.redirect(authUrl);
}