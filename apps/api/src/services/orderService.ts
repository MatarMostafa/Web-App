import { prisma } from "@repo/db";
import {
  OrderStatus,
  AssignmentStatus,
  RatingStatus,
  Prisma,
} from "@repo/db/src/generated/prisma";

// Type definitions for better type safety
type OrderCreateInput = Prisma.OrderCreateInput;
type OrderUpdateInput = Prisma.OrderUpdateInput;
type AssignmentCreateInput = Prisma.AssignmentUncheckedCreateInput;
type AssignmentUpdateInput = Prisma.AssignmentUpdateInput;
type OrderAssignmentCreateInput = Prisma.OrderAssignmentUncheckedCreateInput;
type OrderQualificationCreateInput =
  Prisma.OrderQualificationUncheckedCreateInput;
type RatingCreateInput = Prisma.RatingUncheckedCreateInput;
type RatingUpdateInput = Prisma.RatingUpdateInput;

interface AutoAssignConfig {
  maxEmployees?: number;
  requireAllQualifications?: boolean;
  minPerformanceScore?: number;
  excludeEmployeeIds?: string[];
  prioritizePerformance?: boolean;
}

// -------------------- Orders --------------------
export const getAllOrdersService = async () => {
  return prisma.order.findMany({
    include: {
      customer: true,
      qualifications: true,
      orderAssignments: true,
      employeeAssignments: true,
      ratings: true,
    },
  });
};

export const getOrderByIdService = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      qualifications: true,
      orderAssignments: true,
      employeeAssignments: true,
      ratings: true,
    },
  });
};

export const createOrderService = async (data: OrderCreateInput & { assignedEmployeeIds?: string[] }) => {
  const { assignedEmployeeIds, ...orderData } = data;
  
  // Clean empty strings to undefined for optional DateTime fields
  if (orderData.startTime === '') orderData.startTime = undefined;
  if (orderData.endTime === '') orderData.endTime = undefined;
  if (orderData.location === '') orderData.location = undefined;
  if (orderData.specialInstructions === '') orderData.specialInstructions = undefined;
  if (orderData.description === '') orderData.description = undefined;
  
  // Auto-generate order number if not provided
  if (!orderData.orderNumber) {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Find the highest order number for this month
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: yearMonth
        }
      },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    });
    
    let nextSequence = 1;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(new RegExp(`${yearMonth}-(\\d+)`));
      if (match) {
        nextSequence = parseInt(match[1]) + 1;
      }
    }
    
    orderData.orderNumber = `${yearMonth}-${nextSequence.toString().padStart(3, '0')}`;
  }
  
  // Auto-set status to DRAFT if not provided
  if (!orderData.status) {
    orderData.status = 'DRAFT';
  }
  
  const order = await prisma.order.create({
    data: orderData,
  });
  
  // Auto-update status based on assignments
  let newStatus = order.status;
  if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
    newStatus = 'ACTIVE';
  } else if (order.status === 'DRAFT') {
    newStatus = 'OPEN';
  }

  // Create assignments if employees are specified
  if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
    await Promise.all(
      assignedEmployeeIds.map(employeeId =>
        prisma.assignment.create({
          data: {
            orderId: order.id,
            employeeId,
            assignedDate: new Date(),
            startDate: order.startTime || order.scheduledDate,
            endDate: order.endTime,
            status: "ASSIGNED",
            estimatedHours: order.duration ? order.duration / 60 : undefined,
          },
        })
      )
    );
  }
  
  // Update order status if it changed
  if (newStatus !== order.status) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus }
    });
    order.status = newStatus;
  }

  return order;
};

export const updateOrderService = async (
  id: string,
  data: OrderUpdateInput & { assignedEmployeeIds?: string[] }
) => {
  const { assignedEmployeeIds, ...orderData } = data;
  
  // Clean empty strings to undefined for optional DateTime fields
  if (orderData.startTime === '') orderData.startTime = undefined;
  if (orderData.endTime === '') orderData.endTime = undefined;
  if (orderData.location === '') orderData.location = undefined;
  if (orderData.specialInstructions === '') orderData.specialInstructions = undefined;
  if (orderData.description === '') orderData.description = undefined;
  
  const order = await prisma.order.update({
    where: { id },
    data: orderData,
  });

  // Handle employee assignments if specified
  if (assignedEmployeeIds !== undefined) {
    // Remove existing assignments
    await prisma.assignment.deleteMany({
      where: { orderId: id },
    });

    // Create new assignments
    if (assignedEmployeeIds.length > 0) {
      await Promise.all(
        assignedEmployeeIds.map(employeeId =>
          prisma.assignment.create({
            data: {
              orderId: id,
              employeeId,
              assignedDate: new Date(),
              startDate: order.startTime || order.scheduledDate,
              endDate: order.endTime,
              status: "ASSIGNED",
              estimatedHours: order.duration ? order.duration / 60 : undefined,
            },
          })
        )
      );
    }
    
    // Auto-update order status based on new assignments
    await updateOrderStatusBasedOnAssignments(id);
  }

  return order;
};

