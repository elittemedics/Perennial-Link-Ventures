import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | Perennial Link Ventures' };

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 prose prose-slate">
      <h1>Privacy Policy</h1>
      <p>Last updated: July 31, 2026</p>
      <h2>Information we collect</h2>
      <p>We collect the account, listing, inquiry, review, and technical information needed to operate the directory, communicate with users, prevent abuse, and improve the service.</p>
      <h2>How we use information</h2>
      <p>We use information to provide accounts and listings, deliver requested messages, protect the platform, respond to support requests, and comply with legal obligations. Public listing information is displayed to visitors.</p>
      <h2>Sharing</h2>
      <p>We share information only when needed to operate the platform, comply with law, protect rights and safety, or when you choose to publish it in a listing or inquiry. We do not sell personal information.</p>
      <h2>Security and retention</h2>
      <p>We use reasonable technical and organizational safeguards. No online service can guarantee absolute security. We retain data only for as long as needed for the purposes described here or as required by law.</p>
      <h2>Your choices</h2>
      <p>You may request access, correction, or deletion of your account information by contacting <a href="mailto:info@market-plv.com">info@market-plv.com</a>.</p>
    </main>
  );
}
