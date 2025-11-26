# Customer Portal Implementation Documentation

## Overview
This document outlines the implementation of the Customer Portal feature for the ERP Beta system. The customer portal allows customers to login, view their orders, and manage their profile information while maintaining strict data isolation from internal business operations.

## 🗄️ Database Schema Changes

### 1. UserRole Enum Extension
```prisma
enum UserRole {
  ADMIN
  TEAM_LEADER
  EMPLOYEE
  HR_MANAGER
  SUPER_ADMIN
  CUSTOMER  // ✅ Added
}
```

### 2. Customer Model Enhancement
```prisma
model Customer {
  // ... existing fields
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String? @unique  // ✅ Added optional user relationship
  // ... rest of fields
}
```

### 3. User Model Update
```prisma
model User {
  // ... existing fields
  employee Employee?
  customer Customer?  // ✅ Added customer relationship
  // ... rest of fields
}
```

## 🔧 Backend Implementation

### 1. Authentication Updates

#### Auth Middleware Enhancement
- **File**: `apps/api/src/middleware/authMiddleware.ts`
- **Changes**: 
  - Added customer relation to user query
  - Added customer blocking check similar to employee blocking
  - Handles CUSTOMER role validation

#### Auth Service Extension
- **File**: `apps/api/src/services/authService.ts`
- **New Functions**:
  - `registerCustomer()`: Creates user with CUSTOMER role and linked customer record
  - Updated `login()` to handle customer users and blocking

#### Auth Routes Addition
- **File**: `apps/api/src/routes/core/authRoutes.ts`
- **New Route**: `POST /api/auth/register-customer`

### 2. Customer Service Layer
- **File**: `apps/api/src/services/customerService.ts`
- **Functions**:
  - `filterOrderForCustomer()`: Removes sensitive data from orders
  - `mapOrderStatusForCustomer()`: Maps internal status to customer-friendly labels
  - `validateCustomerOrderAccess()`: Ensures customers only access their orders
  - `getCustomerOrdersService()`: Fetches customer's orders with filtering
  - `getCustomerOrderByIdService()`: Single order with access validation
  - `getCustomerProfileService()`: Customer profile management
  - `updateCustomerProfileService()`: Profile updates

### 3. Customer API Routes
- **File**: `apps/api/src/routes/customerRoutes.ts`
- **Endpoints**:
  - `GET /api/customers/me/orders` - List customer orders
  - `GET /api/customers/me/orders/:id` - Single order details
  - `GET /api/customers/me` - Customer profile
  - `PUT /api/customers/me` - Update profile

### 4. Data Security & Filtering

#### Order Data Filtering
Orders shown to customers exclude:
- `estimatedHours`, `actualHours` (pricing data)
- `employeeAssignments` (internal assignments)
- `ratings` (internal ratings)
- `specialInstructions` (internal notes)

#### Status Mapping
- `DRAFT`, `OPEN` → `Planned`
- `ACTIVE`, `IN_PROGRESS`, `IN_REVIEW` → `In Progress`
- `COMPLETED` → `Completed`
- `CANCELLED`, `EXPIRED` → `Cancelled`

## 🎨 Frontend Implementation

### 1. Customer Dashboard Structure
```
apps/web/src/app/dashboard-customer/
├── layout.tsx          # Customer portal layout with role protection
├── page.tsx           # Dashboard with order statistics
└── orders/
    ├── page.tsx       # Orders list with search
    └── [id]/page.tsx  # Order detail view
```

### 2. Customer Components
```
apps/web/src/components/customer/
├── Sidebar.tsx        # Customer navigation sidebar
└── Header.tsx         # Customer header with notifications
```

### 3. State Management
- **File**: `apps/web/src/store/customerStore.ts`
- **Features**:
  - Order fetching and caching
  - Profile management
  - Error handling
  - Loading states

### 4. Authentication Updates
- **File**: `apps/web/src/lib/auth.ts`
- **Changes**: Added redirect handling for CUSTOMER role

