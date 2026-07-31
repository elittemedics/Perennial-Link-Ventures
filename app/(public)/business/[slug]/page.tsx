import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import db from '@/lib/db';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ShieldCheck,
  Clock,
  Building2,
  Package,
  MessageSquare,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import ClientInquiryForm from './ClientInquiryForm';
import ClientReviewForm from './ClientReviewForm';
import ProductCard from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

export interface BusinessPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: BusinessPageProps): Promise<Metadata> {
  const params = await props.params;
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, tagline: true, description: true, cityName: true, logo: true, coverImage: true },
  });

  if (!business) return { title: 'Business Not Found' };

  return {
    title: `${business.name} - ${business.cityName}, Ghana`,
    description: business.tagline || business.description.slice(0, 160),
    openGraph: {
      title: `${business.name} | Perennial Link Directory`,
      description: business.description.slice(0, 160),
      images: business.coverImage ? [{ url: business.coverImage }] : [],
    },
  };
}

export default async function BusinessDetailPage(props: BusinessPageProps) {
  const params = await props.params;

  let business: any = null;

  try {
    business = await db.business.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        openingHours: true,
        products: true,
        services: true,
        socialLinks: true,
        gallery: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch {
    // Database offline build fallback
  }

  if (!business) {
    notFound();
  }

  // Generate JSON-LD Schema markup for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    image: business.coverImage || business.logo,
    telephone: business.phone,
    email: business.email,
    url: business.website || `${process.env.NEXT_PUBLIC_APP_URL}/business/${business.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.cityName,
      addressRegion: business.stateName || 'Greater Accra',
      addressCountry: 'GH',
    },
  };
  const whatsappNumber = business.whatsapp?.replace(/\D/g, '');
  const hasPhone = business.phone && business.phone !== 'Not provided';
  const hasEmail = business.email && business.email !== 'Not provided';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-slate-50 pb-16">
        
        {/* Cover Image Banner */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
          <Image
            src={business.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600'}
            alt={business.name}
            fill
            sizes="100vw"
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </div>

        {/* Business Header Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {business.logo ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0 -mt-12 sm:-mt-16">
                  <Image src={business.logo} alt={business.name} fill sizes="128px" className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-sea text-white flex items-center justify-center font-bold text-3xl shadow-lg shrink-0 -mt-12 sm:-mt-16 border-4 border-white">
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">{business.category?.name}</Badge>
                  {business.isVerified && (
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Company
                    </Badge>
                  )}
                  {business.isFeatured && <Badge variant="warning">Featured</Badge>}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {business.name}
                </h1>
                {business.tagline && (
                  <p className="text-slate-600 font-medium text-sm sm:text-base">{business.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-sea shrink-0" />
                    {business.address}, {business.city}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{business.avgRating?.toFixed(1) || '5.0'}</span>
                    <span className="text-slate-400 font-normal">({business.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Contact Buttons */}
            <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto shrink-0">
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </Button>
                </a>
              )}
              {hasPhone && (
                <a href={`tel:${business.phone}`} className="w-full">
                  <Button variant="primary" className="w-full gap-2 shadow-md">
                    <Phone className="w-4 h-4" /> Call business
                  </Button>
                </a>
              )}
              {hasEmail && (
                <a href={`mailto:${business.email}`} className="w-full">
                  <Button variant="outline" className="w-full gap-2"><Mail className="w-4 h-4 text-sea" /> Send email</Button>
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Globe className="w-4 h-4 text-sea" /> Visit Website
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Buyer Direct Contact Notice Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                📢
              </div>
              <div>
                <h4 className="font-bold text-sm">How to Make a Purchase or Inquire</h4>
                <p className="text-xs text-amber-800">
                  Perennial Link Directory connects you directly with {business.name}. Contact the owner using their phone or WhatsApp buttons to order or ask questions.
                </p>
              </div>
            </div>
            {hasPhone && (
              <a href={`tel:${business.phone}`} className="shrink-0">
                <Button size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5" /> Call Owner Now
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Detailed Sections */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Business Description */}
            <Card className="p-6 sm:p-8 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sea" /> About {business.name}
              </h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </Card>

            {/* Jumia-Style Products Catalog Section */}
            {business.products?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-sea" /> Product Catalog &amp; Deals ({business.products.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {business.products.map((ps: any) => (
                    <ProductCard
                      key={ps.id}
                      product={{
                        ...ps,
                        business: {
                          name: business.name,
                          slug: business.slug,
                          phone: business.phone,
                          isVerified: business.isVerified,
                          cityName: business.cityName,
                        },
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery Lightbox Grid */}
            {business.gallery?.length > 0 && (
              <Card className="p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Photo Gallery ({business.gallery.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {business.gallery.map((img: any) => (
                    <div key={img.id} className="relative h-40 rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                      <Image src={img.url} alt={img.caption || 'Gallery Image'} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-slate-900/75 text-white text-[11px] p-2 truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews & Ratings Section */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(business.avgRating || 5) ? 'fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-slate-900 text-lg">{business.avgRating?.toFixed(1) || '5.0'}</span>
                    <span className="text-slate-500 text-sm">out of 5 ({business.reviews.length} reviews)</span>
                  </div>
                </div>

                <ClientReviewForm businessId={business.id} />
              </div>

              <div className="space-y-4">
                {business.reviews.length === 0 ? (
                  <p className="text-slate-500 text-sm italic py-4 text-center">
                    No customer reviews yet. Be the first to share your experience!
                  </p>
                ) : (
                  business.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{rev.user.name || 'Verified Client'}</span>
                        <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <h5 className="font-semibold text-slate-900 text-sm">{rev.title}</h5>
                      <p className="text-slate-600 text-xs leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>

          {/* Right Sidebar - Hours & Contact Form */}
          <div className="space-y-6">
            
            {/* Opening Hours Widget */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-sea" /> Opening Hours
              </h3>
              {business.openingHours.length === 0 ? (
                <p className="text-xs text-slate-500">Contact business directly for operating hours.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {business.openingHours.map((oh: any) => (
                    <li key={oh.id} className="flex justify-between items-center py-1 border-b border-slate-50">
                      <span className="font-semibold text-slate-700 capitalize">{oh.dayOfWeek.toLowerCase()}</span>
                      {oh.isClosed ? (
                        <span className="text-rose-600 font-medium">Closed</span>
                      ) : (
                        <span className="text-slate-900 font-medium">{oh.openTime} - {oh.closeTime}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Direct Inquiry Contact Form */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-5 h-5 text-sea" /> Direct Message to Owner
              </h3>
              <ClientInquiryForm businessId={business.id} />
            </Card>

            {business.socialLinks?.length > 0 && (
              <Card className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Find this business online</h3>
                <div className="flex flex-wrap gap-2">
                  {business.socialLinks.map((social: any) => {
                    const Icon = social.platform === 'facebook' ? Facebook : social.platform === 'instagram' ? Instagram : social.platform === 'linkedin' ? Linkedin : Globe;
                    return <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sea hover:text-sea transition-colors"><Icon className="w-4 h-4" />{social.platform}</a>;
                  })}
                </div>
              </Card>
            )}

          </div>

        </div>

      </div>
    </>
  );
}
