'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, PlusCircle, User, LogOut, LayoutDashboard, Menu, X, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string | null; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/logout')
      .then(async (response) => response.ok
        ? readApiResponse<{ user?: { name: string | null; role: string } | null }>(response)
        : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.assign('/');
  };

  const isAuthenticated = Boolean(user);
  const role = user?.role;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-sea text-white flex items-center justify-center font-bold text-xl shadow-md shadow-sea/30 group-hover:scale-105 transition-transform">
              PL
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight group-hover:text-sea transition-colors">
                Perennial Link
              </span>
              <span className="text-[10px] tracking-widest text-slate-500 font-semibold uppercase leading-none">
                Ventures Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-sea transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-sea transition-colors flex items-center gap-1 font-bold text-sea">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Marketplace
            </Link>
            <Link href="/categories" className="hover:text-sea transition-colors">
              Categories
            </Link>
            <Link href="/listings" className="hover:text-sea transition-colors">
              Businesses
            </Link>
            <Link href="/advertise" className="hover:text-sea transition-colors">
              Advertise Free
            </Link>
            <Link href="/about" className="hover:text-sea transition-colors">
              About Us
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:0545898775"
              className="flex items-center gap-1.5 text-xs font-semibold text-sea bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full transition-colors border border-brand-200"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>0545898775</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-sea" />
                    <span>Dashboard</span>
                    {role && (
                      <Badge variant="info" className="ml-1 text-[10px]">
                        {role === 'ADMIN' ? 'Admin' : role === 'BUSINESS_OWNER' ? 'Owner' : 'Visitor'}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Business</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Home
            </Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-sky-50 font-bold text-sea">
              🛍️ Marketplace Products
            </Link>
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Categories
            </Link>
            <Link href="/listings" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Browse Businesses
            </Link>
            <Link href="/advertise" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Advertise Free
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              About Us
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:0545898775"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-sea bg-brand-50 py-2 rounded-lg border border-brand-200"
            >
              <PhoneCall className="w-4 h-4" />
              Call Support: 0545898775
            </a>

            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard ({role})
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-rose-600 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Add Business
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
