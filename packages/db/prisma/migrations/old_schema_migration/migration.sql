BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

----------------------------
-- 1) Extend customer_activities (only if table exists)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    ALTER TABLE public.customer_activities
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS type public."ActivityType",
      ADD COLUMN IF NOT EXISTS code text,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS unit text DEFAULT 'hour',
      ADD COLUMN IF NOT EXISTS "basePrice" numeric(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "articleBasePrice" numeric(10,2) DEFAULT 0;
  END IF;
END$$;

----------------------------
-- 2) Populate from activities (only if tables exist)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities')
     AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
    
    UPDATE public.customer_activities ca
    SET
      name = a.name,
      code = a.code,
      description = a.description,
      unit = COALESCE(ca.unit, a.unit, 'hour'),
      "basePrice" = COALESCE(a."defaultPrice", ca."basePrice", 0),
      type = COALESCE(ca.type, 'OTHER')
    FROM public.activities a
    WHERE ca."activityId" IS NOT NULL
      AND a.id = ca."activityId";

    UPDATE public.customer_activities
    SET
      name = COALESCE(name, 'Unknown activity'),
      type = COALESCE(type, 'OTHER'),
      "basePrice" = COALESCE("basePrice", 0),
      "articleBasePrice" = COALESCE("articleBasePrice", 0)
    WHERE name IS NULL OR type IS NULL;
  END IF;
END$$;

----------------------------
-- 3) customer_prices new columns (only if table exists)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_prices') THEN
    ALTER TABLE public.customer_prices
      ADD COLUMN IF NOT EXISTS "customerActivityId" text,
      ADD COLUMN IF NOT EXISTS "minQuantity" integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "maxQuantity" integer DEFAULT 1;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_prices')
     AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    
    UPDATE public.customer_prices cp
    SET "customerActivityId" = ca.id
    FROM public.customer_activities ca
    WHERE cp."customerActivityId" IS NULL
      AND cp."customerId" = ca."customerId"
      AND ca."activityId" IS NOT NULL
      AND ca."activityId" = cp."activityId";

    WITH unmapped AS (
      SELECT DISTINCT cp."customerId" AS customer_id, a.id AS activity_id,
             a.name, a.code, a.description, a.unit, a."defaultPrice"
      FROM public.customer_prices cp
      JOIN public.activities a ON a.id = cp."activityId"
      LEFT JOIN public.customer_activities ca
        ON ca."customerId" = cp."customerId" AND ca."activityId" = a.id
      WHERE cp."customerActivityId" IS NULL
        AND cp."activityId" IS NOT NULL
    )
    INSERT INTO public.customer_activities (
      id, "customerId", "orderId", name, type, code, description, unit, quantity,
      "unitPrice", "lineTotal", "isActive", "createdAt", "updatedAt", "activityId", "basePrice", "articleBasePrice"
    )
    SELECT gen_random_uuid()::text, customer_id, NULL, name, 'OTHER', code, description, COALESCE(unit,'hour'),
           1, NULL, NULL, true, NOW(), NOW(), activity_id, COALESCE("defaultPrice",0), 0
    FROM unmapped;

    UPDATE public.customer_prices cp
    SET "customerActivityId" = ca.id
    FROM public.customer_activities ca
    WHERE cp."customerActivityId" IS NULL
      AND ca."activityId" = cp."activityId"
      AND ca."customerId" = cp."customerId";
  END IF;
END$$;

----------------------------
-- 4) order_qualifications (only if table exists)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_qualifications') THEN
    ALTER TABLE public.order_qualifications
      ADD COLUMN IF NOT EXISTS "customerActivityId" text;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_qualifications')
     AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    
    UPDATE public.order_qualifications oq
    SET "customerActivityId" = ca.id
    FROM public.customer_activities ca
    WHERE oq."customerActivityId" IS NULL
      AND ca."orderId" IS NOT NULL
      AND ca."orderId" = oq."orderId"
      AND ca."activityId" = oq."activityId";
  END IF;
END$$;

----------------------------
-- 5) Drop old FKs + columns (only if they exist)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    ALTER TABLE public.customer_activities
      DROP CONSTRAINT IF EXISTS "customer_activities_activityId_fkey";
    ALTER TABLE public.customer_activities
      DROP COLUMN IF EXISTS "activityId";
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_prices') THEN
    ALTER TABLE public.customer_prices
      DROP CONSTRAINT IF EXISTS "customer_prices_activityId_fkey";
    ALTER TABLE public.customer_prices
      DROP COLUMN IF EXISTS "activityId";
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_qualifications') THEN
    ALTER TABLE public.order_qualifications
      DROP COLUMN IF EXISTS "activityId";
  END IF;
END$$;

----------------------------
-- 6) Add new FKs (only if tables exist)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_prices')
     AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    ALTER TABLE public.customer_prices
      ADD CONSTRAINT "customer_prices_customerActivityId_fkey"
      FOREIGN KEY ("customerActivityId")
      REFERENCES public.customer_activities(id)
      ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_qualifications')
     AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_activities') THEN
    ALTER TABLE public.order_qualifications
      ADD CONSTRAINT "order_qualifications_customerActivityId_fkey"
      FOREIGN KEY ("customerActivityId")
      REFERENCES public.customer_activities(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

----------------------------
-- 7) Enforce quantity not null (only if table exists)
----------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_prices') THEN
    ALTER TABLE public.customer_prices
      ALTER COLUMN "minQuantity" SET NOT NULL,
      ALTER COLUMN "maxQuantity" SET NOT NULL;
  END IF;
END$$;

COMMIT;