export const deleteOrderService = async (id: string) => {
  return prisma.order.delete({
    where: { id },
  });
};

export const updateOrderStatusService = async (
  id: string,
  status: OrderStatus
) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const getOrderSummaryService = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      employeeAssignments: true,
      ratings: true,
    },
  });

  if (!order) return null;

  return {
    ...order,
    totalAssignedEmployees: order.employeeAssignments.length,
    completionRate:
      order.employeeAssignments.length > 0
        ? order.employeeAssignments.filter((a) => a.status === "COMPLETED")
            .length / order.employeeAssignments.length
        : 0,
  };
};

// -------------------- Assignments --------------------
export const getAssignmentsService = async (orderId: string) => {
  return prisma.assignment.findMany({ where: { orderId } });
};

export const createAssignmentService = async (
  orderId: string,
  data: Omit<AssignmentCreateInput, "orderId">
) => {
  return prisma.assignment.create({
    data: { ...data, orderId },
  });
};

export const updateAssignmentService = async (
  id: string,
  data: AssignmentUpdateInput
) => {
  return prisma.assignment.update({
    where: { id },
    data,
  });
};

export const deleteAssignmentService = async (id: string) => {
  return prisma.assignment.delete({
    where: { id },
  });
};

export const updateAssignmentStatusService = async (
  id: string,
  status: AssignmentStatus
) => {
  const assignment = await prisma.assignment.update({
    where: { id },
    data: { status },
  });
  
  // Auto-update order status based on assignment changes
  if (assignment.orderId) {
    await updateOrderStatusBasedOnAssignments(assignment.orderId);
  }
  
  return assignment;
};

// Helper function to auto-update order status based on assignments
const updateOrderStatusBasedOnAssignments = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { employeeAssignments: true }
  });
  
  if (!order) return;
  
  const assignments = order.employeeAssignments;
  let newStatus = order.status;
  
  if (assignments.length === 0) {
    newStatus = 'OPEN';
  } else {
    const activeAssignments = assignments.filter(a => a.status === 'ACTIVE');
    const completedAssignments = assignments.filter(a => a.status === 'COMPLETED');
    
    if (completedAssignments.length === assignments.length && assignments.length > 0) {
      newStatus = 'COMPLETED';
    } else if (activeAssignments.length > 0) {
      newStatus = 'IN_PROGRESS';
    } else if (assignments.length > 0) {
      newStatus = 'ACTIVE';
    }
  }
  
  if (newStatus !== order.status) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
  }
};

