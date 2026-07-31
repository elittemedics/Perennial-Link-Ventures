import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, CheckCircle, Clock, Star, Megaphone, Layers, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [totalListings, pendingCount, totalUsers, totalReviews, categoriesCount, adsCount] = await Promise.all([
    db.business.count(),
    db.business.count({ where: { status: 'PENDING' } }),
    db.user.count(),
    db.review.count(),
    db.category.count(),
    db.advertisement.count(),
  ]);

  const recentPendingListings = await db.business.findMany({
    where: { status: 'PENDING' },
    include: { owner: true, category: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Badge variant="danger" className="gap-1">
            <Shield className="w-3 h-3" /> System Super Administrator
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Admin Operations Center</h1>
          <p className="text-slate-500 text-xs">Perennial Link Directory management and moderation portal.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/listings">
            <Button variant="primary" size="sm" className="gap-2">
              <CheckCircle className="w-4 h-4" /> Pending Approvals ({pendingCount})
            </Button>
          </Link>
          <Link href="/dashboard/admin/categories">
            <Button variant="outline" size="sm" className="gap-2">
              <Layers className="w-4 h-4 text-sea" /> Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Listings</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalListings}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-sea">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider font-bold">Pending Review</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ad Campaigns</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{adsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Listings Quick Action Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">Listings Awaiting Approval</h3>
          <Link href="/dashboard/admin/listings" className="text-xs text-sea font-semibold hover:underline">
            Manage All Listings ({totalListings}) →
          </Link>
        </div>

        {recentPendingListings.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            🎉 All submitted business listings have been reviewed and processed!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPendingListings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{b.name}</td>
                    <td className="p-3 text-xs text-slate-600">{b.owner.name || b.owner.email}</td>
                    <td className="p-3 text-xs text-slate-600">{b.category.name}</td>
                    <td className="p-3 text-xs text-slate-600">{b.cityName}</td>
                    <td className="p-3 text-right">
                      <Link href="/dashboard/admin/listings">
                        <Button variant="primary" size="sm">Review Listing</Button>
                      </Link>
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
