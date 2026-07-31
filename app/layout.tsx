import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/common/Providers';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'Perennial Link Ventures | Global Business Directory',
    template: '%s | Perennial Link Ventures',
  },
  description:
    'Discover, compare, and contact trusted businesses directly by phone, WhatsApp, email, and website. Free global business listings for products and services.',
  keywords: [
    'Business Directory Ghana',
    'Perennial Link Ventures',
    'Accra Business Listings',
    'Ghana Yellow Pages',
    'Tuba Weija Businesses',
    'Verified Companies Ghana',
    'Ghana Business Registry',
    'Local Services Ghana',
    'Ghana Directory Search',
    'global business directory',
    'free business advertising',
    'contact businesses on WhatsApp',
  ],
  authors: [{ name: 'Perennial Link Ventures' }],
  creator: 'Perennial Link Ventures',
  publisher: 'Perennial Link Ventures',
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Perennial Link Ventures | Global Business Directory',
    description: 'Find trusted businesses and contact them directly by WhatsApp, phone, email, or website.',
    url: appUrl,
    siteName: 'Perennial Link Ventures',
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perennial Link Ventures | Premier Business Directory',
    description: 'Find trusted businesses and contact them directly by WhatsApp, phone, email, or website.',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Google Structured Data for Organization and SearchAction Sitelinks
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

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Perennial Link Ventures',
    url: appUrl,
    telephone: '0545898775',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tuba / Weija',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
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
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 antialiased text-slate-900">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
