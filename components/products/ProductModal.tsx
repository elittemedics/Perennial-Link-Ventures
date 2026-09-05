'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, MessageCircle, Phone, Building2, MapPin, Tag, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatGHS } from '@/lib/utils';

export interface ProductModalProps {
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
    business: {
      name: string;
      slug: string;
      phone: string;
      whatsapp?: string | null;
      isVerified?: boolean;
      cityName?: string;
    } | null;
  } | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  // Extract all images (up to 4)
  const allImages = (product.images && product.images.length > 0)
    ? product.images.map((img) => img.url)
    : product.image
    ? [product.image]
    : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImageUrl = allImages[activeImageIndex] || allImages[0];

  const sellerPhone = product.whatsappPhone || product.business?.whatsapp || product.business?.phone;
  const formattedPhone = sellerPhone?.replace(/[^0-9+]/g, '');

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const whatsappMessage = encodeURIComponent(`Hi, I am interested in buying "${product.title}" listed on Perennial Link Ventures.`);
  const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone.replace(/^\+/, '')}?text=${whatsappMessage}` : '#';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors shadow-lg"
          aria-label="Close Product Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery Viewer */}
        <div className="bg-slate-900 p-6 flex flex-col justify-between relative min-h-[320px] md:min-h-[460px]">
          {/* Main Large Image */}
          <div className="relative flex-1 w-full aspect-square md:aspect-auto rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
            <Image
              src={activeImageUrl}
              alt={product.title}
              fill
              priority
              className="object-contain p-2"
            />

            {/* Discount Badge */}
            {discount && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                -{discount}% OFF
              </span>
            )}

            {/* Navigation Arrows for Multiple Images */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-md transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery Row (Up to 4 Images) */}
          {allImages.length > 1 && (
            <div className="flex gap-2 justify-center pt-4">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === index ? 'border-amber-400 scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={imgUrl} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Direct Seller Contact */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-4">
            {/* Category & Location */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {product.productCategory && (
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sea font-bold border border-sky-100 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {product.productCategory}
                </span>
              )}
              {product.location && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {product.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {product.title}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950">
                {product.price > 0 ? formatGHS(product.price) : 'Contact Seller for Price'}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm font-semibold text-slate-400 line-through">
                  {formatGHS(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Business / Seller Profile Link */}
            {product.business ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sea/10 flex items-center justify-center text-sea">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900">{product.business.name}</span>
                      {product.business.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {product.business.cityName ? `Based in ${product.business.cityName}` : 'Verified Business Listing'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/business/${product.business.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-sea hover:underline hover:text-sky-700 shrink-0"
                >
                  View Profile →
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 font-medium">
                Direct Listing by Individual Seller
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-1 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto pr-1">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons: Direct WhatsApp & Call Seller */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {formattedPhone ? (
              <>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`tel:${formattedPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Call Seller ({sellerPhone})</span>
                </a>
              </>
            ) : (
              <p className="text-xs font-semibold text-slate-500 text-center">
                Contact information available on business profile.
              </p>
            )}

            {/* Safety & Security Tips */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1.5 mt-3">
              <p className="font-extrabold flex items-center gap-1.5 text-amber-950 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Safety & Security Tips
              </p>
              <ul className="space-y-1 text-[10.5px] leading-snug list-disc pl-4 text-amber-900/90 font-medium">
                <li>When meeting in person, choose a safe and public location.</li>
                <li>If an item is being delivered, confirm the delivery details and recipient before making payment.</li>
                <li>Carefully inspect the item upon delivery or collection to ensure it matches the description and your expectations.</li>
                <li>Before accepting a package, make sure it contains the same item you agreed to purchase.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
