-- First, update existing orders to have a customer if they don't have one
-- This assumes you have at least one customer in the database
UPDATE "orders" 
SET "customerId" = (SELECT id FROM "customers" LIMIT 1) 
WHERE "customerId" IS NULL;

-- Make customerId column NOT NULL
ALTER TABLE "orders" ALTER COLUMN "customerId" SET NOT NULL;

-- Drop the title column
ALTER TABLE "orders" DROP COLUMN "title";