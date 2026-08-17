'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, PhoneCall, ExternalLink } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    price: number;
    currency?: string;
    image?: string | null;
    whatsappPhone?: string | null;
    businessName: string;
    phone?: string;
  };
}

export default function WhatsAppModal({ isOpen, onClose, product }: WhatsAppModalProps) {
  const defaultPhone = product.whatsappPhone || product.phone || '0594772823';
  const cleanPhone = defaultPhone.replace(/[^0-9]/g, '');
  // Format international number for Ghana (233)
  const formattedWhatsApp = cleanPhone.startsWith('0')
    ? `233${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('233')
    ? cleanPhone
    : `233${cleanPhone}`;

  const [note, setNote] = useState('');

  const handleOpenWhatsApp = () => {
    const message = `Hello ${product.businessName},\n\nI am interested in buying/inquiring about the following product listed on Perennial Link Directory:\n\n*Product:* ${product.title}\n*Price:* GHS ${product.price.toFixed(2)}\n*Details Note:* ${note || 'Please confirm availability and delivery terms.'}\n\nThank you!`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${formattedWhatsApp}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Direct Inquiry & Order"
      description={`Contact ${product.businessName} directly via WhatsApp or Call.`}
    >
      <div className="space-y-4 pt-2">
        <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-3">
          {product.image && (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.title}</h4>
            <span className="text-sea font-black text-sm">{formatGHS(product.price)}</span>
          </div>
        </div>

        <Textarea
          label="Custom Note for Vendor (Optional)"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Do you have this item in stock? Can you deliver to Tuba/Weija or Accra?"
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full gap-2 py-3 rounded-xl shadow-md text-sm font-bold"
          >
            <MessageSquare className="w-4 h-4 fill-current" /> Order / Inquire via WhatsApp ({defaultPhone})
          </Button>

          <a href={`tel:${defaultPhone}`} className="w-full">
            <Button variant="outline" className="w-full gap-2 text-xs">
              <PhoneCall className="w-4 h-4 text-sea" /> Direct Phone Call ({defaultPhone})
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}
