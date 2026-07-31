import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Eye, MessageSquare, PlusCircle, Star, ArrowRight, Package } from 'lucide-react';
import { BusinessActions } from '@/components/dashboard/BusinessActions';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const user = await requireAuth();

  const [businesses, inquiriesCount, reviewsCount] = await Promise.all([
    db.business.findMany({
      where: { ownerId: user.id },
      include: { category: true, _count: { select: { reviews: true, inquiries: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.inquiryMessage.count({
      where: { business: { ownerId: user.id } },
    }),
    db.review.count({
      where: { business: { ownerId: user.id } },
    }),
  ]);

  const totalViews = businesses.reduce((acc, b) => acc + b.viewCount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Badge variant="info">Business Owner Portal</Badge>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">Welcome back, {user.name}</h1>
          <p className="text-slate-500 text-xs">Manage your business listings, inquiries, and customer feedback.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/owner/products">
            <Button variant="outline" className="gap-2 border-sea text-sea hover:bg-brand-50">
              <Package className="w-4 h-4" /> Manage Products
            </Button>
          </Link>
          <Link href="/dashboard/owner/listings/new">
            <Button variant="primary" className="gap-2 shadow-md">
              <PlusCircle className="w-4 h-4" /> Add New Business
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Listings</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{businesses.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-sea">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Views</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalViews}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inquiries</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{inquiriesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviews</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{reviewsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Business Listings Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Your Business Listings</h3>
          <Link href="/dashboard/owner/inquiries" className="text-xs text-sea font-semibold hover:underline">
            View Inquiries Inbox ({inquiriesCount}) →
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">You haven&apos;t created any business listings yet.</p>
            <Link href="/dashboard/owner/listings/new">
              <Button variant="primary" size="sm">Create First Business Profile</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{b.name}</td>
                    <td className="p-3 text-xs text-slate-600">{b.category.name}</td>
                    <td className="p-3 text-xs text-slate-600">{b.cityName}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          b.status === 'APPROVED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'danger'
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs font-semibold text-amber-600">★ {b.avgRating.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <BusinessActions businessId={b.id} businessSlug={b.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
