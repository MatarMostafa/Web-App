# QA & Regression Test Checklist

**Project:** ERP Beta  
**Version:** v1.3  
**Date:** [Insert Date]  
**Owner:** QA / PM  

---

## 1️⃣ Authentication & Authorization

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| User Login | Enter valid credentials and login | User redirected to appropriate dashboard | ☐ Pass / ☐ Fail | | |
| User Logout | Click logout button | User logged out and redirected to login | ☐ Pass / ☐ Fail | | |
| Password Reset | Request password reset via email | Reset email sent and link works | ☐ Pass / ☐ Fail | | |
| Email Verification | Verify email after signup | Email verified successfully | ☐ Pass / ☐ Fail | | |
| Role-based Access | Access admin/employee routes | Correct access based on user role | ☐ Pass / ☐ Fail | | |
| Session Management | Stay logged in across browser refresh | Session persists correctly | ☐ Pass / ☐ Fail | | |

---

## 2️⃣ Admin Dashboard - Employee Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Employees | Navigate to employees page | List of employees displayed | ☐ Pass / ☐ Fail | | |
| Create Employee | Add new employee with all details | Employee created successfully | ☐ Pass / ☐ Fail | | |
| Edit Employee | Modify employee information | Changes saved and displayed | ☐ Pass / ☐ Fail | | |
| Delete Employee | Remove employee from system | Employee deleted (soft delete) | ☐ Pass / ☐ Fail | | |
| Employee Profile | View individual employee details | Complete profile information shown | ☐ Pass / ☐ Fail | | |
| Block/Unblock Employee | Change employee status | Status updated and notifications sent | ☐ Pass / ☐ Fail | | |
| Employee Search | Search employees by name/email | Correct search results displayed | ☐ Pass / ☐ Fail | | |
| Employee Credentials | Generate login credentials | Credentials modal shows username/password | ☐ Pass / ☐ Fail | | |

---

## 3️⃣ Admin Dashboard - Order Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Orders | Navigate to orders page | List of orders displayed | ☐ Pass / ☐ Fail | | |
| Create Order | Add new order with details | Order created successfully | ☐ Pass / ☐ Fail | | |
| Edit Order | Modify order information | Changes saved and displayed | ☐ Pass / ☐ Fail | | |
| Delete Order | Remove order from system | Order deleted with confirmation | ☐ Pass / ☐ Fail | | |
| Order Details | View individual order details | Complete order information shown | ☐ Pass / ☐ Fail | | |
| Assign Employee | Assign employee to order | Assignment created and notifications sent | ☐ Pass / ☐ Fail | | |
| Remove Assignment | Remove employee from order | Assignment removed and notifications sent | ☐ Pass / ☐ Fail | | |
| Order Status Change | Update order status | Status updated across system | ☐ Pass / ☐ Fail | | |
| Order Search | Search orders by number/description | Correct search results displayed | ☐ Pass / ☐ Fail | | |

---

## 4️⃣ Order Notes System

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Order Notes | Click notes icon on order | Notes dialog opens with existing notes | ☐ Pass / ☐ Fail | | |
| Add General Note | Add note without status change | Note added and visible to all users | ☐ Pass / ☐ Fail | | |
| Add Status Change Note | Add note with status change | Note added and status updated | ☐ Pass / ☐ Fail | | |
| Employee Start Work | Employee clicks "Start Work" | Status changes to IN_PROGRESS with note | ☐ Pass / ☐ Fail | | |
| Employee Mark Complete | Employee clicks "Mark Complete" | Status changes to IN_REVIEW with note | ☐ Pass / ☐ Fail | | |
| Admin Approve | Admin clicks "Approve" | Status changes to COMPLETED with note | ☐ Pass / ☐ Fail | | |
| Admin Request Changes | Admin clicks "Changes" | Status changes to IN_PROGRESS with note | ☐ Pass / ☐ Fail | | |
| Note Notifications | Add note to order | Notifications sent to relevant users | ☐ Pass / ☐ Fail | | |
| Notes Real-time Update | Multiple users viewing notes | Notes update in real-time | ☐ Pass / ☐ Fail | | |

