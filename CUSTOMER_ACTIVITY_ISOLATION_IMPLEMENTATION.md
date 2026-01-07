# Customer-Activity Isolation Implementation

## Overview

This document outlines the implementation of customer-activity isolation in the ERP system to ensure that activities belong to specific customers and cannot be accessed by other customers.

## Problem Statement

Previously, activities were shared globally across all customers, which posed security and data isolation concerns. The system needed to ensure that:

1. **Activities belong to specific customers** - One customer cannot see another customer's activities
2. **Proper data isolation** - Customer activities are filtered by customer ID
3. **Order-activity relationship** - Activities in orders must belong to the same customer as the order
4. **Pricing validation** - Only activities with valid pricing for a customer can be used

## Solution Architecture

### Database Structure

The system uses the following key tables for customer-activity isolation:

1. **`activities`** - Global activity definitions (shared catalog)
2. **`customer_prices`** - Customer-specific pricing for activities
3. **`customer_activities`** - Customer-specific activity instances linked to orders
4. **`orders`** - Orders belonging to specific customers

### Key Relationships

```
Customer (1) -----> (N) CustomerPrice (N) -----> (1) Activity
Customer (1) -----> (N) Order (1) -----> (N) CustomerActivity (N) -----> (1) Activity
```

## Implementation Details

### 1. Customer Activity Service (`customerActivityService.ts`)

A dedicated service that handles all customer-activity operations with proper validation:

```typescript
export class CustomerActivityService {
  // Validate that an activity is available for a specific customer
  static async validateActivityForCustomer(customerId: string, activityId: string): Promise<boolean>
  
  // Get activities available for a specific customer
  static async getCustomerActivities(customerId: string)
  
  // Get customer activities for a specific order with validation
  static async getOrderCustomerActivities(orderId: string)
  
  // Create customer activity with validation
  static async createCustomerActivity(data: {...})
}
```

### 2. API Route Updates

#### Customer Routes (`customerRoutes.ts`)
- **`GET /api/customers/me/activities`** - Returns only activities with valid pricing for the customer
- Uses `CustomerPrice` table to filter activities
- Ensures customer can only see activities they have access to

#### Customer Activity Routes (`customerActivityRoutes.ts`)
- **`GET /api/customer-activities/:customerId/activities`** - Admin endpoint to view customer activities
- **`POST /api/customer-activities/:customerId/activities/:activityId/pricing`** - Add pricing for customer
- **`DELETE /api/customer-activities/:customerId/activities/:activityId/pricing/:priceId`** - Remove pricing
- **`GET /api/customer-activities/:customerId/activities/statistics`** - Customer activity statistics

#### Order Routes (`orderRoutes.ts`)
- **`GET /api/orders/:orderId/activity-ids`** - Returns activity IDs filtered by customer
- Validates that activities belong to the same customer as the order

### 3. Service Layer Updates

#### Order Service (`orderService.ts`)
- **Activity Creation**: Validates that activities have valid pricing before creating `CustomerActivity` records
- **Activity Updates**: Ensures customer ID consistency when updating order activities
- **Customer Validation**: Checks pricing availability before allowing activity assignment

#### Customer Service (`customerService.ts`)
- **Order Activities**: Uses `CustomerActivityService` for proper filtering
- **Activity Access**: Only returns activities available to the specific customer

### 4. Database Constraints

#### Migration (`20241215000000_customer_activity_isolation`)
- **Indexes**: Added performance indexes for customer-activity queries
- **Triggers**: Database-level validation to ensure customer-activity consistency
- **Comments**: Documentation of isolation requirements

```sql
-- Ensure customer activities belong to the correct customer
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
```

## Security Features

### 1. Access Control
- **Customer Isolation**: Customers can only access their own activities
- **Role-Based Access**: Admin/Team Leader roles can manage all customer activities
- **Sub-Account Support**: Sub-users inherit parent customer's activity access

### 2. Data Validation
- **Pricing Validation**: Activities must have valid pricing for the customer
- **Order Consistency**: Order activities must belong to the same customer as the order
- **Active Status**: Only active activities and pricing are considered

