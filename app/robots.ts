import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all standard search engine and shopping crawlers
        userAgent: '*',
        allow: [
          '/',
          '/product/',
          '/products',
          '/business/',
          '/category/',
          '/categories',
          '/api/products/feed',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
        ],
      },
      {
        // Explicitly welcome Googlebot and Google Shopping crawlers
        userAgent: ['Googlebot', 'StoreBot-Google', 'Googlebot-Image', 'Google-InspectionTool', 'Google-Extended'],
        allow: [
          '/',
          '/product/',
          '/products',
          '/business/',
          '/category/',
          '/categories',
          '/api/products/feed',
        ],
        disallow: [
          '/dashboard/',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-products.xml`,
      `${baseUrl}/sitemap-businesses.xml`,
      `${baseUrl}/sitemap-categories.xml`,
    ],
    host: baseUrl,
  };
}