// Intelligent auto-assignment with qualification matching and performance scoring
export const autoAssignEmployeesService = async (
  orderId: string,
  config?: AutoAssignConfig
) => {
  // 1. Get order with requirements
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      qualifications: {
        include: { qualification: true },
      },
      employeeAssignments: true, // Check existing assignments
    },
  });

  if (!order) throw new Error("Order not found");

  // 2. Check if already has enough assignments
  const existingAssignments = order.employeeAssignments.length;
  const needed = Math.min(
    order.requiredEmployees - existingAssignments,
    config?.maxEmployees || order.requiredEmployees
  );
  if (needed <= 0) {
    return {
      message: "Order already has sufficient employee assignments",
      assignments: [],
    };
  }

  // 3. Get required qualifications
  const requiredQualifications = order.qualifications.filter((q) => q.required);
  const requiredQualIds = requiredQualifications.map((q) => q.qualificationId);

  // 4. Find available employees with qualifications
  const availableEmployees = await prisma.employee.findMany({
    where: {
      isAvailable: true,
      blockedAt: null,
      trafficLight: { in: ["GREEN", "YELLOW"] }, // Exclude poor performers
      performanceScore: { gte: config?.minPerformanceScore || 0 },
      // Exclude specific employees if requested
      ...(config?.excludeEmployeeIds?.length && {
        id: { notIn: config.excludeEmployeeIds },
      }),
      // Not already assigned to this order
      NOT: {
        assignments: {
          some: {
            orderId: orderId,
            status: { in: ["ASSIGNED", "ACTIVE"] },
          },
        },
      },
      // Has required qualifications if any specified
      ...(requiredQualIds.length > 0 && {
        qualifications: {
          some: {
            qualificationId: { in: requiredQualIds },
            isVerified: true,
          },
        },
      }),
    },
    include: {
      qualifications: {
        include: { qualification: true },
        where:
          requiredQualIds.length > 0
            ? { qualificationId: { in: requiredQualIds } }
            : undefined,
      },
      assignments: {
        where: {
          status: { in: ["ASSIGNED", "ACTIVE"] },
          OR: [
            { startDate: { lte: order.endTime || order.scheduledDate } },
            { endDate: { gte: order.startTime || order.scheduledDate } },
          ],
        },
      },
    },
  });

  // 5. Score and rank employees
  const scoredEmployees = availableEmployees.map((employee) => {
    let score = 0;

    // Performance score (0-40 points)
    const perfScore = employee.performanceScore?.toNumber() || 50;
    if (config?.prioritizePerformance !== false) {
      score += (perfScore / 100) * 40;
    }

    // Traffic light bonus (0-20 points)
    if (employee.trafficLight === "GREEN") score += 20;
    else if (employee.trafficLight === "YELLOW") score += 10;

    // Qualification match score (0-30 points)
    if (requiredQualifications.length > 0) {
      const matchedQuals = employee.qualifications.length;
      const qualScore = (matchedQuals / requiredQualifications.length) * 30;
      score += qualScore;

      // Proficiency bonus (0-10 points)
      if (employee.qualifications.length > 0) {
        const avgProficiency =
          employee.qualifications.reduce(
            (sum, q) => sum + q.proficiencyLevel,
            0
          ) / employee.qualifications.length;
        score += (avgProficiency / 5) * 10;
      }
    } else {
      score += 30; // No specific requirements
    }

    // Workload penalty (subtract points for current assignments)
    const currentWorkload = employee.assignments.length;
    score -= currentWorkload * 5;

    // Priority bonus (higher priority employees get bonus)
    score += (6 - employee.priority) * 2;

    return { employee, score };
  });

  // 6. Sort by score and take top candidates
  const topCandidates = scoredEmployees
    .sort((a, b) => b.score - a.score)
    .slice(0, needed);

  if (topCandidates.length === 0) {
    throw new Error("No qualified employees available for auto-assignment");
  }

  // 7. Create assignments
  const assignments = await Promise.all(
    topCandidates.map(({ employee }) =>
      prisma.assignment.create({
        data: {
          orderId,
          employeeId: employee.id,
          assignedDate: new Date(),
          startDate: order.startTime || order.scheduledDate,
          endDate: order.endTime,
          status: "ASSIGNED",
          estimatedHours: order.duration ? order.duration / 60 : undefined,
          notes: `Auto-assigned based on qualifications and performance`,
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              performanceScore: true,
              trafficLight: true,
            },
          },
        },
      })
    )
  );

  return {
    message: `Successfully auto-assigned ${assignments.length} employees`,
    assignments,
    summary: {
      requested: needed,
      assigned: assignments.length,
      criteria: {
        requiredQualifications: requiredQualifications.map(
          (q) => q.qualification.name
        ),
        performanceFilter: "GREEN/YELLOW only",
        availabilityCheck: true,
        conflictCheck: true,
      },
    },
  };
};

// -------------------- OrderAssignments --------------------
export const getOrderAssignmentsService = async (orderId: string) => {
  return prisma.orderAssignment.findMany({ where: { orderId } });
};

export const createOrderAssignmentService = async (
  orderId: string,
  data: Omit<OrderAssignmentCreateInput, "orderId">
) => {
  return prisma.orderAssignment.create({
    data: { ...data, orderId },
  });
};

export const deleteOrderAssignmentService = async (id: string) => {
  return prisma.orderAssignment.delete({ where: { id } });
};

// -------------------- OrderQualifications --------------------
export const getOrderQualificationsService = async (orderId: string) => {
  return prisma.orderQualification.findMany({ where: { orderId } });
};

export const createOrderQualificationService = async (
  orderId: string,
  data: Omit<OrderQualificationCreateInput, "orderId">
) => {
  return prisma.orderQualification.create({
    data: { ...data, orderId },
  });
};

export const deleteOrderQualificationService = async (id: string) => {
  return prisma.orderQualification.delete({ where: { id } });
};

// -------------------- Ratings --------------------

// Get ratings for a specific order (with optional filters)
export const getOrderRatingsService = async (
  orderId: string,
  filters?: { employeeId?: string; customerId?: string; status?: RatingStatus }
) => {
  return prisma.rating.findMany({
    where: { orderId, ...filters },
  });
};

// Create a rating for an order
export const createOrderRatingService = async (
  orderId: string,
  data: Omit<RatingCreateInput, "orderId">
) => {
  return prisma.rating.create({ data: { ...data, orderId } });
};

// Update a rating
export const updateOrderRatingService = async (
  id: string,
  data: RatingUpdateInput
) => {
  return prisma.rating.update({ where: { id }, data });
};

// Delete a rating
export const deleteOrderRatingService = async (id: string) => {
  return prisma.rating.delete({ where: { id } });
};
