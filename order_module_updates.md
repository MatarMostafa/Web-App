# Orders Module Updates - Requirements Analysis

## Client Requirements Summary
1. **Auto-generate order numbers** in sequential numeric order
2. **Auto-update status** based on progress
3. **Replace title field** with customer selection dropdown
4. **Keep description field** as is
5. **Keep date field** as is
6. **Auto-fill location** based on selected customer's address

## Current System Analysis

### Frontend Components
- **AddOrderDialog.tsx**: Currently has manual order number input and title field
- **Order Store**: Uses standard CRUD operations without auto-generation logic
- **Order Types**: Includes orderNumber, title, customerId fields

### Backend Services
- **Order Service**: Basic CRUD operations, no auto-generation logic
- **Order Controller**: Standard REST endpoints
- **Database Schema**: Order table has orderNumber, title, customerId fields

### Database Structure
- **Order table**: Has customerId field (optional) linking to Customer table
- **Customer table**: Has address field (JSON type) with customer address data

## Required Changes

### 1. Auto-Generate Order Numbers

**Backend Changes:**
- **Order Service**: Add function to generate sequential order numbers
  - Query database for highest existing order number
  - Increment by 1 for new orders
  - Handle concurrent requests with database transactions
  - Format: "ORD-000001", "ORD-000002", etc.

**Frontend Changes:**
- **AddOrderDialog.tsx**: Remove order number input field (make it read-only/hidden)
- **Order Types**: Make orderNumber optional in CreateOrderData interface

### 2. Auto-Update Status Based on Progress

**Backend Changes:**
- **Order Service**: Add status update logic based on assignments and progress
  - DRAFT → OPEN (when order is created with basic info)
  - OPEN → ACTIVE (when employees are assigned)
  - ACTIVE → IN_PROGRESS (when work starts)
  - IN_PROGRESS → COMPLETED (when all assignments completed)
- **Assignment Service**: Trigger order status updates when assignment status changes

**Frontend Changes:**
- **AddOrderDialog.tsx**: Remove manual status selection (auto-set to DRAFT)
- Consider adding status display (read-only) to show current auto-calculated status

### 3. Replace Title Field with Customer Selection

**Frontend Changes:**
- **AddOrderDialog.tsx**: 
  - Remove title input field
  - Add customer selection dropdown using existing customer store
  - Fetch customers on dialog open
  - Make customer selection required

**Backend Changes:**
- **Order Types**: Make customerId required in CreateOrderData
- **Order Validation**: Add validation to ensure customerId is provided

### 4. Auto-Fill Location Based on Customer Address

**Frontend Changes:**
- **AddOrderDialog.tsx**:
  - Add useEffect to watch customer selection changes
  - When customer is selected, auto-populate location field with customer address
  - Format customer address JSON into readable string
  - Allow manual override of auto-filled location

**Backend Changes:**
- **Customer Service**: Ensure address data is properly formatted and accessible
- Consider adding helper function to format address for display

## Implementation Priority

### Phase 1: Core Functionality
1. Auto-generate order numbers (Backend + Frontend)
2. Replace title with customer selection (Frontend)
3. Auto-fill location from customer address (Frontend)

### Phase 2: Advanced Features
1. Auto-update status based on progress (Backend logic)
2. Status change notifications (if needed)

## Technical Considerations

### Database Considerations
- **Order Number Generation**: Use database transactions to prevent duplicate numbers
- **Indexing**: Ensure orderNumber field is indexed for performance
- **Constraints**: Add unique constraint on orderNumber field

### Frontend UX Considerations
- **Customer Search**: Consider adding search/filter functionality for customer dropdown
- **Address Formatting**: Standardize how customer addresses are displayed
- **Validation**: Ensure proper form validation with new required customer field

### Backend Performance
- **Concurrent Order Creation**: Handle multiple simultaneous order creations
- **Status Update Triggers**: Optimize status update logic to avoid unnecessary database calls

## Files to Modify

### Frontend Files
1. `/apps/web/src/components/admin/AddOrderDialog.tsx`
2. `/apps/web/src/types/order.ts`
3. `/apps/web/src/store/orderStore.ts` (if needed for customer integration)

### Backend Files
1. `/apps/api/src/services/orderService.ts`
2. `/apps/api/src/controllers/orderController.ts`
3. `/apps/api/src/types/order.ts`
4. `/apps/api/src/validation/orderSchemas.ts`

### Database Files
1. `/packages/db/prisma/schema.prisma` (if schema changes needed)

## Testing Requirements
- Test order number generation under concurrent requests
- Test customer selection and address auto-fill functionality
- Test status auto-update logic with various assignment scenarios
- Validate form behavior with new required customer field