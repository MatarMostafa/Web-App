# ERP Beta — Enterprise Resource Planning System

A comprehensive ERP system built as a Turborepo monorepo with Next.js frontend and Express.js backend. This system manages employees, orders, leave requests, qualifications, and provides real-time notifications with multi-language support (English/German).

## 🎯 System Overview

The ERP Beta system is designed to streamline business operations through role-based access control, featuring separate dashboards for administrators and employees. The system provides comprehensive employee management, order tracking, leave management, and qualification tracking with real-time notifications.

### Key Features:
- **Role-based Access Control**: Admin and Employee dashboards with specific permissions
- **Multi-language Support**: English and German localization
- **Real-time Notifications**: Live updates for orders, leave requests, and system events
- **Order Management**: Complete order lifecycle from creation to completion
- **Employee Management**: Comprehensive employee profiles and assignment tracking
- **Leave Management**: Request, approval, and tracking system
- **Qualification System**: Employee skill tracking with admin approval workflow

## 🔧 Admin Functionalities

### Employee Management
- **Employee Creation**: Add new employees with complete profile information
- **Employee Editing**: Update employee details, departments, and positions
- **Employee Blocking/Unblocking**: Control system access for employees
- **Employee Assignment**: Assign employees to orders and track workload

### Order Management
- **Order Creation**: Create new orders with customer details and requirements
- **Order Assignment**: Assign multiple employees to orders (unlimited assignments)
- **Order Tracking**: Monitor order status and progress
- **Order Deletion**: Remove orders when necessary
- **Status Management**: Update order status throughout lifecycle

### Leave Management
- **Leave Request Review**: View and manage employee leave requests
- **Leave Approval/Rejection**: Approve or reject requests with reasons
- **Leave Calendar**: Overview of team availability and scheduled leaves

### System Administration
- **Department Management**: Create and manage organizational departments
- **Position Management**: Define and assign employee positions
- **Qualification Management**: Create system-wide qualifications and categories
- **Qualification Approval**: Review and approve employee-submitted qualifications

### Reporting & Analytics
- **Employee Performance**: Track employee assignments and completion rates
- **Order Analytics**: Monitor order completion and status distribution
- **System Usage**: Overview of system activity and user engagement

## 👤 Employee Functionalities

### Order Management
- **Order Viewing**: Access assigned orders with detailed information
- **Status Updates**: Update order status (In Progress, Completed, etc.)
- **Order Notes**: Add notes and communicate with admin/team
- **Work Tracking**: Track time and progress on assigned orders

### Leave Management
- **Leave Requests**: Submit leave requests with dates and reasons
- **Leave History**: View past and pending leave requests
- **Leave Balance**: Track available leave days and usage

### Profile Management
- **Personal Information**: Update contact details and personal information
- **Qualification Management**: Add personal qualifications and certifications
- **Skill Tracking**: Maintain professional skill portfolio

### Communication
- **Order Notes**: Participate in order-related discussions
- **Notifications**: Receive real-time updates on assignments and approvals

## 💬 Order Notes System

The order notes system facilitates communication between admins and assigned employees:

- **Real-time Communication**: Instant messaging within order context
- **Status Updates**: Automatic notifications when order status changes
- **History Tracking**: Complete audit trail of all order communications
- **Multi-participant**: All assigned employees and admins can participate
- **Notification Integration**: Automatic notifications for new notes and updates

## 🔔 Notification System

Comprehensive real-time notification system covering:

### Order Notifications
- **New Assignments**: Employees notified of new order assignments
- **Status Changes**: Updates when order status is modified
- **Note Additions**: Alerts when new notes are added to orders
- **Completion Requests**: Notifications for order completion and review

### Leave Notifications
- **Request Submissions**: Admins notified of new leave requests
- **Approval/Rejection**: Employees notified of leave request decisions
- **Upcoming Leaves**: Reminders for scheduled leave periods

### System Notifications
- **Qualification Updates**: Notifications for skill approvals/rejections
- **Profile Changes**: Updates for important profile modifications
- **System Announcements**: Administrative messages and updates

### Notification Features
- **Real-time Delivery**: Instant notifications without page refresh
- **Multi-language**: Notifications in user's preferred language
- **Action Integration**: Click notifications to navigate to relevant pages
- **Read/Unread Tracking**: Visual indicators for notification status
- **Batch Operations**: Mark all notifications as read

## 🏗️ Repository Structure

This is a **Turborepo monorepo** with the following structure:

```
erp-beta/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express.js backend API
├── packages/
│   ├── db/           # Prisma database schema and migrations
│   ├── eslint-config/# Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   ├── jest-presets/ # Jest testing configuration
│   └── logger/       # Shared logging utilities
├── docker-compose.yml # Docker container orchestration
└── turbo.json        # Turborepo pipeline configuration
```

### Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: NextAuth.js with JWT
- **Internationalization**: react-i18next
- **State Management**: Zustand
- **UI Components**: Custom components with Radix UI primitives

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn or npm
- PostgreSQL database
- Docker (optional)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd erp-beta
```

2. **Install dependencies**:
```bash
yarn install
# or
npm install
```

3. **Environment Setup**:
Create `.env` files in both `apps/web` and `apps/api` directories:

**apps/api/.env**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/erp_beta"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=3001
```

**apps/web/.env.local**:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

4. **Database Setup**:
```bash
# Run database migrations
yarn workspace @repo/db prisma migrate dev

# Seed initial data (optional)
yarn workspace @repo/db prisma db seed
```

5. **Start Development Servers**:

**Option A: Start all services**:
```bash
yarn dev
```

**Option B: Start individually**:
```bash
# Terminal 1 - API Server
yarn workspace api dev

# Terminal 2 - Web Application
yarn workspace web dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Studio**: `yarn workspace @repo/db prisma studio`

## 📝 Database Management

```bash
# Create new migration
yarn workspace @repo/db prisma migrate dev --name migration_name

# Reset database
yarn workspace @repo/db prisma migrate reset

# Generate Prisma client
yarn workspace @repo/db prisma generate

# Open Prisma Studio
yarn workspace @repo/db prisma studio
```

---

**Built with modern web technologies - 2025**