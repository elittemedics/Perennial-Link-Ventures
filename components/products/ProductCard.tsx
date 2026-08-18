'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatGHS } from '@/lib/utils';
import { Phone, MessageCircle, Building2 } from 'lucide-react';

export interface ProductItemProps {
  product: {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    image?: string | null;
    quantity?: number | null;
    whatsappPhone?: string | null;
    location?: string | null;
    business: { name: string; slug: string; phone: string; isVerified?: boolean; cityName?: string } | null;
  };
}

export default function ProductCard({ product }: ProductItemProps) {
  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  const trackView = () => {
    fetch(`/api/v1/products/${product.id}/view`, { method: 'POST', keepalive: true }).catch(() => null);
  };

  const sellerPhone = product.business?.phone || product.whatsappPhone;
  const formattedPhone = sellerPhone?.replace(/[^0-9+]/g, '');

  const content = (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full group">
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        <Image
          src={
            product.image ||
            'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'
          }
          alt={product.title}
          fill
          sizes="(max-width: 640px) 48vw, (max-width: 1024px) 25vw, 17vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md leading-tight shadow-sm">
            -{discount}%
          </span>
        )}
        {product.location && (
          <span className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            📍 {product.location}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug min-h-[2.2rem] group-hover:text-sea transition-colors">
          {product.title}
        </h3>

        {product.business ? (
          <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 line-clamp-1">
            <Building2 className="w-3 h-3 text-sea shrink-0" />
            <span>{product.business.name}</span>
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 font-medium">Individual Seller</p>
        )}

        <div className="mt-auto pt-1 flex items-baseline justify-between">
          <div>
            <p className="text-sm font-black text-slate-900">
              {product.price > 0 ? formatGHS(product.price) : 'Contact for price'}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[10px] text-slate-400 line-through">{formatGHS(product.originalPrice)}</p>
            )}
          </div>
        </div>

        {/* Clear Contact Button for Everyone */}
        {formattedPhone && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-xl py-1.5 px-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contact Seller</span>
          </div>
        )}
      </div>
    </article>
  );

  if (product.business) {
    return (
      <Link href={`/business/${product.business.slug}#products`} onClick={trackView} className="block group h-full">
        {content}
      </Link>
    );
  }

  return formattedPhone ? (
    <a
      href={`https://wa.me/${formattedPhone.replace(/^\+/, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackView}
      className="block group h-full"
      aria-label={`Contact seller about ${product.title}`}
    >
      {content}
    </a>
  ) : (
    <div className="group h-full">{content}</div>
  );
}
