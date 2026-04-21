-- Rename article→piece fields on orders (pieces = individual units/phones)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='articleQuantity') THEN
    ALTER TABLE "orders" RENAME COLUMN "articleQuantity" TO "pieceQuantity";
  END IF;
END $$;

-- Rename article→piece fields on containers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='containers' AND column_name='articleQuantity') THEN
    ALTER TABLE "containers" RENAME COLUMN "articleQuantity" TO "pieceQuantity";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='containers' AND column_name='articlePrice') THEN
    ALTER TABLE "containers" RENAME COLUMN "articlePrice" TO "piecePrice";
  END IF;
END $$;

-- Rename reported field on container_employees
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='container_employees' AND column_name='reportedArticleQuantity') THEN
    ALTER TABLE "container_employees" RENAME COLUMN "reportedArticleQuantity" TO "reportedPieceQuantity";
  END IF;
END $$;

-- Add PER_ARTICLE to PricingMethod enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'PER_ARTICLE'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PricingMethod')
  ) THEN
    ALTER TYPE "PricingMethod" ADD VALUE 'PER_ARTICLE';
  END IF;
END $$;

-- customer_pricing_rules: drop method column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_pricing_rules' AND column_name='method') THEN
    ALTER TABLE "customer_pricing_rules" DROP COLUMN "method";
  END IF;
END $$;

-- customer_pricing_rules: rename articleRate → pieceRate
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_pricing_rules' AND column_name='articleRate') THEN
    ALTER TABLE "customer_pricing_rules" RENAME COLUMN "articleRate" TO "pieceRate";
  END IF;
END $$;

-- customer_pricing_rules: add articleRate for PER_ARTICLE billing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_pricing_rules' AND column_name='articleRate') THEN
    ALTER TABLE "customer_pricing_rules" ADD COLUMN "articleRate" DECIMAL(10,2);
  END IF;
END $$;

-- billing_line_items: drop old unique constraints if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'billing_line_items_assignmentId_key') THEN
    ALTER TABLE "billing_line_items" DROP CONSTRAINT "billing_line_items_assignmentId_key";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'billing_line_items_containerEmployeeId_key') THEN
    ALTER TABLE "billing_line_items" DROP CONSTRAINT "billing_line_items_containerEmployeeId_key";
  END IF;
END $$;

-- billing_line_items: add composite unique indexes per (entity, method)
CREATE UNIQUE INDEX IF NOT EXISTS "billing_line_items_assignmentId_method_key"
  ON "billing_line_items"("assignmentId", "method")
  WHERE "assignmentId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "billing_line_items_containerEmployeeId_method_key"
  ON "billing_line_items"("containerEmployeeId", "method")
  WHERE "containerEmployeeId" IS NOT NULL;
