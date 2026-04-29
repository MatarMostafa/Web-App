-- Add pricing type fields to customer_activities
ALTER TABLE public.customer_activities
  ADD COLUMN IF NOT EXISTS "pricingTypes" text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS "hourlyRate" numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "perPiecePrice" numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "perArticlePrice" numeric(10,2) DEFAULT 0;
