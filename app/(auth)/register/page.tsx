'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { UserPlus, Building2, User, Eye, EyeOff, Mail } from 'lucide-react';
import { DEFAULT_COUNTRY } from '@/lib/countries-data';
import { CountrySelect } from '@/components/common/CountrySelect';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryDialCode, setCountryDialCode] = useState(DEFAULT_COUNTRY.phoneCode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'VISITOR' | 'BUSINESS_OWNER'>('BUSINESS_OWNER');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address, for example name@example.com.');
      return;
    }

    setIsLoading(true);

    const fullPhone = phone.startsWith('+') ? phone : `${countryDialCode}${phone.replace(/^0+/, '')}`;

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim(), phone: fullPhone, password, role }),
      });

      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Redirect to sign in page after successful registration
      router.push('/login?registered=true');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-2">
        <CardHeader className="text-center space-y-2 border-none">
          <div className="w-12 h-12 rounded-2xl bg-sea text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-sea/30">
            PL
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create Your Account</CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Join Ghana&apos;s leading business directory network.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I want to register as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('BUSINESS_OWNER')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    role === 'BUSINESS_OWNER'
                      ? 'border-sea bg-brand-50 text-sea font-bold ring-2 ring-sea/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs">Business Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('VISITOR')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    role === 'VISITOR'
                      ? 'border-sea bg-brand-50 text-sea font-bold ring-2 ring-sea/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs">Client / Visitor</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kwame Mensah"
            />

            <Input
              label="Email Address"
              type="email"
              id="register-email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => {
                if (email && !isValidEmail(email)) setError('Please enter a valid email address, for example name@example.com.');
              }}
              placeholder="kwame@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {/* Country & International Telephone Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Telephone Number
              </label>
              <div className="flex gap-2">
                <CountrySelect value={countryDialCode} mode="dialCode" className="w-40 shrink-0" onChange={(country) => setCountryDialCode(country.phoneCode)} />
                <div className="flex-1">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="054XXXXXXX"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sea focus:outline-none focus:ring-2 focus:ring-sea/20 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <Input
              label="Password"
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              helperText="Must be at least 6 characters long."
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

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full gap-2 py-2.5">
              <UserPlus className="w-4 h-4" /> Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-sea hover:underline">
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
