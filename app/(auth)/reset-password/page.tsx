'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { KeyRound, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState(false);

  // Password strength indicator
  const getStrength = (pw: string) => {
    if (pw.length === 0) return { label: '', color: '' };
    if (pw.length < 6)   return { label: 'Too short', color: 'text-rose-500' };
    if (pw.length < 8)   return { label: 'Weak', color: 'text-amber-500' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw))
                          return { label: 'Strong ✓', color: 'text-emerald-600' };
    return { label: 'Fair', color: 'text-blue-500' };
  };
  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="font-bold text-rose-800">Invalid Reset Link</p>
        <p className="text-rose-600 text-xs">This reset link is invalid or has expired. Please request a new one.</p>
        <Link href="/forgot-password">
          <Button variant="primary" size="sm">Request New Link</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <p className="font-bold text-emerald-800 text-lg">Password Reset Successful!</p>
          <p className="text-emerald-700 text-xs leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link href="/login">
          <Button variant="primary" className="w-full gap-2">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <Input
        label="New Password"
        id="new-password"
        type={showPassword ? 'text' : 'password'}
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        helperText={strength.label ? `Password strength: ${strength.label}` : undefined}
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
      {strength.label && (
        <p className={`text-xs font-semibold -mt-2 ${strength.color}`}>
          Password strength: {strength.label}
        </p>
      )}

      <Input
        label="Confirm New Password"
        id="confirm-password"
        type={showConfirm ? 'text' : 'password'}
        required
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your new password"
        error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : undefined}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-slate-400 hover:text-sea transition-colors focus:outline-none"
            aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading || password.length < 6 || password !== confirmPassword}
        className="w-full gap-2 py-2.5"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving New Password…</>
        ) : (
          <><KeyRound className="w-4 h-4" /> Set New Password</>
        )}
      </Button>

      <Link href="/login">
        <Button variant="ghost" className="w-full gap-2 text-slate-500 text-xs">
          <ArrowLeft className="w-3 h-3" /> Back to Sign In
        </Button>
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-sky-50/30 to-white">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-sea text-white flex items-center justify-center mx-auto shadow-lg shadow-sea/30">
            <KeyRound className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-900">Set a New Password</CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Enter and confirm your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Suspense fallback={<div className="text-center py-8 text-slate-400 text-sm">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
