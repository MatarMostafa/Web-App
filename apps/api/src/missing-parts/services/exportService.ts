import { prisma } from "../lib/prisma";
import { OrderStatus, AssignmentStatus } from "../generated/prisma";

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  customerId?: string;
  departmentId?: string;
  employeeId?: string;
  orderId?: string;
  tier?: string;
  trafficLight?: string;
  minPerformanceScore?: number;
  qualificationId?: string;
  expiringWithinDays?: number;
}

// Orders export service
export const exportOrdersService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.startDate) whereClause.scheduledDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) whereClause.scheduledDate = { ...whereClause.scheduledDate, lte: new Date(filters.endDate) };
  if (filters.status) whereClause.status = filters.status as OrderStatus;
  if (filters.customerId) whereClause.customerId = filters.customerId;

  return prisma.order.findMany({
    where: whereClause,
    include: {
      customer: true,
      employeeAssignments: {
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              performanceScore: true,
              trafficLight: true
            }
          }
        }
      },
      ratings: true,
      qualifications: {
        include: { qualification: true }
      }
    },
    orderBy: { scheduledDate: 'desc' }
  });
};

// Employee performance export service
export const exportEmployeePerformanceService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.departmentId) whereClause.departmentId = filters.departmentId;
  if (filters.trafficLight) whereClause.trafficLight = filters.trafficLight;
  if (filters.minPerformanceScore) whereClause.performanceScore = { gte: filters.minPerformanceScore };

  return prisma.employee.findMany({
    where: whereClause,
    include: {
      user: {
        select: { email: true, lastLogin: true }
      },
      department: true,
      position: true,
      assignments: {
        where: {
          ...(filters.startDate && { assignedDate: { gte: new Date(filters.startDate) } }),
          ...(filters.endDate && { assignedDate: { lte: new Date(filters.endDate) } })
        },
        include: {
          order: {
            select: { title: true, status: true }
          }
        }
      },
      qualifications: {
        include: { qualification: true }
      },
      ratings: true,
      workStatistics: {
        where: {
          ...(filters.startDate && { date: { gte: new Date(filters.startDate) } }),
          ...(filters.endDate && { date: { lte: new Date(filters.endDate) } })
        }
      }
    },
    orderBy: { performanceScore: 'desc' }
  });
};

// Assignment details export service
export const exportAssignmentDetailsService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.orderId) whereClause.orderId = filters.orderId;
  if (filters.employeeId) whereClause.employeeId = filters.employeeId;
  if (filters.status) whereClause.status = filters.status as AssignmentStatus;
  if (filters.tier) whereClause.tier = filters.tier;
  if (filters.startDate) whereClause.assignedDate = { gte: new Date(filters.startDate) };
  if (filters.endDate) whereClause.assignedDate = { ...whereClause.assignedDate, lte: new Date(filters.endDate) };

  return prisma.assignment.findMany({
    where: whereClause,
    include: {
      order: {
        include: {
          customer: {
            select: { companyName: true }
          }
        }
      },
      employee: {
        include: {
          department: true,
          position: true,
          qualifications: {
            include: { qualification: true }
          }
        }
      }
    },
    orderBy: { assignedDate: 'desc' }
  });
};

// Customer analytics export service
export const exportCustomerAnalyticsService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.customerId) whereClause.id = filters.customerId;

  return prisma.customer.findMany({
    where: whereClause,
    include: {
      orders: {
        where: {
          ...(filters.startDate && { scheduledDate: { gte: new Date(filters.startDate) } }),
          ...(filters.endDate && { scheduledDate: { lte: new Date(filters.endDate) } })
        },
        include: {
          employeeAssignments: {
            include: {
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  performanceScore: true
                }
              }
            }
          },
          ratings: true
        }
      },
      ratings: true
    },
    orderBy: { companyName: 'asc' }
  });
};

// Employee qualifications export service
export const exportEmployeeQualificationsService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.departmentId) whereClause.employee = { departmentId: filters.departmentId };
  if (filters.qualificationId) whereClause.qualificationId = filters.qualificationId;
  
  if (filters.expiringWithinDays) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.expiringWithinDays);
    whereClause.expiryDate = { lte: futureDate, gte: new Date() };
  }

  return prisma.employeeQualification.findMany({
    where: whereClause,
    include: {
      employee: {
        include: {
          department: true,
          position: true
        }
      },
      qualification: true
    },
    orderBy: { expiryDate: 'asc' }
  });
};

// Work statistics export service
export const exportWorkStatisticsService = async (filters: ExportFilters = {}) => {
  const whereClause: any = {};
  
  if (filters.employeeId) whereClause.employeeId = filters.employeeId;
  if (filters.startDate) whereClause.date = { gte: new Date(filters.startDate) };
  if (filters.endDate) whereClause.date = { ...whereClause.date, lte: new Date(filters.endDate) };
  
  if (filters.departmentId) {
    whereClause.employee = { departmentId: filters.departmentId };
  }

  return prisma.workStatistic.findMany({
    where: whereClause,
    include: {
      employee: {
        include: {
          department: true,
          position: true
        }
      }
    },
    orderBy: { date: 'desc' }
  });
};