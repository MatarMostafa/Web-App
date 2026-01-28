import { prisma } from "@repo/db";
import {
  OrderStatus,
  AssignmentStatus,
  RatingStatus,
  Prisma,
} from "@repo/db/src/generated/prisma";
import {
  notifyAssignmentCreated,
  notifyAssignmentUpdated,
  notifyAssignmentCancelled,
  notifyOrderStatusChanged,
  notifyOrderCompleted,
  notifyCustomerOrderStatusChanged,
  notifyCustomerOrderCompleted,
  notifyCustomerOrderCancelled,
  notifyCustomerOrderCreated
} from "./notificationHelpers";
import { getPriceForCustomer } from "./priceService";
import { Decimal } from "decimal.js";
import * as templateService from "./templateService";

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
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      customerActivities: true,
      orderAssignments: true,
      employeeAssignments: true,
      ratings: true,
      descriptionData: true
    },
  });

  console.log(`Fetched ${orders.length} orders with quantities`);
  return orders;
};

export const getOrderByIdService = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      customerActivities: true,
      orderAssignments: true,
      employeeAssignments: true,
      ratings: true,
      descriptionData: true,
    },
  });

  if (order) {
    console.log('Order fetched with quantities:', {
      id: order.id,
      cartonQuantity: order.cartonQuantity,
      articleQuantity: order.articleQuantity
    });
  }

  return order;
};

