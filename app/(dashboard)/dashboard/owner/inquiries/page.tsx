import React from 'react';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// This route is authenticated and therefore cannot be prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function OwnerInquiriesPage() {
  const user = await requireAuth();

  const inquiries = await db.inquiryMessage.findMany({
    where: { business: { ownerId: user.id } },
    include: { business: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Badge variant="info">Communication Inbox</Badge>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Customer Inquiries ({inquiries.length})</h1>
        <p className="text-slate-500 text-xs">Direct messages sent by potential clients viewing your business listing.</p>
      </div>

      {inquiries.length === 0 ? (
        <Card className="p-12 text-center text-slate-500">
          No inquiries received yet. Direct customer messages will appear here.
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id} className="p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{inq.subject}</h3>
                  <span className="text-xs text-sea font-semibold">Listing: {inq.business.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(inq.createdAt)}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {inq.message}
              </div>

              <div className="flex flex-wrap items-center justify-between pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    From: {inq.senderName}
                  </span>
                  <a href={`mailto:${inq.senderEmail}`} className="flex items-center gap-1 text-sea hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {inq.senderEmail}
                  </a>
                  {inq.senderPhone && (
                    <a href={`tel:${inq.senderPhone}`} className="flex items-center gap-1 text-sea hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {inq.senderPhone}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
