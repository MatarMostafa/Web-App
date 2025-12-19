import { prisma } from "@repo/db";
import { generateCSV } from "../utils/csvUtils";

interface ExportFilters {
  employeeId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
}

interface EmployeeAssignmentData {
  employeeCode: string;
  employeeName: string;
  orderNumber: string;
  orderTitle: string;
  customerName: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: string;
  estimatedHours: number;
  actualHours: number;
  period: string;
}

export const exportEmployeeAssignments = async (filters: ExportFilters): Promise<string> => {
  try {
    const { employeeId, period, startDate, endDate } = filters;

    // Build where clause
    const whereClause: any = {
      assignedDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    // Fetch assignments with related data
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            title: true,
            customer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedDate: 'desc',
      },
    });

    // Transform data for CSV
    const csvData: EmployeeAssignmentData[] = assignments.map(assignment => {
      const employeeName = `${assignment.employee.firstName || ''} ${assignment.employee.lastName || ''}`.trim();
      
      return {
        employeeCode: assignment.employee.employeeCode,
        employeeName: employeeName || 'N/A',
        orderNumber: assignment.order?.orderNumber || 'N/A',
        orderTitle: assignment.order?.title || 'N/A',
        customerName: assignment.order?.customer?.companyName || 'N/A',
        assignedDate: assignment.assignedDate.toISOString().split('T')[0],
        startDate: assignment.startDate?.toISOString().split('T')[0] || 'N/A',
        endDate: assignment.endDate?.toISOString().split('T')[0] || 'N/A',
        status: assignment.status,
        estimatedHours: Number(assignment.estimatedHours) || 0,
        actualHours: Number(assignment.actualHours) || 0,
        period: period,
      };
    });

    return generateCSV(csvData);
  } catch (error) {
    console.error('Error exporting employee assignments:', error);
    throw new Error('Failed to export employee assignments');
  }
};

export const exportEmployeeWorkStatistics = async (filters: ExportFilters): Promise<string> => {
  try {
    const { employeeId, period, startDate, endDate } = filters;

    // Build where clause
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    // Fetch work statistics with employee data
    const workStats = await prisma.workStatistic.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transform data for CSV
    const csvData = workStats.map(stat => {
      const employeeName = `${stat.employee.firstName || ''} ${stat.employee.lastName || ''}`.trim();
      
      return {
        employeeCode: stat.employee.employeeCode,
        employeeName: employeeName || 'N/A',
        department: stat.employee.department?.name || 'N/A',
        position: stat.employee.position?.title || 'N/A',
        date: stat.date.toISOString().split('T')[0],
        hoursWorked: Number(stat.hoursWorked) || 0,
        overtimeHours: Number(stat.overtimeHours) || 0,
        totalHours: Number(stat.hoursWorked) + Number(stat.overtimeHours) || 0,
        location: stat.location || 'N/A',
        projects: Array.isArray(stat.projects) ? stat.projects.join('; ') : 'N/A',
        efficiency: Number(stat.efficiency) || 0,
        qualityScore: Number(stat.qualityScore) || 0,
        period: period,
      };
    });

    return generateCSV(csvData);
  } catch (error) {
    console.error('Error exporting work statistics:', error);
    throw new Error('Failed to export work statistics');
  }
};

export const exportCombinedEmployeeData = async (filters: ExportFilters): Promise<string> => {
  try {
    const { employeeId, period, startDate, endDate } = filters;

    // Get assignments and work statistics
    const [assignmentsCSV, workStatsCSV] = await Promise.all([
      exportEmployeeAssignments(filters),
      exportEmployeeWorkStatistics(filters),
    ]);

    // Combine both datasets with headers
    const combinedData = [
      '=== EMPLOYEE ASSIGNMENTS ===',
      assignmentsCSV,
      '',
      '=== WORK STATISTICS ===',
      workStatsCSV,
    ].join('\n');

    return combinedData;
  } catch (error) {
    console.error('Error exporting combined employee data:', error);
    throw new Error('Failed to export combined employee data');
  }
};