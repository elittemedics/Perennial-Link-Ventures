import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all well-behaved crawlers to index public content
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          // Block noisy search/filter params that create duplicate content
          '/*?q=',
          '/*?page=',
          '/*?category=',
          '/*?city=',
          '/*?rating=',
        ],
      },
      {
        // Block GPTBot / AI scrapers from training on content
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-businesses.xml`,
      `${baseUrl}/sitemap-categories.xml`,
    ],
    host: baseUrl,
  };
}
