# Order Module - How It Works

## Overview
The Order module manages work orders from creation to completion, with automatic status transitions based on employee assignments and progress tracking.

## Order Lifecycle & Status Flow

### 1. **Order Creation**
```
Admin creates order → Status: DRAFT
```
- **Initial Status**: `DRAFT`
- **Auto-generated**: Order number (ORD-000001, ORD-000002, etc.)
- **Required Fields**: Customer, scheduled date, required employees, priority
- **Optional Fields**: Description, location, start/end time, duration, special instructions

### 2. **Automatic Status Transitions**

#### **DRAFT → OPEN**
```
Order created without employees → Status: OPEN
```
- Happens when order is saved but no employees assigned
- Order is ready for assignment

#### **OPEN/DRAFT → ACTIVE**
```
Employees assigned to order → Status: ACTIVE
```
- Triggered when `assignedEmployeeIds` are added
- Creates `Assignment` records for each employee
- Assignment status: `ASSIGNED`

#### **ACTIVE → IN_PROGRESS**
```
At least one employee starts work → Status: IN_PROGRESS
```
- Triggered when assignment status changes to `ACTIVE`
- Indicates work has begun

#### **IN_PROGRESS → COMPLETED**
```
All employees complete work → Status: COMPLETED
```
- Triggered when ALL assignments have status `COMPLETED`
- Order is finished

### 3. **Manual Status Changes**
- **CANCELLED**: Admin manually cancels order
- **EXPIRED**: Admin marks order as expired (no auto-expiration yet)

## Key Components

### 1. **Order Model** (`packages/db/prisma/schema.prisma`)
```prisma
model Order {
  id                  String      @id @default(cuid())
  orderNumber         String      @unique
  description         String?
  scheduledDate       DateTime
  startTime           DateTime?
  endTime             DateTime?
  duration            Int?
  location            String?
  requiredEmployees   Int         @default(1)
  priority            Int         @default(1)
  specialInstructions String?
  status              OrderStatus @default(DRAFT)
  customerId          String
  
  // Relations
  customer            Customer             @relation(fields: [customerId], references: [id])
  employeeAssignments Assignment[]
  orderAssignments    OrderAssignment[]
  qualifications      OrderQualification[]
  ratings             Rating[]
}
```

### 2. **Order Service** (`apps/api/src/services/orderService.ts`)

#### **Core Functions:**
- `createOrderService()` - Creates order with auto-generated number
- `updateOrderService()` - Updates order and handles assignments
- `updateOrderStatusBasedOnAssignments()` - Auto status updates
- `autoAssignEmployeesService()` - Intelligent employee assignment

#### **Status Update Logic:**
```javascript
const updateOrderStatusBasedOnAssignments = async (orderId) => {
  const assignments = order.employeeAssignments;
  
  if (assignments.length === 0) {
    newStatus = 'OPEN';
  } else {
    const activeAssignments = assignments.filter(a => a.status === 'ACTIVE');
    const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');
    
    if (completedAssignments.length === assignments.length) {
      newStatus = 'COMPLETED';
    } else if (activeAssignments.length > 0) {
      newStatus = 'IN_PROGRESS';
    } else {
      newStatus = 'ACTIVE';
    }
  }
}
```

### 3. **Assignment Model**
```prisma
model Assignment {
  id           String           @id @default(cuid())
  orderId      String?
  employeeId   String
  assignedDate DateTime         @default(now())
  startDate    DateTime?
  endDate      DateTime?
  status       AssignmentStatus @default(ASSIGNED)
  
  order        Order?    @relation(fields: [orderId], references: [id])
  employee     Employee  @relation(fields: [employeeId], references: [id])
}
```

#### **Assignment Status Flow:**
- `ASSIGNED` → Employee is assigned to order
- `ACTIVE` → Employee has started work
- `COMPLETED` → Employee finished work
- `CANCELLED` → Assignment cancelled
- `OVERDUE` → Assignment past due date

## Frontend Components

### 1. **Order Management**
- **AddOrderDialog**: Create new orders
- **EditOrderDialog**: Modify existing orders
- **OrderTableView**: Display orders list with status badges

### 2. **Employee Assignment**
- **Employee Selection**: Checkbox list with limits based on `requiredEmployees`
- **Auto-assignment**: Intelligent matching based on qualifications and availability
- **Assignment Tracking**: Real-time status updates

