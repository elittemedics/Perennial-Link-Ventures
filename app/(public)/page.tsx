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
import { BusinessBrandFallback } from '@/components/common/BusinessBrandFallback';

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
  // Kept empty while the homepage focuses on businesses and category discovery.
  const trendingProducts: any[] = [];
  let recentBusinesses: any[] = [];
  let totalBusinesses = 0;
  let totalReviews = 0;

  try {
    const res = await Promise.all([
      db.business.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        take: 6,
        include: {
          category: { select: { name: true, slug: true, icon: true } },
          _count: { select: { reviews: true, favorites: true } },
          products: {
            where: { isAvailable: true },
            take: 2,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, price: true, currency: true, image: true },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      db.business.count({ where: { status: 'APPROVED' } }),
      db.review.count({ where: { isApproved: true } }),
    ]);
    recentBusinesses  = res[0];
    totalBusinesses   = res[1];
    totalReviews      = res[2];
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
                    "A Global Business Marketplace & Directory",
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
              <form action="/listings" method="GET"
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
            <div className="order-last lg:order-none flex w-full flex-col items-center justify-center relative animate-slide-right mt-8 lg:mt-0">
              {/* Decorative rings */}
              <div className="absolute w-[260px] sm:w-[380px] lg:w-[420px] h-[220px] sm:h-[280px] lg:h-[420px] rounded-full border border-white/10 animate-pulse-glow" />
              <div className="absolute w-[210px] sm:w-[310px] lg:w-[340px] h-[180px] sm:h-[240px] lg:h-[340px] rounded-full border border-white/15 animate-float-slow" style={{ animationDelay: '1s' }} />
              <div className="absolute w-[180px] sm:w-[240px] lg:w-[260px] h-[160px] sm:h-[210px] lg:h-[260px] rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 blur-xl" />

              {/* Hero Person Image */}
              <div className="hero-image-3d relative z-10 w-full max-w-[280px] sm:max-w-[420px] lg:max-w-[340px] h-[210px] sm:h-[280px] lg:h-[420px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <Image
                  src="/images/hero-handshake.jpg"
                  alt="Professional business handshake on Perennial Link"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 280px, (max-width: 1023px) 420px, 340px"
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
              <div className="hidden lg:block absolute top-2 left-0 sm:-left-6 glass-dark rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-white/10 card-3d">
                <p className="text-xl sm:text-2xl font-black text-white">500+</p>
                <p className="text-[9px] sm:text-[10px] text-sky-300 font-semibold uppercase tracking-wider">Verified Vendors</p>
              </div>
              <div className="hidden lg:block absolute bottom-2 right-0 sm:bottom-6 sm:-right-8 glass-dark rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-white/10 card-3d">
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
              { end: 190, suffix: '+', label: 'Countries Available' },
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
                Businesses &amp; Their Latest Offers
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1.5">
                Browse a company first, then preview the products it has just added—all in one clear marketplace flow.
              </p>
            </div>
            <Link href="/listings">
              <Button variant="outline" className="gap-2 rounded-xl shrink-0 font-bold">
                View Full Directory <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentBusinesses.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {recentBusinesses.map((biz) => (
                <div key={biz.id} className="card-3d group bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {biz.coverImage || biz.logo ? (
                      <Image
                        src={biz.coverImage || biz.logo}
                        alt={biz.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : <BusinessBrandFallback name={biz.name} variant="cover" />}
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
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-sea transition-colors leading-snug">
                        {biz.name}
                      </h3>
                      {biz.tagline && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">"{biz.tagline}"</p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {biz.avgRating || '5.0'} ({biz.totalReviews || 12})
                      </span>
                      <span>{biz.cityName || 'Accra'}, Ghana</span>
                    </div>
                    {biz.products.length > 0 ? (
                      <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Latest from this business</p>
                        {biz.products.map((product: { id: string; title: string; price: number; currency: string; image: string | null }) => (
                          <Link key={product.id} href={`/products?business=${biz.slug}`} className="flex items-center gap-2 rounded-xl bg-white p-2 transition-colors hover:bg-gold-50">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              {product.image ? <Image src={product.image} alt="" fill sizes="36px" className="object-cover" /> : null}
                            </div>
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">{product.title}</span>
                            <span className="text-xs font-black text-navy">{product.currency === 'GHS' ? 'GH₵' : `${product.currency} `}{product.price.toLocaleString()}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">This business has not added products yet.</p>
                    )}
                    <Link href={`/business/${biz.slug}`} className="block pt-1">
                      <Button variant="secondary" className="w-full rounded-xl font-bold gap-2 group-hover:bg-sea group-hover:text-white transition-colors">
                        View business &amp; contact <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. 12 JUMIA CATEGORIES — Clickable, with gradient icons
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-f8fafc py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="space-y-3">
              <Badge variant="info" className="px-4">Shop By Category</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Explore Marketplace Categories
              </h2>
              <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
                Find products from verified Ghanaian companies by category, then contact the seller directly.
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="shrink-0 gap-2 rounded-xl font-bold">
                View All Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 sm:p-4">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {JUMIA_CATS.map(({ name, slug, Icon, color }) => (
              <Link key={slug} href={`/products?category=${encodeURIComponent(name)}`}>
                <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-gold-50 hover:shadow-sm sm:px-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex-1 text-left text-sm font-bold text-slate-700 group-hover:text-navy transition-colors">
                    {name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-gold-600" />
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. TRENDING PRODUCTS
         ═══════════════════════════════════════════════════════════ */}
      {/* Product browsing continues through the marketplace link above. */}
      <section className="hidden bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2 rounded-xl shrink-0">
                View All Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
