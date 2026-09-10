import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ShieldCheck, Truck, Store, CreditCard, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Buying & Selling on Market PLV',
  description:
    'Answers on how to buy and sell on Market PLV — including payments between buyer and seller, delivery options, safety, fees, and how to contact verified sellers directly.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Buying & Selling on Market PLV',
    description:
      'How to buy, how to sell, how to pay safely, delivery options, and more on Market PLV marketplace.',
    type: 'website',
    siteName: 'Market PLV',
  },
};

const FAQS = [
  {
    q: 'Is Market PLV an online store or a marketplace?',
    a: 'Market PLV is an online marketplace, not a retail store. Like Jiji or Jumia Marketplace, we do not own or sell inventory ourselves. We connect you — the buyer — directly with independent verified sellers who list their products and services on the platform. You deal directly with the seller for the product, price, and payment.',
  },
  {
    q: 'How do I buy a product on Market PLV?',
    a: 'Find the product you want using the search bar, categories, or the Latest Products section. Open the product listing to see photos, description, price, and the seller\'s profile. Then contact the seller directly using the "Chat on WhatsApp" or "Call Seller" button on the listing, or via the Direct Message form on the seller\'s business profile page.',
  },
  {
    q: 'How do I pay for an item?',
    a: 'Payment happens directly between you and the seller. The platform does not process or receive any payment. Once you agree on a price with the seller, you can arrange payment using whatever method you both prefer — mobile money (MoMo), bank transfer, cash on delivery, or cash on pickup. Always inspect the item before completing payment whenever possible.',
  },
  {
    q: 'Why does Market PLV not process payments on the website?',
    a: 'We run a classifieds-style marketplace where buyers and sellers transact directly, same as Jiji. For most of our products, prices are negotiable and items are inspected before purchase, so direct contact between buyer and seller gives you more leverage and avoids middleman markups. The platform\'s role is to help you find and contact trusted sellers — not to take a cut of your payment.',
  },
  {
    q: 'Is it safe to buy on Market PLV?',
    a: 'We help you buy safely by showing verified business profiles, customer reviews, and direct contact details. Always follow our Buyer Safety Tips: meet in a safe public place for pickup, inspect the item thoroughly before paying, avoid paying the full amount in advance to strangers, and use a phone or WhatsApp number listed on the platform. Report any seller that breaks these rules.',
  },
  {
    q: 'Do you charge any fees or commission?',
    a: 'No. Listing your products and registering your business on Market PLV is completely free. There are no hidden fees, no monthly charges, and we never take a commission from your sales. Buyers and sellers transact directly with no middleman markup.',
  },
  {
    q: 'How do I sell my products on Market PLV?',
    a: 'Register a free account, create a business profile (add your name, location, WhatsApp number, and photos), then use your dashboard to upload products. Buyers searching the marketplace will see your listings and contact you directly through WhatsApp, phone, or the message form. It is completely free and takes only a few minutes.',
  },
  {
    q: 'What delivery options are available?',
    a: 'Delivery is arranged directly between you and the seller. Many listings show whether the seller offers delivery and the delivery range (for example nationwide or within a city). If a listing says "Pickup only", you and the seller can agree on a pickup location. For delivery, confirm the fee and carrier with the seller before paying.',
  },
  {
    q: 'Can I return an item and get a refund?',
    a: 'Since you transact directly with the seller, returns and refunds are arranged between you and them — exactly as you would when buying from a private seller. For a business-backed purchase, review the business\'s return policy or its customer reviews before paying. If a seller refuses to resolve a legitimate issue, report them and we will investigate.',
  },
  {
    q: 'Where is Market PLV located and how do I contact support?',
    a: 'Market PLV is operated by Perennial Link Ventures, based in Tuba/Weija, Greater Accra, Ghana. You can reach us by phone on 0594772823 or email info@market-plv.com. We serve buyers and sellers across Ghana and worldwide.',
  },
];

export default function FAQPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  // FAQPage structured data — eligible for FAQ rich results in Google Search.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="info" className="mb-3">Help Center</Badge>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
              Everything you need to know about buying and selling on Market PLV — how contact and payment work directly between buyers and sellers.
            </p>
          </div>

          {/* Quick category chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { icon: Store, label: 'How to Buy' },
              { icon: CreditCard, label: 'Payments' },
              { icon: ShieldCheck, label: 'Safety' },
              { icon: Truck, label: 'Delivery' },
              { icon: HelpCircle, label: 'Selling' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
              >
                <Icon className="w-3.5 h-3.5 text-sea" /> {label}
              </span>
            ))}
          </div>

          {/* FAQ accordion (native <details>, no JS required) */}
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md transition-all">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm sm:text-base font-bold text-slate-800 list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <HelpCircle className="w-4 h-4 shrink-0 text-sea transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Still need help */}
          <Card className="mt-12 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7 text-sea" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Still have questions?</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Our support team is happy to help you buy or sell on the marketplace. Reach out anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href="https://wa.me/233594772823"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-extrabold transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-sea transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}