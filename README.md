# Perennial Link Ventures - Business Directory Platform

Production-ready, scalable Business Directory Platform similar to Yelp, Google Business Listings, and Yellow Pages. Self-hosted and optimized for Hostinger Cloud Startup deployment.

---

## 🚀 Technology Stack

- **Framework:** Next.js 15 (App Router, Server Actions & API Routes)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Database:** MySQL 8 with Prisma ORM
- **Authentication:** NextAuth / Auth.js with credentials & role-based RBAC (`ADMIN`, `BUSINESS_OWNER`, `VISITOR`)
- **Validation:** Zod & React Hook Form
- **Image Processing:** Sharp (Auto WebP compression, thumbnail generation, storage abstraction)
- **Emails:** Nodemailer (Welcome, Inquiry alerts, Password resets)
- **SEO:** Dynamic Metadata, Open Graph, Twitter Cards, JSON-LD `LocalBusiness` schema, `sitemap.xml`, `robots.txt`

---

## 🎨 Brand Design & Palette
- **Primary Color:** Sea Blue (`#0284C7` / `#006699`)
- **Secondary:** Clean Crisp White (`#FFFFFF`)
- **Accent:** Touch of Slate Grey (`#64748B` / `#F1F5F9`)
- **Contact Hotline:** `0545898775`
- **Headquarters Location:** `Tuba/Weija, Greater Accra, Ghana`

---

## 📌 Core Features

### Public Portal
- **Hero Directory Search:** Keyword, Category dropdown, and City/Location filters.
- **Featured Listings:** Verified badge, star ratings, categories, and direct contact buttons.
- **Business Profile (`/business/[slug]`):** Photo gallery lightbox, operating hours, products/services catalog, customer reviews, write review modal, direct inquiry contact form, JSON-LD structured data.
- **Category & Location Indexes:** Taxonomies and city breakdown.

### Business Owner Dashboard (`/dashboard/owner`)
- Profile views and inquiry message metrics.
- Business profile creation & editing with Sharp WebP image uploads.
- Customer inquiries inbox.

### Admin Operations Center (`/dashboard/admin`)
- Moderation workflow: Approve/Reject pending listings with custom rejection messages.
- Toggle Featured listings and Verified badges.
- Category taxonomy manager.
- System metrics and audit logs.

---

## 🛠️ Local Development Setup

1. **Clone project & install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env`):**
   Copy `.env.example` to `.env` and adjust database credentials.

3. **Prisma Setup & Database Seeding:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seed Credentials

- **Seeded administrator account:** set `SEED_DEFAULT_PASSWORD` before production seeding; no public default password is provided.
- **Business Owner Account:** `owner@perenniallink.com` / `Owner123!`
- **Visitor Account:** `visitor@perenniallink.com` / `Owner123!`

---

## 📄 Hostinger Cloud Deployment
Refer to [HOSTINGER_DEPLOYMENT.md](file:///c:/Users/pc/Desktop/Perennial%20Link%20Ventures/docs/HOSTINGER_DEPLOYMENT.md) for full server setup, PM2 process configuration, Nginx reverse proxy, and SSL setup.
