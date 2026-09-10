import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/common/Providers';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  title: {
    default: 'Market PLV — Global & Regional Online Marketplace | Buy & Sell',
    template: '%s | Market PLV',
  },
  description:
    'Discover, buy, and sell laptops, phones, electronics, fashion, home appliances, vehicles, and services globally and across Ghana. Contact verified sellers directly via WhatsApp or phone on Market PLV. Best prices, fast delivery, and buyer protection.',
  keywords: [
    // Brand
    'Market PLV',
    'market-plv.com',
    'Perennial Link Ventures',
    // High-Intent Buying Queries
    'buy online',
    'online shopping',
    'global online marketplace',
    'buy laptops online',
    'buy macbook pro',
    'buy hp elitebook',
    'buy microphones online',
    'buy phones online',
    'electronics online store',
    'fashion online store',
    'verified sellers marketplace',
    'wholesale and retail suppliers',
    'direct contact sellers',
    // Regional & Local High-Ranking Keywords
    'online shopping Ghana',
    'buy products Ghana online',
    'Accra marketplace',
    'Ghana business directory and marketplace',
    'WhatsApp shopping contact',
    'verified companies Ghana',
    'best price in Ghana',
  ],
  authors: [{ name: 'Market PLV (Perennial Link Ventures)' }],
  creator: 'Market PLV',
  publisher: 'Market PLV',
  category: 'Online Marketplace',
  classification: 'Shopping & E-Commerce',
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  // ── Geo / Global & Regional SEO meta tags ─────────────────────────────────
  other: {
    'geo.region': 'GH-AA',
    'geo.placename': 'Accra, Greater Accra, Ghana',
    'geo.position': '5.5502;-0.2174',
    'ICBM': '5.5502, -0.2174',
    'DC.title': 'Market PLV — Global Online Marketplace & Shopping',
    'DC.subject': 'Online Marketplace; Shopping; E-Commerce; Electronics; Ghana; Worldwide',
    'DC.language': 'en',
  },
  openGraph: {
    title: 'Market PLV — Global Online Marketplace & Verified Shopping',
    description:
      'Buy and sell electronics, laptops, phones, fashion, and goods worldwide and in Ghana. Contact verified sellers directly on Market PLV.',
    url: appUrl,
    siteName: 'Market PLV',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Market PLV — Global Online Marketplace & Shopping Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market PLV — Global Online Marketplace & Verified Shopping',
    description:
      'Buy and sell electronics, laptops, phones, fashion, and goods worldwide and in Ghana. Contact verified sellers directly on Market PLV.',
    images: [`${appUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#1A2D44',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── JSON-LD Structured Data ───────────────────────────────────────────────

  // 1. WebSite — enables Google Sitelinks Search Box for product queries
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Market PLV',
    alternateName: ['Market-PLV', 'Perennial Link Ventures Marketplace', 'Market PLV Online Store'],
    url: appUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${appUrl}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 2. OnlineMarketplace / Store — establishes e-commerce entity authority with Google AI & Shopping
  const marketplaceSchema = {
    '@context': 'https://schema.org',
    '@type': ['OnlineMarketplace', 'Store'],
    name: 'Market PLV',
    url: appUrl,
    description:
      'Premier global and regional online marketplace connecting buyers directly with verified sellers for electronics, laptops, phones, fashion, home goods, and services.',
    logo: `${appUrl}/icon.png`,
    image: `${appUrl}/og-image.png`,
    telephone: '+233594772823',
    email: 'info@market-plv.com',
    currenciesAccepted: 'GHS, USD, EUR, GBP',
    paymentAccepted: 'Cash on Delivery, Mobile Money, Bank Transfer, Card',
    priceRange: '$$',
    areaServed: [
      { '@type': 'Country', name: 'Ghana' },
      { '@type': 'AdministrativeArea', name: 'Worldwide' },
    ],
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'GH',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 7,
      returnMethod: 'https://schema.org/ReturnInStore',
      returnFees: 'https://schema.org/FreeReturn',
    },
  };

  // 3. Organization — Brand trust & customer contact
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Market PLV (Perennial Link Ventures)',
    alternateName: 'Market PLV',
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    telephone: '+233594772823',
    email: 'info@market-plv.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tuba / Weija',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      postalCode: 'GA',
      addressCountry: 'GH',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+233594772823',
        contactType: 'customer service',
        availableLanguage: ['en', 'Akan', 'Ga'],
        areaServed: ['GH', 'Worldwide'],
      },
    ],
  };

  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0YX7WJXNYL" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0YX7WJXNYL');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 antialiased text-slate-900 overflow-x-hidden">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
