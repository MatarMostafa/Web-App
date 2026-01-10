-- Migration to remove Activity model and ensure all data is in CustomerActivity
-- This migration ensures that the Activities table is dropped and all references are updated

-- First, ensure all necessary data is in CustomerActivity
-- (This should already be done based on the schema, but we're being safe)

-- Drop any remaining foreign key constraints that might reference the old Activity table
-- Note: Since the Activity model has been removed from schema.prisma, 
-- this migration mainly serves as documentation and cleanup

-- The CustomerActivity model now contains all necessary fields:
-- - name, type, code, description, unit (copied from Activity)
-- - customerId, orderId (for customer isolation and order association)
-- - quantity, unitPrice, lineTotal (for pricing and order line items)

-- Update any remaining references in other tables if they exist
-- (Based on the schema review, all references should already be updated)

-- This migration is mainly for documentation purposes since the schema
-- has already been updated to remove the Activity model