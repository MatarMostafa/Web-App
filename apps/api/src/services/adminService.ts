import { prisma } from "@repo/db";
import { generateCSV } from "../utils/csvUtils";

export const getBlockedEmplyees = async () => {
  try {
    const blocks = await prisma.employee.findMany({
      where: {
        blockedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        blockedAt: true,
        blockedReason: true,
      },
    });
    return blocks;
  } catch (error) {
    throw new Error("Failed to fetch employee blocks");
  }
};

export const unblockEmployee = async (employeeId: string) => {
  try {
    const result = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        blockedAt: null,
        blockedReason: null,
      },
    });
    return { message: "Employee unblocked successfully", employee: result };
  } catch (error) {
    throw new Error("Failed to unblock employee");
  }
};

export const getCustomerStatistics = async () => {
  try {
    const totalCustomers = await prisma.customer.count();
    const activeCustomers = await prisma.customer.count({
      where: { isActive: true },
    });
    const ordersPerCustomer = await prisma.order.groupBy({
      by: ["customerId"],
      _count: {
        id: true,
      },
    });

    const avgOrdersPerCustomer =
      ordersPerCustomer.length > 0
        ? ordersPerCustomer.reduce((sum, item) => sum + item._count.id, 0) /
          ordersPerCustomer.length
        : 0;

    return {
      totalCustomers,
      activeCustomers,
      avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
    };
  } catch (error) {
    throw new Error("Failed to fetch customer statistics");
  }
};

export const getAverageValues = async () => {
  try {
    const avgOrderDuration = await prisma.order.aggregate({
      _avg: {
        duration: true,
      },
    });

    const avgEmployeeHourlyRate = await prisma.employee.aggregate({
      _avg: {
        hourlyRate: true,
      },
    });

    const avgAssignmentHours = await prisma.assignment.aggregate({
      _avg: {
        estimatedHours: true,
        actualHours: true,
      },
    });

    return {
      avgOrderDuration: avgOrderDuration._avg.duration || 0,
      avgEmployeeHourlyRate: avgEmployeeHourlyRate._avg.hourlyRate || 0,
      avgEstimatedHours: avgAssignmentHours._avg.estimatedHours || 0,
      avgActualHours: avgAssignmentHours._avg.actualHours || 0,
    };
  } catch (error) {
    throw new Error("Failed to fetch average values");
  }
};

export const getHoursPerEmployee = async () => {
  try {
    const hoursData = await prisma.assignment.groupBy({
      by: ["employeeId"],
      _sum: {
        actualHours: true,
        estimatedHours: true,
      },
      _count: {
        id: true,
      },
    });

    const employeeIds = hoursData.map((item) => item.employeeId);
    const employees = await prisma.employee.findMany({
      where: {
        id: {
          in: employeeIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
      },
    });

    const result = hoursData.map((item) => {
      const employee = employees.find((emp) => emp.id === item.employeeId);
      return {
        employeeId: item.employeeId,
        employeeName: employee
          ? `${employee.firstName} ${employee.lastName}`
          : "Unknown",
        employeeCode: employee?.employeeCode || "N/A",
        totalActualHours: item._sum.actualHours || 0,
        totalEstimatedHours: item._sum.estimatedHours || 0,
        assignmentCount: item._count.id,
      };
    });

    return result;
  } catch (error) {
    throw new Error("Failed to fetch hours per employee");
  }
};

export const exportOrdersCSV = async () => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            companyName: true,
            contactEmail: true,
          },
        },
        employeeAssignments: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeCode: true,
              },
            },
          },
        },
      },
    });

    const csvData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      title: order.title,
      status: order.status,
      customerName: order.customer?.companyName || "N/A",
      contactEmail: order.customer?.contactEmail || "N/A",
      scheduledDate: order.scheduledDate?.toISOString().split("T")[0] || "N/A",
      location: order.location || "N/A",
      duration: order.duration || 0,
      assignedEmployees: order.employeeAssignments.length,
      createdAt: order.createdAt.toISOString().split("T")[0],
    }));

    return generateCSV(csvData);
  } catch (error) {
    throw new Error("Failed to export orders CSV");
  }
};

export const getDashboardStatistics = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      ordersLast30Days,
      newCustomersLast30Days,
      newEmployeesLast30Days,
      employeesOnLeave,
      unassignedOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.employee.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.absence.count({
        where: {
          status: "APPROVED",
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.order.count({
        where: {
          employeeAssignments: {
            none: {},
          },
        },
      }),
      prisma.order.count({
        where: {
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      ordersLast30Days,
      newCustomersLast30Days,
      newEmployeesLast30Days,
      employeesOnLeave,
      unassignedOrders,
      completedOrders,
    };
  } catch (error) {
    throw new Error("Failed to fetch dashboard statistics");
  }
};
