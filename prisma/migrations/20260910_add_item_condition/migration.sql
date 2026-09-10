-- Add item condition tracking to BusinessProduct
ALTER TABLE "BusinessProduct" ADD COLUMN "itemCondition" TEXT NOT NULL DEFAULT 'NewCondition';