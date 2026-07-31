import React from 'react';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ClientCategoryManager from './ClientCategoryManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { businesses: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Badge variant="danger">Administration</Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Taxonomy & Category Manager</h1>
        <p className="text-slate-500 text-xs">Manage directory sectors, icons, and display order.</p>
      </div>

      <ClientCategoryManager initialCategories={categories as any} />
    </div>
  );
}
