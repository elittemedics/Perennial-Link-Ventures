-- Add Google OAuth provider tracking to User
ALTER TABLE "User" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'credentials';
ALTER TABLE "User" ADD COLUMN "providerId" TEXT;
CREATE INDEX "User_provider_providerId_idx" ON "User"("provider", "providerId");