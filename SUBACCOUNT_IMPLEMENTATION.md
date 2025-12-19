# Customer Sub-Accounts Implementation Strategy

## Overview
Implement customer internal users (sub-accounts) to allow companies to have multiple dispatchers or team coordinators who can create and manage orders under their parent customer account.

## Current Database Analysis

### Existing Structure
- **Users Table**: Handles authentication with `UserRole` enum
- **Customer Table**: Main customer accounts with company information
- **SubAccount Table**: Already exists but appears unused/incomplete
- **Order Table**: Links to `customerId` for order ownership

### Current UserRole Enum
```prisma
enum UserRole {
  ADMIN
  TEAM_LEADER
  EMPLOYEE
  HR_MANAGER
  SUPER_ADMIN
  CUSTOMER
}
```

## Implementation Strategy

### Phase 1: Database Schema Updates

#### 1.1 Extend UserRole Enum
```prisma
enum UserRole {
  ADMIN
  TEAM_LEADER
  EMPLOYEE
  HR_MANAGER
  SUPER_ADMIN
  CUSTOMER
  CUSTOMER_SUB_USER  // NEW ROLE
}
```

#### 1.2 Enhance SubAccount Model
```prisma
model SubAccount {
  id       String  @id @default(cuid())
  name     String
  email    String  @unique
  code     String?
  isActive Boolean @default(true)
  
  // Link to parent customer
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId String
  
  // Link to user account for authentication
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String @unique
  
  // Permissions and access control
  canCreateOrders Boolean @default(true)
  canEditOrders   Boolean @default(true)
  canViewReports  Boolean @default(false)
  
  // Metadata
  createdBy String? // Admin or Customer who created this sub-account
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([customerId, email])
  @@map("sub_accounts")
}
```

#### 1.3 Update User Model
```prisma
model User {
  // ... existing fields ...
  
  // Relations
  employee    Employee?
  customer    Customer?
  subAccount  SubAccount?  // NEW RELATION
  
  // ... rest of existing fields ...
}
```

#### 1.4 Update Order Model
```prisma
model Order {
  // ... existing fields ...
  
  // Enhanced customer tracking
  customer      Customer   @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId    String
  
  // Track which sub-user created the order (optional)
  createdBySubAccount SubAccount? @relation(fields: [createdBySubAccountId], references: [id])
  createdBySubAccountId String?
  
  // ... rest of existing fields ...
}
```

### Phase 2: Authentication & Authorization

#### 2.1 Role-Based Access Control
- **CUSTOMER**: Main customer admin, can manage sub-accounts and all orders
- **CUSTOMER_SUB_USER**: Sub-account user, can only see/manage orders for their customer

#### 2.2 Middleware Updates
```typescript
// Add to role checking middleware
const customerRoles = ['CUSTOMER', 'CUSTOMER_SUB_USER'];
const isCustomerUser = customerRoles.includes(user.role);

// Permission checking for sub-users
const canAccessCustomerData = (user, targetCustomerId) => {
  if (user.role === 'CUSTOMER' && user.customer?.id === targetCustomerId) return true;
  if (user.role === 'CUSTOMER_SUB_USER' && user.subAccount?.customerId === targetCustomerId) return true;
  return false;
};
```

### Phase 3: API Endpoints

#### 3.1 Sub-Account Management (Customer Admin)
```
POST   /api/customers/sub-accounts          # Create sub-account
GET    /api/customers/sub-accounts          # List customer's sub-accounts
PUT    /api/customers/sub-accounts/:id      # Update sub-account
DELETE /api/customers/sub-accounts/:id      # Delete sub-account
```

#### 3.2 Sub-Account Management (Super Admin)
```
GET    /api/admin/customers/:id/sub-accounts     # List customer's sub-accounts
POST   /api/admin/customers/:id/sub-accounts     # Create sub-account for customer
PUT    /api/admin/sub-accounts/:id              # Update any sub-account
DELETE /api/admin/sub-accounts/:id              # Delete any sub-account
```

#### 3.3 Order Management (Sub-Users)
```
GET    /api/sub-accounts/orders            # Get orders for sub-user's customer
POST   /api/sub-accounts/orders            # Create order for customer
PUT    /api/sub-accounts/orders/:id        # Update order (if created by sub-user)
```

### Phase 4: Frontend Implementation

#### 4.1 Customer Dashboard Enhancements
- Add "Sub-Accounts" section to customer dashboard
- Sub-account creation/management interface
- Permission management for each sub-account

#### 4.2 New Sub-Account Dashboard
- Similar to customer dashboard but with restricted permissions
- Only shows orders for their parent customer
- Cannot manage other sub-accounts

