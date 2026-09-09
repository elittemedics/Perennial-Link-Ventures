import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import db from '@/lib/db';
import {
  MapPin, Phone, Building2, Tag, ShieldCheck, Truck,
  StoreIcon, ChevronRight, ArrowLeft, MessageCircle, Star
} from 'lucide-react';
import { formatGHS, formatWhatsAppNumber } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

export interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// ─── SEO: generateMetadata ──────────────────────────────────────────────────
export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  const product = await db.businessProduct.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      price: true,
      originalPrice: true,
      productCategory: true,
      location: true,
      image: true,
      isAvailable: true,
      images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
      business: {
        select: {
          name: true,
          cityName: true,
          isVerified: true,
          slug: true,
        },
      },
    },
  });

  if (!product) return { title: 'Product Not Found' };

  const cityName = product.business?.cityName || product.location || 'Ghana';
  const sellerName = product.business?.name || 'Perennial Link Ventures';
  const category = product.productCategory || 'Products';
  const priceStr = product.price > 0 ? `GHS ${product.price.toLocaleString()}` : '';

  const title = `Buy ${product.title}${priceStr ? ` — ${priceStr}` : ''} in ${cityName}, Ghana | Perennial Link Ventures`;
  const shortDesc = (product.description || '').slice(0, 155);
  const description = shortDesc
    ? `${shortDesc}… Sold by ${sellerName}. Contact seller directly via WhatsApp on Perennial Link Ventures.`
    : `Buy ${product.title} from ${sellerName} in ${cityName}, Ghana. Contact seller via WhatsApp on Perennial Link Ventures.`;

  const imageUrl = product.images?.[0]?.url || product.image || `${baseUrl}/og-image.png`;

  const keywords = [
    `buy ${product.title}`,
    `${product.title} price Ghana`,
    `${product.title} for sale`,
    `${product.title} ${cityName}`,
    `${category} Ghana`,
    `buy ${category} online Ghana`,
    `${sellerName}`,
    'online shopping Ghana',
    'Ghana marketplace',
    'Perennial Link Ventures',
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `${baseUrl}/product/${id}` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${id}`,
      siteName: 'Perennial Link Ventures',
      locale: 'en_GH',
      type: 'website',
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  const product = await db.businessProduct.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      business: {
        select: {
          name: true,
          slug: true,
          phone: true,
          whatsapp: true,
          isVerified: true,
          cityName: true,
          logo: true,
          tagline: true,
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  if (!product) notFound();

  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'];

  const sellerPhone =
    product.whatsappPhone || product.business?.whatsapp || product.business?.phone || '';
  const formattedPhone = formatWhatsAppNumber(sellerPhone);
  const whatsappMessage = encodeURIComponent(
    `Hi, I saw "${product.title}" on Perennial Link Ventures and I'm interested in buying it.`
  );
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${whatsappMessage}`
    : '#';

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  // Related products in same category
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await db.businessProduct.findMany({
      where: {
        productCategory: product.productCategory,
        isAvailable: true,
        id: { not: id },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        business: {
          select: { name: true, slug: true, phone: true, whatsapp: true, isVerified: true, cityName: true },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    });
  } catch {
    // silently ignore
  }

  // ── JSON-LD: Product + BreadcrumbList ────────────────────────────────────
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: allImages,
    sku: product.id,
    category: product.productCategory,
    url: `${baseUrl}/product/${id}`,
    offers: {
      '@type': 'Offer',
      price: product.price > 0 ? product.price : undefined,
      priceCurrency: 'GHS',
      availability: product.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/product/${id}`,
      ...(product.business
        ? {
            seller: {
              '@type': 'Organization',
              name: product.business.name,
              url: `${baseUrl}/business/${product.business.slug}`,
            },
          }
        : {}),
    },
    ...(product.business?.isVerified ? { award: 'Verified Business on Perennial Link Ventures' } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${baseUrl}/products` },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.productCategory,
        item: `${baseUrl}/products?category=${encodeURIComponent(product.productCategory)}`,
      },
      { '@type': 'ListItem', position: 4, name: product.title, item: `${baseUrl}/product/${id}` },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-slate-50">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-sea font-medium transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/products" className="hover:text-sea font-medium transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link
              href={`/products?category=${encodeURIComponent(product.productCategory)}`}
              className="hover:text-sea font-medium transition-colors"
            >
              {product.productCategory}
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[160px] sm:max-w-none">
              {product.title}
            </span>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-10">
          {/* ── Main Product Card ── */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

            {/* Left: Image Gallery */}
            <div className="bg-slate-900 p-5 flex flex-col gap-3 items-center justify-center relative min-h-[300px]">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
                <Image
                  src={allImages[0]}
                  alt={product.title}
                  fill
                  priority
                  className="object-contain p-4"
                />
                {discount && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {/* Additional thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {allImages.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white/20"
                    >
                      <Image src={imgUrl} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {allImages.length > 1 && (
                <p className="text-[11px] text-slate-400">
                  {allImages.length} photos available
                </p>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-5 sm:p-8 flex flex-col gap-4">
              {/* Category & Location */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-bold border border-sky-100 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {product.productCategory}
                </span>
                {product.location && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {product.location}
                  </span>
                )}
                {!product.isAvailable && (
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-950">
                  {product.price > 0 ? formatGHS(product.price) : 'Contact Seller for Price'}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base font-semibold text-slate-400 line-through">
                    {formatGHS(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2">
                {product.hasDelivery ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                    <Truck className="w-3.5 h-3.5" />
                    {product.deliveryRange ? `Delivery: ${product.deliveryRange}` : 'Delivery available'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 rounded-full px-3 py-1">
                    <StoreIcon className="w-3.5 h-3.5" /> Pickup only
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Product Description
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seller */}
              {product.business && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {product.business.logo ? (
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                        <Image src={product.business.logo} alt={product.business.name} fill className="object-contain p-1" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-sky-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">
                          {product.business.name}
                        </span>
                        {product.business.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {product.business.cityName
                          ? `Based in ${product.business.cityName}`
                          : 'Verified Business'}
                        {typeof product.business._count?.reviews === 'number' &&
                          product.business._count.reviews > 0 && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {product.business._count.reviews} reviews
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/business/${product.business.slug}`}
                    className="text-xs font-bold text-sky-600 hover:underline hover:text-sky-700 shrink-0 whitespace-nowrap"
                  >
                    View Profile →
                  </Link>
                </div>
              )}

              {/* Contact CTAs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {formattedPhone ? (
                  <>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm"
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                      Chat on WhatsApp with Seller
                    </a>
                    <a
                      href={`tel:${sellerPhone}`}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                      Call Seller ({sellerPhone})
                    </a>
                  </>
                ) : product.business ? (
                  <Link
                    href={`/business/${product.business.slug}`}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
                  >
                    <Building2 className="w-4 h-4" />
                    Visit Business Profile to Contact Seller
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  More {product.productCategory}
                </h2>
                <Link
                  href={`/products?category=${encodeURIComponent(product.productCategory)}`}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                {relatedProducts.map((rp) => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </section>
          )}

          {/* ── Back link ── */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all products
          </Link>
        </div>
      </div>
    </>
  );
}
