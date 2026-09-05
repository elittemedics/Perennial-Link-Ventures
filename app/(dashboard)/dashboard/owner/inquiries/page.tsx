import React from 'react';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Mail, Phone, Calendar, MessageSquare, Package, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// This route is authenticated and therefore cannot be prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function OwnerInquiriesPage() {
  const user = await requireAuth();

  const [inquiries, productMessages] = await Promise.all([
    db.inquiryMessage.findMany({
      where: { business: { ownerId: user.id } },
      include: { business: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.productMessage.findMany({
      where: {
        OR: [
          { product: { ownerId: user.id } },
          { product: { business: { ownerId: user.id } } },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true, email: true } },
        receiver: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Badge variant="info">Communication Inbox</Badge>
          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Customer Inquiries &amp; Messages ({inquiries.length + productMessages.length})
          </h1>
          <p className="text-slate-500 text-xs">
            Direct messages sent by potential clients viewing your business listing and products.
          </p>
        </div>
        <Link href="/account/messages">
          <Button variant="primary" size="sm" className="gap-2 text-xs font-bold shadow-sm">
            <MessageSquare className="w-4 h-4" /> Open Full Chat Inbox <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Product Messages Section */}
      {productMessages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-sea" /> Product Inquiries ({productMessages.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productMessages.map((pm) => (
              <Card key={pm.id} className="p-5 space-y-3 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                      {(pm.sender.name?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{pm.sender.name || 'Client'}</h4>
                      <p className="text-[10px] text-slate-400">{pm.sender.email || 'Verified user'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(pm.createdAt)}
                  </span>
                </div>

                {pm.product && (
                  <div className="bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sea shrink-0" />
                    <span className="truncate">{pm.product.title}</span>
                  </div>
                )}

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-line leading-relaxed">
                  {pm.message}
                </p>

                <div className="pt-1 flex justify-end">
                  <Link href="/account/messages">
                    <Button size="sm" variant="outline" className="text-xs font-bold text-sea hover:bg-sky-50">
                      Reply in Chat →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Listing Inquiries Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-sea" /> Listing Contact Forms ({inquiries.length})
        </h2>

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
    </div>
  );
}
