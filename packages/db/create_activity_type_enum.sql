-- Create ActivityType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "ActivityType" AS ENUM ('PACKING', 'UNPACKING', 'LOADING', 'UNLOADING', 'TRANSPORT', 'STORAGE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Remove default before altering type
ALTER TABLE customer_activities 
  ALTER COLUMN type DROP DEFAULT;

-- Alter the type column to use the enum
ALTER TABLE customer_activities 
  ALTER COLUMN type TYPE "ActivityType" USING type::"ActivityType";

-- Set default back
ALTER TABLE customer_activities 
  ALTER COLUMN type SET DEFAULT 'OTHER'::"ActivityType";
