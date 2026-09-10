import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import db from '@/lib/db';
import {
  Search, Phone, ArrowRight, Star, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/products/ProductCard';
import { BusinessBrandFallback } from '@/components/common/BusinessBrandFallback';
import CategoryTabDropdown from '@/components/home/CategoryTabDropdown';

export const dynamic = 'force-dynamic';




export default async function HomePage() {
  let trendingProducts: any[] = [];
  let recentBusinesses: any[] = [];

  try {
    const res = await Promise.all([
      db.businessProduct.findMany({
        where: { isAvailable: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          business: { select: { name: true, slug: true, phone: true, whatsapp: true, isVerified: true, cityName: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 18,
      }),
      db.business.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        include: {
          category: { select: { name: true } },
          products: {
            where: { isAvailable: true },
            select: { id: true, title: true, price: true, currency: true, image: true },
            take: 6,
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);
    trendingProducts = res[0];
    recentBusinesses = res[1];
  } catch {
    // DB offline fallback for build/preview
  }

  return (
    <div className="space-y-0 overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — Compact, centered, static text
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative hero-bg-animated text-white overflow-hidden py-8 sm:py-10 lg:py-12 flex items-center">

        {/* Background floating orbs */}
        <div className="orb w-[400px] h-[400px] bg-sky-400/20 top-[-100px] left-[-100px] animate-pulse-glow" />
        <div className="orb w-[300px] h-[300px] bg-blue-300/15 bottom-[-60px] right-[10%] animate-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* Grid mesh overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 w-full">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-snug">
            Showcase Your Products to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-200 to-white">Thousands of Buyers</span>
          </h1>

          <p className="text-sm sm:text-base text-sky-100 max-w-2xl mx-auto font-normal leading-relaxed">
            List your business, upload your products, and let customers contact you directly on whatsapp or phone - no middlemen, no commission fees.
          </p>

        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 sm:h-12">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          4. MARKETPLACE CATEGORIES — Clickable, with gradient icons
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col gap-5">
            <div>
              <CategoryTabDropdown />
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info" className="px-3 py-1 text-xs">Fresh listings</Badge>
              </div>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Latest products</h2>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                Browse products quickly, then open the business profile to view and contact the seller to buy products.
              </p>
            </div>


            {/* Search Bar */}
            <form action="/search" method="GET" className="max-w-2xl w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search businesses, products, services..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm shadow-sm"
                  />
                </div>
                <Button type="submit" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-md shrink-0">
                  Search
                </Button>
              </div>
            </form>

            <div>
              <Link href="/products">
                <Button variant="outline" className="gap-2 rounded-xl shrink-0 mt-2">
                  View All Products <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {trendingProducts.map((prod) => <ProductCard key={prod.id} product={prod} />)}
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="info" className="mb-2 text-xs">Businesses &amp; services</Badge>
              <h2 className="text-2xl font-black text-slate-900">Find registered companies</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Businesses and service providers appear here even when they do not sell physical products. Product sellers may add a business profile, but it is optional.</p>
            </div>
            <Link href="/listings"><Button variant="outline" className="shrink-0 gap-2">View all businesses <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentBusinesses.map((business) => (
              <Link key={business.id} href={`/business/${business.slug}`} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-sea hover:bg-sky-50/40">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{business.name}</h3><p className="mt-1 text-xs text-slate-500">{business.category?.name || 'Business'}{business.cityName ? ` · ${business.cityName}` : ''}</p></div>{business.isVerified && <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          6. BUSINESS REGISTRATION CTA — Dark 3D panel
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-sky-600/15 top-[-120px] right-[-100px] animate-pulse-glow" />
        <div className="orb w-[300px] h-[300px] bg-blue-500/10 bottom-[-60px] left-[10%] animate-float-slow" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-sea/20 text-sky-300 border-sea/30 px-5 py-1.5 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Free Business Registration
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Put Your Business
            <br />
            <span className="gradient-text">In Front of Buyers Today</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Upload your product catalog, set your WhatsApp number, and start receiving direct customer inquiries — completely free. No monthly fees, no commissions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
            <Link href="/register">
              <Button variant="primary" size="lg"
                className="px-10 py-4 text-base rounded-2xl shadow-2xl shadow-sea/30 font-extrabold gap-2"
              >
                Register Free Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="tel:0594772823"
              className="flex items-center gap-2.5 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-7 py-4 rounded-2xl transition-all"
            >
              <Phone className="w-4 h-4 text-sea" />
              Call: 0594772823
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
