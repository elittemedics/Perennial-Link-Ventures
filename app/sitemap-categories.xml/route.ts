import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  try {
    const categories = await db.category.findMany({
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    const urls = categories
      .map(
        (c) => `
    <url>
      <loc>${baseUrl}/category/${c.slug}</loc>
      <lastmod>${c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
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
