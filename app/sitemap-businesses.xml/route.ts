import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  try {
    const businesses = await db.business.findMany({
      where: { status: 'APPROVED', deletedAt: null },
      select: { slug: true, updatedAt: true, isFeatured: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    });

    const urls = businesses
      .map(
        (b) => `
    <url>
      <loc>${baseUrl}/business/${b.slug}</loc>
      <lastmod>${b.updatedAt.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${b.isFeatured ? '0.9' : '0.8'}</priority>
    </url>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch {
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
