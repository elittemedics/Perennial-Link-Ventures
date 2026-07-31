import { NextRequest } from 'next/server';

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

/**
 * Small per-instance backstop for abuse of sensitive endpoints. Configure a
 * shared rate limit (Vercel Firewall / Redis) for multi-instance production.
 */
export function isRateLimited(request: NextRequest, scope: string, limit: number, windowMs: number): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}
