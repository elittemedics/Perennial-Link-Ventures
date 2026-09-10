import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { Search, Building2, Package, MapPin, Phone, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessBrandFallback } from '@/components/common/BusinessBrandFallback';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Products & Businesses',
  description: 'Search for products, verified businesses, suppliers, and local services on Market PLV.',
  // Dynamic search result URLs are user-generated query pages; they index
  // poorly and waste crawl budget, so we keep them out of the index.
  robots: { index: false, follow: true },
};

export interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q || '').trim();

  let products: any[] = [];
  let businesses: any[] = [];

  if (query) {
    try {
      const [prodRes, bizRes] = await Promise.all([
        db.businessProduct.findMany({
          where: {
            isAvailable: true,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { productCategory: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
              { business: { is: { name: { contains: query, mode: 'insensitive' } } } },
            ],
          },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            business: {
              select: { name: true, slug: true, phone: true, whatsapp: true, isVerified: true, cityName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 40,
        }),
        db.business.findMany({
          where: {
            status: 'APPROVED',
            deletedAt: null,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { tagline: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { cityName: { contains: query, mode: 'insensitive' } },
              { category: { is: { name: { contains: query, mode: 'insensitive' } } } },
            ],
          },
          include: {
            category: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

      products = prodRes;
      businesses = bizRes;
    } catch {
      // Offline fallback
    }
  }

  const totalResults = products.length + businesses.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
          <Search className="w-4 h-4" /> Marketplace Search Engine
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          {query ? `Search results for "${query}"` : 'Search Marketplace & Directory'}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
          {query
            ? `Found ${totalResults} matching result${totalResults === 1 ? '' : 's'} across product deals and verified business profiles.`
            : 'Type any product name, business category, phone number, or city to find matching deals.'}
        </p>

        {/* Header Search Form */}
        <form action="/search" method="GET" className="max-w-2xl pt-2">
          <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-200" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products, businesses, services..."
                className="w-full pl-10 pr-4 py-3 bg-white/15 text-white placeholder-sky-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
              />
            </div>
            <Button type="submit" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 shrink-0">
              Search
            </Button>
          </div>
        </form>
      </div>

      {!query ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Start Your Search</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Enter a search term above to discover products and verified businesses across Ghana.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No Matches Found for &quot;{query}&quot;</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            We couldn&apos;t find any products or businesses matching your exact query. Try searching for a broader term like &quot;Phones&quot; or &quot;Electronics&quot;.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/products">
              <Button variant="outline" className="font-bold">Browse All Products</Button>
            </Link>
            <Link href="/listings">
              <Button variant="primary" className="font-bold">Browse Business Directory</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Matching Products Section */}
          {products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-sea" /> Matching Products ({products.length})
                </h2>
                <Link href={`/products?q=${encodeURIComponent(query)}`} className="text-xs font-bold text-sea hover:underline flex items-center gap-1">
                  View all in Marketplace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}

          {/* Matching Businesses Section */}
          {businesses.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-sea" /> Verified Businesses ({businesses.length})
                </h2>
                <Link href={`/listings?q=${encodeURIComponent(query)}`} className="text-xs font-bold text-sea hover:underline flex items-center gap-1">
                  View all Directory Listings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/business/${biz.slug}`}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      {biz.logo ? (
                        <img src={biz.logo} alt={biz.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <BusinessBrandFallback name={biz.name} className="w-14 h-14 rounded-xl shrink-0" />
                      )}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-base truncate group-hover:text-sea transition-colors">
                            {biz.name}
                          </h3>
                          {biz.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        {biz.category && (
                          <span className="text-[11px] font-bold text-sea bg-sky-50 px-2 py-0.5 rounded-md inline-block">
                            {biz.category.name}
                          </span>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-1">{biz.tagline || biz.address}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {biz.cityName}
                      </span>
                      <span className="font-bold text-sea group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Profile →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
