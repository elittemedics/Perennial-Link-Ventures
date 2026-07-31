import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service | Perennial Link Ventures' };

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose prose-slate">
      <h1>Terms of Service</h1>
      <p>Last updated: July 31, 2026</p>
      <h2>Using Perennial Link Ventures</h2>
      <p>You may use this directory and marketplace only for lawful business discovery, promotion, and communication. You must provide accurate information and must not impersonate another person or business.</p>
      <h2>Business listings and content</h2>
      <p>Listing owners are responsible for their content, prices, availability, contact details, and compliance with applicable law. We may review, suspend, remove, or edit content that is misleading, unlawful, abusive, fraudulent, or infringes another party&apos;s rights.</p>
      <h2>Direct dealings</h2>
      <p>Buyers and businesses deal directly with one another. Perennial Link Ventures is not a party to a sale, payment, delivery, warranty, or dispute between users. Verify a business and never send money or sensitive information until you are satisfied that the other party is legitimate.</p>
      <h2>Accounts and security</h2>
      <p>Keep your password and verification codes private. Notify us promptly if you suspect unauthorized account access. We may suspend accounts that create a security risk or violate these terms.</p>
      <h2>Contact</h2>
      <p>For questions about these terms, contact <a href="mailto:info@perenniallink.com">info@perenniallink.com</a>.</p>
    </main>
  );
}
