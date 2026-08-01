import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
  };
};

function isValidSignature(payload: string, request: NextRequest): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signatures = request.headers.get('svix-signature');

  if (!secret || !id || !timestamp || !signatures) return false;

  const timestampSeconds = Number(timestamp);
  const fiveMinutes = 5 * 60;
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > fiveMinutes) {
    return false;
  }

  // Resend webhook secrets are Svix secrets: `whsec_` followed by base64 key data.
  const encodedSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const secretBytes = Buffer.from(encodedSecret, 'base64');
  if (secretBytes.length === 0) return false;

  const expected = createHmac('sha256', secretBytes)
    .update(`${id}.${timestamp}.${payload}`)
    .digest('base64');

  return signatures
    .split(/\s+/)
    .map((signature) => signature.split(',', 2))
    .filter(([version, value]) => version === 'v1' && Boolean(value))
    .some(([, value]) => {
      const received = Buffer.from(value, 'base64');
      const calculated = Buffer.from(expected, 'base64');
      return received.length === calculated.length && timingSafeEqual(received, calculated);
    });
}

export async function POST(request: NextRequest) {
  const payload = await request.text();

  if (!process.env.RESEND_WEBHOOK_SECRET) {
    console.error('[RESEND_WEBHOOK_CONFIGURATION_ERROR] RESEND_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  if (!isValidSignature(payload, request)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(payload) as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  // Keep logs intentionally minimal: do not log recipient addresses or email content.
  console.info('[RESEND_WEBHOOK_EVENT]', {
    id: request.headers.get('svix-id'),
    type: event.type,
    emailId: event.data?.email_id,
  });

  return NextResponse.json({ received: true });
}
