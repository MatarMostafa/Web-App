# Settings Implementation Plan

## Overview
Implement comprehensive settings pages for all user types (Admin, Employee, Customer) with appropriate permission levels and approval workflows.

## Current System Analysis

### Existing Dashboards:
- **Admin Dashboard**: `/dashboard-admin` - Full system control, can delete employees
- **Employee Dashboard**: `/dashboard-employee` - Limited to own data and assignments
- **Customer Dashboard**: `/dashboard-customer` - Order management and profile (to be replaced by settings)

### User Roles:
- **Admin**: Super admin with full system privileges
- **Employee**: Standard employee with limited permissions
- **Customer**: External customer with order access

## Implementation Structure

### 1. Settings Page Architecture

```
/dashboard-{role}/settings/
├── index.tsx (Main settings page)
├── components/
│   ├── PasswordSection.tsx
│   ├── ContactSection.tsx
│   ├── PersonalSection.tsx (Employee/Admin)
│   ├── BusinessSection.tsx (Customer)
│   ├── PendingChangesSection.tsx
│   └── ChangeRequestModal.tsx
└── types/
    └── settings.types.ts
```

### 2. Database Schema Requirements

#### New Tables Needed:
```sql
-- Change requests for approval workflow
ChangeRequest {
  id: String @id @default(cuid())
  userId: String
  requestType: ChangeRequestType // EMAIL, NAME, COMPANY_NAME, TAX_NUMBER
  currentValue: String?
  newValue: String
  reason: String?
  status: RequestStatus // PENDING, APPROVED, REJECTED
  requestedAt: DateTime @default(now())
  reviewedAt: DateTime?
  reviewedBy: String?
  rejectionReason: String?
}

enum ChangeRequestType {
  EMAIL
  FIRST_NAME
  LAST_NAME
  COMPANY_NAME
  TAX_NUMBER
}
```

### 3. Feature Implementation Plan

## Phase 1: Instant Changes (No Approval Required)

### 3.1 Password Change (All Users)
**Location**: `/dashboard-{role}/settings` → Account Security Section

**Features**:
- Current password verification
- New password with confirmation
- Password strength indicator
- Success/error notifications

**Validation**:
- Minimum 8 characters
- Must contain uppercase, lowercase, number
- Cannot be same as current password
- Cannot be same as last 5 passwords (future enhancement)

**API Endpoints**:
- `PUT /api/auth/change-password`

### 3.2 Phone Number (Employee & Customer)
**Location**: `/dashboard-{role}/settings` → Contact Information Section

**Features**:
- Direct edit with validation
- Phone number format validation
- Instant save with success notification

**API Endpoints**:
- `PUT /api/employees/me/phone` (Employee)
- `PUT /api/customers/me/phone` (Customer)

### 3.3 Business Information (Customer Only)
**Location**: `/dashboard-customer/settings` → Business Information Section

**Instant Changes**:
- Business Address (full address object)
- Industry (dropdown selection)

**Features**:
- Address form with validation
- Industry dropdown with predefined options
- Instant save functionality

**API Endpoints**:
- `PUT /api/customers/me/address`
- `PUT /api/customers/me/industry`

## Phase 2: Approval Workflow System

### 3.4 Change Request System
**Components**:
- Change request creation
- Admin approval interface
- Email notifications
- Status tracking

**Workflow**:
1. User submits change request with reason
2. System creates pending request
3. Admin receives notification
4. Admin approves/rejects with optional reason
5. User receives notification of decision
6. If approved, change is applied automatically

### 3.5 Email Changes (All Users)
**Location**: `/dashboard-{role}/settings` → Contact Information Section

**Process**:
1. User requests email change
2. System sends verification to new email
3. User verifies new email
4. Admin receives approval request
5. Admin approves/rejects
6. If approved, email is updated

**Security**:
- Email verification required
- Admin approval required
- Old email receives notification
- Audit log entry created

### 3.6 Name Changes (Employee & Admin)
**Location**: `/dashboard-{role}/settings` → Personal Information Section

**Fields**:
- First Name
- Last Name
- Reason for change (required)

**Process**:
1. Employee/Admin submits name change request
2. Admin (or Super Admin for admin changes) receives notification
3. Approval/rejection with reason
4. If approved, name updated in all systems

