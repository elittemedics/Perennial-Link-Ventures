import React from 'react';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import AdminListingsTable from './AdminListingsTable';

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage() {
  await requireAdmin();

  const listings = await db.business.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Badge variant="danger">Administration</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Manage Business Listings ({listings.length})</h1>
        <p className="text-slate-500 text-xs">Approve pending listings, verify businesses, or mark listings as featured.</p>
      </div>

      <AdminListingsTable initialListings={listings as any} />
    </div>
  );
}
