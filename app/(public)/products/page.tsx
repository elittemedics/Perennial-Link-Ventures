import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import ProductCard from '@/components/products/ProductCard';
import { Search, Filter, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    business?: string;
  }>;
}

const JUMIA_CATEGORIES = [
  'Supermarket',
  'Phones & Tablets',
  'Health & Beauty',
  'Home & Office',
  'Appliances',
  'Electronics',
  'Computing',
  'Fashion',
  'Sporting Goods',
  'Baby Products',
  'Gaming',
  'Other categories',
];

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const selectedCategory = searchParams.category || '';
  const sort = searchParams.sort || 'newest';
  const businessSlug = searchParams.business || '';

  let products: any[] = [];

  try {
    const where: any = { isAvailable: true };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (selectedCategory) {
      where.productCategory = selectedCategory;
    }

    if (businessSlug) {
      where.business = { slug: businessSlug };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };

    products = await db.businessProduct.findMany({
      where,
      include: {
        business: {
          select: { name: true, slug: true, phone: true, isVerified: true, cityName: true },
        },
      },
      orderBy,
      take: query ? 100 : 40,
    });

    // Put the closest product-title matches first, like a marketplace search,
    // then use recency as the tie-breaker. Every matching seller remains visible.
    if (query && sort === 'newest') {
      const term = query.trim().toLocaleLowerCase();
      const relevance = (product: { title: string; description?: string | null }) => {
        const title = product.title.toLocaleLowerCase();
        const description = product.description?.toLocaleLowerCase() || '';
        if (title === term) return 4;
        if (title.startsWith(term)) return 3;
        if (title.includes(term)) return 2;
        return description.includes(term) ? 1 : 0;
      };
      products.sort((a, b) => relevance(b) - relevance(a) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      products = products.slice(0, 40);
    }
  } catch {
    // Fallback for offline DB
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-emerald-600 text-white border-none px-3 py-1">Perennial Link Marketplace</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Browse Products & Direct Deals</h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Contact business owners directly via WhatsApp or Phone without middleman fees.
          </p>
        </div>

        <Link href="/register">
          <Button variant="primary" size="lg" className="rounded-2xl gap-2 font-bold shadow-lg">
            <ShoppingBag className="w-5 h-5" /> Post Product for Free
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        
        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form action="/products" method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Keyword Search
              </label>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Product title, brand..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Category
              </label>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              >
                <option value="">All Categories</option>
                {JUMIA_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Sort Order
              </label>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full gap-2 font-bold py-2.5">
              <Search className="w-4 h-4" /> Filter Products
            </Button>
          </form>
        </div>

        {/* Product Grid Results (2 on Phone, 3 on Tablet, 5 on PC) */}
        <main className="space-y-6">
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                No items match your filter selection right now. Try searching with a different term.
              </p>
              <Link href="/products">
                <Button variant="outline">Reset Filters</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
