'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);

      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-sky-50/30 to-white">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-sea text-white flex items-center justify-center mx-auto shadow-lg shadow-sea/30">
            <Mail className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-900">
            {sent ? 'Check Your Email' : 'Forgot Your Password?'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            {sent
              ? 'If an account exists for this email, a password reset link has been sent.'
              : 'Enter your email address below and we\'ll send you a secure link to reset your password.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          {sent ? (
            <div className="space-y-5">
              {/* Success State */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="font-bold text-emerald-800 text-sm">Reset Link Sent!</p>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  A password reset link has been sent to <strong>{email}</strong>. 
                  Check your inbox (and spam folder). The link expires in <strong>1 hour</strong>.
                </p>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Didn&apos;t receive the email?{' '}
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="font-semibold text-sea hover:underline"
                >
                  Try again
                </button>
              </p>

              <Link href="/login">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  ⚠️ {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                id="forgot-email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full gap-2 py-2.5"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link…</>
                ) : (
                  <><Mail className="w-4 h-4" /> Send Reset Link</>
                )}
              </Button>

              <Link href="/login">
                <Button variant="ghost" className="w-full gap-2 text-slate-500">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