---

## 5️⃣ Customer Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Customers | Navigate to customers page | List of customers displayed | ☐ Pass / ☐ Fail | | |
| Create Customer | Add new customer with details | Customer created successfully | ☐ Pass / ☐ Fail | | |
| Edit Customer | Modify customer information | Changes saved and displayed | ☐ Pass / ☐ Fail | | |
| Delete Customer | Remove customer from system | Customer deleted with confirmation | ☐ Pass / ☐ Fail | | |
| Customer Search | Search customers by name/company | Correct search results displayed | ☐ Pass / ☐ Fail | | |

---

## 6️⃣ Department Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Departments | Navigate to departments page | List of departments displayed | ☐ Pass / ☐ Fail | | |
| Create Department | Add new department | Department created successfully | ☐ Pass / ☐ Fail | | |
| Edit Department | Modify department information | Changes saved and displayed | ☐ Pass / ☐ Fail | | |
| Delete Department | Remove department | Department deleted with confirmation | ☐ Pass / ☐ Fail | | |
| Toggle Department Status | Activate/deactivate department | Status updated correctly | ☐ Pass / ☐ Fail | | |

---

## 7️⃣ Position Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| View Positions | Navigate to positions page | List of positions displayed | ☐ Pass / ☐ Fail | | |
| Create Position | Add new position | Position created successfully | ☐ Pass / ☐ Fail | | |
| Edit Position | Modify position information | Changes saved and displayed | ☐ Pass / ☐ Fail | | |
| Delete Position | Remove position | Position deleted with confirmation | ☐ Pass / ☐ Fail | | |
| Toggle Position Status | Activate/deactivate position | Status updated correctly | ☐ Pass / ☐ Fail | | |

---

## 8️⃣ Leave Management

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Employee Request Leave | Submit leave request | Request created and admin notified | ☐ Pass / ☐ Fail | | |
| Admin View Requests | Navigate to leave management | List of leave requests displayed | ☐ Pass / ☐ Fail | | |
| Admin Approve Leave | Approve leave request | Status updated and employee notified | ☐ Pass / ☐ Fail | | |
| Admin Reject Leave | Reject leave request with reason | Status updated and employee notified | ☐ Pass / ☐ Fail | | |
| Employee View Leaves | Navigate to employee leaves page | Employee's leave history displayed | ☐ Pass / ☐ Fail | | |

---

## 9️⃣ Employee Dashboard

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Employee Login | Login as employee | Redirected to employee dashboard | ☐ Pass / ☐ Fail | | |
| View Assigned Orders | Navigate to orders page | List of assigned orders displayed | ☐ Pass / ☐ Fail | | |
| Order Details | Click on order | Order details page opens | ☐ Pass / ☐ Fail | | |
| Start Work | Click start work on order | Order status changes to IN_PROGRESS | ☐ Pass / ☐ Fail | | |
| Complete Work | Mark work as complete | Order status changes to IN_REVIEW | ☐ Pass / ☐ Fail | | |
| Add Order Notes | Add note to assigned order | Note added and admin notified | ☐ Pass / ☐ Fail | | |
| View Profile | Access employee profile | Profile information displayed | ☐ Pass / ☐ Fail | | |

---

## 🔟 Notification System

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Order Assignment | Assign employee to order | Employee receives notification | ☐ Pass / ☐ Fail | | |
| Order Status Change | Change order status | Relevant users receive notifications | ☐ Pass / ☐ Fail | | |
| Order Notes | Add note to order | Relevant users receive notifications | ☐ Pass / ☐ Fail | | |
| Leave Request | Submit leave request | Admin receives notification | ☐ Pass / ☐ Fail | | |
| Leave Response | Approve/reject leave | Employee receives notification | ☐ Pass / ☐ Fail | | |
| Notification Click | Click on notification | Navigate to relevant page and open dialog | ☐ Pass / ☐ Fail | | |
| Mark All Read | Mark all notifications as read | All notifications marked as read | ☐ Pass / ☐ Fail | | |
| Notification Dropdown | Click notification bell | Dropdown opens with recent notifications | ☐ Pass / ☐ Fail | | |

