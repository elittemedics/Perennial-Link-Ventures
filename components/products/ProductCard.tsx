'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatGHS } from '@/lib/utils';

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
    business: { name: string; slug: string; phone: string; isVerified?: boolean; cityName?: string } | null;
  };
}

export default function ProductCard({ product }: ProductItemProps) {
  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  const trackView = () => { fetch(`/api/v1/products/${product.id}/view`, { method: 'POST', keepalive: true }).catch(() => null); };
  const content = (
      <article className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full">
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
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-tight">
              -{discount}%
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-2 flex flex-col gap-0.5 flex-1">
          <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-tight min-h-[2rem]">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-1">
            <p className="text-sm font-extrabold text-slate-900">
              {product.price > 0 ? formatGHS(product.price) : 'Contact for price'}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[10px] text-slate-400 line-through">{formatGHS(product.originalPrice)}</p>
            )}
          </div>
        </div>
      </article>
  );

  if (product.business) {
    return <Link href={`/business/${product.business.slug}#products`} onClick={trackView} className="block group h-full">{content}</Link>;
  }

  const contact = product.whatsappPhone?.replace(/[^0-9+]/g, '');
  return contact ? (
    <a href={`tel:${contact}`} onClick={trackView} className="block group h-full" aria-label={`Call seller about ${product.title}`}>
      {content}
    </a>
  ) : <div className="group h-full">{content}</div>;
}
