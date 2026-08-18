import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/common/Providers';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://market-plv.com';

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
  title: {
    default: 'Perennial Link Ventures | Ghana Business Directory',
    template: '%s | Perennial Link Ventures',
  },
  description:
    "Ghana's premier verified business directory. Discover, compare, and contact trusted businesses in Accra, Tema, Kumasi & beyond — by WhatsApp, phone, email, or website. Free to list.",
  keywords: [
    // Brand
    'Perennial Link Ventures',
    'market-plv.com',
    // Directory — Ghana
    'Business Directory Ghana',
    'Ghana Yellow Pages',
    'Ghana Business Registry',
    'Verified Companies Ghana',
    'Accra Business Listings',
    'Tuba Weija Businesses',
    'Greater Accra Business Directory',
    'Ghana Local Business Search',
    // Long-tail intent
    'find businesses in Ghana',
    'contact businesses on WhatsApp Ghana',
    'free business listing Ghana',
    'list my business in Ghana',
    'Ghana company directory',
    'buy products Ghana online',
    'Ghana services directory',
    'verified suppliers Ghana',
    'local services Accra',
    'small business Ghana',
    // Global
    'global business directory',
    'free business advertising',
    'WhatsApp business contact',
  ],
  authors: [{ name: 'Perennial Link Ventures' }],
  creator: 'Perennial Link Ventures',
  publisher: 'Perennial Link Ventures',
  category: 'Business Directory',
  classification: 'Business',
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  // ── Geo / Local SEO meta tags ─────────────────────────────────────────────
  other: {
    'geo.region': 'GH-AA',
    'geo.placename': 'Accra, Greater Accra, Ghana',
    'geo.position': '5.5502;-0.2174',
    'ICBM': '5.5502, -0.2174',
    'DC.title': 'Perennial Link Ventures — Ghana Business Directory',
    'DC.subject': 'Business Directory; Ghana; Accra',
    'DC.language': 'en',
  },
  openGraph: {
    title: 'Perennial Link Ventures | Ghana Business Directory',
    description:
      'Find verified businesses in Ghana and contact them directly by WhatsApp, phone, email, or website. Free to list.',
    url: appUrl,
    siteName: 'Perennial Link Ventures',
    locale: 'en_GH',
    type: 'website',
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Perennial Link Ventures — Ghana Business Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perennial Link Ventures | Ghana Business Directory',
    description:
      'Find verified businesses in Ghana and contact them by WhatsApp, phone, email, or website.',
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

  // 1. WebSite — enables Google Sitelinks Search Box
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Perennial Link Ventures Directory',
    url: appUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${appUrl}/listings?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 2. Organization — brand knowledge panel signals
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Perennial Link Ventures',
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    sameAs: [],
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
  };

  // 3. LocalBusiness — local SEO signals (maps, local pack)
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Perennial Link Ventures',
    description:
      "Ghana's premier verified business directory connecting customers with local businesses via WhatsApp, phone, email, and website.",
    url: appUrl,
    telephone: '+233594772823',
    email: 'info@market-plv.com',
    image: `${appUrl}/og-image.png`,
    priceRange: 'Free',
    currenciesAccepted: 'GHS',
    paymentAccepted: 'Free listing',
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tuba / Weija',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 5.5502,
      longitude: -0.2174,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  };

  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
