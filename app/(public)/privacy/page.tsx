import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | Perennial Link Ventures',
  description: 'Privacy Policy for Perennial Link Ventures directory and marketplace in Ghana.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-sea hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-sea shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Perennial Link Ventures · Last Updated: August 2026</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            Perennial Link Ventures (&quot;Perennial Link Ventures&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates an online business directory and marketplace that helps customers discover businesses, products, and services and communicate directly with businesses and service providers.
            This Privacy Policy explains what personal information we collect, how we use it, when we may share it, how we protect it, and the choices and rights available to you.
          </p>
          <p className="text-xs font-bold text-slate-700 bg-sky-50 border border-sky-100 p-3 rounded-xl">
            By using our website, creating an account, submitting a business listing, contacting a business, or otherwise using our services, you acknowledge the practices described in this Privacy Policy.
          </p>
        </div>

        {/* Policy Content */}
        <Card className="p-8 sm:p-10 space-y-8 text-slate-700 text-sm leading-relaxed border-slate-200">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">1. Who We Are</h2>
            <p>
              Perennial Link Ventures is the operator of the Perennial Link Ventures online business directory and marketplace.
              Our website allows businesses and service providers to create listings and upload information about their businesses, products, and services. Customers and visitors can browse listings and contact businesses directly.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs font-medium">
              <p className="font-bold text-slate-900 mb-1">Our Contact Details:</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-sea shrink-0" /> Perennial Link Ventures — Tuba/Weija, Greater Accra, Ghana</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-sea shrink-0" /> Email: info@market-plv.com</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-sea shrink-0" /> Telephone: 0594772823</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">2. Information We Collect</h2>
            <p>Depending on how you use our website, we may collect the following categories of information:</p>
            
            <div className="space-y-4 pl-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">A. Account Information</h3>
                <p className="text-xs text-slate-600 mt-1">When you create an account, we may collect:</p>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mt-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Telephone number</li>
                  <li>Password or authentication information</li>
                  <li>Account type, such as business owner or client/visitor</li>
                  <li>Other information you voluntarily provide during registration</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">B. Business Listing Information</h3>
                <p className="text-xs text-slate-600 mt-1">If you register or operate a business listing, we may collect information such as:</p>
                <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1 mt-1">
                  <li>Business name, description, category, and location</li>
                  <li>Business telephone number, WhatsApp contact info, and business email address</li>
                  <li>Products and services offered, including names, descriptions, prices, and images</li>
                  <li>Business logo and other uploaded images</li>
                  <li>Other information you choose to publish through your listing</li>
                </ul>
                <p className="text-xs italic text-slate-500 mt-1">
                  Information deliberately published as part of a public business listing may be visible to website visitors.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">C. Communications and Inquiries</h3>
                <p className="text-xs text-slate-600">
                  If you contact us, submit an inquiry, report a listing, submit a review, or communicate with a business through functionality provided by our platform, we may collect the information contained in that communication.
                  Where our website directs you to contact a business through WhatsApp, telephone, email, or another external communication service, that communication may also be subject to the privacy policy of the relevant service provider.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">D. Technical Information</h3>
                <p className="text-xs text-slate-600">
                  When you visit our website, certain technical information may be automatically collected, such as IP address, browser type and version, device type, operating system, date and time of access, pages visited, referring pages, general usage, and security diagnostic data.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">E. Cookies and Similar Technologies</h3>
                <p className="text-xs text-slate-600">
                  We use cookies and similar technologies to keep the website functioning properly, remember preferences, maintain sessions, improve performance, understand usage, and detect security abuse. You can control cookies through your browser settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">3. How We Use Your Information</h2>
            <p>We may use personal information to:</p>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
              <li>Create and manage user accounts</li>
              <li>Provide our directory and marketplace services</li>
              <li>Publish and manage business listings, products, and service profiles</li>
              <li>Enable customers to contact businesses directly via WhatsApp or phone</li>
              <li>Respond to inquiries and support requests</li>
              <li>Verify or review business information where appropriate</li>
              <li>Prevent fraud, abuse, spam, and other harmful activity</li>
              <li>Protect the security and integrity of our platform</li>
              <li>Comply with applicable legal obligations and resolve disputes</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">4. Public Business Listings</h2>
            <p>
              Businesses should understand that information deliberately submitted for publication in a public listing may be accessible to members of the public.
              This includes business names, descriptions, telephone numbers, WhatsApp contact info, locations, product catalog items, prices, and uploaded photos. Business owners should avoid publishing sensitive personal information that they do not want publicly accessible.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">5. Direct Communication With Businesses</h2>
            <p>
              Perennial Link Ventures is designed to connect customers directly with businesses. When you choose to contact a business through WhatsApp, telephone, email, or another external communication channel, the information you provide may be received directly by that business and processed according to its own practices. Perennial Link Ventures does not control how an independent business handles information you voluntarily provide directly to that business.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">6. Sharing of Personal Information</h2>
            <p><strong>We do not sell personal information.</strong> We may disclose information where reasonably necessary:</p>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
              <li>To service providers that help us operate, maintain, secure, or improve the platform</li>
              <li>To technology, hosting, storage, analytics, communications, or security providers</li>
              <li>Where you have chosen to publish the information publicly</li>
              <li>To investigate fraud, security incidents, or violations of our Terms</li>
              <li>Where required by law, court order, or regulatory authority</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">7. Third-Party Services and Links</h2>
            <p>
              Our website may use or link to third-party services. A link to another website does not mean that Perennial Link Ventures controls that website. Third-party websites have their own privacy practices and terms which you should review.
            </p>
          </section>

          {/* Section 8 & 9 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">8 &amp; 9. Data Security and Data Retention</h2>
            <p>
              We take reasonable technical and organizational measures to protect personal information against unauthorized access, loss, misuse, or alteration. We retain personal information only for as long as reasonably necessary to fulfill service requirements, resolve disputes, enforce agreements, or comply with legal obligations.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 bg-brand-50/50 p-5 rounded-2xl border border-brand-100">
            <h2 className="text-lg font-bold text-slate-900 border-b border-brand-200 pb-2">10. Your Data Protection Rights (Act 843 Compliance)</h2>
            <p>
              Ghana&apos;s <strong>Data Protection Act, 2012 (Act 843)</strong> provides data subjects with rights including access, correction, deletion, consent withdrawal, and protection from unauthorized processing or direct marketing.
            </p>
            <p className="text-xs text-slate-600">
              To exercise any of your privacy rights, please contact our Data Officer via email: <a href="mailto:info@market-plv.com" className="font-bold text-sea hover:underline">info@market-plv.com</a>.
            </p>
          </section>

          {/* Section 11 - 15 */}
          <section className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-slate-900">11. Marketing Communications</h3>
              <p className="text-xs text-slate-600">You may withdraw consent or request to stop receiving marketing communications at any time by contacting us.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">12. Children&apos;s Privacy</h3>
              <p className="text-xs text-slate-600">Our services are intended for general business users. We do not knowingly collect personal information from children.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">13. International Users &amp; Data Transfers</h3>
              <p className="text-xs text-slate-600">Where personal information is processed outside Ghana, we take steps to ensure appropriate safeguards in accordance with applicable data protection requirements.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">14. Changes to This Privacy Policy</h3>
              <p className="text-xs text-slate-600">We may update this policy periodically. Please review this page regularly for changes.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">15. Contact Us</h3>
              <p className="text-xs text-slate-600">For questions regarding this policy, contact:</p>
              <div className="mt-2 text-xs font-medium text-slate-800 space-y-1">
                <p><strong>Perennial Link Ventures</strong></p>
                <p>📍 Location: Tuba/Weija, Greater Accra, Ghana</p>
                <p>✉️ Email: info@market-plv.com</p>
                <p>📞 Phone: 0594772823</p>
              </div>
            </div>
          </section>

        </Card>
      </div>
    </div>
  );
}
