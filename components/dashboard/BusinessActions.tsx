'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { readApiResponse } from '@/lib/api-client';

interface BusinessActionsProps {
  businessId: string;
  businessSlug: string;
}

export function BusinessActions({ businessId, businessSlug }: BusinessActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/businesses/${businessId}`, {
        method: 'DELETE',
      });
      const data = await readApiResponse<{ success: boolean; error?: string }>(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete business');
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error deleting business');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Link href={`/business/${businessSlug}`}>
        <Button variant="outline" size="sm" title="View Public Profile">
          <Eye className="w-4 h-4 text-slate-500" />
        </Button>
      </Link>
      <Link href={`/dashboard/owner/listings/${businessId}/edit`}>
        <Button variant="outline" size="sm" title="Edit Business">
          <Pencil className="w-4 h-4 text-sea" />
        </Button>
      </Link>
      
      {showConfirm ? (
        <div className="flex items-center gap-2 bg-rose-50 p-1 rounded-md border border-rose-200">
          <span className="text-xs font-semibold text-rose-700 px-2">Sure?</span>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting} className="h-7 px-2 text-xs">
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)} disabled={isDeleting} className="h-7 px-2 text-xs text-slate-600">
            No
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" title="Delete Business" onClick={() => setShowConfirm(true)} className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
