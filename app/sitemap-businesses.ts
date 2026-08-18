import { MetadataRoute } from 'next';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemapBusinesses(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  try {
    const businesses = await db.business.findMany({
      where: { status: 'APPROVED', deletedAt: null },
      select: { slug: true, updatedAt: true, isFeatured: true },
      orderBy: { updatedAt: 'desc' },
    });

    return businesses.map((b) => ({
      url: `${baseUrl}/business/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly' as const,
      // Featured businesses get slightly higher priority
      priority: b.isFeatured ? 0.9 : 0.8,
    }));
  } catch {
    return [];
  }
}
