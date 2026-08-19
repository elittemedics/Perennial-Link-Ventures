import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | Perennial Link Ventures',
  description: 'Terms of Service for Perennial Link Ventures business directory and marketplace.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-sea hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-sea shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Perennial Link Ventures · Last Updated: August 2026</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            Welcome to Perennial Link Ventures. By accessing or using our directory, marketplace, or services, you agree to comply with and be bound by the following Terms of Service.
          </p>
        </div>

        {/* Content */}
        <Card className="p-8 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed border-slate-200">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">1. Using Perennial Link Ventures</h2>
            <p>
              You may use this directory and marketplace only for lawful business discovery, promotion, product listing, and communication. You must provide accurate, truthful information and must not impersonate any person or business.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">2. Product Postings and Business Listings</h2>
            <p>
              Sellers and business owners are solely responsible for their content, products, services, prices, availability, images, and contact information. We reserve the right to review, edit, suspend, or remove listings or products that are misleading, fraudulent, abusive, unlawful, or violate intellectual property rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">3. Direct Dealings &amp; Communication</h2>
            <p>
              Buyers and sellers deal directly with one another via WhatsApp, phone, or email. Perennial Link Ventures is not a party to any contract, sale, payment, delivery, warranty, or dispute between users. Always verify sellers and products before making payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">4. Contact Information</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs font-medium">
              <p className="font-bold text-slate-900 mb-1">Perennial Link Ventures</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-sea shrink-0" /> Tuba/Weija, Greater Accra, Ghana</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-sea shrink-0" /> Email: info@market-plv.com</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-sea shrink-0" /> Phone: 0594772823</p>
            </div>
          </section>

        </Card>
      </div>
    </div>
  );
}
