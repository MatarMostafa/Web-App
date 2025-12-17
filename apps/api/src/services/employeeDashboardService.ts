import { prisma } from "@repo/db";
import { ensureEmployeeExists } from "../utils/employeeUtils";

// Helper function to get start and end of current week (Monday to Sunday)
const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

export const getCurrentWeekOrders = async (userId: string) => {
  try {
    const employee = await ensureEmployeeExists(userId);

    const assignments = await prisma.assignment.findMany({
      where: {
        employeeId: employee.id,
        order: {
          isArchived: false,
        },
      },
      include: {
        order: {
          include: {
            customerActivities: {
              include: {
                activity: true
              }
            }
          }
        },
      },
    });

    return assignments.filter(a => a.order).map(assignment => ({
      id: assignment.order!.id,
      orderNumber: assignment.order!.orderNumber,
      title: assignment.order!.title,
      description: assignment.order!.description,
      scheduledDate: assignment.order!.scheduledDate.toISOString(),
      status: assignment.order!.status,
      priority: assignment.order!.priority,
      estimatedHours: assignment.order!.estimatedHours?.toNumber(),
      actualHours: assignment.order!.actualHours?.toNumber(),
      assignment: {
        id: assignment.id,
        assignedDate: assignment.assignedDate.toISOString(),
        startDate: assignment.startDate?.toISOString(),
        endDate: assignment.endDate?.toISOString(),
        status: assignment.status,
        notes: assignment.notes,
      },
    }));
  } catch (error) {
    console.error("Error fetching current week orders:", error);
    throw error;
  }
};

export const getArchivedOrders = async (userId: string) => {
  try {
    const employee = await ensureEmployeeExists(userId);

    const assignments = await prisma.assignment.findMany({
      where: {
        employeeId: employee.id,
        order: {
          isArchived: true,
        },
      },
      include: {
        order: {
          include: {
            customerActivities: {
              include: {
                activity: true
              }
            }
          }
        },
      },
      take: 50,
    });

    return assignments.filter(a => a.order).map(assignment => ({
      id: assignment.order!.id,
      orderNumber: assignment.order!.orderNumber,
      title: assignment.order!.title,
      description: assignment.order!.description,
      scheduledDate: assignment.order!.scheduledDate.toISOString(),
      status: assignment.order!.status,
      priority: assignment.order!.priority,
      estimatedHours: assignment.order!.estimatedHours?.toNumber(),
      actualHours: assignment.order!.actualHours?.toNumber(),
      assignment: {
        id: assignment.id,
        assignedDate: assignment.assignedDate.toISOString(),
        startDate: assignment.startDate?.toISOString(),
        endDate: assignment.endDate?.toISOString(),
        status: assignment.status,
        notes: assignment.notes,
      },
    }));
  } catch (error) {
    console.error("Error fetching archived orders:", error);
    throw error;
  }
};

export const getDashboardStats = async (userId: string) => {
  try {
    const employee = await ensureEmployeeExists(userId);

    const { startOfWeek, endOfWeek } = getCurrentWeekRange();

    // Current week orders count
    const currentWeekOrdersCount = await prisma.assignment.count({
      where: {
        employeeId: employee.id,
        OR: [
          {
            order: {
              scheduledDate: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          },
          {
            assignedDate: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        ],
      },
    });

    // Completed orders (all time)
    const completedOrdersCount = await prisma.assignment.count({
      where: {
        employeeId: employee.id,
        order: {
          status: "COMPLETED",
        },
      },
    });

    // Pending orders (all time)
    const pendingOrdersCount = await prisma.assignment.count({
      where: {
        employeeId: employee.id,
        order: {
          status: {
            in: ["DRAFT", "OPEN", "ACTIVE", "IN_PROGRESS"],
          },
        },
      },
    });

    // Total hours worked (from assignments with actual hours)
    const totalHoursResult = await prisma.assignment.aggregate({
      where: {
        employeeId: employee.id,
        actualHours: {
          not: null,
        },
      },
      _sum: {
        actualHours: true,
      },
    });

    // Average hours per order
    const avgHoursResult = await prisma.assignment.aggregate({
      where: {
        employeeId: employee.id,
        actualHours: {
          not: null,
        },
      },
      _avg: {
        actualHours: true,
      },
    });

    // Upcoming deadlines (orders scheduled in next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingDeadlinesCount = await prisma.assignment.count({
      where: {
        employeeId: employee.id,
        order: {
          scheduledDate: {
            gte: new Date(),
            lte: nextWeek,
          },
          status: {
            not: "COMPLETED",
          },
        },
      },
    });

    return {
      currentWeekOrders: currentWeekOrdersCount,
      completedOrders: completedOrdersCount,
      pendingOrders: pendingOrdersCount,
      totalHoursWorked: totalHoursResult._sum.actualHours?.toNumber() || 0,
      averageHoursPerOrder: avgHoursResult._avg.actualHours?.toNumber() || 0,
      upcomingDeadlines: upcomingDeadlinesCount,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const updateOrderStatus = async (userId: string, orderId: string, status: string) => {
  try {
    const employee = await ensureEmployeeExists(userId);

    // Check if the order is assigned to this employee
    const assignment = await prisma.assignment.findFirst({
      where: {
        employeeId: employee.id,
        orderId: orderId,
      },
    });

    if (!assignment) {
      throw new Error("Auftrag nicht gefunden oder Ihnen nicht zugewiesen");
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    const employeeAssignment = await prisma.assignment.findFirst({
      where: {
        employeeId: employee.id,
        orderId: orderId,
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      title: updatedOrder.title,
      description: updatedOrder.description,
      scheduledDate: updatedOrder.scheduledDate.toISOString(),
      status: updatedOrder.status,
      priority: updatedOrder.priority,
      estimatedHours: updatedOrder.estimatedHours?.toNumber(),
      actualHours: updatedOrder.actualHours?.toNumber(),
      assignment: employeeAssignment ? {
        id: employeeAssignment.id,
        assignedDate: employeeAssignment.assignedDate.toISOString(),
        startDate: employeeAssignment.startDate?.toISOString(),
        endDate: employeeAssignment.endDate?.toISOString(),
        status: employeeAssignment.status,
        notes: employeeAssignment.notes,
      } : undefined,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};