### 3. Database Integrity
- **Foreign Key Constraints**: Ensure referential integrity
- **Triggers**: Validate customer-activity relationships at database level
- **Indexes**: Optimized queries for customer-specific data

## API Endpoints

### Customer Endpoints
```
GET    /api/customers/me/activities              # Get customer's available activities
GET    /api/customers/me/orders                  # Get customer's orders
GET    /api/customers/me/orders/:id              # Get specific customer order
POST   /api/customers/me/orders                  # Create customer order
PUT    /api/customers/me/orders/:id              # Update customer order
```

### Admin Endpoints
```
GET    /api/customer-activities/:customerId/activities                    # Get customer activities
POST   /api/customer-activities/:customerId/activities/:activityId/pricing # Add customer pricing
DELETE /api/customer-activities/:customerId/activities/:activityId/pricing/:priceId # Remove pricing
GET    /api/customer-activities/:customerId/activities/statistics         # Activity statistics
```

### Order Endpoints
```
GET    /api/orders/:orderId/activities           # Get order activities (filtered by customer)
GET    /api/orders/:orderId/activity-ids         # Get order activity IDs (filtered by customer)
```

## Data Flow

### 1. Customer Activity Access
```
Customer Login → Get Customer ID → Query CustomerPrice → Filter Activities → Return Available Activities
```

### 2. Order Activity Assignment
```
Create/Update Order → Validate Customer Activities → Check Pricing → Create CustomerActivity Records
```

### 3. Activity Pricing Management
```
Admin → Select Customer → Add Activity Pricing → CustomerPrice Record → Activity Available to Customer
```

## Benefits

### 1. Security
- **Complete Isolation**: Customers cannot access other customers' activities
- **Data Privacy**: Customer-specific activity data is protected
- **Access Control**: Role-based permissions for activity management

### 2. Flexibility
- **Custom Pricing**: Each customer can have different pricing for the same activity
- **Activity Availability**: Control which activities are available to which customers
- **Scalability**: System can handle multiple customers with different activity sets

### 3. Maintainability
- **Clear Separation**: Customer-specific logic is isolated in dedicated services
- **Validation**: Multiple layers of validation ensure data integrity
- **Documentation**: Comprehensive documentation and code comments

## Usage Examples

### 1. Customer Accessing Activities
```typescript
// Customer can only see activities with valid pricing
const activities = await CustomerActivityService.getCustomerActivities(customerId);
```

### 2. Creating Order with Activities
```typescript
// Activities are validated against customer pricing
const order = await createOrderService({
  customerId: "customer-123",
  activities: [
    { activityId: "activity-456", quantity: 10 }
  ]
});
```

### 3. Admin Managing Customer Activities
```typescript
// Admin can manage activities for any customer
const customerActivities = await CustomerActivityService.getCustomerActivities("customer-123");
```

## Migration Guide

### For Existing Data
1. **Backup Database**: Create full backup before migration
2. **Run Migration**: Execute the customer activity isolation migration
3. **Validate Data**: Ensure all customer activities have proper customer associations
4. **Test Access**: Verify customers can only access their own activities

### For New Installations
1. **Fresh Install**: Migration is included in the schema
2. **Seed Data**: Create sample customers and activities with pricing
3. **Test Isolation**: Verify customer isolation works correctly

## Monitoring and Maintenance

### 1. Performance Monitoring
- Monitor query performance on customer-activity joins
- Check index usage for customer-specific queries
- Track API response times for activity endpoints

### 2. Data Integrity Checks
- Regular validation of customer-activity relationships
- Monitor for orphaned customer activities
- Verify pricing data consistency

### 3. Security Auditing
- Log customer activity access attempts
- Monitor cross-customer data access attempts
- Regular security reviews of isolation implementation

## Conclusion

The customer-activity isolation implementation provides a secure, scalable, and maintainable solution for ensuring that activities belong to specific customers and cannot be accessed by unauthorized users. The multi-layered approach with database constraints, service-level validation, and API-level filtering ensures complete data isolation while maintaining system performance and flexibility.