### 3. **Status Display**
```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'DRAFT': return "bg-gray-100 text-gray-800";
    case 'OPEN': return "bg-blue-100 text-blue-800";
    case 'ACTIVE': return "bg-green-100 text-green-800";
    case 'IN_PROGRESS': return "bg-yellow-100 text-yellow-800";
    case 'COMPLETED': return "bg-emerald-100 text-emerald-800";
    case 'CANCELLED': return "bg-red-100 text-red-800";
    case 'EXPIRED': return "bg-orange-100 text-orange-800";
  }
};
```

## Order Number Generation

### **Sequential Generation:**
```javascript
// Find highest existing order number
const lastOrder = await prisma.order.findFirst({
  orderBy: { orderNumber: 'desc' },
  select: { orderNumber: true }
});

// Extract number and increment
let nextNumber = 1;
if (lastOrder?.orderNumber) {
  const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
  if (match) {
    nextNumber = parseInt(match[1]) + 1;
  }
}

// Generate new order number
orderData.orderNumber = `ORD-${nextNumber.toString().padStart(6, '0')}`;
```

## Employee Assignment Process

### 1. **Manual Assignment**
- Admin selects employees from checkbox list
- Limited by `requiredEmployees` count
- Creates Assignment records with status `ASSIGNED`
- Order status automatically changes to `ACTIVE`

### 2. **Auto Assignment** (`autoAssignEmployeesService`)
- **Qualification Matching**: Finds employees with required skills
- **Availability Check**: Excludes blocked/unavailable employees
- **Performance Scoring**: Prioritizes high-performing employees
- **Conflict Detection**: Avoids double-booking employees
- **Smart Selection**: Balances workload across team

#### **Scoring Algorithm:**
```javascript
// Performance score (0-40 points)
score += (performanceScore / 100) * 40;

// Traffic light bonus (0-20 points)
if (trafficLight === "GREEN") score += 20;

// Qualification match (0-30 points)
score += (matchedQuals / requiredQuals) * 30;

// Workload penalty
score -= currentAssignments * 5;
```

## Status Automation Triggers

### 1. **Order Creation**
- `createOrderService()` → Sets initial status based on assignments

### 2. **Assignment Changes**
- `updateAssignmentStatusService()` → Triggers order status update
- `updateOrderService()` → Handles assignment modifications

### 3. **Employee Actions**
- Employee starts work → Assignment status `ACTIVE` → Order `IN_PROGRESS`
- Employee completes work → Assignment status `COMPLETED` → Check if order `COMPLETED`

## API Endpoints

### **Order Management**
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update order status

### **Assignment Management**
- `GET /api/orders/:id/assignments` - Get order assignments
- `POST /api/orders/:id/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment
- `PATCH /api/assignments/:id/status` - Update assignment status
- `POST /api/orders/:id/assignments/auto` - Auto-assign employees

## Data Flow Example

### **Complete Order Lifecycle:**
```
1. Admin creates order
   → Status: DRAFT
   → Order number: ORD-000001

2. Admin assigns 2 employees
   → Status: ACTIVE
   → 2 Assignment records created (status: ASSIGNED)

3. Employee 1 starts work
   → Assignment 1 status: ACTIVE
   → Order status: IN_PROGRESS

4. Employee 1 completes work
   → Assignment 1 status: COMPLETED
   → Order status: Still IN_PROGRESS (Employee 2 not done)

5. Employee 2 completes work
   → Assignment 2 status: COMPLETED
   → Order status: COMPLETED (all assignments done)
```

## Key Features

### ✅ **Automated Status Management**
- No manual status updates needed for normal flow
- Status reflects actual work progress
- Real-time updates based on employee actions

### ✅ **Intelligent Assignment**
- Qualification-based matching
- Performance-aware selection
- Workload balancing
- Conflict prevention

### ✅ **Audit Trail**
- All status changes tracked
- Assignment history maintained
- Performance metrics recorded

### ✅ **Flexible Workflow**
- Supports manual and automatic processes
- Handles various order types and priorities
- Scalable assignment system

## Future Enhancements

### **Planned Features:**
- **Date-based Expiration**: Auto-expire overdue orders
- **Notification System**: Alert stakeholders of status changes
- **Advanced Scheduling**: Time-slot based assignments
- **Resource Management**: Equipment and material tracking
- **Customer Portal**: Allow customers to track order progress

The order system provides a complete workflow from creation to completion with intelligent automation and comprehensive tracking capabilities.