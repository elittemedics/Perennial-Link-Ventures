/**
 * This project uses better-auth for authentication, not NextAuth.
 * This file is kept as a stub to prevent legacy import errors.
 * All auth is handled via /api/auth/[...betterauth]/route.ts
 */
export async function GET() {
  return new Response('Not Found', { status: 404 });
}

export async function POST() {
  return new Response('Not Found', { status: 404 });
}
