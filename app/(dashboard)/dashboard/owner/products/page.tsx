'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/components/common/ImageUpload';
import { Package, PlusCircle, Trash2, ArrowLeft, Store, Pencil } from 'lucide-react';
import { readApiResponse } from '@/lib/api-client';
import { formatGHS } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  cityName: string;
  phone: string;
  whatsapp?: string | null;
}

interface Product {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  quantity?: number | null;
  location?: string | null;
  image?: string | null;
  productCategory: string;
  createdAt: string;
  business: { name: string };
}

const CATEGORIES = [
  'Supermarket',
  'Phones & Tablets',
  'Health & Beauty',
  'Home & Office',
  'Appliances',
  'Electronics',
  'Computing',
  'Fashion',
  'Sporting Goods',
  'Baby Products',
  'Gaming',
  'Other categories',
];

export default function OwnerProductsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState({ title: '', description: '', price: '', quantity: '', location: '', productCategory: 'Other categories', image: null as string | null });

  const [formData, setFormData] = useState({
    businessId: '',
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    quantity: '',
    location: '',
    productCategory: 'Other categories',
    image: null as string | null,
  });

  const fetchData = async () => {
    setIsFetching(true);
    try {
      // Fetch owner's businesses
      const res = await fetch('/api/v1/businesses?mine=true&limit=100');
      const data = await readApiResponse<{ listings?: Business[] }>(res);
      if (data.listings && data.listings.length > 0) {
        setBusinesses(data.listings);
        const requestedBusinessId = new URLSearchParams(window.location.search).get('businessId');
        const selectedBusiness = data.listings.find((business) => business.id === requestedBusinessId) || data.listings[0];
        setFormData((prev) => ({
          ...prev,
          businessId: prev.businessId || selectedBusiness.id,
          location: prev.location || selectedBusiness.cityName,
        }));
        
        // Fetch products for first business
        const prodRes = await fetch(`/api/v1/products?businessId=${selectedBusiness.id}`);
        const prodData = await readApiResponse<{ products?: Product[] }>(prodRes);
        if (prodData.products) setProducts(prodData.products);
      }
    } catch {
      // Fallback
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectBusiness = async (bId: string) => {
    setFormData((prev) => ({ ...prev, businessId: bId }));
    try {
      const prodRes = await fetch(`/api/v1/products?businessId=${bId}`);
      const prodData = await readApiResponse<{ products?: Product[] }>(prodRes);
      if (prodData.products) setProducts(prodData.products);
    } catch {
      setProducts([]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessId) {
      setError('Please select a business first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        businessId: formData.businessId,
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : undefined,
        location: formData.location || undefined,
        productCategory: formData.productCategory,
        image: formData.image || undefined,
        images: formData.image ? [formData.image] : [],
      };

      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse<{ success?: boolean; error?: string; product?: Product }>(res);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add product.');
      }

      setSuccessMsg(`"${formData.title}" added to your marketplace store!`);
      setFormData((prev) => ({
        ...prev,
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        quantity: '',
        location: '',
        image: null,
      }));

      // Refresh products list
      handleSelectBusiness(formData.businessId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const handleUpdateImage = async (id: string, newImageUrl: string | null) => {
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: newImageUrl }),
      });
      const data = await readApiResponse<{ success?: boolean; product?: Product }>(res);
      if (res.ok && data.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, image: newImageUrl } : p));
        setEditingImageId(null);
      } else {
        alert('Failed to update image');
      }
    } catch {
      alert('Error updating image');
    }
  };

  const openProductEditor = (product: Product) => {
    setEditingProduct(product);
    setEditDraft({
      title: product.title,
      description: product.description || '',
      price: product.price ? String(product.price) : '',
      quantity: product.quantity === null || product.quantity === undefined ? '' : String(product.quantity),
      location: product.location || '',
      productCategory: product.productCategory,
      image: product.image || null,
    });
  };

  const handleSaveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct) return;
    setError(null);
    try {
      const response = await fetch(`/api/v1/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editDraft.title,
          description: editDraft.description || null,
          price: editDraft.price ? Number(editDraft.price) : 0,
          quantity: editDraft.quantity ? Number(editDraft.quantity) : null,
          location: editDraft.location || null,
          productCategory: editDraft.productCategory,
          image: editDraft.image,
        }),
      });
      const data = await readApiResponse<{ success?: boolean; error?: string; product?: Product }>(response);
      if (!response.ok || !data.success || !data.product) throw new Error(data.error || 'Unable to update product.');
      setProducts((current) => current.map((product) => product.id === data.product?.id ? { ...product, ...data.product } : product));
      setEditingProduct(null);
      setSuccessMsg('Product updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update product.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link href="/dashboard/owner">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-8 h-8 text-sea" /> Manage Business Products &amp; Offerings
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Upload images, prices, quantities, and descriptions of products your business sells.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <Card className="lg:col-span-1 p-6 space-y-6 h-fit shadow-md">
          <CardHeader className="p-0 border-b border-slate-100 pb-3">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sea" /> Add New Product
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            {error && <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl font-medium border border-rose-200">{error}</p>}
            {successMsg && <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl font-medium border border-emerald-200">{successMsg}</p>}

            <form onSubmit={handleAddProduct} className="space-y-4">
              
              {/* Select Business */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Business
                </label>
                <select
                  required
                  value={formData.businessId}
                  onChange={(e) => handleSelectBusiness(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-medium focus:border-sea focus:outline-none"
                >
                  {businesses.length === 0 && <option value="">No businesses found...</option>}
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.cityName})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Product Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Organic Palm Oil 5L"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Price (GHS, optional)"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="150.00"
                />
                <Input
                  label="Original Price (optional)"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="200.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantity Available (optional)"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 25"
                />
                <Input
                  label="Location (optional)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Spintex, Accra"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Product Category
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:border-sea focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Textarea
                label="Description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product details, specifications..."
              />

              <ImageUpload
                label="Product Image (Sharp Auto-WebP)"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                prefix="product"
              />

              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full gap-2">
                <PlusCircle className="w-4 h-4" /> Save Product to Store
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Products Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-sea" /> Store Inventory ({products.length})
          </h3>

          {editingProduct && (
            <Card className="border-sea/30 bg-sky-50/40 p-5">
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Edit {editingProduct.title}</h4>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>Cancel</Button>
                </div>
                <Input label="Product title" required value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Price (optional)" type="number" step="0.01" value={editDraft.price} onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })} />
                  <Input label="Quantity (optional)" type="number" value={editDraft.quantity} onChange={(e) => setEditDraft({ ...editDraft, quantity: e.target.value })} />
                </div>
                <Input label="Location (optional)" value={editDraft.location} onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })} />
                <Textarea label="Description (optional)" rows={3} value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
                <ImageUpload label="Replace product image (optional)" value={editDraft.image} onChange={(url) => setEditDraft({ ...editDraft, image: url })} prefix="product" />
                <Button type="submit" variant="primary" className="gap-2"><Pencil className="w-4 h-4" /> Save changes</Button>
              </form>
            </Card>
          )}

          {products.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">No products added for this business yet.</p>
              <p className="text-slate-400 text-xs">Fill out the form on the left to display products on your public business page.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <Card key={p.id} className="p-4 space-y-3 relative group">
                  <div className="flex gap-3">
                    {editingImageId === p.id ? (
                      <div className="flex-1">
                        <ImageUpload
                          label=""
                          value={p.image}
                          onChange={(url) => handleUpdateImage(p.id, url)}
                          prefix="product"
                        />
                        <Button variant="ghost" size="sm" onClick={() => setEditingImageId(null)} className="mt-2 text-xs h-7">Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative group/img cursor-pointer" onClick={() => setEditingImageId(p.id)}>
                          {p.image ? (
                            <img src={p.image} alt={p.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                              No Image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-900/50 hidden group-hover/img:flex items-center justify-center rounded-xl">
                            <span className="text-white text-[10px] font-bold text-center leading-tight">Edit<br/>Image</span>
                          </div>
                        </div>
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-bold uppercase text-sea bg-brand-50 px-2 py-0.5 rounded-md">
                            {p.productCategory}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.title}</h4>
                          <p className="font-extrabold text-slate-900 text-sm">{p.price > 0 ? formatGHS(p.price) : 'Contact for price'}</p>
                          {p.quantity !== undefined && p.quantity !== null && (
                            <p className="text-xs text-emerald-700 font-medium">📦 Qty: {p.quantity}</p>
                          )}
                          {p.location && <p className="text-xs text-slate-500">📍 {p.location}</p>}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Added {new Date(p.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openProductEditor(p)} className="h-8 px-2 text-xs gap-1 text-sea">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteProduct(p.id)} className="text-rose-600 hover:bg-rose-50 h-8 px-2 text-xs gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
