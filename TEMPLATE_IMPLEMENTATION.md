# Order Description Templates System - Implementation Guide

## 🎯 Overview

A simple system that replaces the single "description" field in orders with multiple predefined text fields based on customer-specific templates. Each customer gets their own set of description prompts that create structured data for easy invoice generation.

## 📋 System Requirements

### Business Goals
- **Replace Single Description Field**: Convert one description textarea into multiple labeled input fields
- **Customer-Specific Prompts**: Each customer has their own set of description line templates
- **Structured Data Output**: Easy export format for automated invoice generation
- **Simple Employee Interface**: Clear labeled fields that employees fill out
- **Consistent Data Format**: Same structure for every order per customer

## 🏗️ System Architecture

### Database Schema Changes

**Add to existing Prisma schema:**

```prisma
// Customer Description Templates (Simple text lines)
model CustomerDescriptionTemplate {
  id          String   @id @default(cuid())
  customerId  String   @unique
  templateLines String[] // Array of text prompts like ['Container', 'Weight', 'Instructions']
  
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String?
  
  @@map("customer_description_templates")
}

// Order Description Data (stores the filled values)
model OrderDescriptionData {
  id              String @id @default(cuid())
  orderId         String @unique
  descriptionData Json   // {"Container": "20ft", "Weight": "15000kg", "Instructions": "Handle with care"}
  
  order           Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("order_description_data")
}
```

**Update existing models:**

```prisma
// Add to Customer model
model Customer {
  // ... existing fields ...
  
  // Add this relation
  descriptionTemplate CustomerDescriptionTemplate?
  
  // ... rest of existing fields ...
}

// Add to Order model  
model Order {
  // ... existing fields ...
  
  // Keep existing description field for backward compatibility
  description String?
  
  // Add template usage flag
  usesTemplate Boolean @default(false)
  
  // Add this relation
  descriptionData OrderDescriptionData?
  
  // ... rest of existing fields ...
}
```
```

## 🔄 Implementation Workflow

### Phase 1: Simple Template Setup (Admin)

#### 1.1 Customer Template Creation
**Location**: Admin Dashboard → Customers → [Customer Details] → Description Template

**Simple Interface**:
```
┌─────────────────────────────────────────┐
│ Description Template for ABC Logistics  │
├─────────────────────────────────────────┤
│ Line 1: [Container                    ] │
│ Line 2: [Goods Description           ] │
│ Line 3: [Weight                      ] │
│ Line 4: [Special Instructions        ] │
│ Line 5: [                            ] │
│                                         │
│ [+ Add Line] [Remove Last Line]         │
│ [Save Template] [Preview]               │
└─────────────────────────────────────────┘
```

**Features**:
- Simple text input for each template line
- Add/remove lines as needed
- No complex field types - just text prompts
- One template per customer (simple)

**Example Templates**:

**Logistics Company**:
```
Line 1: Container
Line 2: Goods Description  
Line 3: Weight
Line 4: Special Instructions
```

**Manufacturing Company**:
```
Line 1: Product Code
Line 2: Quantity
Line 3: Quality Requirements
Line 4: Delivery Notes
```

### Phase 2: Order Creation with Templates

#### 2.1 Automatic Template Loading
**Location**: Admin Dashboard → Orders → Create Order

**Simple Process**:
1. Select customer
2. If customer has template, description section automatically shows template fields
3. If no template, shows regular description textarea

**UI Flow**:
```
Step 1: Basic Order Info
┌─────────────────────────────────────────┐
│ Customer: [ABC Logistics ▼]            │
│ Scheduled Date: [2024-01-15]           │
│ Location: [Auto-filled from customer]  │
└─────────────────────────────────────────┘

Step 2: Description (Template Auto-Loaded)
┌─────────────────────────────────────────┐
│ Order Description:                      │
│                                         │
│ Container: [___________________]        │
│ Goods Description: [___________]        │
│ Weight: [______________________]        │
│ Special Instructions: [________]        │
│                                         │
│ ☐ Use custom description instead        │
└─────────────────────────────────────────┘
```

**No Complex Validation**:
- All fields are simple text inputs
- No required field enforcement (optional)
- Basic form validation only

### Phase 3: Employee Interface

#### 3.1 Simple Order View
**Location**: Employee Dashboard → My Orders → [Order Details]

**Employee View**:
```
┌─────────────────────────────────────────┐
│ Order #ORD-2024-001                     │
│ Customer: ABC Logistics                 │
│ Status: In Progress                     │
├─────────────────────────────────────────┤
│ Order Description:                      │
│                                         │
│ Container: [20ft Standard Container]    │
│ Goods Description: [Electronics Equip] │
│ Weight: [15000 kg]                     │
│ Special Instructions: [Handle with care]│
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

**Features**:
- Simple text inputs for each template field
- Save changes functionality
- Mobile-friendly (responsive)
- No complex progress tracking

