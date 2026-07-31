'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function ClientCategoryManager({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Building2');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon, description }),
      });

      const data = await readApiResponse<{ success?: boolean; error?: string; category?: any }>(res);
      if (res.ok && data.success) {
        setCategories([...categories, { ...data.category, _count: { businesses: 0 } }]);
        setName('');
        setDescription('');
        router.refresh();
      }
    } catch {
      null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Category Creation Form */}
      <Card className="p-6 h-fit space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create New Category</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hospitality & Events"
          />
          <Input
            label="Lucide Icon Name"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. Utensils, Laptop, Building2, Car"
          />
          <Textarea
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of businesses in this sector..."
          />
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full gap-2">
            <PlusCircle className="w-4 h-4" /> Add Category
          </Button>
        </form>
      </Card>

      {/* Category List */}
      <Card className="lg:col-span-2 p-6">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Existing Categories ({categories.length})
        </h3>
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{c.description || 'No description provided.'}</p>
                <span className="text-[11px] text-sea font-semibold">Icon: {c.icon}</span>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                {c._count.businesses} Listings
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
