'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, User, LogOut, LayoutDashboard, Menu, X, Package, House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ name: string | null; role: string } | null>(null);

  const loadUser = useCallback(() => {
    fetch('/api/v1/auth/logout', { cache: 'no-store', credentials: 'same-origin' })
      .then(async (response) => response.ok
        ? readApiResponse<{ user?: { name: string | null; role: string } | null }>(response)
        : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    loadUser();
    const handleAuthenticationChange = (event: Event) => {
      const authenticatedUser = (event as CustomEvent<{ name: string | null; role: string }>).detail;
      if (authenticatedUser) setUser(authenticatedUser);
      else loadUser();
    };
    window.addEventListener('auth-changed', handleAuthenticationChange);
    return () => window.removeEventListener('auth-changed', handleAuthenticationChange);
  }, [loadUser]);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    window.location.assign('/');
  };

  const isAuthenticated = Boolean(user);
  const role = user?.role;
  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/98 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-11 h-11 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/images/plv-logo.png"
                alt="Perennial Link Ventures Logo"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-navy text-base tracking-tight leading-tight group-hover:text-gold transition-colors">
                Perennial Link
              </span>
              <span className="text-[10px] tracking-widest text-gold-600 font-bold uppercase leading-none">
                Ventures Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-gold transition-colors flex items-center gap-1 font-bold text-navy">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              Marketplace
            </Link>
            <Link href="/listings" className="hover:text-gold transition-colors">
              Businesses
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <Link href="/dashboard/owner/products#new-product">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg border-sea text-sea font-bold hover:bg-brand-50">
                  <Package className="w-4 h-4" /> Add product
                </Button>
              </Link>
            )}
            <Link href={role === 'BUSINESS_OWNER' ? '/dashboard/owner/listings/new' : '/register'}>
              <Button variant="primary" size="sm" className="gap-1.5 whitespace-nowrap">
                <PlusCircle className="w-4 h-4" /> Add Business
              </Button>
            </Link>
            {isAuthenticated ? (
              <div ref={profileMenuRef} className="relative">
                {/* Profile Icon / Avatar Button */}
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-sea/30"
                  aria-label="User profile menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-navy to-gold text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {userInitials}
                  </div>
                  <div className="flex flex-col text-left pr-1.5 hidden lg:flex">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name || 'Account'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {role === 'ADMINISTRATOR' ? 'Admin' : role === 'BUSINESS_OWNER' ? 'Business Owner' : 'Member'}
                    </span>
                  </div>
                  <User className="w-4 h-4 text-slate-500 lg:hidden" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.name || 'Logged In User'}</p>
                      <Badge variant="info" className="mt-1 text-[10px]">
                        {role === 'ADMINISTRATOR' ? 'Admin' : role === 'BUSINESS_OWNER' ? 'Owner' : 'Visitor'}
                      </Badge>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sea" />
                      Dashboard
                    </Link>

                    {role === 'BUSINESS_OWNER' && (
                      <Link
                        href="/dashboard/owner/listings/new"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        Add New Business
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-2 rounded-lg border-slate-200 bg-white font-bold text-slate-700 hover:border-gold-300 hover:bg-gold-50 hover:text-navy">
                    <User className="w-4 h-4 text-gold-600" />
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Keep Home visible on every signed-in phone screen. */}
          <div className="md:hidden flex items-center gap-1">
            <Link href="/" aria-label="Home" className="inline-flex items-center gap-1 rounded-lg bg-navy px-2.5 py-2 text-xs font-bold text-white shadow-sm">
              <House className="w-4 h-4" /> <span>Home</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Home
            </Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-gold-50 font-bold text-gold-700">
              🛍️ Marketplace Products
            </Link>
            <Link href="/listings" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-slate-50">
              Browse Businesses
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-navy to-gold text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user?.name || 'Your account'}</p>
                    <p className="text-xs text-emerald-700 font-medium">Signed in</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard ({role})
                  </Button>
                </Link>
                {isAuthenticated && (
                  <Link href="/dashboard/owner/products#new-product" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-start gap-2">
                      <Package className="w-4 h-4" /> Add product
                    </Button>
                  </Link>
                )}
                <Link href={role === 'BUSINESS_OWNER' ? '/dashboard/owner/listings/new' : '/register'} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Business
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
                  <Button variant="outline" className="w-full gap-2 rounded-lg border-slate-200 font-bold">
                    <User className="w-4 h-4 text-gold-600" />
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full gap-1.5">
                    <PlusCircle className="w-4 h-4" /> Add Business
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
