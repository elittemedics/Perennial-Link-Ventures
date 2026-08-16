'use client';

import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Mail, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join('');

  const updateDigits = (value: string, index: number) => {
    const entered = value.replace(/\D/g, '');
    if (!entered) {
      setDigits((current) => current.map((digit, position) => position === index ? '' : digit));
      return;
    }
    const next = [...digits];
    entered.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
    setDigits(next);
    inputs.current[Math.min(index + entered.length, 5)]?.focus();
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email) return setError('Your email address is missing. Please register again.');
    if (code.length !== 6) return setError('Enter all six numbers from the verification email.');
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, token: code }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string }>(response);
      if (!response.ok || !data.success) throw new Error(data.error || 'Verification failed.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-5">
        {success ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" /> : <Mail className="mx-auto h-12 w-12 text-sea" />}
        <h1 className="text-2xl font-extrabold text-slate-900">{success ? 'Email verified' : 'Enter verification code'}</h1>
        {success ? (
          <><p className="text-sm text-slate-600">Your email address has been confirmed. You can now sign in.</p><Link href="/login" className="block"><Button variant="primary" className="w-full">Go to sign in</Button></Link></>
        ) : (
          <form onSubmit={verify} className="space-y-5">
            <p className="text-sm text-slate-600">We sent a six-digit code to <strong>{email || 'your email address'}</strong>.</p>
            <div className="flex justify-center gap-2" onPaste={(event) => { event.preventDefault(); updateDigits(event.clipboardData.getData('text'), 0); }}>
              {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element; }} value={digit} onChange={(event) => updateDigits(event.target.value, index)} onKeyDown={(event) => { if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus(); }} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Verification code digit ${index + 1}`} className="h-12 w-10 rounded-lg border border-slate-300 text-center text-xl font-bold outline-none focus:border-sea focus:ring-2 focus:ring-sea/20" />)}
            </div>
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
            <Button type="submit" variant="primary" disabled={isLoading || code.length !== 6} className="w-full gap-2">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying</> : <><ShieldCheck className="h-4 w-4" /> Verify email</>}</Button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="min-h-[85vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sea" /></main>}><VerifyEmailContent /></Suspense>;
}