---

## 1️⃣1️⃣ UI/UX & Responsive Design

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Mobile Responsiveness | Test on mobile devices | UI adapts correctly to small screens | ☐ Pass / ☐ Fail | | |
| Tablet Responsiveness | Test on tablet devices | UI adapts correctly to medium screens | ☐ Pass / ☐ Fail | | |
| Desktop Layout | Test on desktop | UI displays correctly on large screens | ☐ Pass / ☐ Fail | | |
| Navigation | Use sidebar navigation | Navigation works on all screen sizes | ☐ Pass / ☐ Fail | | |
| Form Validation | Submit forms with invalid data | Proper validation messages displayed | ☐ Pass / ☐ Fail | | |
| Loading States | Perform actions that require loading | Loading indicators shown appropriately | ☐ Pass / ☐ Fail | | |
| Error Handling | Trigger error conditions | User-friendly error messages displayed | ☐ Pass / ☐ Fail | | |

---

## 1️⃣2️⃣ Performance & Security

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Page Load Speed | Navigate between pages | Pages load within acceptable time | ☐ Pass / ☐ Fail | | |
| API Response Time | Perform CRUD operations | API responses within acceptable time | ☐ Pass / ☐ Fail | | |
| Data Validation | Submit malformed data | Server validates and rejects bad data | ☐ Pass / ☐ Fail | | |
| SQL Injection | Attempt SQL injection | System prevents SQL injection attacks | ☐ Pass / ☐ Fail | | |
| XSS Protection | Attempt XSS attacks | System prevents XSS attacks | ☐ Pass / ☐ Fail | | |
| CSRF Protection | Test CSRF vulnerabilities | System has CSRF protection | ☐ Pass / ☐ Fail | | |

---

## 1️⃣3️⃣ Data Integrity & Business Logic

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| Order Status Flow | Test order status transitions | Only valid status transitions allowed | ☐ Pass / ☐ Fail | | |
| Employee Assignment | Assign multiple employees to order | System handles multiple assignments | ☐ Pass / ☐ Fail | | |
| Data Consistency | Perform concurrent operations | Data remains consistent | ☐ Pass / ☐ Fail | | |
| Soft Delete | Delete records | Records soft deleted, not permanently removed | ☐ Pass / ☐ Fail | | |
| Audit Trail | Perform actions | System logs important actions | ☐ Pass / ☐ Fail | | |

---

## 1️⃣4️⃣ Integration & API Testing

| Feature | Test Steps | Expected Result | Status | Tester | Notes |
|---------|------------|-----------------|--------|--------|-------|
| API Endpoints | Test all CRUD endpoints | All endpoints return correct responses | ☐ Pass / ☐ Fail | | |
| Authentication API | Test auth endpoints | Authentication works correctly | ☐ Pass / ☐ Fail | | |
| Error Responses | Test error conditions | APIs return proper error codes/messages | ☐ Pass / ☐ Fail | | |
| Rate Limiting | Test API rate limits | Rate limiting works as expected | ☐ Pass / ☐ Fail | | |

---

## 📝 Test Execution Summary

**Total Test Cases:** [Count]  
**Passed:** [Count]  
**Failed:** [Count]  
**Blocked:** [Count]  
**Not Executed:** [Count]  

**Overall Status:** ☐ Ready for Release / ☐ Needs Fixes  

---

## 🐛 Known Issues & Bugs

| Issue ID | Description | Severity | Status | Assigned To | Notes |
|----------|-------------|----------|--------|-------------|-------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## 📋 Test Environment Details

**Frontend URL:** http://localhost:3000  
**Backend URL:** http://localhost:3001  
**Database:** PostgreSQL  
---
