'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn, Eye, EyeOff, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { readApiResponse } from '@/lib/api-client';
import GoogleIcon from '@/components/common/GoogleIcon';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const oauthError = searchParams.get('error');

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError]             = useState<string | null>(oauthError);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = () => {
    setOauthLoading(true);
    setError(null);
    // Redirect through the API route — it sets the PKCE/state cookies and
    // forwards to Google's consent screen.
    window.location.href = '/api/v1/auth/google';
  };


  // ── Sign in with email + password ───────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string; showOnboarding?: boolean; user?: { name: string | null; role: string } }>(res);

      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed.');

      window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
      if (data.showOnboarding) {
        router.replace('/dashboard/owner?welcome=true');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
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
            Sign In to Your Account
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Access your business dashboard, reviews, and inquiries.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          {/* Error / Success Alerts */}
          {isRegistered && !successMsg && !error && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created, continue to sign in.</span>
            </div>
          )}
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

          {/* ── Google Sign-In ────────────────────────────────────── */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading || isLoading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-sea/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {oauthLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin text-slate-400" /> Connecting to Google…</>
            ) : (
              <><GoogleIcon className="w-5 h-5" /> Sign in with Google</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* ── Email & Password ────────────────────────────────── */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In</>
                )}
              </Button>
            </form>

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] bg-slate-50" />}>
      <LoginContent />
    </Suspense>
  );
}
