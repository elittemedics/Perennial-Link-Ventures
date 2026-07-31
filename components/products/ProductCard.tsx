'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, PhoneCall, Tag, ShieldCheck, ExternalLink } from 'lucide-react';
import { formatGHS } from '@/lib/utils';
import WhatsAppModal from './WhatsAppModal';

export interface ProductItemProps {
  product: {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    currency?: string;
    image?: string | null;
    quantity?: number | null;
    location?: string | null;
    whatsappPhone?: string | null;
    productCategory: string;
    business: {
      name: string;
      slug: string;
      phone: string;
      isVerified?: boolean;
      cityName?: string;
    };
  };
}

export default function ProductCard({ product }: ProductItemProps) {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const discount = product.discountPercentage || (
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null
  );

  return (
    <>
      <Card className="hover-card-elevate group rounded-2xl bg-white border-slate-200 overflow-hidden flex flex-col justify-between">
        <div>
          {/* Image & Badges Container */}
          <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden">
            <Image
              src={product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            
            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
              {discount && (
                <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-md animate-pulse">
                  -{discount}% OFF
                </span>
              )}
              <Badge variant="info" className="text-[10px] backdrop-blur bg-slate-900/70 text-white border-none">
                {product.productCategory}
              </Badge>
            </div>

            {product.business.isVerified && (
              <div className="absolute top-2.5 right-2.5 z-10">
                <Badge variant="success" className="gap-1 text-[10px] shadow-md bg-emerald-600 text-white border-none">
                  <ShieldCheck className="w-3 h-3" /> Verified Vendor
                </Badge>
              </div>
            )}
          </div>

          {/* Product Details Content */}
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <Link href={`/business/${product.business.slug}`} className="font-semibold text-sea hover:underline line-clamp-1">
                Vendor: {product.business.name}
              </Link>
              {(product.location || product.business.cityName) && (
                <span className="text-slate-500">📍 {product.location || product.business.cityName}</span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-sea transition-colors">
              {product.title}
            </h3>

            {product.description && (
              <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity / Availability Tag */}
            {product.quantity !== undefined && product.quantity !== null && (
              <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                📦 {product.quantity > 0 ? `${product.quantity} in stock` : 'Available on request'}
              </div>
            )}

            {/* Price section */}
            <div className="pt-1 flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">
                {formatGHS(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {formatGHS(product.originalPrice)}
                </span>
              )}
            </div>
          </CardContent>
        </div>

        {/* Action Buttons & Notice */}
        <div className="p-4 pt-0 space-y-2">
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 text-center font-medium">
            Contact owner directly to purchase:
          </div>
          <Button
            type="button"
            onClick={() => setIsWhatsAppOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs py-2.5 rounded-xl shadow-md"
          >
            <MessageSquare className="w-4 h-4 fill-current" /> Contact Owner via WhatsApp / Call
          </Button>
        </div>
      </Card>

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        product={{
          title: product.title,
          price: product.price,
          image: product.image,
          whatsappPhone: product.whatsappPhone,
          businessName: product.business.name,
          phone: product.business.phone,
        }}
      />
    </>
  );
}
