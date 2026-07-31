'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Star, ShieldCheck, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface BusinessItem {
  id: string;
  name: string;
  slug: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isFeatured: boolean;
  isVerified: boolean;
  cityName: string;
  category: { name: string };
  owner: { name: string | null; email: string };
}

export default function AdminListingsTable({ initialListings }: { initialListings: BusinessItem[] }) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (id: string, status: string, rejectionReason?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: status as any } : item))
        );
        setRejectModalId(null);
        setReason('');
        router.refresh();
      }
    } catch {
      null;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlag = async (id: string, field: 'isFeatured' | 'isVerified', currentValue: boolean) => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, [field]: !currentValue } : item))
        );
        router.refresh();
      }
    } catch {
      null;
    }
  };

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-100">
            <tr>
              <th className="p-4">Business Name</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Flags</th>
              <th className="p-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-900">{b.name}</td>
                <td className="p-4 text-xs text-slate-600">{b.owner.name || b.owner.email}</td>
                <td className="p-4 text-xs text-slate-600">{b.category.name}</td>
                <td className="p-4 text-xs text-slate-600">{b.cityName}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      b.status === 'APPROVED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'danger'
                    }
                  >
                    {b.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFlag(b.id, 'isFeatured', b.isFeatured)}
                      className={`p-1 rounded-md border text-xs font-semibold flex items-center gap-1 ${
                        b.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </button>
                    <button
                      onClick={() => toggleFlag(b.id, 'isVerified', b.isVerified)}
                      className={`p-1 rounded-md border text-xs font-semibold flex items-center gap-1 ${
                        b.isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/business/${b.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="p-1.5">
                      <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                  </Link>

                  {b.status !== 'APPROVED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateStatus(b.id, 'APPROVED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                  )}

                  {b.status !== 'REJECTED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectModalId(b.id)}
                      className="gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectModalId}
        onClose={() => setRejectModalId(null)}
        title="Reject Business Listing"
        description="Provide a reason for rejecting this business listing. The owner will be notified."
      >
        <div className="space-y-4 pt-2">
          <Textarea
            label="Rejection Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invalid contact phone number or incomplete business description."
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setRejectModalId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isLoading}
              onClick={() => rejectModalId && updateStatus(rejectModalId, 'REJECTED', reason)}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
