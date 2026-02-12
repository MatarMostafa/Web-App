-- Add missing columns to orders table safely
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS "cartonQuantity" INTEGER,
  ADD COLUMN IF NOT EXISTS "articleQuantity" INTEGER;

-- Add missing columns to customer_prices table safely
ALTER TABLE customer_prices
  ADD COLUMN IF NOT EXISTS "customerActivityId" TEXT;

-- Update customer_prices to link to customer_activities if needed
UPDATE customer_prices cp
SET "customerActivityId" = ca.id
FROM customer_activities ca
WHERE cp."customerActivityId" IS NULL
  AND cp."customerId" = ca."customerId"
  AND ca."activityId" IS NOT NULL
  AND cp."activityId" = ca."activityId";
