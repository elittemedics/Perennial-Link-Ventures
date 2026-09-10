import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { Search, ShoppingBag, Package, Phone, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

export interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    business?: string;
  }>;
}

export async function generateMetadata(props: ProductsPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';
  const query = searchParams.q?.trim() || '';
  const category = searchParams.category?.trim() || '';

  let title = 'Online Shopping & Marketplace — Buy Electronics, Phones, Laptops & Deals | Market PLV';
  let description =
    'Shop verified products directly from sellers on Market PLV. Browse laptops, phones, electronics, fashion, home appliances, and more with buyer protection and fast delivery.';

  if (query && category) {
    title = `Buy ${query} in ${category} Online — Best Prices | Market PLV`;
    description = `Find and buy ${query} in ${category} from verified sellers on Market PLV. Compare prices, chat on WhatsApp, and enjoy secure delivery.`;
  } else if (query) {
    title = `Buy ${query} Online — Best Deals & Verified Sellers | Market PLV`;
    description = `Looking for ${query}? Browse authentic listings with real photos and verified seller contacts on Market PLV.`;
  } else if (category) {
    title = `Buy ${category} Online — Best Deals & Verified Sellers | Market PLV`;
    description = `Explore top deals on ${category} on Market PLV. Connect with trusted sellers directly for quick orders and nationwide delivery.`;
  }

  const canonicalUrl = category
    ? `${baseUrl}/products?category=${encodeURIComponent(category)}`
    : `${baseUrl}/products`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Market PLV',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

const POPULAR_CATEGORIES = [
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
  'Cars & Vehicles',
  'Services',
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
        { business: { is: { OR: [
          { name: { contains: query, mode: 'insensitive' } }, { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } },
        ] } } },
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
        images: { orderBy: { sortOrder: 'asc' } },
        business: {
          select: { name: true, slug: true, phone: true, whatsapp: true, isVerified: true, cityName: true },
        },
      },
      orderBy,
      take: query ? 100 : 40,
    });

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: selectedCategory
      ? `Buy ${selectedCategory} Online | Market PLV`
      : 'Browse Products & Deals | Market PLV',
    description: 'Verified products available for direct purchase from trusted sellers on Market PLV.',
    numberOfItems: products.length,
    itemListElement: products.map((prod, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: prod.title,
      url: `${baseUrl}/product/${prod.id}`,
      image: prod.images?.[0]?.url || prod.image || undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-emerald-600 text-white border-none px-3 py-1">Market PLV Verified Marketplace</Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Browse Products & Direct Deals</h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Connect directly with verified sellers via WhatsApp or phone. Secure deals and fast delivery.
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
                  placeholder="Product, company, phone, email..."
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
                  {POPULAR_CATEGORIES.map((cat) => (
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
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full font-bold gap-2">
              <Search className="w-4 h-4" /> Filter Products
            </Button>
          </form>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              We couldn&apos;t find any products matching your search criteria. Try clearing filters or searching for something else.
            </p>
            <Link href="/products">
              <Button variant="ghost" className="font-bold text-sea">Clear Filters</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
    </>
  );
}
