'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const sent = searchParams.get('sent') === 'true';
  const email = searchParams.get('email');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'loading' : 'idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const response = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await readApiResponse<{ success?: boolean; error?: string }>(response);
        if (!response.ok || !data.success) throw new Error(data.error || 'Verification failed.');
        setState('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed.');
        setState('error');
      }
    };

    verify();
  }, [token]);

  if (state === 'loading') {
    return <Status icon={<Loader2 className="h-10 w-10 animate-spin text-sea" />} title="Verifying your email" text="Please wait a moment." />;
  }
  if (state === 'success') {
    return <Status icon={<CheckCircle2 className="h-12 w-12 text-emerald-500" />} title="Email verified" text="Your email address has been confirmed. You can now sign in." />;
  }
  if (state === 'error') {
    return <Status icon={<XCircle className="h-12 w-12 text-rose-500" />} title="Verification link unavailable" text={error} />;
  }
  return <Status icon={<Mail className="h-12 w-12 text-sea" />} title="Check your email" text={sent && email ? `We sent a verification link to ${email}. Open it to confirm your account.` : 'Open the verification link sent to your email address.'} />;
}

function Status({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-4">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{text}</p>
        <Link href="/login" className="block pt-2"><Button variant="primary" className="w-full">Go to sign in</Button></Link>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="min-h-[85vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sea" /></main>}><VerifyEmailContent /></Suspense>;
}
