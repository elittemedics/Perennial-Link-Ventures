'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatGHS, formatWhatsAppNumber } from '@/lib/utils';
import { Building2, Eye, Images, Bookmark, BookmarkCheck, Truck, StoreIcon, MessageCircle } from 'lucide-react';
import ProductModal from '@/components/products/ProductModal';

export interface ProductItemProps {
  product: {
    id: string;
    title: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    image?: string | null;
    images?: { id?: string; url: string; sortOrder?: number }[];
    quantity?: number | null;
    whatsappPhone?: string | null;
    location?: string | null;
    productCategory?: string;
    hasDelivery?: boolean;
    deliveryRange?: string | null;
    business: {
      name: string;
      slug: string;
      phone: string;
      whatsapp?: string | null;
      isVerified?: boolean;
      cityName?: string;
    } | null;
  };
  directContact?: boolean;
  hideBusinessInfo?: boolean;
}

export default function ProductCard({ product, directContact = false, hideBusinessInfo = false }: ProductItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  useEffect(() => {
    fetch(`/api/v1/products/${product.id}/save`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSaved(d.saved); })
      .catch(() => null);
  }, [product.id]);

  const trackView = () => {
    fetch(`/api/v1/products/${product.id}/view`, { method: 'POST', keepalive: true }).catch(() => null);
  };

  const handleCardClick = () => {
    trackView();
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSavingLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${product.id}/save`, { method: 'POST' });
      const data = await res.json();
      if (data.success) setSaved(data.saved);
      else if (res.status === 401) window.location.href = '/login?next=' + window.location.pathname;
    } catch { /* silent */ }
    setSavingLoading(false);
  };

  const imageCount = product.images && product.images.length > 0 ? product.images.length : (product.image ? 1 : 0);

  const sellerPhone = product.whatsappPhone || product.business?.whatsapp || product.business?.phone;
  const formattedPhone = formatWhatsAppNumber(sellerPhone);
  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in buying "${product.title}" listed on Perennial Link Ventures.`
  );
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${whatsappMessage}`
    : '#';


  return (
    <>
      <article
        onClick={handleCardClick}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col h-full group cursor-pointer relative"
      >
        {/* Save/Bookmark Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={savingLoading}
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full shadow-md transition-all ${saved ? 'bg-amber-400 text-white' : 'bg-white/90 text-slate-500 hover:bg-amber-50 hover:text-amber-500'}`}
          aria-label={saved ? 'Unsave product' : 'Save product'}
          title={saved ? 'Saved!' : 'Save this product'}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Product Image Link */}
        <Link
          href={`/product/${product.id}`}
          onClick={trackView}
          className="block relative aspect-square bg-slate-50 overflow-hidden"
          title={`View details for ${product.title}`}
        >
          <Image
            src={
              product.image ||
              (product.images && product.images[0]?.url) ||
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'
            }
            alt={product.title}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md leading-tight shadow-sm z-10">
              -{discount}%
            </span>
          )}

          {imageCount > 1 && (
            <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 z-10 shadow-sm">
              <Images className="w-3 h-3 text-amber-300" /> {imageCount} photos
            </span>
          )}

          {product.location && (
            <span className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10">
              📍 {product.location}
            </span>
          )}

          {/* Quick Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-slate-900/85 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-300" /> View & Buy
            </span>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <Link
            href={`/product/${product.id}`}
            onClick={trackView}
            className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug min-h-[2.2rem] hover:text-sea transition-colors"
          >
            <h3>{product.title}</h3>
          </Link>

          {!hideBusinessInfo && (
            product.business ? (
              <Link
                href={`/business/${product.business.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 line-clamp-1 hover:text-sea transition-colors"
              >
                <Building2 className="w-3 h-3 text-sea shrink-0" />
                <span>{product.business.name}</span>
              </Link>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">Verified Seller</p>
            )
          )}

          {/* Delivery Badge */}
          {product.hasDelivery ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 w-fit">
              <Truck className="w-3 h-3" />
              {product.deliveryRange || 'Delivery available'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 w-fit">
              <StoreIcon className="w-3 h-3" /> Pickup only
            </span>
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

          {/* Action CTAs: Quick WhatsApp + Direct View & Buy link */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            {whatsappUrl !== '#' && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  trackView();
                }}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-emerald-600 rounded-xl py-2 px-2 hover:bg-emerald-500 transition-colors shadow-2xs"
                title="Chat directly on WhatsApp with seller"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <Link
              href={`/product/${product.id}`}
              onClick={trackView}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-sea hover:text-white rounded-xl py-2 px-2 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </article>

      {/* Enlarged Product Gallery Modal */}
      {isModalOpen && (
        <ProductModal
          product={product}
          directContact={directContact}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
