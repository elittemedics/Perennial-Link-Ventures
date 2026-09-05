'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X, MessageCircle, Phone, Building2, MapPin, Tag, ShieldCheck,
  ShieldAlert, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
  Truck, StoreIcon, Send, AlertTriangle, EyeOff, Flag, CheckCircle2,
} from 'lucide-react';
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
  } | null;
  onClose: () => void;
  directContact?: boolean;
}

type MessageItem = {
  id: string;
  message: string;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
};

export default function ProductModal({ product, onClose, directContact = false }: ProductModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Messaging
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Report / Mark unavailable
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState<'UNAVAILABLE' | 'ABUSE'>('ABUSE');
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  if (!product) return null;

  // Build image list
  const allImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'];

  const activeImageUrl = allImages[activeImageIndex] || allImages[0];

  const sellerPhone = product.whatsappPhone || product.business?.whatsapp || product.business?.phone;
  const formattedPhone = sellerPhone?.replace(/[^0-9+]/g, '');

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null);

  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in buying "${product.title}" listed on Perennial Link Ventures.`
  );
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone.replace(/^\+/, '')}?text=${whatsappMessage}`
    : '#';

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Load save status
  useEffect(() => {
    fetch(`/api/v1/products/${product.id}/save`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setSaved(d.saved); })
      .catch(() => null);
  }, [product.id]);

  // Load messages when panel opens
  useEffect(() => {
    if (!showMessages) return;
    fetch(`/api/v1/products/${product.id}/messages`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setMessages(d.messages || []);
          setIsOwner(d.isOwner || false);
        }
      })
      .catch(() => null);
  }, [showMessages, product.id]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSave = async () => {
    setSavingLoading(true);
    const res = await fetch(`/api/v1/products/${product.id}/save`, { method: 'POST' });
    const data = await res.json();
    if (data.success) setSaved(data.saved);
    else if (res.status === 401) window.location.href = '/login?next=' + window.location.pathname;
    setSavingLoading(false);
  };

  const handleSendMessage = async () => {
    if (!msgText.trim()) return;
    setMsgSending(true);
    setMsgError('');
    const res = await fetch(`/api/v1/products/${product.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msgText.trim() }),
    });
    const data = await res.json();
    if (res.status === 401) {
      window.location.href = '/login?next=' + window.location.pathname;
    } else if (data.success) {
      setMessages((prev) => [...prev, data.message]);
      setMsgText('');
    } else {
      setMsgError(data.error || 'Failed to send message.');
    }
    setMsgSending(false);
  };

  const handleReport = async () => {
    setReportLoading(true);
    const res = await fetch(`/api/v1/products/${product.id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType, reason: reportReason }),
    });
    const data = await res.json();
    if (data.success) setReportSent(true);
    setReportLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto grid grid-cols-1 md:grid-cols-2 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={savingLoading}
          className={`absolute top-3 right-14 z-30 p-2 rounded-full shadow-lg transition-all ${saved ? 'bg-amber-400 text-white' : 'bg-slate-900/60 hover:bg-amber-400 text-white'}`}
          aria-label={saved ? 'Unsave' : 'Save product'}
          title={saved ? 'Saved!' : 'Save this product'}
        >
          {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>

        {/* ─── Left: Image Gallery ─── */}
        <div
          className="bg-slate-900 p-4 flex flex-col justify-between relative min-h-[280px] md:min-h-[460px] select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative flex-1 w-full aspect-square md:aspect-auto rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
            <Image
              src={activeImageUrl}
              alt={product.title}
              fill
              priority
              className="object-contain p-2"
            />
            {discount && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                -{discount}% OFF
              </span>
            )}
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

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 justify-center pt-3">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === index
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={imgUrl} alt={`Photo ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Swipe or tap arrows to view all {allImages.length} photos
            </p>
          )}
        </div>

        {/* ─── Right: Details ─── */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 bg-white overflow-y-auto max-h-[92vh]">
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
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{product.title}</h2>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-950">
              {product.price > 0 ? formatGHS(product.price) : 'Contact Seller for Price'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatGHS(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Delivery Info */}
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

          {/* Seller Profile */}
          {product.business && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
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
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line max-h-28 overflow-y-auto pr-1">
                {product.description}
              </p>
            </div>
          )}

          {/* ─── Contact Actions ─── */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {directContact && formattedPhone ? (
              <>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  Chat on WhatsApp with Seller
                </a>
                <a
                  href={`tel:${formattedPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  Call Seller ({sellerPhone})
                </a>
              </>
            ) : product.business ? (
              <Link
                href={`/business/${product.business.slug}`}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-sea hover:bg-sky-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all text-sm"
              >
                <Building2 className="w-4 h-4" />
                Visit Business Profile to Contact Seller
              </Link>
            ) : formattedPhone ? (
              <>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${formattedPhone}`}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  Call Seller ({sellerPhone})
                </a>
              </>
            ) : null}
          </div>

          {/* ─── Direct Message Panel ─── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMessages(!showMessages)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sea" />
                {isOwner ? 'View Customer Messages' : 'Send a Message to Seller'}
              </span>
              <span className="text-slate-400 text-xs">{showMessages ? '▲' : '▼'}</span>
            </button>

            {showMessages && (
              <div className="p-3 space-y-3">
                {/* Messages list */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {messages.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No messages yet.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className="flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-navy to-gold text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(m.sender.name?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-600 mb-0.5">{m.sender.name || 'User'}</p>
                          <p className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">{m.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={msgEndRef} />
                </div>

                {/* Send message input */}
                <div className="flex gap-2 items-end">
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Type your message to the seller..."
                    rows={2}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-sea/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={msgSending || !msgText.trim()}
                    className="p-2.5 rounded-xl bg-sea hover:bg-sky-600 text-white disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {msgError && <p className="text-[11px] text-red-500">{msgError}</p>}
              </div>
            )}
          </div>

          {/* ─── Safety Tips ─── */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
            <p className="font-extrabold flex items-center gap-1.5 text-amber-950 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              Safety & Security Tips
            </p>
            <ul className="space-y-1 text-[10.5px] leading-snug list-disc pl-4 text-amber-900/90 font-medium">
              <li>Avoid paying in advance before seeing or inspecting the product physically.</li>
              <li>Meet in a safe, public location (such as a busy market, mall, or landmark) when picking up goods.</li>
              <li>Carefully inspect the product to confirm its quality and condition before handing over payment.</li>
              <li>Never share sensitive financial details, OTPs, or passwords with anyone.</li>
            </ul>
          </div>

          {/* ─── Mark Unavailable / Report Abuse ─── */}
          <div className="border-t border-slate-100 pt-3">
            {reportSent ? (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {reportType === 'UNAVAILABLE' ? 'Product marked as unavailable.' : 'Report submitted. Thank you.'}
              </div>
            ) : !reportOpen ? (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setReportType('UNAVAILABLE'); setReportOpen(true); }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-orange-600 font-semibold transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" /> Mark Unavailable
                </button>
                <span className="text-slate-200">|</span>
                <button
                  type="button"
                  onClick={() => { setReportType('ABUSE'); setReportOpen(true); }}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-red-600 font-semibold transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Report Abuse
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  {reportType === 'UNAVAILABLE' ? 'Mark as Unavailable' : 'Report Abuse'}
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={reportType === 'ABUSE' ? 'Briefly describe the issue (optional)...' : 'Reason (optional)...'}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReport}
                    disabled={reportLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {reportLoading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="px-4 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
