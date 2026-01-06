# Unified Activity & Pricing Model Implementation

## Overview

This implementation successfully refactors the ERP system to use a unified activity & pricing model where:

- **Container unloading is now just one activity type** among others
- **ALL activities use tiered pricing** based on quantity ranges
- **Quantity is REQUIRED** for all activities without exception
- **No flat pricing exists** anywhere in the system

## Key Changes Made

### 1. Database Schema Updates (`schema.prisma`)

#### Activity Model Changes:
- **REMOVED**: `defaultPrice` field (completely eliminated flat pricing)
- **ADDED**: `type` field with enum `ActivityType` containing:
  - `CONTAINER_UNLOADING`
  - `WRAPPING` 
  - `REPACKING`
  - `CROSSING`
  - `LABELING`
  - `OTHER`

#### CustomerPrice Model Changes:
- **ADDED**: `minQuantity` and `maxQuantity` fields for tiered pricing
- **UPDATED**: Unique constraint to include quantity ranges
- **ENFORCED**: All pricing is now quantity-based with no exceptions

#### CustomerActivity & OrderQualification Changes:
- **ENFORCED**: `quantity` field is now required (removed default values)
- **ENFORCED**: `unitPrice` and `lineTotal` are required

### 2. Backend API Updates

#### Price Service (`priceService.ts`):
- **NEW**: `getPriceForCustomer()` now requires `quantity` parameter
- **NEW**: `validatePriceTierOverlap()` validates quantity range overlaps
- **REMOVED**: All fallback to default pricing logic
- **ENFORCED**: Hard errors when no pricing tier matches quantity

#### Customer Pricing Controller (`customerPricingController.ts`):
- **NEW**: `createCustomerPrice()` requires min/max quantity ranges
- **NEW**: `calculatePrice()` endpoint for real-time price calculation
- **UPDATED**: All validation enforces positive quantities
- **REMOVED**: All references to `defaultPrice`

#### Order Service (`orderService.ts`):
- **UPDATED**: All price calculations pass quantity parameter
- **ENFORCED**: Activities without quantity cause order creation to fail

### 3. Frontend Updates

#### Type Definitions (`types/order.ts`):
- **ADDED**: `ActivityType` enum matching backend
- **ADDED**: `CustomerPriceTier` interface for tiered pricing
- **ENFORCED**: `quantity` is required in all activity interfaces

#### Activities Page (`ActivitiesPage.tsx`):
- **REMOVED**: Default price display and input fields
- **ADDED**: Activity type selection and display
- **UPDATED**: Form validation removes price-related fields

#### Activity Dialogs:
- **REMOVED**: Default price inputs from Add/Edit dialogs
- **ADDED**: Activity type selection with predefined options
- **SIMPLIFIED**: Forms focus on activity definition, not pricing

#### Customer Pricing Tab (`CustomerPricingTab.tsx`):
- **REPLACED**: Single price input with quantity range inputs
- **ADDED**: Min/Max quantity validation
- **UPDATED**: Table displays quantity ranges instead of default prices

#### Create Order Dialog (`CreateOrderDialog.tsx`):
- **ENFORCED**: Quantity input required for each selected activity
- **UPDATED**: UI prevents order submission without quantities
- **REMOVED**: Price calculation without quantity

### 4. Migration Strategy

#### Database Migration (`migration.sql`):
- **STEP 1**: Add `ActivityType` enum to database
- **STEP 2**: Migrate existing activities to appropriate types
- **STEP 3**: Add quantity range columns to `customer_prices`
- **STEP 4**: Migrate existing flat prices to single tier (1-999999)
- **STEP 5**: Remove `defaultPrice` column completely
- **STEP 6**: Update constraints and enforce required fields

## Validation Rules Implemented

### Quantity Validation:
- ✅ Quantity must be provided for ALL activities
- ✅ Quantity must be positive (> 0)
- ✅ Order creation fails if any activity lacks quantity
- ✅ Price calculation fails if quantity is missing

### Pricing Tier Validation:
- ✅ `minQuantity` ≤ `maxQuantity` enforced
- ✅ No overlapping tiers for same customer/activity/date range
- ✅ Price must be positive
- ✅ Hard error if no tier matches requested quantity

### Activity Type Validation:
- ✅ Only predefined activity types allowed
- ✅ Activity type required for all new activities
- ✅ Consistent activity type display across UI

## API Endpoints Updated

### New Endpoints:
- `POST /pricing/customers/:id/calculate` - Calculate price for quantity
- `POST /pricing/customers/:id/prices` - Create price tier (with quantity ranges)

### Updated Endpoints:
- `GET /pricing/customers/:id/prices` - Returns tiered pricing data
- `POST /orders` - Enforces quantity for all activities
- `PUT /orders/:id` - Validates quantity requirements

### Removed Functionality:
- ❌ Default price fallback logic
- ❌ Flat pricing creation/update
- ❌ Price calculation without quantity

## Error Handling

### New Error Messages:
- `"Quantity is required and must be positive"`
- `"No pricing tier found for quantity X of activity Y"`
- `"Minimum quantity cannot be greater than maximum quantity"`
- `"Price tier overlaps with existing tier"`

### Validation Failures:
- Order creation fails gracefully with clear error messages
- Price calculation returns specific tier mismatch errors
- Frontend prevents invalid form submissions

## Testing Checklist

### ✅ Backend Validation:
- [x] Price calculation requires quantity
- [x] Order creation enforces activity quantities
- [x] Tier overlap validation works
- [x] No default price fallbacks exist

### ✅ Frontend Validation:
- [x] Activity forms require type selection
- [x] Order creation requires quantities
- [x] Price tier forms validate ranges
- [x] No default price inputs remain

### ✅ Data Migration:
- [x] Existing activities get appropriate types
- [x] Flat prices convert to single tiers
- [x] Database constraints enforced
- [x] No data loss during migration

## Deployment Steps

1. **Run Database Migration**:
   ```bash
   yarn workspace @repo/db prisma migrate deploy
   ```

2. **Update Application Code**:
   ```bash
   yarn build
   yarn workspace api restart
   yarn workspace web restart
   ```

3. **Verify System**:
   - Test activity creation with types
   - Test price tier creation with ranges
   - Test order creation with quantities
   - Verify no flat pricing remains

## Success Criteria Met

✅ **Container unloading is just one activity type** - No special treatment
✅ **All activities use tiered pricing** - No flat pricing exists
✅ **Quantity required everywhere** - Hard validation enforced
✅ **No default prices** - Completely removed from system
✅ **Consistent behavior** - All activities follow same rules
✅ **Clean migration** - Existing data preserved and converted
✅ **User-friendly errors** - Clear validation messages
✅ **Type safety** - Strong typing throughout stack

The system now enforces a truly unified activity & pricing model with no exceptions or legacy behavior remaining.