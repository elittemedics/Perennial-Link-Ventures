'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/common/ImageUpload';
import { Building2, Save, ArrowLeft, Loader2, Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { readApiResponse } from '@/lib/api-client';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries-data';
import { CountrySelect } from '@/components/common/CountrySelect';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_COUNTRY.phoneCode);
  const [whatsappDialCode, setWhatsappDialCode] = useState(DEFAULT_COUNTRY.phoneCode);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    categoryId: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    socialLinks: { facebook: '', instagram: '', linkedin: '' },
    address: '',
    cityName: 'Accra',
    stateName: 'Greater Accra',
    countryName: 'Ghana',
    logo: null as string | null,
    coverImage: null as string | null,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/categories').then((res) => res.json()),
      fetch(`/api/v1/businesses/${id}`).then((res) => res.json())
    ]).then(([catsData, busData]) => {
      if (catsData.categories) setCategories(catsData.categories);
      
      if (busData.success && busData.business) {
        const b = busData.business;
        setFormData({
          name: b.name || '',
          tagline: b.tagline || '',
          description: b.description || '',
          categoryId: b.categoryId || '',
          phone: b.phone || '',
          whatsapp: b.whatsapp || '',
          email: b.email || '',
          website: b.website || '',
          socialLinks: b.socialLinks || { facebook: '', instagram: '', linkedin: '' },
          address: b.address || '',
          cityName: b.cityName || 'Accra',
          stateName: b.stateName || 'Greater Accra',
          countryName: b.countryName || 'Ghana',
          logo: b.logo || null,
          coverImage: b.coverImage || null,
        });

        const countryMatch = COUNTRIES.find(c => c.name === (b.countryName || 'Ghana'));
        if (countryMatch) {
          setPhoneDialCode(countryMatch.phoneCode);
          setWhatsappDialCode(countryMatch.phoneCode);
        }
      } else {
        setError('Failed to load business details.');
      }
    }).catch(() => {
      setError('An error occurred while fetching data.');
    }).finally(() => {
      setIsFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formatNumber = (num: string, code: string) => {
      if (!num) return '';
      if (num.startsWith('+')) return num;
      return `${code}${num.replace(/^0+/, '')}`;
    };

    const formattedPhone = formatNumber(formData.phone, phoneDialCode);
    const formattedWhatsapp = formatNumber(formData.whatsapp, whatsappDialCode);

    try {
      const res = await fetch(`/api/v1/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formattedPhone,
          whatsapp: formattedWhatsapp,
        }),
      });

      const data = await readApiResponse<{ success?: boolean; error?: string }>(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update business listing.');
      }

      router.push('/dashboard/owner');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sea" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link href="/dashboard/owner">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>

      <Card className="p-4 sm:p-8">
        <CardHeader className="border-b border-slate-100 pb-4 mb-6">
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sea" /> Edit Business Listing
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-lg border border-rose-200 mb-6">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Perennial Link Ventures HQ"
              />
              <Input
                label="Tagline (Slogan)"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Your trusted local and global partner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Telephone / Contact Number</label>
                <div className="flex gap-2">
                  <CountrySelect value={phoneDialCode} mode="dialCode" className="w-40 shrink-0" onChange={(country) => setPhoneDialCode(country.phoneCode)} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0545898775"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Number (optional)</label>
                <div className="flex gap-2">
                  <CountrySelect value={whatsappDialCode} mode="dialCode" className="w-40 shrink-0" onChange={(country) => setWhatsappDialCode(country.phoneCode)} />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="0545898775"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:border-sea focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Official Email Address (optional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@market-plv.com"
              />
              <Input
                label="Official Website URL"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://perenniallink.com"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900">Social & direct contact links</h3>
                <p className="text-xs text-slate-500 mt-1">All optional. Add only the places customers can contact or learn about your business.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Facebook page" type="url" leftIcon={<Facebook className="w-4 h-4" />} value={formData.socialLinks?.facebook || ''} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/yourbusiness" />
                <Input label="Instagram profile" type="url" leftIcon={<Instagram className="w-4 h-4" />} value={formData.socialLinks?.instagram || ''} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/yourbusiness" />
                <Input label="LinkedIn page" type="url" leftIcon={<Linkedin className="w-4 h-4" />} value={formData.socialLinks?.linkedin || ''} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/company/yourbusiness" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Street Address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot 42, Weija Lake View"
              />
              <Input
                label="City / Town"
                required
                value={formData.cityName}
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                placeholder="Tuba/Weija"
              />
              <Input
                label="Region / State"
                value={formData.stateName}
                onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                placeholder="Greater Accra"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                <CountrySelect value={formData.countryName} onChange={(country) => {
                  setFormData({ ...formData, countryName: country.name });
                  setPhoneDialCode(country.phoneCode);
                  setWhatsappDialCode(country.phoneCode);
                }} />
              </div>
            </div>

            <Textarea
              label="Detailed Business Description"
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your services, products, history, and special offers in detail..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <ImageUpload
                label="Company Logo (optional)"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                prefix="logo"
              />
              <ImageUpload
                label="Cover Image Banner"
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                prefix="cover"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Link href="/dashboard/owner">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isLoading} className="gap-2 px-8">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
