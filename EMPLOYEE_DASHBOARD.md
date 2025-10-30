# Employee Dashboard Implementation

## Overview
The Employee Dashboard provides employees with a comprehensive view of their current assignments, performance metrics, and leave statistics. It implements a weekly archiving system where orders automatically move to the archive at the end of each week.

## Key Features

### 1. Current Week Orders
- Shows orders assigned for the current week (Monday to Sunday)
- Orders are sorted by scheduled date, priority, and assignment date
- Employees can update order status (Start, Pause, Resume, Complete)
- Real-time status updates with visual indicators

### 2. Weekly Archive System
- **Automatic Archiving**: Every Monday at 00:01 UTC, orders from the previous week are automatically archived
- **Archive Logic**: Orders scheduled for the previous week (Monday to Sunday) are marked as archived
- **Current Week Reset**: Starting Monday, only new/current week orders are visible on the dashboard
- **Archive Access**: Employees can view their archived orders in a separate section

### 3. Dashboard Statistics
- **Current Week Orders**: Count of orders assigned this week
- **Completed Orders**: Total completed orders (all time)
- **Pending Orders**: Orders awaiting completion
- **Hours Worked**: Total hours logged across all assignments
- **Average Hours/Order**: Average time spent per order
- **Upcoming Deadlines**: Orders due in the next 7 days

### 4. Leave Statistics
- **Total Days**: All leave days requested
- **Approved/Pending/Rejected**: Breakdown by status
- **Leave Types**: Categorized by leave type

## Technical Implementation

### Backend Components

#### 1. Employee Dashboard Service (`employeeDashboardService.ts`)
- `getCurrentWeekOrders()`: Fetches non-archived orders for current week
- `getArchivedOrders()`: Fetches archived orders
- `getDashboardStats()`: Calculates employee performance metrics
- `updateOrderStatus()`: Updates order status with validation

#### 2. Weekly Archive Service (`weeklyArchiveService.ts`)
- `archivePreviousWeekOrders()`: Archives orders from previous week
- `getCurrentWeekRange()`: Helper to calculate current week boundaries
- `shouldRunArchiveProcess()`: Determines if archive should run

#### 3. Weekly Archive Worker (`weeklyArchiveWorker.ts`)
- Cron job scheduled for every Monday at 00:01 UTC
- Automatically triggers the archive process
- Includes error handling and logging

#### 4. Database Schema Updates
```sql
-- Added to Order model
isArchived Boolean @default(false)
archivedAt DateTime?
title String?
estimatedHours Decimal?
actualHours Decimal?
```

### Frontend Components

#### 1. Employee Dashboard Store (`employeeDashboardStore.ts`)
- Manages current week orders, archived orders, and dashboard stats
- Provides actions for fetching data and updating order status
- Integrates with existing leave store for comprehensive stats

#### 2. Employee Dashboard Page (`EmployeeDashboardPage.tsx`)
- Responsive dashboard layout with key metrics cards
- Current week orders with status management buttons
- Archived orders section (limited to 10 most recent)
- Leave statistics integration
- Real-time status updates

### API Endpoints

```
GET /api/employee/current-week-orders    # Current week orders
GET /api/employee/archived-orders        # Archived orders
GET /api/employee/dashboard-stats        # Dashboard statistics
PUT /api/employee/orders/:id/status      # Update order status
POST /api/employee/archive/trigger       # Manual archive trigger (admin only)
```

## Weekly Archive Logic

### Week Definition
- **Week Start**: Monday 00:00:00
- **Week End**: Sunday 23:59:59
- **Archive Time**: Monday 00:01 UTC

### Archive Process
1. **Identify Orders**: Find all orders scheduled for the previous week
2. **Mark as Archived**: Set `isArchived = true` and `archivedAt = now()`
3. **Update Indexes**: Database indexes ensure efficient querying
4. **Logging**: Archive results are logged for monitoring

### Current Week Display
- Only shows orders where `isArchived = false`
- Includes orders scheduled for current week OR assigned during current week
- Sorted by: scheduled date → priority → assignment date

## Usage Instructions

### For Employees
1. **View Current Orders**: See all orders assigned for the current week
2. **Update Status**: Use action buttons to start, pause, resume, or complete orders
3. **Track Progress**: Monitor hours worked and completion statistics
4. **View Archive**: Access previously completed orders in the archive section
5. **Monitor Deadlines**: Keep track of upcoming deadlines

### For Administrators
1. **Manual Archive**: Trigger archive process manually via API endpoint
2. **Monitor Process**: Check logs for archive process execution
3. **Database Maintenance**: Archive process helps maintain database performance

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- Archive worker runs automatically, no additional configuration needed

### Cron Schedule
- **Production**: Every Monday at 00:01 UTC
- **Development**: Can be triggered manually for testing

## Benefits

1. **Performance**: Archived orders reduce query load on current operations
2. **User Experience**: Clean, focused view of current work
3. **Data Retention**: Historical data preserved in archive
4. **Automatic Management**: No manual intervention required
5. **Scalability**: System handles growing order volume efficiently

## Future Enhancements

1. **Custom Archive Rules**: Allow different archive schedules per department
2. **Archive Search**: Advanced search functionality for archived orders
3. **Export Options**: Export archived data to CSV/PDF
4. **Performance Analytics**: Detailed performance trends over time
5. **Mobile Optimization**: Enhanced mobile experience for field workers