- **File**: `apps/web/src/components/auth/SignInPage.tsx`
- **Changes**: 
  - Added customer registration link
  - Updated role-based redirect logic

### 5. Customer Registration
- **File**: `apps/web/src/app/(auth)/customer-register/page.tsx`
- **Features**:
  - Company information collection
  - Account creation with email verification
  - Form validation and error handling

## 🔐 Security Implementation

### 1. Role-Based Access Control
- Customers can only access `/dashboard-customer/*` routes
- Automatic redirect based on user role after login
- API endpoints protected with `roleMiddleware(["CUSTOMER"])`

### 2. Data Isolation
- Customers can only see their own orders
- No access to employee data, pricing, or internal information
- Order access validated by customer ownership

### 3. Route Protection
- Customer dashboard layout validates user role
- Redirects non-customers to appropriate dashboards
- Session-based authentication with NextAuth

## 🎯 Customer Portal Features

### 1. Dashboard
- Order statistics (total, completed, in progress, planned)
- Recent orders overview
- Company profile summary
- Clean, customer-focused interface

### 2. Order Management
- **Orders List**: Search and filter customer orders
- **Order Details**: Status tracking, scheduled dates, descriptions
- **Status Updates**: Real-time order status information
- **Contact Support**: Easy access to help resources

### 3. Profile Management
- Company information updates
- Contact details management
- Account settings access

## 🔔 Notification Integration

### Customer Notifications
- Order status changes
- New order assignments
- System announcements
- Multi-language support (English/German)

### Notification Features
- Real-time delivery
- Click-to-navigate functionality
- Read/unread tracking
- Customer-appropriate messaging

## 🚀 Deployment & Migration

### Database Migration
Run the following command to apply schema changes:
```bash
yarn workspace @repo/db prisma migrate dev --name add_customer_portal
```

### Environment Variables
No new environment variables required - uses existing configuration.

### Deployment Steps
1. Apply database migration
2. Deploy backend API changes
3. Deploy frontend updates
4. Test customer registration and login flow

## 🧪 Testing Checklist

### Backend Testing
- [ ] Customer registration creates user and customer records
- [ ] Customer login works with role validation
- [ ] Customer API endpoints return filtered data
- [ ] Access control prevents unauthorized data access
- [ ] Order filtering removes sensitive information

### Frontend Testing
- [ ] Customer registration form works
- [ ] Customer login redirects to customer dashboard
- [ ] Customer dashboard displays correct data
- [ ] Order list and details show filtered information
- [ ] Role-based navigation works correctly

### Security Testing
- [ ] Customers cannot access admin/employee routes
- [ ] Customers cannot see other customers' orders
- [ ] API endpoints validate customer ownership
- [ ] Sensitive data is properly filtered

## 🔮 Future Enhancements

### Phase 2 Features (Prepared Structure)
- Customer order creation capability
- Order modification requests
- Document upload/download
- Enhanced communication tools
- Order history analytics

### Technical Improvements
- Real-time order status updates
- Mobile app support
- Advanced search and filtering
- Bulk order operations

## 📝 Usage Instructions

### For Customers
1. Visit `/customer-register` to create account
2. Verify email address
3. Login at `/login`
4. Access dashboard at `/dashboard-customer`
5. View orders, manage profile, track status

### For Administrators
- Existing customers can be linked to user accounts
- Customer accounts can be managed through admin panel
- Order assignments automatically visible to customers

## 🛠️ Maintenance

### Regular Tasks
- Monitor customer registration and login metrics
- Review customer feedback and support requests
- Update customer-facing documentation
- Maintain data filtering rules

### Performance Considerations
- Customer order queries are optimized with proper indexing
- Data filtering happens at service layer for security
- Caching implemented for frequently accessed data
- Responsive design for mobile access

---

**Implementation Status**: ✅ Complete
**Last Updated**: 2024
**Version**: 1.0.0