### 3.7 Company Information Changes (Customer)
**Location**: `/dashboard-customer/settings` → Business Information Section

**Fields Requiring Approval**:
- Company Name
- Tax Number

**Process**:
1. Customer submits change request
2. Admin receives notification with legal implications warning
3. Admin reviews and approves/rejects
4. If approved, updates affect all future invoices/contracts

## Phase 3: Advanced Features

### 3.8 Admin Approval Interface
**Location**: `/dashboard-admin/settings/approvals`

**Features**:
- Pending requests dashboard
- Request details view
- Bulk approval actions
- Request history
- Email notifications toggle

### 3.9 Audit Trail
**Features**:
- All settings changes logged
- Who changed what and when
- Before/after values
- IP address and user agent tracking

### 3.10 Notification System Integration
**Notifications**:
- Change request submitted
- Change request approved/rejected
- Email verification required
- Security alerts for sensitive changes

## Implementation Order

### Sprint 1: Foundation (Week 1)
1. Create settings page structure for all roles
2. Implement password change functionality
3. Add phone number editing (Employee/Customer)
4. Create basic UI components

### Sprint 2: Business Information (Week 2)
1. Implement customer business address editing
2. Add industry selection for customers
3. Create validation and error handling
4. Add success notifications

### Sprint 3: Approval System (Week 3-4)
1. Create ChangeRequest database model
2. Implement change request API endpoints
3. Build admin approval interface
4. Add email verification system

### Sprint 4: Name & Email Changes (Week 5)
1. Implement name change requests (Employee/Admin)
2. Add email change workflow
3. Create notification system integration
4. Add audit logging

### Sprint 5: Polish & Testing (Week 6)
1. Add comprehensive validation
2. Implement security measures
3. Create comprehensive testing
4. Add documentation

## Security Considerations

### Authentication:
- Current password required for sensitive changes
- Session validation for all requests
- Rate limiting on change requests

### Authorization:
- Role-based access control
- Admin approval for sensitive changes
- Audit trail for all modifications

### Data Validation:
- Server-side validation for all inputs
- Email format validation
- Phone number format validation
- Business data validation

### Notifications:
- Email notifications for security changes
- In-app notifications for status updates
- Admin alerts for pending approvals

## API Endpoints Summary

### Instant Changes:
- `PUT /api/auth/change-password`
- `PUT /api/employees/me/phone`
- `PUT /api/customers/me/phone`
- `PUT /api/customers/me/address`
- `PUT /api/customers/me/industry`

### Approval Workflow:
- `POST /api/change-requests`
- `GET /api/change-requests/me`
- `GET /api/change-requests` (Admin only)
- `PUT /api/change-requests/:id/approve` (Admin only)
- `PUT /api/change-requests/:id/reject` (Admin only)

### Email Verification:
- `POST /api/auth/request-email-change`
- `POST /api/auth/verify-email-change`

## UI/UX Considerations

### Design Principles:
- Clear section separation
- Instant vs. approval workflow distinction
- Progress indicators for multi-step processes
- Comprehensive error messaging
- Success confirmations

### Responsive Design:
- Mobile-friendly forms
- Touch-friendly buttons
- Proper input validation feedback
- Loading states for async operations

### Accessibility:
- Proper form labels
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance

## Testing Strategy

### Unit Tests:
- API endpoint validation
- Business logic testing
- Security validation
- Error handling

### Integration Tests:
- End-to-end workflow testing
- Email verification flow
- Approval workflow testing
- Cross-role permission testing

### Security Tests:
- Authorization bypass attempts
- Input validation testing
- SQL injection prevention
- XSS prevention

## Deployment Considerations

### Database Migration:
- Create ChangeRequest table
- Add indexes for performance
- Backup existing data

### Feature Flags:
- Gradual rollout capability
- A/B testing for UI changes
- Emergency disable functionality

### Monitoring:
- Change request metrics
- Error rate monitoring
- Performance monitoring
- Security event logging

## Future Enhancements

### Phase 4 (Future):
- Two-factor authentication settings
- API key management (Admin)
- Advanced notification preferences
- Bulk user management (Admin)
- Data export functionality
- Advanced audit reporting

This implementation plan provides a comprehensive, secure, and user-friendly settings system that respects the different permission levels while maintaining system security and data integrity.