import React from 'react';
import Link from 'next/link';
import { requireBusinessOwner } from '@/lib/auth';
import db from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Building2, ShoppingBag, Phone, MapPin, Eye, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OwnerListingsPage() {
  const user = await requireBusinessOwner();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id, deletedAt: null },
    include: {
      category: true,
      products: { where: { isAvailable: true }, orderBy: { createdAt: 'desc' } },
      _count: { select: { reviews: true, businessViews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div>
          <Badge className="bg-sea text-white border-none mb-2">Vendor Portal</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Your Business &amp; Products</h1>
          <p className="text-slate-300 text-sm mt-1">
            Update your business details, manage uploaded company images, and add unlimited products.
          </p>
        </div>
        <Link href="/dashboard/owner/listings/new">
          <Button variant="primary" size="lg" className="rounded-2xl gap-2 font-bold shadow-lg">
            <Plus className="w-5 h-5" /> Add New Business
          </Button>
        </Link>
      </div>

      {/* Business Listings */}
      {businesses.length === 0 ? (
        <Card className="p-12 text-center space-y-4 rounded-3xl border-dashed border-2">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">No Businesses Registered Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You haven&apos;t listed your company or store on Perennial Link yet. Register your business to start showcasing products to thousands of buyers.
          </p>
          <Link href="/dashboard/owner/listings/new">
            <Button variant="primary" className="rounded-xl font-bold">List Your Business Now</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {businesses.map((biz) => (
            <Card key={biz.id} className="rounded-3xl border-slate-200 shadow-md overflow-hidden p-6 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-xl text-sea shrink-0">
                    {biz.logo ? (
                      <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                    ) : (
                      biz.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900">{biz.name}</h2>
                      <Badge variant={biz.status === 'APPROVED' ? 'success' : 'warning'}>
                        {biz.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sea" /> {biz.cityName}, Ghana</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {biz.phone}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-sky-600" /> {biz.viewCount} views</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link href={`/business/${biz.slug}`}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 font-bold">
                      <ExternalLink className="w-4 h-4" /> View Live Page
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Business Products Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-sea" /> Products &amp; Catalog ({biz.products.length})
                  </h3>
                </div>

                {biz.products.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500">No products added for this business yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {biz.products.map((prod) => (
                      <div key={prod.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="relative h-28 rounded-xl bg-slate-200 overflow-hidden">
                          {prod.image && <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />}
                        </div>
                        <p className="font-bold text-slate-900 truncate">{prod.title}</p>
                        <p className="font-extrabold text-sea">GHS {prod.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