export const createOrderService = async (data: OrderCreateInput & { assignedEmployeeIds?: string[]; activities?: Array<{ activityId: string; quantity?: number; basePrice?: number }>; customerId: string; templateData?: Record<string, string> | null; createdBySubAccountId?: string; cartonQuantity?: number; articleQuantity?: number; containers?: Array<{ serialNumber: string; cartonQuantity: number; articleQuantity: number; cartonPrice: number; articlePrice: number; articles: Array<{ articleName: string; quantity: number; price: number }> }> }, createdBy?: string) => {
  let { assignedEmployeeIds, activities, customerId, templateData, createdBySubAccountId, cartonQuantity, articleQuantity, containers, ...orderData } = data;

  console.log('Creating order with data:', { containers: containers?.length || 0, containerData: containers }); // Debug log

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  // Clean empty strings to undefined for optional DateTime fields
  if (orderData.startTime === '') orderData.startTime = undefined;
  if (orderData.endTime === '') orderData.endTime = undefined;
  if (orderData.location === '') orderData.location = undefined;
  if (orderData.specialInstructions === '') orderData.specialInstructions = undefined;
  if (orderData.description === '') orderData.description = undefined;

  // Auto-set startTime to scheduledDate if not provided
  if (!orderData.startTime && orderData.scheduledDate) {
    orderData.startTime = orderData.scheduledDate;
  }

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

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        ...orderData,
        requiredEmployees: assignedEmployeeIds?.length || orderData.requiredEmployees || 1,
        usesTemplate: templateData !== null ? true : false,
        cartonQuantity,
        articleQuantity,
        createdBy,
        customer: {
          connect: { id: customerId }
        },
        ...(createdBySubAccountId && {
          createdBySubAccount: {
            connect: { id: createdBySubAccountId }
          }
        })
      },
    });

    // Create order description data if template data is provided and has actual values
    if (templateData && Object.keys(templateData).length > 0 && Object.values(templateData).some(value => value.trim() !== "")) {
      await tx.orderDescriptionData.create({
        data: {
          orderId: newOrder.id,
          descriptionData: templateData
        }
      });
    }

    // Create customer activities linked to order
    if (activities && activities.length > 0) {
      console.log(`Creating ${activities.length} customer activities for order ${newOrder.id}`);
      for (const activity of activities) {
        try {
          // Fetch definition
          const definition = await tx.customerActivity.findUnique({
            where: { id: activity.activityId }
          });

          if (!definition) {
            console.warn(`Definition ${activity.activityId} not found, skipping`);
            continue;
          }

          // Verify that the activity has pricing configured for this customer
          const hasValidPricing = await tx.customerPrice.findFirst({
            where: {
              customerId: customerId!,
              customerActivityId: activity.activityId, // Definition ID
              isActive: true,
              effectiveFrom: { lte: orderData.scheduledDate as Date },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: orderData.scheduledDate as Date } }
              ]
            }
          });

          if (!hasValidPricing) {
            console.warn(`Activity ${activity.activityId} has no valid pricing for customer ${customerId}, skipping`);
            continue;
          }

          const priceResult = await getPriceForCustomer(
            customerId!,
            activity.activityId,
            activity.quantity ?? 1,
            orderData.scheduledDate as Date
          );

          const customerActivity = await tx.customerActivity.create({
            data: {
              customerId: customerId!,
              orderId: newOrder.id,
              quantity: activity.quantity ?? 1,
              unitPrice: priceResult.price.toNumber(),
              lineTotal: priceResult.price.toNumber(),
              basePrice: activity.basePrice ? new Decimal(activity.basePrice) : new Decimal(0),

              // Copied fields
              name: definition.name,
              type: definition.type,
              code: definition.code,
              description: definition.description,
              unit: definition.unit,
              isActive: true
            }
          });
          console.log(`Created customer activity ${customerActivity.id} for order ${newOrder.id}`);
        } catch (error) {
          console.error(`Error creating customer activity for activity ${activity.activityId}:`, error);
          throw error;
        }
      }
    }

    // Create containers if provided
    if (containers && containers.length > 0) {
      console.log(`Creating ${containers.length} containers for order ${newOrder.id}`);
      for (const containerData of containers) {
        console.log('Creating container:', containerData);
        const container = await tx.container.create({
          data: {
            serialNumber: containerData.serialNumber,
            orderId: newOrder.id,
            cartonQuantity: containerData.cartonQuantity,
            articleQuantity: containerData.articleQuantity,
            cartonPrice: new Decimal(containerData.cartonPrice),
            articlePrice: new Decimal(containerData.articlePrice),
            articles: {
              create: containerData.articles?.map(article => ({
                articleName: article.articleName,
                quantity: article.quantity,
                price: new Decimal(article.price)
              })) || []
            }
          }
        });
        console.log(`Created container ${container.id} for order ${newOrder.id}`);
      }
    } else {
      console.log('No containers provided for order creation');
    }

    return newOrder;
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
    // Validate employee IDs exist
    const existingEmployees = await prisma.employee.findMany({
      where: { id: { in: assignedEmployeeIds } },
      select: { id: true }
    });

    const existingIds = existingEmployees.map(e => e.id);
    const invalidIds = assignedEmployeeIds.filter(id => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      // Filter out invalid IDs and continue with valid ones
      const validIds = assignedEmployeeIds.filter(id => existingIds.includes(id));
      if (validIds.length === 0) {
        throw new Error(`Keine gültigen Mitarbeiter-IDs gefunden`);
      }
      console.warn(`Ungültige Mitarbeiter-IDs ignoriert: ${invalidIds.join(', ')}`);
      assignedEmployeeIds = validIds;
    }

    const assignments = await Promise.all(
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

    // Send notifications for new assignments (only if employees assigned)
    await Promise.all(
      assignments.map(assignment =>
        notifyAssignmentCreated(assignment.id, createdBy)
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

  // Send customer notification for order creation
  await notifyCustomerOrderCreated(order.id, createdBy);

  return order;
};

export const updateOrderService = async (
  id: string,
  data: OrderUpdateInput & { assignedEmployeeIds?: string[]; activities?: Array<{ activityId: string; quantity?: number; basePrice?: number }>; templateData?: Record<string, string> | null; cartonQuantity?: number; articleQuantity?: number; containers?: Array<{ serialNumber: string; cartonQuantity: number; articleQuantity: number; cartonPrice: number; articlePrice: number; articles: Array<{ articleName: string; quantity: number; price: number }> }> },
  updatedBy?: string
) => {
  let { assignedEmployeeIds, activities, templateData, cartonQuantity, articleQuantity, containers, ...orderData } = data;

  // Clean empty strings to undefined for optional DateTime fields
  if (orderData.startTime === '') orderData.startTime = undefined;
  if (orderData.endTime === '') orderData.endTime = undefined;
  if (orderData.location === '') orderData.location = undefined;
  if (orderData.specialInstructions === '') orderData.specialInstructions = undefined;
  if (orderData.description === '') orderData.description = undefined;

  // Auto-set startTime to scheduledDate if scheduledDate is updated but startTime is not provided
  if (orderData.scheduledDate && !orderData.startTime) {
    orderData.startTime = orderData.scheduledDate;
  }

  const order = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        ...orderData,
        ...(assignedEmployeeIds !== undefined && {
          requiredEmployees: assignedEmployeeIds.length || 1
        }),
        ...(templateData !== undefined && {
          usesTemplate: templateData !== null && Object.keys(templateData || {}).length > 0
        }),
        ...(cartonQuantity !== undefined && { cartonQuantity }),
        ...(articleQuantity !== undefined && { articleQuantity })
      },
    });

    // Handle template data update if provided
    if (templateData !== undefined) {
      // Remove existing template data
      await tx.orderDescriptionData.deleteMany({
        where: { orderId: id }
      });

      // Create new template data if provided and has actual values
      if (templateData && Object.keys(templateData).length > 0 && Object.values(templateData).some(value => value.trim() !== "")) {
        await tx.orderDescriptionData.create({
          data: {
            orderId: id,
            descriptionData: templateData
          }
        });
      }
    }

    // Handle activities update if provided
    if (activities !== undefined) {
      // Remove existing customer activities for this order
      await tx.customerActivity.deleteMany({
        where: {
          orderId: id,
          customerId: updatedOrder.customerId // Ensure we only delete activities for this customer
        }
      });

      // Create new customer activities
      if (activities.length > 0) {
        for (const activity of activities) {
          try {
            // Fetch definition
            const definition = await tx.customerActivity.findUnique({
              where: { id: activity.activityId }
            });

            if (!definition) {
              console.warn(`Definition ${activity.activityId} not found, skipping`);
              continue;
            }

            // Verify that the activity has pricing configured for this customer
            const hasValidPricing = await tx.customerPrice.findFirst({
              where: {
                customerId: updatedOrder.customerId,
                customerActivityId: activity.activityId,
                isActive: true,
                effectiveFrom: { lte: updatedOrder.scheduledDate },
                OR: [
                  { effectiveTo: null },
                  { effectiveTo: { gte: updatedOrder.scheduledDate } }
                ]
              }
            });

            if (!hasValidPricing) {
              console.warn(`Activity ${activity.activityId} has no valid pricing for customer ${updatedOrder.customerId}, skipping`);
              continue;
            }

            const priceResult = await getPriceForCustomer(
              updatedOrder.customerId,
              activity.activityId,
              activity.quantity ?? 1,
              updatedOrder.scheduledDate
            );

            await tx.customerActivity.create({
              data: {
                customerId: updatedOrder.customerId,
                orderId: id,
                quantity: activity.quantity ?? 1,
                unitPrice: priceResult.price.toNumber(),
                lineTotal: priceResult.price.toNumber(),
                basePrice: activity.basePrice ? new Decimal(activity.basePrice) : new Decimal(0),

                // Copied fields
                name: definition.name,
                type: definition.type,
                code: definition.code,
                description: definition.description,
                unit: definition.unit,
                isActive: true
              }
            });
          } catch (error) {
            console.error(`Error updating customer activity for activity ${activity.activityId}:`, error);
            throw error;
          }
        }
      }
    }

    // Handle containers update if provided
    if (containers !== undefined) {
      console.log(`Updating containers for order ${id}:`, containers);
      // Remove existing containers for this order
      await tx.container.deleteMany({
        where: { orderId: id }
      });

      // Create new containers
      if (containers.length > 0) {
        for (const containerData of containers) {
          await tx.container.create({
            data: {
              serialNumber: containerData.serialNumber,
              orderId: id,
              cartonQuantity: containerData.cartonQuantity,
              articleQuantity: containerData.articleQuantity,
              cartonPrice: new Decimal(containerData.cartonPrice),
              articlePrice: new Decimal(containerData.articlePrice),
              articles: {
                create: containerData.articles?.map(article => ({
                  articleName: article.articleName,
                  quantity: article.quantity,
                  price: new Decimal(article.price)
                })) || []
              }
            }
          });
        }
      }
    }

    return updatedOrder;
  });

  // Handle employee assignments if specified
  if (assignedEmployeeIds !== undefined) {
    // Remove existing assignments
    await prisma.assignment.deleteMany({
      where: { orderId: id },
    });

    // Create new assignments
    if (assignedEmployeeIds.length > 0) {
      // Validate employee IDs exist
      const existingEmployees = await prisma.employee.findMany({
        where: { id: { in: assignedEmployeeIds } },
        select: { id: true }
      });

      const existingIds = existingEmployees.map(e => e.id);
      const invalidIds = assignedEmployeeIds.filter(id => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        // Filter out invalid IDs and continue with valid ones
        const validIds = assignedEmployeeIds.filter(id => existingIds.includes(id));
        if (validIds.length === 0) {
          // If no valid IDs, just skip assignment creation
          assignedEmployeeIds = [];
        } else {
          console.warn(`Ungültige Mitarbeiter-IDs ignoriert: ${invalidIds.join(', ')}`);
          assignedEmployeeIds = validIds;
        }
      }

      const assignments = await Promise.all(
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

      // Send notifications for new assignments
      await Promise.all(
        assignments.map(assignment =>
          notifyAssignmentCreated(assignment.id, updatedBy)
        )
      );
    }
  }

  // Always update order status based on assignments (whether assignments were updated or not)
  await updateOrderStatusBasedOnAssignments(id);

  return order;
};

