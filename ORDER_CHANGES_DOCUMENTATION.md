# Order Creation and Edit Logic Changes

## Overview
Updated the order creation and edit logic to include a new step 3 for carton and article quantities, with price calculation based on activity price ranges.

## Changes Made

### 1. Frontend Changes

#### AddOrderDialog.tsx
- Added step 3 for carton and article quantity input
- Updated step navigation from 3 to 4 steps
- Added `cartonQuantity` and `articleQuantity` state variables
- Modified `getTotalPrice()` function to calculate based on carton quantity ranges
- Added validation for carton and article quantities
- Updated form submission to include new quantities

#### EditOrderDialog.tsx
- Added step 3 for carton and article quantity input
- Updated step navigation from 3 to 4 steps
- Added `cartonQuantity` and `articleQuantity` state variables
- Modified `getTotalPrice()` function to calculate based on carton quantity ranges
- Added validation for carton and article quantities
- Updated form submission to include new quantities
- Added logic to load existing quantities from order data

### 2. Backend Changes

#### Database Schema (schema.prisma)
- Added `cartonQuantity` and `articleQuantity` fields to Order model
- Both fields are optional integers

#### Order Service (orderService.ts)
- Updated `createOrderService` to handle cartonQuantity and articleQuantity
- Updated `updateOrderService` to handle cartonQuantity and articleQuantity
- Modified service functions to store these values in the database

#### Types (order.ts)
- Added cartonQuantity and articleQuantity to Order interface
- Added cartonQuantity and articleQuantity to CreateOrderData interface
- Added cartonQuantity and articleQuantity to UpdateOrderData interface

### 3. Database Migration
- Created migration files to add the new columns to the orders table
- Created migration scripts for both Unix/Linux and Windows

## Price Calculation Logic

The new price calculation works as follows:

1. **Step 1**: User selects customer
2. **Step 2**: User selects activities (shows price ranges but no total)
3. **Step 3**: User enters carton and article quantities
   - Price calculation is triggered when carton quantity is entered
   - For each selected activity, the system finds the price range that matches the carton quantity
   - If carton quantity falls within a price range (minQuantity <= cartonQuantity <= maxQuantity), that price is used
   - Total order price = sum of all applicable activity prices
4. **Step 4**: User completes other order details

### Example Price Calculation

**Example 1**: Carton quantity = 1500
- Activity 1: Range 0-1500 = €100
- Total = €100

**Example 2**: Carton quantity = 1200
- Activity 1: Range 1000-1500 = €800
- Activity 2: Range 1000-1500 = €400
- Total = €1200

## Files Modified

### Frontend
- `apps/web/src/components/admin/AddOrderDialog.tsx`
- `apps/web/src/components/admin/EditOrderDialog.tsx`
- `apps/web/src/types/order.ts`

### Backend
- `packages/db/prisma/schema.prisma`
- `apps/api/src/services/orderService.ts`

### Database
- `packages/db/prisma/migrations/20250103_add_order_quantities/migration.sql`

### Scripts
- `migrate-order-quantities.sh` (Unix/Linux)
- `migrate-order-quantities.bat` (Windows)

## How to Deploy

1. Run the database migration:
   ```bash
   # On Unix/Linux/macOS
   ./migrate-order-quantities.sh
   
   # On Windows
   migrate-order-quantities.bat
   ```

2. Restart the API server to load the updated Prisma client

3. The frontend changes will be automatically available after the next build/deployment

## Testing

1. Create a new order and verify the 4-step process works correctly
2. Test price calculation with different carton quantities
3. Edit an existing order and verify quantities are loaded and can be updated
4. Verify that the total price updates correctly based on carton quantity ranges