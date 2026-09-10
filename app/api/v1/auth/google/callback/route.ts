import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { exchangeCodeForTokens, getGoogleUserInfo, isGoogleConfigured } from '@/lib/auth/google-oauth';
import { createSession } from '@/lib/auth/better-auth';
import { Role, UserStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/auth/google/callback
 * Google redirects the browser here after consent.
 *  - Validates the state parameter (CSRF protection)
 *  - Exchanges the code for tokens
 *  - Fetches the user's Google profile
 *  - Finds or creates a local account and session
 *  - Redirects to /dashboard on success, /login?error= on failure
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const cookieStore = await cookies();

  if (!isGoogleConfigured()) {
    return redirectToLogin(req, 'Google sign-in is not configured on this server yet.');
  }

  // User cancelled on Google's consent screen.
  if (error) {
    return redirectToLogin(req, 'You cancelled Google sign-in. No changes were made.');
  }

  if (!code || !state) {
    return redirectToLogin(req, 'Google sign-in failed. Please try again.');
  }

  const expectedState = cookieStore.get('plv_oauth_state')?.value;
  const codeVerifier = cookieStore.get('plv_oauth_verifier')?.value;

  // CSRF check: state must match the one we issued; verifier must still be present.
  if (!expectedState || !codeVerifier || expectedState !== state) {
    return redirectToLogin(req, 'This sign-in attempt is invalid or expired. Please try again.');
  }

  // Consume the one-time cookies regardless of outcome.
  cookieStore.delete('plv_oauth_state');
  cookieStore.delete('plv_oauth_verifier');

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return redirectToLogin(req, 'Google did not return an email address for your account.');
    }

    const email = googleUser.email.toLowerCase().trim();
    const userAgent = req.headers.get('user-agent') || undefined;

    // Find the user by Google ID first, then by email.
    let user = await db.user.findFirst({
      where: { provider: 'google', providerId: googleUser.id },
    });

    if (!user) {
      // Already have an account with this email? Link the Google identity to it.
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        if (existing.deletedAt !== null) {
          return redirectToLogin(req, 'This account has been deactivated. Contact support.');
        }
        user = await db.user.update({
          where: { id: existing.id },
          data: {
            provider: 'google',
            providerId: googleUser.id,
            emailVerified: existing.emailVerified ?? new Date(),
            image: existing.image ?? googleUser.picture ?? null,
            name: existing.name ?? googleUser.name ?? null,
          },
        });
      } else {
        // Brand-new account — create it as a VISITOR; they can opt into
        // becoming a business owner during onboarding.
        user = await db.user.create({
          data: {
            name: googleUser.name ?? null,
            email,
            emailVerified: new Date(),
            image: googleUser.picture ?? null,
            provider: 'google',
            providerId: googleUser.id,
            role: Role.VISITOR,
            status: UserStatus.ACTIVE,
          },
        });
      }
    } else {
      // Known Google user — clear any leftover suspension-free flags, refresh profile.
      if (user.deletedAt !== null) {
        return redirectToLogin(req, 'This account has been deactivated. Contact support.');
      }
      if (user.status !== UserStatus.ACTIVE) {
        return redirectToLogin(req, 'Your account has been suspended. Contact support.');
      }
      user = await db.user.update({
        where: { id: user.id },
        data: {
          email,
          emailVerified: user.emailVerified ?? new Date(),
          image: user.image ?? googleUser.picture ?? null,
          name: user.name ?? googleUser.name ?? null,
        },
      });
    }

    const showOnboarding = user.role === Role.BUSINESS_OWNER && !user.onboardingSeenAt;
    await createSession(user.id, userAgent);
    if (showOnboarding) {
      await db.user.update({ where: { id: user.id }, data: { onboardingSeenAt: new Date() } });
    }

    // On success we land the user straight in with their fresh session cookie.
    // The redirect path mirrors password login so returning owners keep their flow.
    const dest = showOnboarding
      ? '/dashboard/owner?welcome=true'
      : user.role === Role.BUSINESS_OWNER
        ? '/dashboard/owner'
        : '/dashboard';
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return redirectToLogin(req, err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
  }
}

function redirectToLogin(req: NextRequest, message: string) {
  const url = new URL('/login', req.nextUrl);
  url.searchParams.set('error', message);
  return NextResponse.redirect(url);
}