export const deleteOrderService = async (id: string) => {
  return prisma.order.delete({
    where: { id },
  });
};

export const updateOrderStatusService = async (
  id: string,
  status: OrderStatus,
  createdBy?: string
) => {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  // Send status change notification to employees/admins
  await notifyOrderStatusChanged(id, status, createdBy);

  // Send status change notification to customer
  await notifyCustomerOrderStatusChanged(id, status, createdBy);

  // Send completion notifications
  if (status === 'COMPLETED') {
    await notifyOrderCompleted(id, createdBy);
    await notifyCustomerOrderCompleted(id, createdBy);
  }

  // Send cancellation notification to customer
  if (status === 'CANCELLED') {
    await notifyCustomerOrderCancelled(id, undefined, createdBy);
  }

  return order;
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
  return prisma.assignment.findMany({
    where: { orderId },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          employeeCode: true,
          department: {
            select: {
              name: true
            }
          },
          position: {
            select: {
              title: true
            }
          },
          user: {
            select: {
              email: true
            }
          }
        }
      }
    }
  });
};

export const createAssignmentService = async (
  orderId: string,
  data: Omit<AssignmentCreateInput, "orderId">,
  createdBy?: string
) => {
  const assignment = await prisma.assignment.create({
    data: { ...data, orderId },
  });

  // Send notification to assigned employee
  await notifyAssignmentCreated(assignment.id, createdBy);

  return assignment;
};

