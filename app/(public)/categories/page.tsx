import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone, Tv, Laptop, Armchair, Refrigerator, Shirt,
  ShoppingCart, Gamepad2, Baby, Dumbbell, MoreHorizontal, HeartPulse,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Hardcoded Jumia categories as guaranteed fallback
const STATIC_CATEGORIES = [
  { name: 'Supermarket',      slug: 'Supermarket',      icon: 'ShoppingCart', description: 'Groceries, Beverages, Snacks, Food Staples, Household Cleaning Supplies.',       color: 'from-amber-500 to-orange-500', count: 0 },
  { name: 'Phones & Tablets', slug: 'Phones & Tablets', icon: 'Smartphone',   description: 'Smartphones, iPads, Tablets, Smartwatches, and Mobile Accessories.',           color: 'from-blue-500 to-sky-600',    count: 0 },
  { name: 'Health & Beauty',  slug: 'Health & Beauty',  icon: 'HeartPulse',   description: 'Skincare, Fragrances, Haircare, Makeup, Personal Grooming, and Oral Hygiene.', color: 'from-pink-500 to-rose-500',   count: 0 },
  { name: 'Home & Office',    slug: 'Home & Office',    icon: 'Armchair',     description: 'Furniture, Bedding, Kitchenware, Office Stationery, Lighting, and Decor.',      color: 'from-emerald-500 to-teal-600',count: 0 },
  { name: 'Appliances',       slug: 'Appliances',       icon: 'Refrigerator', description: 'Refrigerators, Washing Machines, Air Conditioners, and Microwaves.',            color: 'from-cyan-500 to-blue-600',   count: 0 },
  { name: 'Electronics',      slug: 'Electronics',      icon: 'Tv',           description: 'Smart TVs, Home Theatre Systems, Cameras, Audio Speakers, and Amplifiers.',    color: 'from-violet-500 to-purple-600',count: 0 },
  { name: 'Computing',        slug: 'Computing',        icon: 'Laptop',       description: 'Laptops, Desktop PCs, Monitors, Printers, Storage and Networking devices.',    color: 'from-indigo-500 to-blue-600', count: 0 },
  { name: 'Fashion',          slug: 'Fashion',          icon: 'Shirt',        description: 'Men & Women Clothing, Shoes, Watches, Designer Bags, and Jewelry.',            color: 'from-fuchsia-500 to-pink-600',count: 0 },
  { name: 'Sporting Goods',   slug: 'Sporting Goods',   icon: 'Dumbbell',     description: 'Fitness Equipment, Treadmills, Jerseys, Sports Wear, and Camping Gear.',       color: 'from-orange-500 to-red-500',  count: 0 },
  { name: 'Baby Products',    slug: 'Baby Products',    icon: 'Baby',         description: 'Diapers, Baby Food, Strollers, Car Seats, Baby Clothing, and Toys.',           color: 'from-sky-400 to-cyan-500',    count: 0 },
  { name: 'Gaming',           slug: 'Gaming',           icon: 'Gamepad2',     description: 'PlayStation 5, Xbox, Nintendo Switch, Gaming PCs, VR Headsets, Controllers.',  color: 'from-purple-600 to-indigo-600',count: 0 },
  { name: 'Other categories', slug: 'Other categories', icon: 'MoreHorizontal',description: 'Automotive, Industrial Equipment, Books, Musical Instruments, and more.',     color: 'from-slate-500 to-slate-600', count: 0 },
];

const IconMap: Record<string, React.ElementType> = {
  ShoppingCart, Smartphone, HeartPulse, Armchair, Refrigerator,
  Tv, Laptop, Shirt, Dumbbell, Baby, Gamepad2, MoreHorizontal,
};

export default async function CategoriesIndexPage() {
  let categories = STATIC_CATEGORIES;

  try {
    const dbCats = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { businesses: { where: { status: 'APPROVED' } } } } },
    });
    if (dbCats.length > 0) {
      categories = dbCats.map((c) => ({
        name:        c.name,
        slug:        c.name, // use name for product filter
        icon:        c.icon || 'MoreHorizontal',
        description: c.description || '',
        color:       STATIC_CATEGORIES.find((s) => s.name === c.name)?.color || 'from-slate-500 to-slate-600',
        count:       c._count.businesses,
      }));
    }
  } catch {
    // DB offline — use hardcoded fallback
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="info">Marketplace Categories</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Browse by Product Category
        </h1>
        <p className="text-slate-500 text-base">
          Click any category to browse products from verified Ghanaian businesses and contact sellers directly on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = IconMap[cat.icon] || MoreHorizontal;
          return (
            <Link key={cat.slug} href={`/products?category=${encodeURIComponent(cat.slug)}`}>
              <Card className="hover:border-sea hover:shadow-xl transition-all group p-6 space-y-4 h-full flex flex-col justify-between card-3d cursor-pointer">
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-sea transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sea">
                  {cat.count > 0
                    ? <span>{cat.count} Verified Business{cat.count !== 1 ? 'es' : ''}</span>
                    : <span>Tap to browse products</span>
                  }
                  <span className="group-hover:translate-x-1 transition-transform inline-block">Browse →</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
