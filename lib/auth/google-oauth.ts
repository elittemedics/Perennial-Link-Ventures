import crypto from 'crypto';

// ── Configuration ──────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://market-plv.com');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const REDIRECT_URI = `${APP_URL}/api/v1/auth/google/callback`;

// ── PKCE helpers ───────────────────────────────────────────────────────────
/**
 * Generate a cryptographically random PKCE code verifier.
 * Per RFC 7636 it must be 43–128 chars of unreserved characters.
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url'); // 43 chars
}

/**
 * Derive the S256 PKCE code challenge from a verifier (RFC 7636).
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Generate a random state string for CSRF protection (URL-safe).
 */
export function generateState(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// ── URLs ───────────────────────────────────────────────────────────────────
/**
 * Build the Google authorization URL with PKCE params.
 */
export function getGoogleAuthUrl(state: string, codeVerifier: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: generateCodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// ── Token exchange ─────────────────────────────────────────────────────────
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * Exchange the authorization code for access/id tokens.
 */
export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const data = (await res.json()) as GoogleTokenResponse;
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'Failed to exchange Google OAuth code.');
  }
  return data;
}

// ── User info ──────────────────────────────────────────────────────────────
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

/**
 * Fetch the signed-in user's profile from Google.
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google user info (${res.status}).`);
  }
  return (await res.json()) as GoogleUserInfo;
}

// ── Validation ─────────────────────────────────────────────────────────────
export function isGoogleConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function googleAuthError(message: string): string {
  return message;
}