'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Package, Store, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/** A one-time, plain-language choice shown after a new owner first signs in. */
export function FirstSignInPrompt() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(searchParams.get('welcome') === 'true');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="first-sign-in-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sea">Welcome</p>
            <h2 id="first-sign-in-title" className="mt-1 text-xl font-extrabold text-slate-900">What would you like to do first?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">You can post a product now, or create a business profile. Both are free and you can do the other one later.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/dashboard/owner/products#new-product" onClick={() => setOpen(false)}>
            <Button variant="primary" className="h-auto w-full justify-start gap-2 py-3 text-left"><Package className="h-5 w-5 shrink-0" />Post my first product</Button>
          </Link>
          <Link href="/dashboard/owner/listings/new" onClick={() => setOpen(false)}>
            <Button variant="outline" className="h-auto w-full justify-start gap-2 py-3 text-left"><Store className="h-5 w-5 shrink-0" />Add my business</Button>
          </Link>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-sea">I will do this later</button>
      </div>
    </div>
  );
}
