import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Phone, MapPin, Mail, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Ghana\'s Premier Business Directory',
  description:
    'Learn about Perennial Link Ventures — headquartered in Tuba/Weija, Accra. We bridge the gap between high-intent clients and verified local businesses across Ghana.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Perennial Link Ventures | Ghana Business Directory',
    description:
      'Learn how Perennial Link Ventures connects customers with verified local businesses across Ghana via WhatsApp, phone, email, and web.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="info">Company Overview</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Perennial Link Ventures
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Ghana’s premier verified business directory and enterprise solutions hub. Headquartered in Tuba/Weija, Greater Accra, we bridge the gap between high-intent clients and verified local businesses.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-sea" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Built for Every Kind of Business</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            From independent professionals and local tradespeople to clinics, retailers, and growing companies, Perennial Link gives every legitimate service a clear place to be discovered.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-sea" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Global Reach</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Connecting consumers, businesses, and service providers across Ghana, Africa, and international markets.
          </p>
        </Card>
      </div>

      {/* Contact info panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <Badge className="bg-sea text-white border-none">Get In Touch</Badge>
          <h2 className="text-3xl font-extrabold">Have Questions or Need Assistance?</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Reach out to our customer support team or visit our office location in Tuba/Weija.
          </p>
          <div className="space-y-3 pt-2 text-sm">
            <p className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-sea" />
              <span>Telephone: <strong>0594772823</strong></span>
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-sea" />
              <span>Location: <strong>Tuba/Weija, Greater Accra, Ghana</strong></span>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-sea" />
              <span>Email: <strong>info@market-plv.com</strong></span>
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/register">
            <Button variant="primary" size="lg" className="px-8 py-4 text-base">
              Register Your Business Now
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
}
