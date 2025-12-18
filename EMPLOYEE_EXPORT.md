# Employee Export CSV Functionality

## Overview
This feature allows administrators to export employee assignments and work statistics data in CSV format with daily, weekly, and monthly reporting periods.

## Features
- **Export Types**:
  - Assignments Only: Employee assignments with order details
  - Work Statistics Only: Hours worked, overtime, efficiency metrics
  - Combined Data: Both assignments and work statistics in one file

- **Filtering Options**:
  - Period: Daily, Weekly, Monthly
  - Employee: All employees or specific employee
  - Date Range: Custom start and end dates

## API Endpoints

### Export Employee Assignments
```
GET /employees/export/assignments
```
**Query Parameters:**
- `period`: 'daily' | 'weekly' | 'monthly'
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)
- `employeeId`: Employee ID (optional, exports all if not provided)

### Export Work Statistics
```
GET /employees/export/work-stats
```
**Query Parameters:**
- `period`: 'daily' | 'weekly' | 'monthly'
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)
- `employeeId`: Employee ID (optional, exports all if not provided)

### Export Combined Data
```
GET /employees/export/combined
```
**Query Parameters:**
- `period`: 'daily' | 'weekly' | 'monthly'
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)
- `employeeId`: Employee ID (optional, exports all if not provided)

## CSV Output Format

### Assignments CSV Columns:
- employeeCode
- employeeName
- orderNumber
- orderTitle
- customerName
- assignedDate
- startDate
- endDate
- status
- estimatedHours
- actualHours
- period

### Work Statistics CSV Columns:
- employeeCode
- employeeName
- department
- position
- date
- hoursWorked
- overtimeHours
- totalHours
- location
- projects
- efficiency
- qualityScore
- period

## Frontend Usage

The export functionality is available in the Admin Dashboard > Employees page via the "Export CSV" button.

### Export Dialog Options:
1. **Export Type**: Choose between assignments, work statistics, or combined data
2. **Period**: Select daily, weekly, or monthly reporting
3. **Employee**: Export data for all employees or a specific employee
4. **Date Range**: Set custom start and end dates

## Security
- Only Admin and HR Manager roles can access export functionality
- All exports require authentication via JWT token
- Data is filtered based on user permissions

## File Naming Convention
Exported files follow this naming pattern:
- `employee-assignments-{period}-{date}.csv`
- `employee-work-stats-{period}-{date}.csv`
- `employee-combined-data-{period}-{date}.csv`

## Implementation Details

### Backend Files:
- `src/services/employeeExportService.ts` - Export logic
- `src/controllers/employeeController.ts` - Export endpoints
- `src/routes/employeeRoutes.ts` - Route definitions
- `src/utils/csvUtils.ts` - CSV generation utility

### Frontend Files:
- `src/components/admin/EmployeeExportDialog.tsx` - Export dialog component
- `src/components/pages/admin/EmployeesPage.tsx` - Integration point

## Testing
Run the export service tests:
```bash
yarn workspace api test src/__tests__/employeeExport.test.ts
```