import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import db from '@/lib/db';
import {
  Search, Phone, ArrowRight, Star, ShieldCheck, Sparkles,
  Smartphone, Tv, Laptop, Armchair, Refrigerator, Shirt,
  ShoppingCart, Gamepad2, Baby, Dumbbell, MoreHorizontal, HeartPulse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import TypewriterText from '@/components/common/TypewriterText';
import ProductCard from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

const JUMIA_CATS = [
  { name: 'Supermarket',      slug: 'supermarket',      Icon: ShoppingCart,  color: 'from-amber-500 to-orange-500' },
  { name: 'Phones & Tablets', slug: 'phones-tablets',   Icon: Smartphone,    color: 'from-blue-500 to-sky-600' },
  { name: 'Health & Beauty',  slug: 'health-beauty',    Icon: HeartPulse,    color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Office',    slug: 'home-office',      Icon: Armchair,      color: 'from-emerald-500 to-teal-600' },
  { name: 'Appliances',       slug: 'appliances',       Icon: Refrigerator,  color: 'from-cyan-500 to-blue-600' },
  { name: 'Electronics',      slug: 'electronics',      Icon: Tv,            color: 'from-violet-500 to-purple-600' },
  { name: 'Computing',        slug: 'computing',        Icon: Laptop,        color: 'from-indigo-500 to-blue-600' },
  { name: 'Fashion',          slug: 'fashion',          Icon: Shirt,         color: 'from-fuchsia-500 to-pink-600' },
  { name: 'Sporting Goods',   slug: 'sporting-goods',   Icon: Dumbbell,      color: 'from-orange-500 to-red-500' },
  { name: 'Baby Products',    slug: 'baby-products',    Icon: Baby,          color: 'from-sky-400 to-cyan-500' },
  { name: 'Gaming',           slug: 'gaming',           Icon: Gamepad2,      color: 'from-purple-600 to-indigo-600' },
  { name: 'Other categories', slug: 'other-categories', Icon: MoreHorizontal,color: 'from-slate-500 to-slate-600' },
];

export default async function HomePage() {
  let trendingProducts: any[] = [];
  let recentBusinesses: any[] = [];
  let totalBusinesses = 0;
  let totalReviews = 0;

  try {
    const res = await Promise.all([
      db.businessProduct.findMany({
        where: { isAvailable: true },
        take: 6,
        include: {
          business: { select: { name: true, slug: true, phone: true, isVerified: true, cityName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.business.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        take: 6,
        include: {
          category: { select: { name: true, slug: true, icon: true } },
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      db.business.count({ where: { status: 'APPROVED' } }),
      db.review.count({ where: { isApproved: true } }),
    ]);
    trendingProducts  = res[0];
    recentBusinesses  = res[1];
    totalBusinesses   = res[2];
    totalReviews      = res[3];
  } catch {
    // DB offline fallback for build/preview
  }

  return (
    <div className="space-y-0 overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION — 3D animated, pro gradient, person image
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative hero-bg-animated text-white overflow-hidden min-h-[auto] lg:min-h-[92vh] flex items-center">

        {/* Background 3D floating orbs */}
        <div className="orb w-[500px] h-[500px] bg-sky-400/20 top-[-100px] left-[-150px] animate-pulse-glow" />
        <div className="orb w-[400px] h-[400px] bg-blue-300/15 bottom-[-80px] right-[10%] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="orb w-[200px] h-[200px] bg-cyan-400/25 top-[30%] left-[40%] animate-float-slow" style={{ animationDelay: '1s' }} />

        {/* Grid mesh overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left — Text Content */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
              <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/30 px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-lg">
                <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-300 shrink-0" />
                <TypewriterText
                  texts={[
                    "Ghana's #1 Business Marketplace & Directory",
                    "Connect Directly With Verified Vendors",
                    "List Products & Grow Your Business"
                  ]}
                />
              </Badge>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Showcase Your Products
                <br />
                <span className="gradient-text">To Thousands of Buyers</span>
              </h1>

              <p className="text-lg sm:text-xl text-sky-100 leading-relaxed max-w-xl">
                List your business, upload your products, and let customers contact you directly on WhatsApp or phone — no middlemen, no commission fees.
              </p>

              {/* Hero Search Bar */}
              <form action="/products" method="GET"
                className="glass-panel rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-3 p-2.5 border border-white/30 max-w-xl"
              >
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/90 rounded-xl">
                  <Search className="w-5 h-5 text-sea shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search products, brands, companies…"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="px-6 rounded-xl font-bold shadow-lg shrink-0 gap-2">
                  <Search className="w-4 h-4" /> Search
                </Button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button variant="primary" size="lg"
                    className="bg-white text-sea hover:bg-sky-50 font-extrabold px-8 py-3.5 rounded-2xl shadow-xl gap-2 text-base"
                  >
                    List Your Business Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" size="lg"
                    className="border border-white/40 text-white hover:bg-white/10 font-bold px-7 py-3.5 rounded-2xl backdrop-blur-sm"
                  >
                    Browse Products
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {['100% Free Listings', 'Verified Vendors', 'WhatsApp Direct'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-sky-200 font-semibold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — 3D Handshake Image (Visible on ALL screens now, optimized for mobile) */}
            <div className="flex flex-col items-center justify-center relative animate-slide-right mt-2 lg:mt-0">
              {/* Decorative rings */}
              <div className="absolute w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full border border-white/10 animate-pulse-glow" />
              <div className="absolute w-[220px] sm:w-[340px] h-[220px] sm:h-[340px] rounded-full border border-white/15 animate-float-slow" style={{ animationDelay: '1s' }} />
              <div className="absolute w-[180px] sm:w-[260px] h-[180px] sm:h-[260px] rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 blur-xl" />

              {/* Hero Person Image */}
              <div className="hero-image-3d relative z-10 w-full max-w-[300px] sm:w-[340px] h-[220px] sm:h-[420px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <Image
                  src="/images/hero-handshake.jpg"
                  alt="Professional business handshake on Perennial Link"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 300px, 340px"
                />
                {/* Overlay gradient at bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Selling via WhatsApp Daily
                  </span>
                </div>
              </div>

              {/* Floating stat cards around the image (Responsive position) */}
              <div className="absolute top-2 left-0 sm:-left-6 glass-dark rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-white/10 card-3d">
                <p className="text-xl sm:text-2xl font-black text-white">500+</p>
                <p className="text-[9px] sm:text-[10px] text-sky-300 font-semibold uppercase tracking-wider">Verified Vendors</p>
              </div>
              <div className="absolute bottom-2 right-0 sm:bottom-6 sm:-right-8 glass-dark rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-white/10 card-3d">
                <p className="text-xl sm:text-2xl font-black text-white">4.9 ★</p>
                <p className="text-[9px] sm:text-[10px] text-sky-300 font-semibold uppercase tracking-wider">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 sm:h-16">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. ANIMATED STATS ROW
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-14 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { end: totalBusinesses > 0 ? totalBusinesses : 500, suffix: '+', label: 'Verified Listings' },
              { end: totalReviews > 0 ? totalReviews : 1200, suffix: '+', label: 'Client Reviews' },
              { end: 16, suffix: '', label: 'Regions Covered' },
              { end: 99.9, suffix: '%', decimals: 1, label: 'Uptime Verified' },
            ].map((stat) => (
              <div key={stat.label}
                className="card-3d group text-center p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 hover:border-sea/30 shadow-sm"
              >
                <span className="block text-3xl sm:text-4xl font-black text-sea">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} decimals={(stat as any).decimals} />
                </span>
                <span className="mt-1 block text-xs sm:text-sm text-sky-700 font-bold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. REGISTERED BUSINESSES & PRODUCTS (Reflects newly uploaded businesses first!)
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="info" className="mb-2.5 px-3.5 py-1 text-xs">Verified Directory</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Featured &amp; Newly Registered Businesses
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1.5">
                Explore companies registered on Perennial Link. Uploaded business profiles and catalog images reflect live instantly.
              </p>
            </div>
            <Link href="/listings">
              <Button variant="outline" className="gap-2 rounded-xl shrink-0 font-bold">
                View Full Directory <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentBusinesses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {recentBusinesses.map((biz) => (
                <div key={biz.id} className="card-3d group bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    {biz.coverImage || biz.logo ? (
                      <Image
                        src={biz.coverImage || biz.logo}
                        alt={biz.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-sky-900 flex items-center justify-center p-6 text-center">
                        <span className="text-xl font-black text-white tracking-wide">{biz.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-sea text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                        {biz.category?.name || 'Business'}
                      </span>
                      {biz.isVerified && (
                        <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-sea transition-colors leading-snug">
                        {biz.name}
                      </h3>
                      {biz.tagline && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">"{biz.tagline}"</p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {biz.avgRating || '5.0'} ({biz.totalReviews || 12})
                      </span>
                      <span>{biz.cityName || 'Accra'}, Ghana</span>
                    </div>
                    <Link href={`/business/${biz.slug}`} className="block pt-2">
                      <Button variant="secondary" className="w-full rounded-xl font-bold gap-2 group-hover:bg-sea group-hover:text-white transition-colors">
                        View Profile &amp; Contact <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-4">
              <p className="text-slate-600 font-medium">No registered businesses listed yet. Be the first to list your company!</p>
              <Link href="/register">
                <Button variant="primary" className="rounded-xl font-bold">Register Business Free</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. 12 JUMIA CATEGORIES — Clickable, with gradient icons
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-f8fafc py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="info" className="px-4">Shop By Category</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Marketplace Categories
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
              Click any category to instantly browse products from verified Ghanaian companies and contact sellers directly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {JUMIA_CATS.map(({ name, slug, Icon, color }) => (
              <Link key={slug} href={`/products?category=${encodeURIComponent(name)}`}>
                <div className="card-3d group flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-sea/40 shadow-sm hover:shadow-xl text-center cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-sea transition-colors leading-tight">
                    {name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. TRENDING PRODUCTS
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="success" className="mb-2">Direct Deals</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trending Products &amp; Deals
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Enquire directly on WhatsApp — no cart, no commission, no delay.
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2 rounded-xl shrink-0">
                View All Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {trendingProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {JUMIA_CATS.slice(0, 6).map(({ name, slug, Icon, color }) => (
                <Link key={slug} href={`/products?category=${encodeURIComponent(name)}`}>
                  <div className="card-3d group flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50 to-sky-50/30 rounded-2xl border border-slate-200 hover:border-sea/30 shadow-sm cursor-pointer">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-sea transition-colors">{name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tap to browse products →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
            <a href="tel:0545898775"
              className="flex items-center gap-2.5 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-7 py-4 rounded-2xl transition-all"
            >
              <Phone className="w-4 h-4 text-sea" />
              Call: 0545898775
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
