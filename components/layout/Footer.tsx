import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Smartphone, Tv, Laptop, Armchair, Refrigerator, Shirt, ShoppingCart, Gamepad2, Baby, Dumbbell, MoreHorizontal, HeartPulse } from 'lucide-react';

const CATEGORIES = [
  { name: 'Supermarket',      slug: 'Supermarket' },
  { name: 'Phones & Tablets', slug: 'Phones & Tablets' },
  { name: 'Health & Beauty',  slug: 'Health & Beauty' },
  { name: 'Home & Office',    slug: 'Home & Office' },
  { name: 'Appliances',       slug: 'Appliances' },
  { name: 'Electronics',      slug: 'Electronics' },
  { name: 'Computing',        slug: 'Computing' },
  { name: 'Fashion',          slug: 'Fashion' },
  { name: 'Sporting Goods',   slug: 'Sporting Goods' },
  { name: 'Baby Products',    slug: 'Baby Products' },
  { name: 'Gaming',           slug: 'Gaming' },
  { name: 'Other categories', slug: 'Other categories' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src="/images/plv-logo.png"
                  alt="Perennial Link Ventures"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                Perennial Link
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A global business directory and marketplace connecting customers directly with trusted businesses and service providers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-gold-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-gold-400 transition-colors">Marketplace Products</Link></li>
              <li><Link href="/listings" className="hover:text-gold-400 transition-colors">Browse Business Directory</Link></li>
              <li><Link href="/register" className="hover:text-gold-400 transition-colors">Register Your Business</Link></li>
              <li><Link href="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Shop Categories</h4>
            <ul className="space-y-1.5 text-sm columns-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className="hover:text-gold-400 transition-colors text-xs leading-relaxed block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sea shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Telephone</span>
                  <a href="tel:+233594772823" className="hover:text-gold-400 transition-colors">+233 (0) 594772823</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sea shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Headquarters</span>
                  <span>Serving businesses worldwide</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sea shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Email Address</span>
                  <a href="mailto:info@perenniallink.com" className="hover:text-gold-400 transition-colors">
                    info@perenniallink.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Perennial Link Ventures. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-gold-400">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gold-400">Privacy Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-gold-400">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
