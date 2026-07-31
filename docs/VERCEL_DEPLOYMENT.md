# Vercel & Netlify Deployment Guide
## Perennial Link Ventures Business Directory Platform

This guide outlines how to deploy the **Perennial Link Ventures Business Directory Platform** to **Vercel** or **Netlify** for instant live preview and testing before migrating to Hostinger Cloud.

---

## 1. Quick Deploy to Vercel

1. Push your project repository to GitHub or GitLab.
2. Go to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `perennial-link-ventures` repository.
4. Keep Vercel's detected pnpm settings (or set the Build Command to):
   ```bash
   pnpm run build
   ```
5. Add the following **Environment Variables** in Vercel settings:
   - `DATABASE_URL`: A PostgreSQL connection string (for example Supabase, Neon, Railway, or a PostgreSQL server you control). This app is not compatible with MySQL.
   - `NEXTAUTH_SECRET`: Random 32-character string.
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://perennial-link-ventures.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: `https://perennial-link-ventures.vercel.app`.
   - `NEXT_PUBLIC_CONTACT_PHONE`: `0545898775`.
   - `NEXT_PUBLIC_CONTACT_LOCATION`: `Tuba/Weija, Greater Accra, Ghana`.
   - `BLOB_READ_WRITE_TOKEN`: Create a Vercel Blob store and add its token. This is required for image uploads because Vercel functions do not have persistent local disk storage.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM_NAME`, and `EMAIL_FROM` when email delivery is enabled.

6. Click **Deploy**. Vercel will build all Next.js 15 App Router pages, API routes, and Server Actions automatically!

After deployment, open `https://your-domain/api/categories`. It must return JSON, not an HTML page. If it returns HTML, confirm that the project is deployed as **Next.js** (not a static export) and inspect the Vercel Function logs for the route. The application now reports this server response clearly in the browser instead of showing a JSON parsing error.

## Security configuration

Enable Vercel's Firewall and add rate limits/challenge rules for `/api/auth/*`, `/api/v1/auth/*`, `/api/inquiries`, and `/api/v1/messages`. The code includes a per-instance fallback limit, but a Vercel Firewall rule is needed to enforce limits across all serverless instances and block abusive traffic before it reaches the database or email provider.

---

## 2. Quick Deploy to Netlify

1. Log into [Netlify.com](https://netlify.com) and select **"Add new site" > "Import an existing project"**.
2. Select your repository.
3. Build Settings:
   - **Build Command:** `pnpm prisma generate && next build`
   - **Publish Directory:** `.next`
4. Add Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
5. Click **Deploy Site**.

---

## 3. Platform Monetization Model (How the Website Owner Makes Money)

Although basic business listings are **100% Free** to attract massive business registration volume, the platform is engineered to generate strong recurring revenue for the owner through 5 key channels:

1. **Promoted / Featured Listings (Paid Subscriptions):**
   - Businesses pay monthly/yearly fees (e.g. GHS 150/month) for top search placement, gold border badges, and homepage carousel exposure.
2. **Verification Trust Badge Fee:**
   - One-time or annual verification fee (e.g. GHS 100) to receive the official green "Verified Entity" shield badge after document review.
3. **Direct Customer Lead Generation:**
   - Charge business owners per verified client inquiry/quote request received through the platform.
4. **Banner Advertisements (`/dashboard/admin/advertisements`):**
   - Sell targeted homepage hero and directory sidebar banner space to corporate sponsors, banks, telecom operators, and real estate developers.
5. **Google AdSense & Programmatic Display Ads:**
   - Pre-configured responsive ad slots embedded throughout category index pages and business profile pages.
