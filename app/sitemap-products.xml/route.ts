import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  try {
    const products = await db.businessProduct.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        title: true,
        image: true,
        images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const urls = products
      .map((p) => {
        const imgUrl = p.images?.[0]?.url || p.image;
        const lastMod = p.createdAt.toISOString();
        return `
    <url>
      <loc>${baseUrl}/product/${p.id}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
      ${imgUrl ? `
      <image:image>
        <image:loc>${escapeXml(imgUrl)}</image:loc>
        <image:title>${escapeXml(p.title)}</image:title>
      </image:image>` : ''}
    </url>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
    return new NextResponse(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