### Phase 4: Data Export & Invoice Generation

#### 4.1 Simple Structured Output
**JSON Format**:
```json
{
  "orderId": "ORD-2024-001",
  "customerId": "cust-123",
  "customerName": "ABC Logistics",
  "descriptionData": {
    "Container": "20ft Standard Container",
    "Goods Description": "Electronics Equipment",
    "Weight": "15000 kg",
    "Special Instructions": "Handle with care"
  }
}
```

#### 4.2 Invoice Format
**Simple Text Output**:
```
Order Description:
- Container: 20ft Standard Container
- Goods Description: Electronics Equipment  
- Weight: 15000 kg
- Special Instructions: Handle with care
```

**CSV Export**:
```csv
Order ID,Customer,Container,Goods Description,Weight,Special Instructions
ORD-001,ABC Logistics,20ft Standard,Electronics,15000 kg,Handle with care
```

## 🛠️ Technical Implementation

### Backend API Endpoints

```typescript
// Simple Template Management
POST   /api/admin/customers/:customerId/description-template
GET    /api/admin/customers/:customerId/description-template
PUT    /api/admin/customers/:customerId/description-template
DELETE /api/admin/customers/:customerId/description-template

// Order Description Data
POST   /api/orders/:orderId/description-data
PUT    /api/orders/:orderId/description-data
GET    /api/orders/:orderId/description-data

// Export
GET    /api/admin/orders/export/descriptions
```

### Prisma Client Usage Examples

```typescript
// Create customer template
const template = await prisma.customerDescriptionTemplate.create({
  data: {
    customerId: "customer-id",
    templateLines: ["Container", "Goods Description", "Weight", "Instructions"],
    createdBy: "admin-user-id"
  }
});

// Get customer template
const customerTemplate = await prisma.customerDescriptionTemplate.findUnique({
  where: { customerId: "customer-id" }
});

// Save order description data
const orderData = await prisma.orderDescriptionData.create({
  data: {
    orderId: "order-id",
    descriptionData: {
      "Container": "20ft Standard",
      "Goods Description": "Electronics",
      "Weight": "15000kg",
      "Instructions": "Handle with care"
    }
  }
});

// Get order with template data
const orderWithData = await prisma.order.findUnique({
  where: { id: "order-id" },
  include: {
    customer: {
      include: {
        descriptionTemplate: true
      }
    },
    descriptionData: true
  }
});
```

### Frontend Components

```typescript
// Simple Components
- CustomerDescriptionTemplate (Admin setup)
- OrderDescriptionForm (Dynamic fields based on template)
- EmployeeDescriptionView (Employee editing)
- DescriptionExporter (Export functionality)
```

### Simple Data Flow

```
1. Admin creates simple text template for customer
   ↓
2. Order creation automatically loads customer template
   ↓
3. Multiple input fields appear instead of single description
   ↓
4. Employee fills out the labeled fields
   ↓
5. Data is stored as key-value pairs
   ↓
6. Export system formats data for invoices
```

## 📊 Benefits & ROI

### Business Benefits
- **Consistency**: Same description structure for every customer order
- **Efficiency**: Faster order processing with labeled fields
- **Automation**: Easy invoice generation from structured data
- **Simplicity**: No complex setup or configuration needed

### Technical Benefits
- **Simple Implementation**: Just text arrays and key-value storage
- **Easy Maintenance**: No complex field types or validation rules
- **Fast Development**: Much quicker than complex form builders
- **Reliable Export**: Consistent data format for automated processing

## 🚀 Implementation Timeline

### Phase 1 (Week 1): Database & Backend
- Simple database schema
- Basic API endpoints
- Template CRUD operations

### Phase 2 (Week 2): Admin Interface
- Simple template setup UI
- Add/remove template lines
- Save customer templates

### Phase 3 (Week 3): Order Integration
- Auto-load customer template in order form
- Generate multiple input fields
- Save structured description data

### Phase 4 (Week 4): Employee Interface & Export
- Employee description editing
- Simple export functionality
- Basic invoice formatting

## 🔧 Simple Template Examples

**Logistics Company**:
```
Template Lines: ["Container", "Goods Description", "Weight", "Special Instructions"]
```

**Manufacturing Company**:
```
Template Lines: ["Product Code", "Quantity", "Quality Requirements", "Delivery Notes"]
```

**Service Company**:
```
Template Lines: ["Service Type", "Duration", "Equipment Needed", "Notes"]
```

## 🎯 **Key Benefits**

- **Simple Setup**: Just text prompts, no complex configuration
- **Structured Data**: Consistent format for every customer
- **Easy Export**: Perfect for automated invoice generation
- **Employee Friendly**: Clear labeled fields instead of blank description
- **Fast Implementation**: Much simpler than complex form builders

This system transforms your single description field into multiple structured fields that make invoice automation straightforward and reliable.