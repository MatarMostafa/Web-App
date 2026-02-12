-- Add missing columns to customer_activities table safely
ALTER TABLE customer_activities 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'hour',
  ADD COLUMN IF NOT EXISTS "basePrice" NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "articleBasePrice" NUMERIC(10,2) DEFAULT 0;

-- Populate name from activities table if activityId exists
UPDATE customer_activities ca
SET
  name = a.name,
  code = a.code,
  description = a.description,
  unit = COALESCE(ca.unit, a.unit, 'hour'),
  "basePrice" = COALESCE(a."defaultPrice", ca."basePrice", 0),
  type = COALESCE(ca.type, 'OTHER')
FROM activities a
WHERE ca."activityId" IS NOT NULL
  AND a.id = ca."activityId"
  AND ca.name IS NULL;

-- Set default values for any remaining NULL names
UPDATE customer_activities
SET
  name = COALESCE(name, 'Unknown activity'),
  type = COALESCE(type, 'OTHER'),
  "basePrice" = COALESCE("basePrice", 0),
  "articleBasePrice" = COALESCE("articleBasePrice", 0)
WHERE name IS NULL OR type IS NULL;
