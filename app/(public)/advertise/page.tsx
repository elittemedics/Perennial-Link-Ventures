import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Globe2, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Advertise Your Business Free',
  description: 'Create a free business profile on Perennial Link Ventures. Be discovered in search and let customers contact you directly by WhatsApp, phone, email, or website.',
  alternates: { canonical: '/advertise' },
};

const benefits = [
  ['Free to list', 'Create a professional profile without listing fees or sales commissions.'],
  ['Direct enquiries', 'Customers contact your team directly by WhatsApp, phone, email, or your website.'],
  ['Built for discovery', 'Categories, location pages, structured data, and a searchable profile help customers find you.'],
];

export default function AdvertisePage() {
  return <main className="bg-slate-50">
    <section className="hero-bg-animated text-white"><div className="mx-auto max-w-5xl px-4 py-20 sm:py-28 text-center space-y-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold"><Globe2 className="h-4 w-4" /> For businesses everywhere</span>
      <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Put your business where customers are searching.</h1>
      <p className="mx-auto max-w-2xl text-lg text-sky-100">Create a rich, searchable business profile and let buyers contact you directly. No commission on your conversations or sales.</p>
      <Link href="/register"><Button size="lg" className="rounded-2xl bg-white px-7 font-extrabold text-sea hover:bg-sky-50">Create a free profile <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
    </div></section>
    <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:grid-cols-3">
      {benefits.map(([title, description], index) => { const Icon = [BadgeCheck, MessageCircle, Search][index]; return <article key={title} className="card-3d rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><Icon className="mb-5 h-9 w-9 text-sea" /><h2 className="text-xl font-extrabold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>; })}
    </section>
  </main>;
}
