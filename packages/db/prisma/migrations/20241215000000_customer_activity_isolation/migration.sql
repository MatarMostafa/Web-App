-- Customer Activity Isolation Migration
-- This migration adds constraints to ensure proper customer-activity isolation

-- Add index for better performance on customer activity queries
CREATE INDEX IF NOT EXISTS "customer_activities_customer_order_idx" ON "customer_activities" ("customerId", "orderId");
CREATE INDEX IF NOT EXISTS "customer_activities_customer_active_idx" ON "customer_activities" ("customerId", "isActive");

-- Add index for customer pricing queries
CREATE INDEX IF NOT EXISTS "customer_prices_customer_activity_active_idx" ON "customer_prices" ("customerId", "activityId", "isActive");
CREATE INDEX IF NOT EXISTS "customer_prices_effective_dates_idx" ON "customer_prices" ("effectiveFrom", "effectiveTo");

-- Create a function to validate customer activity isolation
CREATE OR REPLACE FUNCTION validate_customer_activity_isolation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."orderId" IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM "orders" 
            WHERE "id" = NEW."orderId" 
            AND "customerId" = NEW."customerId"
        ) THEN
            RAISE EXCEPTION 'Customer activity customer ID must match order customer ID';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce customer activity isolation
DROP TRIGGER IF EXISTS customer_activity_isolation_trigger ON "customer_activities";
CREATE TRIGGER customer_activity_isolation_trigger
    BEFORE INSERT OR UPDATE ON "customer_activities"
    FOR EACH ROW
    EXECUTE FUNCTION validate_customer_activity_isolation();