'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ArrowRight, Grid, ShoppingCart, UtensilsCrossed,
  Smartphone, HeartPulse, Armchair, Car, BriefcaseBusiness, Refrigerator,
  Tv, Laptop, Shirt, Dumbbell, Baby, Gamepad2, MoreHorizontal
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Supermarket',       slug: 'supermarket',       Icon: ShoppingCart,    color: 'from-amber-500 to-orange-500' },
  { name: 'Food & Beverages',  slug: 'food-beverages',    Icon: UtensilsCrossed, color: 'from-green-500 to-emerald-600' },
  { name: 'Phones & Tablets',  slug: 'phones-tablets',    Icon: Smartphone,      color: 'from-blue-500 to-sky-600' },
  { name: 'Health & Beauty',   slug: 'health-beauty',     Icon: HeartPulse,      color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Office',     slug: 'home-office',       Icon: Armchair,        color: 'from-emerald-500 to-teal-600' },
  { name: 'Cars & Vehicles',   slug: 'cars-vehicles',     Icon: Car,             color: 'from-slate-500 to-slate-700' },
  { name: 'Services',          slug: 'services',          Icon: BriefcaseBusiness, color: 'from-rose-500 to-pink-600' },
  { name: 'Appliances',        slug: 'appliances',        Icon: Refrigerator,    color: 'from-cyan-500 to-blue-600' },
  { name: 'Electronics',       slug: 'electronics',       Icon: Tv,              color: 'from-violet-500 to-purple-600' },
  { name: 'Computing',         slug: 'computing',         Icon: Laptop,          color: 'from-indigo-500 to-blue-600' },
  { name: 'Fashion',           slug: 'fashion',           Icon: Shirt,           color: 'from-fuchsia-500 to-pink-600' },
  { name: 'Sporting Goods',    slug: 'sporting-goods',    Icon: Dumbbell,        color: 'from-orange-500 to-red-500' },
  { name: 'Baby Products',     slug: 'baby-products',     Icon: Baby,            color: 'from-sky-400 to-cyan-500' },
  { name: 'Gaming',            slug: 'gaming',            Icon: Gamepad2,        color: 'from-purple-600 to-indigo-600' },
  { name: 'Other categories',  slug: 'other-categories',  Icon: MoreHorizontal,  color: 'from-slate-500 to-slate-600' },
];

export default function CategoryTabDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-30 mb-4">
      {/* Category Tab Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm border ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-sea/30'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
        }`}
        aria-expanded={isOpen}
      >
        <Grid className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Browse All Categories ({CATEGORIES.length})</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`}
        />
      </button>

      {/* Sub-dropdown Panel (Compact Jumia-style Megamenu) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Marketplace Categories</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">All Functional</span>
            </div>
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-sea hover:underline flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {CATEGORIES.map(({ name, Icon, color }) => (
              <Link
                key={name}
                href={`/products?category=${encodeURIComponent(name)}`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-sea transition-colors truncate">
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
