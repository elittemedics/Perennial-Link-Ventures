'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Package, Store, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/** Warm, plain-language choice shown after a new user first signs in. */
export function FirstSignInPrompt() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get('welcome') === 'true');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-sign-in-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 sm:p-7 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-[11px] font-black uppercase tracking-wider text-sea bg-brand-50 px-2.5 py-1 rounded-full mb-2">
              Welcome to Perennial Link 🎉
            </span>
            <h2 id="first-sign-in-title" className="text-xl font-extrabold text-slate-900 leading-tight">
              What would you like to do first?
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clear, friendly explanation */}
        <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
          You can <strong>upload a product to sell now</strong>, or <strong>register a business profile now</strong>. You can also skip this step and do any of these later anytime you wish.
        </p>

        {/* Action Options */}
        <div className="grid gap-3">
          <Link href="/dashboard/owner/products#new-product" onClick={() => setOpen(false)}>
            <Button variant="primary" className="w-full justify-between gap-2 py-3.5 px-4 text-left font-bold rounded-2xl shadow-md">
              <span className="flex items-center gap-2.5">
                <Package className="h-5 w-5 shrink-0" />
                Upload a Product Now
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Button>
          </Link>

          <Link href="/dashboard/owner/listings/new" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full justify-between gap-2 py-3.5 px-4 text-left font-bold rounded-2xl border-slate-200 text-slate-800 hover:bg-slate-50">
              <span className="flex items-center gap-2.5">
                <Store className="h-5 w-5 shrink-0 text-sea" />
                Register a Business Now
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Button>
          </Link>
        </div>

        {/* Skip action */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full text-center text-xs font-bold text-slate-400 hover:text-sea pt-1 transition-colors"
        >
          I&apos;ll do this later — Take me to my dashboard
        </button>

      </div>
    </div>
  );
}
