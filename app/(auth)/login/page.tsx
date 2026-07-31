'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogIn, Eye, EyeOff, Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import { readApiResponse } from '@/lib/api-client';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep]               = useState<Step>('credentials');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [otp, setOtp]                 = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  // ── Step 1: Verify email + password, send OTP ───────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readApiResponse<{ error?: string }>(res);

      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

      setStep('otp');
      setSuccessMsg(`A 6-digit verification code has been sent to ${email}. Check your inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP via NextAuth ─────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'otp-verified', otp }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);
      if (!res.ok || !data.success) throw new Error(data.error || 'Verification failed.');

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-sky-50/30 to-white">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-sea text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-sea/30">
            PL
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-900">
            {step === 'credentials' ? 'Sign In to Your Account' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            {step === 'credentials'
              ? 'Access your business dashboard, reviews, and inquiries.'
              : `We sent a 6-digit code to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          {/* Error / Success Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}
          {successMsg && !error && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-start gap-2">
              <span className="shrink-0">✅</span> {successMsg}
            </div>
          )}

          {/* ── Step 1: Email & Password ────────────────────────────────── */}
          {step === 'credentials' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                id="login-email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-sea transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-sea hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full gap-2 py-2.5"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending Code…</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Continue &amp; Send Code</>
                )}
              </Button>
            </form>
          )}

          {/* ── Step 2: OTP Code ────────────────────────────────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="otp-input">
                  6-Digit Verification Code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="block w-full text-center text-3xl font-black tracking-[0.5em] rounded-xl border border-slate-300 bg-white py-4 px-3 text-slate-900 placeholder-slate-300 focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/30 transition-all shadow-sm"
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Code valid for 10 minutes. Didn&apos;t receive it?{' '}
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(''); setError(null); setSuccessMsg(null); }}
                    className="font-semibold text-sea hover:underline"
                  >
                    Go back
                  </button>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || otp.length !== 6}
                className="w-full gap-2 py-2.5"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Verify &amp; Sign In</>
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(null); setSuccessMsg(null); }}
                className="w-full text-xs text-slate-500 hover:text-sea flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Use a different account
              </button>
            </form>
          )}

          {/* Register CTA */}
          <div className="text-center text-xs text-slate-500 pt-1 border-t border-slate-100">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-sea hover:underline">
              Register free
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
