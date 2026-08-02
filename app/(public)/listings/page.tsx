import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import db from '@/lib/db';
import { Search, MapPin, Star, ShieldCheck, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BusinessBrandFallback } from '@/components/common/BusinessBrandFallback';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    rating?: string;
    page?: string;
  }>;
}

export default async function ListingsPage(props: ListingsPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const categorySlug = searchParams.category || '';
  const city = searchParams.city || '';
  const minRating = parseFloat(searchParams.rating || '0');
  const page = parseInt(searchParams.page || '1');
  const limit = 9;
  const skip = (page - 1) * limit;

  let categories: any[] = [];
  let listings: any[] = [];
  let total = 0;

  try {
    const where: any = { status: 'APPROVED' };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { cityName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) where.category = { slug: categorySlug };
    if (city) where.cityName = { contains: city, mode: 'insensitive' };
    if (minRating > 0) where.avgRating = { gte: minRating };

    const res = await Promise.all([
      db.category.findMany({ orderBy: { name: 'asc' } }),
      db.business.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }],
        skip,
        take: limit,
      }),
      db.business.count({ where }),
    ]);

    categories = res[0];
    listings = res[1];
    total = res[2];
  } catch {
    // Database offline build fallback
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Directory</h1>
        <p className="text-slate-500 text-sm mt-1">
          Showing {total} verified business listings across Ghana
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
            <Filter className="w-5 h-5 text-sea" />
            <span>Filter Businesses</span>
          </div>

          <form action="/listings" method="GET" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Keyword Search
              </label>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Business name, service..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                defaultValue={categorySlug}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                defaultValue={city}
                placeholder="e.g. Tuba/Weija, Accra"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Minimum Rating
              </label>
              <select
                name="rating"
                defaultValue={minRating}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              >
                <option value="0">Any Rating</option>
                <option value="4.5">4.5+ Stars (Excellent)</option>
                <option value="4.0">4.0+ Stars (Good)</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full gap-2 mt-2">
              <Search className="w-4 h-4" />
              Apply Filters
            </Button>
          </form>
        </aside>

        {/* Listings Grid Results */}
        <main className="lg:col-span-3 space-y-6">
          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Business Listings Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                We couldn&apos;t find any businesses matching your filter criteria. Try adjusting your keywords or category.
              </p>
              <Link href="/listings">
                <Button variant="outline">Clear All Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {listings.map((b) => (
                <Card key={b.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      {b.coverImage ? <Image src={b.coverImage} alt={b.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> : <BusinessBrandFallback name={b.name} variant="cover" />}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="info" className="shadow-md">{b.category?.name}</Badge>
                        {b.isVerified && (
                          <Badge variant="success" className="gap-1 shadow-md">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        {b.logo ? (
                          <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                            <Image src={b.logo} alt={b.name} fill className="object-cover" />
                          </div>
                        ) : <BusinessBrandFallback name={b.name} className="w-10 h-10 text-xs shrink-0" />}
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-sea transition-colors line-clamp-1">
                            {b.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-sea shrink-0" />
                            <span>{b.cityName}</span>
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-xs text-slate-800">{b.avgRating?.toFixed(1) || '5.0'}</span>
                      <span className="text-[11px] text-slate-400">({b.totalReviews || 0})</span>
                    </div>

                    <Link href={`/business/${b.slug}`}>
                      <Button variant="primary" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={`/listings?q=${query}&category=${categorySlug}&city=${city}&rating=${minRating}&page=${page - 1}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/listings?q=${query}&category=${categorySlug}&city=${city}&rating=${minRating}&page=${page + 1}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