#### 4.3 Admin Dashboard Updates
- Add sub-account management to customer details page
- Ability to create/edit/delete sub-accounts for any customer
- View sub-account activity and order creation

### Phase 5: Data Inheritance & Security

#### 5.1 Data Access Rules
```typescript
// Sub-accounts inherit customer data
const getCustomerData = (user) => {
  if (user.role === 'CUSTOMER') return user.customer;
  if (user.role === 'CUSTOMER_SUB_USER') return user.subAccount.customer;
  return null;
};

// Order filtering for sub-users
const getOrdersForUser = (user) => {
  const customer = getCustomerData(user);
  return orders.filter(order => order.customerId === customer.id);
};
```

#### 5.2 Pricing Inheritance
- Sub-accounts automatically inherit parent customer's pricing
- No separate pricing configuration needed
- All billing goes to parent customer account

### Phase 6: Migration Strategy

#### 6.1 Database Migration
```sql
-- Add new role to enum
ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER_SUB_USER';

-- Update SubAccount table structure
ALTER TABLE "sub_accounts" ADD COLUMN "userId" TEXT UNIQUE;
ALTER TABLE "sub_accounts" ADD COLUMN "email" TEXT UNIQUE;
ALTER TABLE "sub_accounts" ADD COLUMN "canCreateOrders" BOOLEAN DEFAULT true;
ALTER TABLE "sub_accounts" ADD COLUMN "canEditOrders" BOOLEAN DEFAULT true;
ALTER TABLE "sub_accounts" ADD COLUMN "canViewReports" BOOLEAN DEFAULT false;
ALTER TABLE "sub_accounts" ADD COLUMN "createdBy" TEXT;

-- Add foreign key constraints
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Update orders table
ALTER TABLE "orders" ADD COLUMN "createdBySubAccountId" TEXT;
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdBySubAccountId_fkey"
  FOREIGN KEY ("createdBySubAccountId") REFERENCES "sub_accounts"("id");
```

#### 6.2 Data Migration
- No existing data migration needed (new feature)
- Existing customers remain unchanged
- Sub-accounts are opt-in feature

### Phase 7: Implementation Order

1. **Database Schema Updates** (1-2 days)
   - Update Prisma schema
   - Run migrations
   - Update TypeScript types

2. **Backend API Development** (3-4 days)
   - Authentication middleware updates
   - Sub-account CRUD endpoints
   - Order access control updates
   - Permission checking utilities

3. **Frontend Customer Portal** (2-3 days)
   - Sub-account management interface
   - Create/edit/delete sub-accounts
   - Permission configuration

4. **Frontend Sub-Account Dashboard** (2-3 days)
   - New dashboard for sub-users
   - Order management interface
   - Restricted feature set

5. **Admin Interface Updates** (1-2 days)
   - Sub-account management in admin panel
   - Customer details enhancement

6. **Testing & Security Review** (2-3 days)
   - Role-based access testing
   - Data isolation verification
   - Security audit

### Phase 8: Security Considerations

#### 8.1 Data Isolation
- Sub-accounts can only access their parent customer's data
- Strict filtering on all API endpoints
- No cross-customer data leakage

#### 8.2 Permission Management
- Granular permissions per sub-account
- Customer admin can control sub-account capabilities
- Super admin has override capabilities

#### 8.3 Audit Trail
- Track sub-account creation/modification
- Log order creation by sub-accounts
- Maintain audit trail for compliance

### Phase 9: User Experience Flow

#### 9.1 Customer Admin Flow
1. Login to customer dashboard
2. Navigate to "Sub-Accounts" section
3. Create new sub-account with email/permissions
4. Sub-account receives invitation email
5. Sub-account sets up password and logs in

#### 9.2 Sub-Account User Flow
1. Receive invitation email
2. Set up account password
3. Login to sub-account dashboard
4. Create/manage orders for parent customer
5. View only parent customer's orders

#### 9.3 Super Admin Flow
1. Access any customer's details
2. Manage sub-accounts for any customer
3. Override permissions as needed
4. Monitor sub-account activity

## Technical Requirements

### Dependencies
- Prisma schema updates
- NextAuth.js role configuration
- Email service for invitations
- Role-based middleware updates

### Performance Considerations
- Index on `customerId` for efficient filtering
- Proper query optimization for sub-account data access
- Caching strategy for customer data inheritance

### Monitoring & Analytics
- Track sub-account usage
- Monitor order creation patterns
- Customer adoption metrics

## Success Metrics
- Number of customers using sub-accounts
- Orders created by sub-accounts vs main accounts
- User satisfaction with multi-user capability
- Reduction in customer support requests for access management

## Risk Mitigation
- Comprehensive testing of data isolation
- Gradual rollout to select customers first
- Rollback plan for schema changes
- Security audit before production deployment