export const updateAssignmentService = async (
  id: string,
  data: AssignmentUpdateInput,
  createdBy?: string
) => {
  const assignment = await prisma.assignment.update({
    where: { id },
    data,
  });

  // Send notification to assigned employee
  await notifyAssignmentUpdated(id, createdBy);

  return assignment;
};

export const deleteAssignmentService = async (id: string, createdBy?: string) => {
  // Get assignment details before deletion
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { order: true }
  });

  const result = await prisma.assignment.delete({
    where: { id },
  });

  // Send cancellation notification
  if (assignment) {
    await notifyAssignmentCancelled(
      id,
      assignment.employeeId,
      assignment.order?.orderNumber || 'Unknown',
      createdBy
    );
  }

  return result;
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

    // Send status change notifications
    await notifyOrderStatusChanged(orderId, newStatus);
    await notifyCustomerOrderStatusChanged(orderId, newStatus);

    // Send completion notifications
    if (newStatus === 'COMPLETED') {
      await notifyOrderCompleted(orderId);
      await notifyCustomerOrderCompleted(orderId);
    }
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

  if (!order) throw new Error("Auftrag nicht gefunden");

  // 2. Check if already has enough assignments
  const existingAssignments = order.employeeAssignments.length;
  const needed = Math.min(
    order.requiredEmployees - existingAssignments,
    config?.maxEmployees || order.requiredEmployees
  );
  if (needed <= 0) {
    return {
      message: "Auftrag hat bereits ausreichend Mitarbeiterzuweisungen",
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
    throw new Error("Keine qualifizierten Mitarbeiter für automatische Zuweisung verfügbar");
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
          notes: `Automatisch zugewiesen basierend auf Qualifikationen und Leistung`,
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
    message: `${assignments.length} Mitarbeiter erfolgreich automatisch zugewiesen`,
    assignments,
    summary: {
      requested: needed,
      assigned: assignments.length,
      criteria: {
        requiredQualifications: requiredQualifications.map(
          (q) => q.qualification.name
        ),
        performanceFilter: "NUR GRÜN/GELB",
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
  data: Omit<OrderQualificationCreateInput, "orderId"> & { activityId?: string; quantity?: number }
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, select: { customerId: true, scheduledDate: true } });
    if (!order) throw new Error('Auftrag nicht gefunden');

    let unitPrice: number | undefined;
    let unit: string | undefined;
    let lineTotal: number | undefined;

    if (data.activityId) {
      const priceResult = await getPriceForCustomer(order.customerId, data.activityId, data.quantity ?? 1, order.scheduledDate);
      unitPrice = priceResult.price.toNumber();
      unit = priceResult.unit;
      lineTotal = priceResult.price.toNumber();
    }

    return tx.orderQualification.create({
      data: {
        ...data,
        orderId,
        unit,
        unitPrice,
        quantity: data.quantity ?? 1,
        lineTotal
      },
    });
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

// -------------------- Order Activities --------------------
export const getOrderActivitiesService = async (orderId: string) => {
  // First get the order to ensure we have the customer context
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerId: true,
      createdAt: true,
      createdBy: true
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Get customer activities for this order (filtered by customer)
  const customerActivities = await prisma.customerActivity.findMany({
    where: {
      orderId,
      customerId: order.customerId // Ensure activities belong to the same customer
    },
    include: {
      customer: {
        select: {
          id: true,
          companyName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get order notes with status changes
  const notes = await prisma.orderNote.findMany({
    where: { orderId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get assignment changes
  const assignments = await prisma.assignment.findMany({
    where: { orderId },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const activities = [];

  // Add order creation activity
  activities.push({
    id: `order-created-${orderId}`,
    type: 'ORDER_CREATED' as const,
    description: 'Auftrag wurde erstellt',
    authorId: order.createdBy || 'system',
    authorName: 'System',
    timestamp: order.createdAt.toISOString(),
    metadata: {}
  });

  // Add customer activities (already filtered by customer)
  customerActivities.forEach(customerActivity => {
    activities.push({
      id: `customer-activity-${customerActivity.id}`,
      type: 'ACTIVITY_ASSIGNED' as const,
      description: `Aktivität "${customerActivity.name}" zugewiesen (Menge: ${customerActivity.quantity})`,
      authorId: 'system',
      authorName: 'System',
      timestamp: customerActivity.createdAt.toISOString(),
      metadata: {
        activityName: customerActivity.name,
        activityCode: customerActivity.code,
        quantity: customerActivity.quantity,
        unitPrice: customerActivity.unitPrice?.toNumber() ?? 0,
        lineTotal: customerActivity.lineTotal?.toNumber() ?? 0,
        unit: customerActivity.unit,
        priceValidFrom: customerActivity.createdAt.toISOString()
      }
    });
  });

  // Add note activities
  notes.forEach(note => {
    const authorName = note.author.employee
      ? `${note.author.employee.firstName || ''} ${note.author.employee.lastName || ''}`.trim()
      : note.author.username;

    activities.push({
      id: note.id,
      type: note.triggersStatus ? 'STATUS_CHANGE' : 'NOTE_ADDED' as const,
      description: note.triggersStatus
        ? `Status geändert zu ${note.triggersStatus}`
        : 'Notiz hinzugefügt',
      authorId: note.authorId,
      authorName: authorName || 'Unbekannter Benutzer',
      timestamp: note.createdAt.toISOString(),
      metadata: {
        noteContent: note.content,
        category: note.category,
        ...(note.triggersStatus && { newStatus: note.triggersStatus })
      }
    });
  });

  // Add assignment activities
  assignments.forEach(assignment => {
    const employeeName = `${assignment.employee.firstName || ''} ${assignment.employee.lastName || ''}`.trim();

    activities.push({
      id: `assignment-${assignment.id}`,
      type: 'ASSIGNMENT_CHANGED' as const,
      description: `Mitarbeiter ${employeeName} wurde diesem Auftrag zugewiesen`,
      authorId: 'system',
      authorName: 'System',
      timestamp: assignment.createdAt.toISOString(),
      metadata: {
        employeeName,
        assignmentStatus: assignment.status
      }
    });
  });

  // Sort all activities by timestamp (newest first)
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};
