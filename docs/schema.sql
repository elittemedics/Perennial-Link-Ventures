-- PostgreSQL Complete Database DDL for Perennial Link Ventures Business Directory Platform
-- Compatible with Hostinger Cloud Startup PostgreSQL 14+ / 15+ / 16+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('VISITOR', 'BUSINESS_OWNER', 'MODERATOR', 'ADMINISTRATOR');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
CREATE TYPE "BusinessStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "SubscriptionPlanEnum" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatusEnum" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');
CREATE TYPE "AdPlacement" AS ENUM ('HOMEPAGE_HERO', 'SIDEBAR', 'CATEGORY_TOP', 'LISTING_FOOTER');
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED', 'PENDING');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'BUSINESS', 'REVIEW', 'SUBSCRIPTION', 'INQUIRY');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "ClickTarget" AS ENUM ('PHONE', 'EMAIL', 'WEBSITE', 'WHATSAPP', 'DIRECTIONS');

-- ── TABLES ──────────────────────────────────────────────────────────────────

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    "passwordHash" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'VISITOR',
    "image" TEXT,
    "phone" VARCHAR(50),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "twoFactorToken" VARCHAR(20),
    "twoFactorExpires" TIMESTAMP WITH TIME ZONE,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Country" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) UNIQUE NOT NULL,
    "code" VARCHAR(10) UNIQUE NOT NULL,
    "phoneCode" VARCHAR(20),
    "flagEmoji" VARCHAR(10),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Region" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "countryId" UUID NOT NULL REFERENCES "Country"("id") ON DELETE CASCADE,
    "code" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "City" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "regionId" UUID REFERENCES "Region"("id") ON DELETE SET NULL,
    "countryId" UUID NOT NULL REFERENCES "Country"("id") ON DELETE CASCADE,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Category" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "icon" VARCHAR(255),
    "description" TEXT,
    "parentId" UUID REFERENCES "Category"("id") ON DELETE SET NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Subcategory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "categoryId" UUID NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE,
    "description" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Business" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "tagline" VARCHAR(255),
    "description" TEXT NOT NULL,
    "categoryId" UUID NOT NULL REFERENCES "Category"("id"),
    "subcategoryId" UUID REFERENCES "Subcategory"("id") ON DELETE SET NULL,
    "phone" VARCHAR(50) NOT NULL,
    "whatsapp" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "website" VARCHAR(255),
    "address" TEXT NOT NULL,
    "cityId" UUID REFERENCES "City"("id") ON DELETE SET NULL,
    "regionId" UUID REFERENCES "Region"("id") ON DELETE SET NULL,
    "countryId" UUID REFERENCES "Country"("id") ON DELETE SET NULL,
    "cityName" VARCHAR(255) NOT NULL,
    "stateName" VARCHAR(255),
    "countryName" VARCHAR(255) NOT NULL DEFAULT 'Ghana',
    "zipCode" VARCHAR(50),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logo" TEXT,
    "coverImage" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'PENDING',
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "viewCount" INT NOT NULL DEFAULT 0,
    "clickCount" INT NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalReviews" INT NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BusinessGallery" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "caption" VARCHAR(255),
    "mediaType" VARCHAR(50) NOT NULL DEFAULT 'IMAGE',
    "sortOrder" INT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BusinessService" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "icon" VARCHAR(255),
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BusinessProduct" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "discountPercentage" INT DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "image" TEXT,
    "whatsappPhone" VARCHAR(50),
    "productCategory" VARCHAR(255) NOT NULL DEFAULT 'Other categories',
    "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BusinessSocialLink" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "platform" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL
);

CREATE TABLE "BusinessOpeningHour" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" VARCHAR(10),
    "closeTime" VARCHAR(10),
    "isClosed" BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT "unique_business_day" UNIQUE ("businessId", "dayOfWeek")
);

CREATE TABLE "Review" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "rating" INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "title" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT TRUE,
    "deletedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ReviewReply" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reviewId" UUID NOT NULL REFERENCES "Review"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Favorite" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_favorite" UNIQUE ("userId", "businessId")
);

CREATE TABLE "InquiryMessage" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" UUID NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
    "senderName" VARCHAR(255) NOT NULL,
    "senderEmail" VARCHAR(255) NOT NULL,
    "senderPhone" VARCHAR(50),
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "reply" TEXT,
    "replyAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "entityId" VARCHAR(255),
    "details" TEXT,
    "ipAddress" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── INDEXES & FULL TEXT SEARCH ──────────────────────────────────────────────

CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_business_slug" ON "Business"("slug");
CREATE INDEX "idx_business_status" ON "Business"("status");
CREATE INDEX "idx_business_category" ON "Business"("categoryId");
CREATE INDEX "idx_business_owner" ON "Business"("ownerId");
CREATE INDEX "idx_business_city" ON "Business"("cityName");
CREATE INDEX "idx_business_country" ON "Business"("countryName");

-- GIN Index for PostgreSQL Full-Text Search
CREATE INDEX "idx_business_fts" ON "Business" USING gin(
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(description,'') || ' ' || coalesce("cityName",'') || ' ' || coalesce("countryName",''))
);

-- ── VIEWS ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW "View_Active_Businesses" AS
SELECT 
    b.id,
    b.name,
    b.slug,
    b.tagline,
    b.description,
    b.phone,
    b.email,
    b.website,
    b.address,
    b."cityName",
    b."countryName",
    b.logo,
    b."coverImage",
    b."avgRating",
    b."totalReviews",
    b."viewCount",
    b."isFeatured",
    b."isVerified",
    c.name AS category_name,
    c.slug AS category_slug
FROM "Business" b
JOIN "Category" c ON b."categoryId" = c.id
WHERE b.status = 'APPROVED' AND b."deletedAt" IS NULL;
