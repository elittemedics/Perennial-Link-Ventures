import React from 'react';
import Link from 'next/link';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LocationsPage() {
  // Aggregate businesses by city
  const businesses = await db.business.findMany({
    where: { status: 'APPROVED' },
    select: { cityName: true },
  });

  const cityCounts: Record<string, number> = {};
  businesses.forEach((b) => {
    if (b.cityName) cityCounts[b.cityName] = (cityCounts[b.cityName] || 0) + 1;
  });

  const cities = Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <Badge variant="info">Geographic Directory</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Explore Businesses by Location</h1>
        <p className="text-slate-500 text-base">
          Find verified companies, shops, and services operating in your city or region in Ghana.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(({ city, count }) => (
          <Link key={city} href={`/listings?city=${encodeURIComponent(city)}`}>
            <Card className="p-6 hover:border-sea hover:shadow-lg transition-all group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-sea" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-sea transition-colors">
                    {city}
                  </h3>
                  <span className="text-slate-500 text-xs">{count} Verified Listing{count > 1 ? 's' : ''}</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sea group-hover:translate-x-1 transition-all" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
