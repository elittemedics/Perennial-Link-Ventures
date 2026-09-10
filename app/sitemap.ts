import { MetadataRoute } from 'next';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/listings`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/locations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/advertise`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const [products, businesses, categories] = await Promise.all([
      db.businessProduct.findMany({
        where: { isAvailable: true },
        select: { id: true, createdAt: true },
        take: 5000,
      }),
      db.business.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        select: { slug: true, updatedAt: true, isFeatured: true },
        take: 5000,
      }),
      db.category.findMany({
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: p.createdAt,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    const businessEntries: MetadataRoute.Sitemap = businesses.map((b) => ({
      url: `${baseUrl}/business/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly',
      priority: b.isFeatured ? 0.9 : 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticEntries, ...businessEntries, ...categoryEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
