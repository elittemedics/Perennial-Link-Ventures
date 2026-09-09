import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import db from '@/lib/db';
import {
  MapPin, Phone, Mail, Globe, Star, ShieldCheck, Clock, Building2,
  Package, MessageCircle, Tag, Truck, StoreIcon, ArrowLeft,
  ChevronRight, Share2, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatGHS, formatDate, formatWhatsAppNumber, truncate } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import ProductGalleryViewer from './ProductGalleryViewer';

export const dynamic = 'force-dynamic';

export interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  const product = await db.businessProduct.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      business: { select: { name: true, slug: true, cityName: true } },
    },
  });

  if (!product) {
    return { title: 'Product Not Found | Perennial Link Ventures' };
  }

  const locationName = product.location || product.business?.cityName || 'Ghana';
  const title = `Buy ${product.title} in ${locationName} - ${formatGHS(product.price)} | Perennial Link`;
  const description = product.description
    ? truncate(product.description, 155)
    : `Buy ${product.title} online for ${formatGHS(product.price)} in ${locationName}, Ghana. Contact seller directly on WhatsApp or phone.`;

  const canonicalUrl = `${baseUrl}/product/${product.id}`;
  const ogImage =
    (product.images && product.images[0]?.url) ||
    product.image ||
    `${baseUrl}/og-image.png`;

  const categoryName = product.productCategory || 'General';

  return {
    title,
    description,
    keywords: [
      product.title,
      `buy ${product.title}`,
      `buy ${product.title} Ghana`,
      `${product.title} price Accra`,
      `${product.title} ${locationName}`,
      `buy ${categoryName} online Ghana`,
      'buy hp laptop Ghana',
      'buy macbook online Ghana',
      'online shopping Ghana',
      'verified sellers Ghana',
      product.business?.name ?? '',
    ].filter(Boolean),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const params = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await db.businessProduct.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            whatsapp: true,
            email: true,
            isVerified: true,
            cityName: true,
            address: true,
            logo: true,
          },
        },
      },
    });

    if (product) {
      relatedProducts = await db.businessProduct.findMany({
        where: {
          id: { not: product.id },
          isAvailable: true,
          productCategory: product.productCategory || undefined,
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          business: { select: { name: true, slug: true, phone: true, whatsapp: true, isVerified: true, cityName: true } },
        },
        take: 6,
      });
    }
  } catch {
    // Database fallback
  }

  if (!product) {
    notFound();
  }

  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img: any) => img.url)
      : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'];

  const sellerPhone = product.whatsappPhone || product.business?.whatsapp || product.business?.phone;
  const formattedWhatsApp = formatWhatsAppNumber(sellerPhone);
  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in buying "${product.title}" (${formatGHS(product.price)}) listed on Perennial Link Ventures.`
  );
  const whatsappUrl = formattedWhatsApp
    ? `https://wa.me/${formattedWhatsApp}?text=${whatsappMessage}`
    : '#';

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  // ── Schema.org Product JSON-LD ──
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: allImages,
    description: product.description || product.title,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: 'GHS',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.business?.name || 'Verified Seller',
      },
    },
  };

  // ── BreadcrumbList JSON-LD ──
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${baseUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.productCategory || 'Catalog',
        item: `${baseUrl}/products?category=${encodeURIComponent(product.productCategory || '')}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.title,
        item: `${baseUrl}/product/${product.id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-slate-50 min-h-screen pb-16">
        
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-slate-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-sea transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <Link href="/products" className="hover:text-sea transition-colors">Products</Link>
              {product.productCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <Link href={`/products?category=${encodeURIComponent(product.productCategory)}`} className="hover:text-sea transition-colors">
                    {product.productCategory}
                  </Link>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Product Images Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <ProductGalleryViewer images={allImages} title={product.title} discount={discount} />
            </div>

            {/* Right: Product Details & Seller Action Card */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
                
                {/* Category & Location Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {product.productCategory && (
                    <Badge variant="info" className="px-3 py-1 text-xs gap-1">
                      <Tag className="w-3 h-3" /> {product.productCategory}
                    </Badge>
                  )}
                  {product.location && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {product.location}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Pricing Block */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between gap-4">
                  <div>
                    <span className="text-3xl font-black text-slate-950">
                      {product.price > 0 ? formatGHS(product.price) : 'Contact for Price'}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="ml-3 text-sm font-semibold text-slate-400 line-through">
                        {formatGHS(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount && (
                    <Badge variant="warning" className="text-xs font-extrabold px-3 py-1">
                      Save {discount}%
                    </Badge>
                  )}
                </div>

                {/* Delivery Information */}
                <div className="flex items-center gap-2 pt-1">
                  {product.hasDelivery ? (
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {product.deliveryRange ? `Delivery: ${product.deliveryRange}` : 'Nationwide Delivery Available'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl px-3.5 py-1.5">
                      <StoreIcon className="w-4 h-4 text-slate-500" /> Store Pickup Only
                    </span>
                  )}
                </div>

                {/* Seller Profile Card */}
                {product.business && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {product.business.logo ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <Image src={product.business.logo} alt={product.business.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-sea text-white flex items-center justify-center font-bold shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">{product.business.name}</span>
                          {product.business.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {product.business.cityName ? `Located in ${product.business.cityName}` : 'Verified Business Listing'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/business/${product.business.slug}`}
                      className="text-xs font-bold text-sea hover:underline shrink-0"
                    >
                      View Profile →
                    </Link>
                  </div>
                )}

                {/* Direct Contact Action Buttons */}
                <div className="space-y-3 pt-2">
                  {formattedWhatsApp && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all text-base"
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                      Buy / Contact Seller on WhatsApp
                    </a>
                  )}

                  {sellerPhone && (
                    <a
                      href={`tel:${sellerPhone}`}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4 text-amber-300" />
                      Call Seller Directly ({sellerPhone})
                    </a>
                  )}
                </div>

                {/* Safety Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Buyer Safety Tips
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-900/90 leading-relaxed font-medium text-[11.5px]">
                    <li>Inspect the item before making any payment.</li>
                    <li>Meet seller in a public, safe location.</li>
                  </ul>
                </div>

                {/* Product Description */}
                {product.description && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Product Overview &amp; Specifications
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Similar Products You Might Like</h2>
                <Link href="/products" className="text-xs font-bold text-sea hover:underline">
                  View All Products →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {relatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
}
