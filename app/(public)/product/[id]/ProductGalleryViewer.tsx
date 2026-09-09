'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductGalleryViewerProps {
  images: string[];
  title: string;
  discount?: number | null;
}

export default function ProductGalleryViewer({ images, title, discount }: ProductGalleryViewerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activeImage = images[activeIdx] || images[0];

  const prevImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0) setActiveIdx((prev) => (prev + 1) % images.length);
      else setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="space-y-4">
      {/* Main Active Image Box */}
      <div
        className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4"
        />

        {discount && (
          <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg z-10">
            -{discount}% OFF
          </span>
        )}

        {/* Carousel Arrow Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              onTouchEnd={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/80 hover:bg-amber-400 hover:text-slate-950 text-white shadow-xl transition-all border border-white/20 active:scale-90"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              onTouchEnd={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/80 hover:bg-amber-400 hover:text-slate-950 text-white shadow-xl transition-all border border-white/20 active:scale-90"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                activeIdx === idx
                  ? 'border-sea ring-2 ring-sea/30 scale-105 shadow-md'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={imgUrl} alt={`${title} photo ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
