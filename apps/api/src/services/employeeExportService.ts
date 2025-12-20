import { prisma } from "@repo/db";
import * as XLSX from 'xlsx';
import { generateCSV } from "../utils/csvUtils";

interface ExportFilters {
  employeeId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  format?: 'csv' | 'xlsx';
}

const getAssignmentsData = async (filters: ExportFilters) => {
  const { employeeId, period, startDate, endDate } = filters;

  const whereClause: any = {
    assignedDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (employeeId) {
    whereClause.employeeId = employeeId;
  }

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

  return assignments.map(assignment => {
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
};

const getWorkStatsData = async (filters: ExportFilters) => {
  const { employeeId, period, startDate, endDate } = filters;

  const whereClause: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (employeeId) {
    whereClause.employeeId = employeeId;
  }

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

  return workStats.map(stat => {
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
};

export const exportEmployeeAssignments = async (filters: ExportFilters): Promise<string | Buffer> => {
  try {
    const csvData = await getAssignmentsData(filters);
    const { format = 'xlsx' } = filters;
    
    if (format === 'csv') {
      return generateCSV(csvData);
    } else {
      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employee Assignments');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
  } catch (error) {
    console.error('Error exporting employee assignments:', error);
    throw new Error('Failed to export employee assignments');
  }
};

export const exportEmployeeWorkStatistics = async (filters: ExportFilters): Promise<string | Buffer> => {
  try {
    const csvData = await getWorkStatsData(filters);
    const { format = 'xlsx' } = filters;
    
    if (format === 'csv') {
      return generateCSV(csvData);
    } else {
      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Work Statistics');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
  } catch (error) {
    console.error('Error exporting work statistics:', error);
    throw new Error('Failed to export work statistics');
  }
};

export const exportCombinedEmployeeData = async (filters: ExportFilters): Promise<string | Buffer> => {
  try {
    const assignmentsData = await getAssignmentsData(filters);
    const workStatsData = await getWorkStatsData(filters);
    const { format = 'xlsx' } = filters;
    
    if (format === 'csv') {
      const assignmentsCSV = generateCSV(assignmentsData);
      const workStatsCSV = generateCSV(workStatsData);
      return [
        '=== EMPLOYEE ASSIGNMENTS ===',
        assignmentsCSV,
        '',
        '=== WORK STATISTICS ===',
        workStatsCSV,
      ].join('\n');
    } else {
      const wb = XLSX.utils.book_new();
      
      const assignmentsWs = XLSX.utils.json_to_sheet(assignmentsData);
      XLSX.utils.book_append_sheet(wb, assignmentsWs, 'Assignments');
      
      const workStatsWs = XLSX.utils.json_to_sheet(workStatsData);
      XLSX.utils.book_append_sheet(wb, workStatsWs, 'Work Statistics');
      
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
  } catch (error) {
    console.error('Error exporting combined employee data:', error);
    throw new Error('Failed to export combined employee data');
  }
};