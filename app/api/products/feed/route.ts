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

function detectBrand(title: string, fallback: string): string {
  const t = title.toLowerCase();
  if (t.includes('apple') || t.includes('macbook') || t.includes('iphone') || t.includes('ipad')) return 'Apple';
  if (t.includes('hp') || t.includes('elitebook') || t.includes('probook')) return 'HP';
  if (t.includes('dell') || t.includes('latitude') || t.includes('xps')) return 'Dell';
  if (t.includes('lenovo') || t.includes('thinkpad')) return 'Lenovo';
  if (t.includes('samsung') || t.includes('galaxy')) return 'Samsung';
  if (t.includes('sony')) return 'Sony';
  if (t.includes('asus')) return 'Asus';
  if (t.includes('acer')) return 'Acer';
  if (t.includes('toshiba')) return 'Toshiba';
  if (t.includes('canon')) return 'Canon';
  if (t.includes('nikon')) return 'Nikon';
  if (t.includes('nike')) return 'Nike';
  if (t.includes('adidas')) return 'Adidas';
  if (t.includes('toyota')) return 'Toyota';
  if (t.includes('honda')) return 'Honda';
  return fallback || 'Market PLV';
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

  try {
    const products = await db.businessProduct.findMany({
      where: { isAvailable: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 3 },
        business: { select: { name: true, cityName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });

    const items = products
      .map((p) => {
        const imageUrl = p.images?.[0]?.url || p.image || `${baseUrl}/og-image.png`;
        const sellerName = p.business?.name || 'Market PLV';
        const brand = detectBrand(p.title, sellerName);
        const price = p.price > 0 ? `${p.price.toFixed(2)} GHS` : '1.00 GHS';
        const link = `${baseUrl}/product/${p.id}`;
        const desc = p.description || `Buy ${p.title} online from verified seller on Market PLV.`;

        return `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(desc.slice(0, 5000))}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${p.isAvailable ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(p.productCategory || 'General Merchandise')}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Market PLV Google Merchant Center Product Feed</title>
    <link>${baseUrl}</link>
    <description>Active products catalog on Market PLV online marketplace</description>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Merchant feed generation error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Market PLV</title></channel></rss>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}
