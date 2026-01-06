-- Migration: Unified Activity & Pricing Model
-- This migration removes flat pricing and implements tiered pricing for all activities

-- Step 1: Add ActivityType enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "ActivityType" AS ENUM ('CONTAINER_UNLOADING', 'WRAPPING', 'REPACKING', 'CROSSING', 'LABELING', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to Activity table (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "activities" ADD COLUMN "type" "ActivityType";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Step 3: Migrate existing activities to new structure
-- Set default type based on name patterns
UPDATE "activities" SET "type" = 'CONTAINER_UNLOADING' WHERE LOWER("name") LIKE '%container%' OR LOWER("name") LIKE '%unload%';
UPDATE "activities" SET "type" = 'WRAPPING' WHERE LOWER("name") LIKE '%wrap%';
UPDATE "activities" SET "type" = 'REPACKING' WHERE LOWER("name") LIKE '%repack%' OR LOWER("name") LIKE '%pack%';
UPDATE "activities" SET "type" = 'CROSSING' WHERE LOWER("name") LIKE '%cross%';
UPDATE "activities" SET "type" = 'LABELING' WHERE LOWER("name") LIKE '%label%';
UPDATE "activities" SET "type" = 'OTHER' WHERE "type" IS NULL;

-- Step 4: Make type column required
ALTER TABLE "activities" ALTER COLUMN "type" SET NOT NULL;

-- Step 5: Add new columns to CustomerPrice table for tiered pricing (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "customer_prices" ADD COLUMN "minQuantity" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "customer_prices" ADD COLUMN "maxQuantity" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Step 6: Migrate existing flat prices to single tier (1 to 999999)
UPDATE "customer_prices" SET 
  "minQuantity" = 1,
  "maxQuantity" = 999999
WHERE "minQuantity" IS NULL;

-- Step 7: Make quantity columns required
ALTER TABLE "customer_prices" ALTER COLUMN "minQuantity" SET NOT NULL;
ALTER TABLE "customer_prices" ALTER COLUMN "maxQuantity" SET NOT NULL;

-- Step 8: Update CustomerActivity table to enforce quantity
ALTER TABLE "customer_activities" ALTER COLUMN "quantity" DROP DEFAULT;
ALTER TABLE "customer_activities" ALTER COLUMN "quantity" SET NOT NULL;
ALTER TABLE "customer_activities" ALTER COLUMN "unitPrice" SET NOT NULL;
ALTER TABLE "customer_activities" ALTER COLUMN "lineTotal" SET NOT NULL;

-- Step 9: Update OrderQualification table to enforce quantity
ALTER TABLE "order_qualifications" ALTER COLUMN "quantity" DROP DEFAULT;
ALTER TABLE "order_qualifications" ALTER COLUMN "quantity" SET NOT NULL;

-- Step 10: Remove defaultPrice column from activities (only if it exists)
DO $$ BEGIN
    ALTER TABLE "activities" DROP COLUMN "defaultPrice";
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Step 11: Update unique constraint for customer_prices
DO $$ BEGIN
    ALTER TABLE "customer_prices" DROP CONSTRAINT "customer_prices_customerId_activityId_effectiveFrom_key";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "customer_prices" ADD CONSTRAINT "customer_prices_customerId_activityId_minQuantity_maxQuantity_effectiveFrom_key" 
      UNIQUE ("customerId", "activityId", "minQuantity", "maxQuantity", "effectiveFrom");
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Step 12: Update any existing customer activities with missing quantities
UPDATE "customer_activities" SET "quantity" = 1 WHERE "quantity" IS NULL OR "quantity" = 0;
UPDATE "order_qualifications" SET "quantity" = 1 WHERE "quantity" IS NULL OR "quantity" = 0;