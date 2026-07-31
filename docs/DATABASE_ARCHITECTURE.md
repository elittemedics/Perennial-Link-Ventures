# Perennial Link Ventures - Production PostgreSQL Database Architecture

## Overview
Perennial Link Ventures utilizes PostgreSQL with Prisma ORM 6.x to manage global business directory listings, multi-currency subscriptions, user authentication, review systems, analytics tracking, and geographic location hierarchies.

---

## 🏗️ Core Models & Data Schema

### 1. **Authentication & Access Control**
- `User`: Accounts for visitors, business owners, moderators, and administrators.
- `Role`: Enum (`VISITOR`, `BUSINESS_OWNER`, `MODERATOR`, `ADMINISTRATOR`).
- `Session` & `Account`: NextAuth.js OAuth and session persistence.
- `RolePermissionModel`, `Permission`, `UserRole`, `RolePermission`: Granular RBAC tables.

### 2. **Global Location Hierarchy**
- `Country`: Global country records (e.g. US, GH, GB, DE, AE) with phone codes, flags, standard currency.
- `Region`: State/Region mappings linked to parent countries.
- `City`: City records with latitude, longitude, and region/country pointers.

### 3. **Categories & Business Core**
- `Category`: Top-level business categories with hierarchical subcategory support.
- `Subcategory`: Specialized sector categories.
- `Business`: Central directory listing record.
  - Media & Branding: `BusinessGallery`, `BusinessLogo`, `BusinessCover`, `BusinessVideo`.
  - Content & Support: `BusinessService`, `BusinessProduct`, `BusinessOpeningHour`, `BusinessFAQ`, `BusinessContact`, `BusinessSocialLink`, `BusinessDocument`.

### 4. **Community & Interactions**
- `Review`: Star ratings (1-5), titles, and comments with automatic calculation of business average rating & review count.
- `ReviewReply`: Official owner or staff responses to user reviews.
- `Favorite` & `Bookmark`: User saved listings.
- `InquiryMessage`: Direct messages sent to business owners.

### 5. **Monetization & Ads**
- `SubscriptionPlan`: Free, Pro, Enterprise tiers with configurable limits for listings, photos, products, and services.
- `Subscription`: User active subscription status.
- `Payment` & `Invoice`: Payment gateway records (Card, Mobile Money, PayPal) with automated invoice numbers.
- `Advertisement`: Hero, Sidebar, Category top ad placement banners with click and impression tracking.

### 6. **Analytics & Audit Logs**
- `BusinessView`: Individual page view logs with visitor IP and user agent tracking.
- `BusinessClick`: Phone, Website, WhatsApp, and Direction click conversion tracking.
- `SearchLog`: Term searches, location filters, and result count tracking.
- `AdminLog` & `AuditLog`: Security audit trails for administrative actions.

---

## 🛠️ Data Access Layer (Repository Pattern)

All database interactions are encapsulated inside `@/lib/repositories`:

```typescript
import {
  BusinessRepository,
  CategoryRepository,
  UserRepository,
  ReviewRepository,
  SubscriptionRepository,
  LocationRepository,
  AnalyticsRepository
} from '@/lib/repositories';
```

### Key Repository Features:
1. **`BusinessRepository`**:
   - `findMany()`: Paginated search across name, description, category, city, country, min rating, and featured status.
   - `findBySlug()`: Full relational detail graph retrieval.
   - `create()`: Auto-generates unique slugs for new listings.
   - `incrementView()`: Atomic view count increment & view log insertion.

2. **`CategoryRepository`**:
   - `findMany()`: Returns main categories with subcategories and live business counts.
   - `getFeatured()`: Retrieves top featured categories for home page display.

3. **`ReviewRepository`**:
   - `createReview()`: Inserts user review and automatically recalculates business average rating (`avgRating`) and total review count (`totalReviews`).

4. **`SubscriptionRepository`**:
   - Manages plan tiers, user active plan states, payments, and invoices.

5. **`LocationRepository`**:
   - Manages global countries, regions, cities, and location auto-complete searches.

6. **`AnalyticsRepository`**:
   - Logs call-to-action click events and search term performance.

---

## 🚀 Useful Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to PostgreSQL database
npm run db:push

# Seed database with global locations, categories, sample businesses, & admin users
npm run db:seed
```

### Seeded users

Production seeds require a unique `SEED_DEFAULT_PASSWORD`; no default password is provided.
- **Admin**: `admin@perenniallink.com`
- **Owner**: `owner@perenniallink.com`
- **Visitor**: `visitor@perenniallink.com`
