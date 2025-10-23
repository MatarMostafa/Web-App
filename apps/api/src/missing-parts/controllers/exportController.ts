import { Request, Response } from "express";
import * as exportService from "../services/exportService";

// Helper function to convert data to CSV format
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = getNestedValue(row, header);
      // Escape commas and quotes in CSV values
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value || '';
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Set CSV response headers
const setCSVHeaders = (res: Response, filename: string) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
};

// Export orders
export const exportOrders = async (req: Request, res: Response) => {
  try {
    const orders = await exportService.exportOrdersService(req.query);
    
    const csvData = orders.map(order => ({
      orderNumber: order.orderNumber,
      title: order.title,
      status: order.status,
      scheduledDate: order.scheduledDate?.toISOString().split('T')[0],
      location: order.location,
      requiredEmployees: order.requiredEmployees,
      assignedEmployees: order.employeeAssignments.length,
      customerName: order.customer?.companyName || 'N/A',
      priority: order.priority,
      completionRate: order.employeeAssignments.length > 0 
        ? (order.employeeAssignments.filter(a => a.status === 'COMPLETED').length / order.employeeAssignments.length * 100).toFixed(2) + '%'
        : '0%',
      avgRating: order.ratings.length > 0 
        ? (order.ratings.reduce((sum, r) => sum + r.rating, 0) / order.ratings.length).toFixed(1)
        : 'N/A',
      qualificationsRequired: order.qualifications.map(q => q.qualification.name).join('; '),
      createdAt: order.createdAt.toISOString().split('T')[0]
    }));

    const headers = [
      'orderNumber', 'title', 'status', 'scheduledDate', 'location', 
      'requiredEmployees', 'assignedEmployees', 'customerName', 'priority',
      'completionRate', 'avgRating', 'qualificationsRequired', 'createdAt'
    ];

    const csv = convertToCSV(csvData, headers);
    setCSVHeaders(res, `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ 
      message: 'Failed to export orders', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Export employee performance
export const exportEmployeePerformance = async (req: Request, res: Response) => {
  try {
    const employees = await exportService.exportEmployeePerformanceService(req.query);
    
    const csvData = employees.map(employee => ({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.user.email,
      department: employee.department?.name || 'N/A',
      position: employee.position?.title || 'N/A',
      performanceScore: employee.performanceScore?.toString() || 'N/A',
      trafficLight: employee.trafficLight || 'N/A',
      totalAssignments: employee.assignments.length,
      completedAssignments: employee.assignments.filter(a => a.status === 'COMPLETED').length,
      completionRate: employee.assignments.length > 0 
        ? (employee.assignments.filter(a => a.status === 'COMPLETED').length / employee.assignments.length * 100).toFixed(2) + '%'
        : '0%',
      avgRating: employee.ratings.length > 0 
        ? (employee.ratings.reduce((sum, r) => sum + r.rating, 0) / employee.ratings.length).toFixed(1)
        : 'N/A',
      qualifications: employee.qualifications.map(q => q.qualification.name).join('; '),
      totalHoursWorked: employee.workStatistics.reduce((sum, ws) => sum + Number(ws.hoursWorked), 0),
      isAvailable: employee.isAvailable ? 'Yes' : 'No',
      lastLogin: employee.user.lastLogin?.toISOString().split('T')[0] || 'Never',
      hireDate: employee.hireDate.toISOString().split('T')[0]
    }));

    const headers = [
      'employeeCode', 'firstName', 'lastName', 'email', 'department', 'position',
      'performanceScore', 'trafficLight', 'totalAssignments', 'completedAssignments',
      'completionRate', 'avgRating', 'qualifications', 'totalHoursWorked', 
      'isAvailable', 'lastLogin', 'hireDate'
    ];

    const csv = convertToCSV(csvData, headers);
    setCSVHeaders(res, `employee_performance_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export employee performance error:', error);
    res.status(500).json({ 
      message: 'Failed to export employee performance', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Export assignment details
export const exportAssignmentDetails = async (req: Request, res: Response) => {
  try {
    const assignments = await exportService.exportAssignmentDetailsService({
      ...req.query,
      orderId: req.params.orderId
    });
    
    const csvData = assignments.map(assignment => ({
      assignmentId: assignment.id,
      orderNumber: assignment.order?.orderNumber || 'N/A',
      orderTitle: assignment.order?.title || 'N/A',
      customerName: assignment.order?.customer?.companyName || 'N/A',
      employeeName: `${assignment.employee.firstName} ${assignment.employee.lastName}`,
      employeeCode: assignment.employee.employeeCode,
      department: assignment.employee.department?.name || 'N/A',
      position: assignment.employee.position?.title || 'N/A',
      tier: assignment.tier,
      status: assignment.status,
      assignedDate: assignment.assignedDate.toISOString().split('T')[0],
      startDate: assignment.startDate?.toISOString().split('T')[0] || 'N/A',
      endDate: assignment.endDate?.toISOString().split('T')[0] || 'N/A',
      estimatedHours: assignment.estimatedHours?.toString() || 'N/A',
      actualHours: assignment.actualHours?.toString() || 'N/A',
      qualifications: assignment.employee.qualifications.map(q => q.qualification.name).join('; '),
      notes: assignment.notes || 'N/A'
    }));

    const headers = [
      'assignmentId', 'orderNumber', 'orderTitle', 'customerName', 'employeeName',
      'employeeCode', 'department', 'position', 'tier', 'status', 'assignedDate',
      'startDate', 'endDate', 'estimatedHours', 'actualHours', 'qualifications', 'notes'
    ];

    const csv = convertToCSV(csvData, headers);
    const filename = req.params.orderId 
      ? `assignment_details_order_${req.params.orderId}_${new Date().toISOString().split('T')[0]}.csv`
      : `assignment_details_${new Date().toISOString().split('T')[0]}.csv`;
    
    setCSVHeaders(res, filename);
    res.send(csv);
  } catch (error) {
    console.error('Export assignment details error:', error);
    res.status(500).json({ 
      message: 'Failed to export assignment details', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Export customer analytics
export const exportCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const customers = await exportService.exportCustomerAnalyticsService({
      ...req.query,
      customerId: req.params.customerId
    });
    
    const csvData = customers.map(customer => ({
      companyName: customer.companyName,
      contactEmail: customer.contactEmail || 'N/A',
      contactPhone: customer.contactPhone || 'N/A',
      totalOrders: customer.orders.length,
      completedOrders: customer.orders.filter(o => o.status === 'COMPLETED').length,
      cancelledOrders: customer.orders.filter(o => o.status === 'CANCELLED').length,
      avgOrderRating: customer.orders.length > 0 && customer.orders.some(o => o.ratings.length > 0)
        ? (customer.orders.reduce((sum, o) => sum + (o.ratings.length > 0 ? o.ratings.reduce((rSum, r) => rSum + r.rating, 0) / o.ratings.length : 0), 0) / customer.orders.filter(o => o.ratings.length > 0).length).toFixed(1)
        : 'N/A',
      totalEmployeesAssigned: customer.orders.reduce((sum, o) => sum + o.employeeAssignments.length, 0),
      avgEmployeePerformance: customer.orders.length > 0 
        ? (customer.orders.reduce((sum, o) => sum + o.employeeAssignments.reduce((eSum, ea) => eSum + (Number(ea.employee.performanceScore) || 0), 0), 0) / Math.max(customer.orders.reduce((sum, o) => sum + o.employeeAssignments.length, 0), 1)).toFixed(1)
        : 'N/A',
      isActive: customer.isActive ? 'Yes' : 'No',
      createdAt: customer.createdAt.toISOString().split('T')[0]
    }));

    const headers = [
      'companyName', 'contactEmail', 'contactPhone', 'totalOrders', 'completedOrders',
      'cancelledOrders', 'avgOrderRating', 'totalEmployeesAssigned', 'avgEmployeePerformance',
      'isActive', 'createdAt'
    ];

    const csv = convertToCSV(csvData, headers);
    const filename = req.params.customerId 
      ? `customer_analytics_${req.params.customerId}_${new Date().toISOString().split('T')[0]}.csv`
      : `customer_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    
    setCSVHeaders(res, filename);
    res.send(csv);
  } catch (error) {
    console.error('Export customer analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to export customer analytics', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Export employee qualifications
export const exportEmployeeQualifications = async (req: Request, res: Response) => {
  try {
    const qualifications = await exportService.exportEmployeeQualificationsService(req.query);
    
    const csvData = qualifications.map(eq => ({
      employeeName: `${eq.employee.firstName} ${eq.employee.lastName}`,
      employeeCode: eq.employee.employeeCode,
      department: eq.employee.department?.name || 'N/A',
      position: eq.employee.position?.title || 'N/A',
      qualificationName: eq.qualification.name,
      qualificationCategory: eq.qualification.category || 'N/A',
      proficiencyLevel: eq.proficiencyLevel,
      acquiredDate: eq.acquiredDate.toISOString().split('T')[0],
      expiryDate: eq.expiryDate?.toISOString().split('T')[0] || 'No Expiry',
      isVerified: eq.isVerified ? 'Yes' : 'No',
      certificateUrl: eq.certificateUrl || 'N/A',
      daysUntilExpiry: eq.expiryDate 
        ? Math.ceil((new Date(eq.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 'N/A'
    }));

    const headers = [
      'employeeName', 'employeeCode', 'department', 'position', 'qualificationName',
      'qualificationCategory', 'proficiencyLevel', 'acquiredDate', 'expiryDate',
      'isVerified', 'certificateUrl', 'daysUntilExpiry'
    ];

    const csv = convertToCSV(csvData, headers);
    setCSVHeaders(res, `employee_qualifications_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export employee qualifications error:', error);
    res.status(500).json({ 
      message: 'Failed to export employee qualifications', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Export work statistics
export const exportWorkStatistics = async (req: Request, res: Response) => {
  try {
    const workStats = await exportService.exportWorkStatisticsService(req.query);
    
    const csvData = workStats.map(ws => ({
      date: ws.date.toISOString().split('T')[0],
      employeeName: `${ws.employee.firstName} ${ws.employee.lastName}`,
      employeeCode: ws.employee.employeeCode,
      department: ws.employee.department?.name || 'N/A',
      position: ws.employee.position?.title || 'N/A',
      hoursWorked: ws.hoursWorked.toString(),
      overtimeHours: ws.overtimeHours.toString(),
      location: ws.location || 'N/A',
      projects: ws.projects.join('; '),
      efficiency: ws.efficiency?.toString() || 'N/A',
      qualityScore: ws.qualityScore?.toString() || 'N/A'
    }));

    const headers = [
      'date', 'employeeName', 'employeeCode', 'department', 'position',
      'hoursWorked', 'overtimeHours', 'location', 'projects', 'efficiency', 'qualityScore'
    ];

    const csv = convertToCSV(csvData, headers);
    setCSVHeaders(res, `work_statistics_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export work statistics error:', error);
    res.status(500).json({ 
      message: 'Failed to export work statistics', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};