import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import db from '@/lib/db';
import { MapPin, Star, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, slug: true, description: true },
  });

  if (!category) return { title: 'Category Not Found' };

  const title = `${category.name} Businesses in Ghana`;
  const description =
    category.description ||
    `Browse verified ${category.name} businesses in Ghana. Find contact details, WhatsApp numbers, and reviews for top ${category.name} providers.`;
  const canonicalUrl = `${baseUrl}/category/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} | Perennial Link Ventures`,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Perennial Link Ventures`,
      description,
    },
  };
}

export default async function CategoryDetailPage(props: CategoryPageProps) {
  const params = await props.params;

  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      businesses: {
        where: { status: 'APPROVED' },
        orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }],
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <Link href="/categories">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Button>
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-2">
        <Badge variant="info">Category</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900">{category.name}</h1>
        {category.description && <p className="text-slate-600 text-sm max-w-2xl">{category.description}</p>}
        <p className="text-xs font-semibold text-sea pt-2">
          {category.businesses.length} Active Verified Businesses
        </p>
      </div>

      {category.businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <p className="text-slate-500 text-sm">No businesses listed in this category yet.</p>
          <Link href="/register">
            <Button variant="primary">Be the First Business to List Here</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.businesses.map((b) => (
            <Card key={b.id} className="group hover:shadow-xl transition-all duration-300">
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={b.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'}
                  alt={b.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {b.isVerified && (
                  <Badge variant="success" className="absolute top-3 left-3 gap-1 shadow-md">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>

              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-sea transition-colors line-clamp-1">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sea shrink-0" />
                  <span>{b.cityName}, {b.address}</span>
                </p>
                <p className="text-slate-600 text-xs line-clamp-2">{b.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{b.avgRating.toFixed(1)}</span>
                  </div>
                  <Link href={`/business/${b.slug}`}>
                    <Button variant="primary" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
